-- Migration: Fix account_type enum values in complete_onboarding_transaction function
-- The enum uses uppercase values (ASSET, EQUITY) not lowercase (asset, equity)

-- Drop and recreate the function with correct enum values
DROP FUNCTION IF EXISTS public.complete_onboarding_transaction(
    p_user_id UUID,
    p_company_data JSONB,
    p_fbr_data JSONB,
    p_opening_balance JSONB,
    p_skip_balance BOOLEAN,
    p_skip_tax_info BOOLEAN
);

CREATE OR REPLACE FUNCTION complete_onboarding_transaction(
    p_user_id UUID,
    p_company_data JSONB,
    p_fbr_data JSONB,
    p_opening_balance JSONB DEFAULT NULL,
    p_skip_balance BOOLEAN DEFAULT FALSE,
    p_skip_tax_info BOOLEAN DEFAULT FALSE
) RETURNS JSONB AS $$
DECLARE
    v_company_id UUID;
    v_company_name TEXT;
    v_company_type_text TEXT;
    v_company_type company_type;
    v_tax_id_number TEXT;
    v_filing_status TEXT;
    v_tax_year_end DATE;
    v_assigned_accountant_id UUID;
    
    -- FBR data variables
    v_cnic_ntn TEXT;
    v_business_name TEXT;
    v_province_code INTEGER;
    v_address TEXT;
    v_mobile_number TEXT;
    v_business_activity_type_ids INTEGER[];
    v_sector_ids INTEGER[];
    v_business_activity_selection JSONB;
    
    -- Opening balance variables
    v_has_opening_balance BOOLEAN;
    v_opening_amount NUMERIC(12,2);
    v_opening_date DATE;
    v_cash_account_id BIGINT;
    v_equity_account_id BIGINT;
    v_journal_entry_id UUID;
    
    v_result JSONB;
    v_activity_type_id INTEGER;
    v_sector_id INTEGER;
