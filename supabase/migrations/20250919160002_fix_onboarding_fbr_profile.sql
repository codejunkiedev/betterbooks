-- Migration: Fix FBR profile creation in complete_onboarding_transaction
-- This adds better error handling and ensures FBR profile is created

DROP FUNCTION IF EXISTS public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN);

CREATE OR REPLACE FUNCTION public.complete_onboarding_transaction(
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
    v_activities TEXT[];
    v_sectors TEXT[];

    -- Opening balance variables
    v_has_opening_balance BOOLEAN;
    v_opening_amount NUMERIC(12,2);
    v_opening_date DATE;
    v_cash_account_id BIGINT;
    v_equity_account_id BIGINT;
    v_journal_entry_id UUID;

    v_result JSONB;
    v_fbr_created BOOLEAN := FALSE;
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

    -- Extract activities array (array of strings)
    IF p_fbr_data->'activities' IS NOT NULL THEN
        SELECT ARRAY_AGG(value #>> '{}')
        INTO v_activities
        FROM jsonb_array_elements(p_fbr_data->'activities');
    END IF;

    -- Extract sectors array (array of strings)
    IF p_fbr_data->'sectors' IS NOT NULL THEN
        SELECT ARRAY_AGG(value #>> '{}')
        INTO v_sectors
        FROM jsonb_array_elements(p_fbr_data->'sectors');
    END IF;

    -- Extract opening balance data
    v_has_opening_balance := NOT COALESCE(p_skip_balance, FALSE);
    IF v_has_opening_balance AND p_opening_balance IS NOT NULL THEN
        v_opening_amount := (p_opening_balance->>'amount')::NUMERIC(12,2);
        v_opening_date := (p_opening_balance->>'date')::DATE;
    END IF;

    -- Check if user already has a company
    IF EXISTS (SELECT 1 FROM companies WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'User already has a company';
    END IF;

    -- Check if user already has an FBR profile
    IF EXISTS (SELECT 1 FROM fbr_profiles WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'User already has an FBR profile';
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
        -- First check what columns exist in fbr_profiles
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'fbr_profiles'
            AND column_name = 'activities'
            AND table_schema = 'public'
        ) THEN
            -- New structure with activities and sectors arrays
            INSERT INTO public.fbr_profiles (
                user_id,
                cnic_ntn,
                business_name,
                province_code,
                address,
                mobile_number,
                activities,
                sectors,
                created_at
            ) VALUES (
                p_user_id,
                v_cnic_ntn,
                v_business_name,
                v_province_code,
                v_address,
                v_mobile_number,
                v_activities,
                v_sectors,
                NOW()
            );
            v_fbr_created := TRUE;
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'fbr_profiles'
            AND column_name = 'business_activity_type_id'
            AND table_schema = 'public'
        ) THEN
            -- Alternative structure with business_activity_type_id and sector_id
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
            v_fbr_created := TRUE;
        ELSE
            -- Basic structure
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
            v_fbr_created := TRUE;
        END IF;

        -- Verify FBR profile was created
        IF NOT EXISTS (SELECT 1 FROM fbr_profiles WHERE user_id = p_user_id) THEN
            RAISE EXCEPTION 'Failed to create FBR profile';
        END IF;

        -- Set up chart of accounts for the company from template (only if tables exist)
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'company_coa' AND table_schema = 'public'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'coa_template' AND table_schema = 'public'
        ) THEN
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
        END IF;

        -- Handle opening balance if provided (only if tables exist)
        IF v_has_opening_balance AND v_opening_amount IS NOT NULL AND v_opening_amount > 0 THEN
            IF EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_name = 'company_coa' AND table_schema = 'public'
            ) THEN
                -- Get cash account ID
                SELECT id INTO v_cash_account_id
                FROM public.company_coa
                WHERE company_id = v_company_id
                AND (account_id = '1000' OR account_name ILIKE '%cash%')
                AND account_type = 'ASSET'
                LIMIT 1;

                -- Get equity account ID
                SELECT id INTO v_equity_account_id
                FROM public.company_coa
                WHERE company_id = v_company_id
                AND (account_id = '3000' OR account_type = 'EQUITY')
                LIMIT 1;

                IF v_cash_account_id IS NOT NULL AND v_equity_account_id IS NOT NULL THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_name = 'journal_entries' AND table_schema = 'public'
                    ) THEN
                        INSERT INTO public.journal_entries (
                            company_id,
                            entry_date,
                            description,
                            is_adjusting_entry,
                            created_by,
                            created_at
                        ) VALUES (
                            v_company_id,
                            v_opening_date,
                            'Opening Balance',
                            FALSE,
                            p_user_id,
                            NOW()
                        ) RETURNING id INTO v_journal_entry_id;

                        IF EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_name = 'journal_entry_lines' AND table_schema = 'public'
                        ) THEN
                            INSERT INTO public.journal_entry_lines (
                                journal_entry_id,
                                account_id,
                                type,
                                amount
                            ) VALUES
                            (v_journal_entry_id, v_cash_account_id, 'DEBIT', v_opening_amount),
                            (v_journal_entry_id, v_equity_account_id, 'CREDIT', v_opening_amount);
                        END IF;
                    END IF;
                END IF;
            END IF;
        END IF;

        -- Update user onboarding status
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'users' AND table_schema = 'auth'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users' AND table_schema = 'auth' AND column_name = 'raw_user_meta_data'
        ) THEN
            UPDATE auth.users
            SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"onboarding_completed": true}'::jsonb
            WHERE id = p_user_id;
        END IF;

        -- Prepare success response with debug info
        v_result := jsonb_build_object(
            'success', true,
            'company_id', v_company_id,
            'has_opening_balance', v_has_opening_balance,
            'fbr_profile_created', v_fbr_created,
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
                'fbr_profile_created', false,
                'message', 'Onboarding failed: ' || SQLERRM
            );
            RETURN v_result;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup - with better error handling';

-- Let's also check what columns actually exist in fbr_profiles
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE 'FBR Profiles table columns:';
    FOR col_record IN
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'fbr_profiles'
        AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %)', col_record.column_name, col_record.data_type, col_record.is_nullable;
    END LOOP;
END $$;