BEGIN
    -- Validate required parameters
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;
    
    IF p_company_data IS NULL THEN
        RAISE EXCEPTION 'Company data is required';
    END IF;
    
    IF p_fbr_data IS NULL THEN
        RAISE EXCEPTION 'FBR data is required';
    END IF;

    -- Extract company data
    v_company_name := p_company_data->>'name';
    v_company_type_text := p_company_data->>'type';
    v_tax_id_number := p_company_data->>'tax_id_number';
    v_filing_status := p_company_data->>'filing_status';
    v_tax_year_end := (p_company_data->>'tax_year_end')::DATE;
    v_assigned_accountant_id := (p_company_data->>'assigned_accountant_id')::UUID;

    -- Validate company type
    BEGIN
        v_company_type := v_company_type_text::company_type;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Invalid company type: %', v_company_type_text;
    END;

    -- Extract FBR data
    v_cnic_ntn := p_fbr_data->>'cnic_ntn';
    v_business_name := p_fbr_data->>'business_name';
    v_province_code := (p_fbr_data->>'province_code')::INTEGER;
    v_address := p_fbr_data->>'address';
    v_mobile_number := p_fbr_data->>'mobile_number';
    v_business_activity_selection := p_fbr_data->'business_activities';

    -- Extract business activity type IDs and sector IDs from the new structure
    IF v_business_activity_selection IS NOT NULL THEN
        SELECT ARRAY_AGG(DISTINCT (value->>'business_activity_type_id')::INTEGER)
        INTO v_business_activity_type_ids
        FROM jsonb_array_elements(v_business_activity_selection);
        
        SELECT ARRAY_AGG(DISTINCT (value->>'sector_id')::INTEGER)
        INTO v_sector_ids
        FROM jsonb_array_elements(v_business_activity_selection)
        WHERE value->>'sector_id' IS NOT NULL;
    END IF;

    -- Extract opening balance data
    v_has_opening_balance := NOT COALESCE(p_skip_balance, FALSE);
    IF v_has_opening_balance AND p_opening_balance IS NOT NULL THEN
        v_opening_amount := (p_opening_balance->>'amount')::NUMERIC(12,2);
        v_opening_date := (p_opening_balance->>'date')::DATE;
    END IF;

    -- Begin transaction
    BEGIN
        -- Generate company ID
        v_company_id := gen_random_uuid();

        -- Create company record
        INSERT INTO public.companies (
            id,
            name,
            type,
            tax_id_number,
            filing_status,
            tax_year_end,
            user_id,
            assigned_accountant_id,
            created_at
        ) VALUES (
            v_company_id,
            v_company_name,
            v_company_type,
            v_tax_id_number,
            v_filing_status,
            v_tax_year_end,
            p_user_id,
            v_assigned_accountant_id,
            NOW()
        );

        -- Create FBR profile record
        INSERT INTO public.fbr_profiles (
            user_id,
            cnic_ntn,
            business_name,
            province_code,
            address,
            mobile_number,
            created_at
        ) VALUES (
            p_user_id,
            v_cnic_ntn,
            v_business_name,
            v_province_code,
            v_address,
            v_mobile_number,
            NOW()
        );

        -- Create user business activity records
        IF v_business_activity_type_ids IS NOT NULL THEN
            FOREACH v_activity_type_id IN ARRAY v_business_activity_type_ids
            LOOP
                -- Insert business activity type
                INSERT INTO public.user_business_activities (
                    user_id,
                    business_activity_type_id,
                    is_primary,
                    created_at
                ) VALUES (
                    p_user_id,
                    v_activity_type_id,
                    (v_activity_type_id = v_business_activity_type_ids[1]), -- First one is primary
                    NOW()
                ) ON CONFLICT (user_id, business_activity_type_id) DO NOTHING;
            END LOOP;
        END IF;

        -- Set up chart of accounts for the company from template
        INSERT INTO public.company_coa (
            company_id,
            account_id,
            account_name,
            account_type,
            parent_id,
            template_id,
            created_at
        )
        SELECT 
            v_company_id,
            account_id,
            account_name,
            account_type,
            parent_id,
            id,
            NOW()
        FROM public.coa_template 
        WHERE account_id IS NOT NULL;

        -- Handle opening balance if provided
        IF v_has_opening_balance AND v_opening_amount IS NOT NULL AND v_opening_amount > 0 THEN
            -- Get cash and equity account IDs from company's chart of accounts
            -- Use uppercase enum values: 'ASSET' and 'EQUITY'
            SELECT id INTO v_cash_account_id
            FROM public.company_coa
            WHERE company_id = v_company_id
            AND account_name ILIKE '%cash%'
            AND account_type = 'ASSET'
            LIMIT 1;

            SELECT id INTO v_equity_account_id
            FROM public.company_coa
            WHERE company_id = v_company_id
            AND account_type = 'EQUITY'
            LIMIT 1;

            IF v_cash_account_id IS NOT NULL AND v_equity_account_id IS NOT NULL THEN
                -- Create journal entry for opening balance
                v_journal_entry_id := gen_random_uuid();
                
                INSERT INTO public.journal_entries (
                    id,
                    company_id,
                    entry_date,
                    reference,
                    description,
                    created_by,
                    created_at
                ) VALUES (
                    v_journal_entry_id,
                    v_company_id,
                    v_opening_date,
                    'OPENING-BAL',
                    'Opening Balance Entry',
                    p_user_id,
                    NOW()
                );

                -- Debit cash account
                INSERT INTO public.journal_entry_lines (
                    journal_entry_id,
                    account_id,
                    debit_amount,
                    credit_amount,
                    description,
                    created_at
                ) VALUES (
                    v_journal_entry_id,
                    v_cash_account_id,
                    v_opening_amount,
                    0,
                    'Opening balance - Cash',
                    NOW()
                );

                -- Credit equity account
                INSERT INTO public.journal_entry_lines (
                    journal_entry_id,
                    account_id,
                    debit_amount,
                    credit_amount,
                    description,
                    created_at
                ) VALUES (
                    v_journal_entry_id,
                    v_equity_account_id,
                    0,
                    v_opening_amount,
                    'Opening balance - Equity',
                    NOW()
                );
            END IF;
        END IF;

        -- Update user onboarding status
        UPDATE auth.users
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"onboarding_completed": true}'::jsonb
        WHERE id = p_user_id;

        -- Prepare success response
        v_result := jsonb_build_object(
            'success', true,
            'company_id', v_company_id,
            'has_opening_balance', v_has_opening_balance,
            'message', 'Onboarding completed successfully'
        );

        RETURN v_result;

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback will happen automatically
            v_result := jsonb_build_object(
                'success', false,
                'company_id', '',
                'error', SQLERRM,
                'has_opening_balance', false,
                'message', 'Onboarding failed'
            );
            RETURN v_result;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.complete_onboarding_transaction IS 'Complete user onboarding process - Fixed with correct account_type enum values (ASSET, EQUITY)';

-- Verify function was created successfully
DO $$
DECLARE
    function_count integer;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'complete_onboarding_transaction'
    AND n.nspname = 'public';
    
    IF function_count = 1 THEN
        RAISE NOTICE 'SUCCESS: complete_onboarding_transaction function updated with correct account_type enum values';
    ELSE
        RAISE EXCEPTION 'ERROR: Function update failed. Found % functions', function_count;
    END IF;
END $$;
