-- Migration: Update complete_onboarding_transaction function to support multiple business activities

-- Drop the existing function
DROP FUNCTION IF EXISTS public.complete_onboarding_transaction(
    p_user_id UUID,
    p_company_data JSONB,
    p_fbr_data JSONB,
    p_opening_balance JSONB,
    p_skip_balance BOOLEAN,
    p_skip_tax_info BOOLEAN
);

-- Create updated function with multiple business activities support
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
    v_business_activity_id INTEGER;
    v_business_activities INTEGER[];
    
    -- Opening balance variables
    v_has_opening_balance BOOLEAN;
    v_opening_amount NUMERIC(12,2);
    v_opening_date DATE;
    v_cash_account_id BIGINT;
    v_equity_account_id BIGINT;
    v_journal_entry_id UUID;
    
    v_result JSONB;
    v_activity_id INTEGER;
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
    
    -- Convert company type string to enum
    BEGIN
        v_company_type := v_company_type_text::company_type;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid company type: %', v_company_type_text;
    END;
    
    -- Extract FBR data
    v_cnic_ntn := p_fbr_data->>'cnic_ntn';
    v_business_name := p_fbr_data->>'business_name';
    v_province_code := (p_fbr_data->>'province_code')::INTEGER;
    v_address := p_fbr_data->>'address';
    v_mobile_number := p_fbr_data->>'mobile_number';
    v_business_activity_id := (p_fbr_data->>'business_activity_id')::INTEGER;
    
    -- Extract business activities array (new field)
    IF p_fbr_data ? 'business_activities' THEN
        SELECT ARRAY(
            SELECT jsonb_array_elements_text(p_fbr_data->'business_activities')::INTEGER
        ) INTO v_business_activities;
    ELSE
        -- Fallback to single business activity for backward compatibility
        v_business_activities := ARRAY[v_business_activity_id];
    END IF;

    -- Validate required fields
    IF v_company_name IS NULL OR v_company_name = '' THEN
        RAISE EXCEPTION 'Company name is required';
    END IF;
    
    IF v_cnic_ntn IS NULL OR v_business_name IS NULL OR v_business_activity_id IS NULL THEN
        RAISE EXCEPTION 'FBR profile data is incomplete';
    END IF;

    -- Validate business activities exist
    IF NOT EXISTS (SELECT 1 FROM business_activity WHERE id = ANY(v_business_activities)) THEN
        RAISE EXCEPTION 'One or more business activities do not exist';
    END IF;

    -- Check if user already has a company
    IF EXISTS (SELECT 1 FROM companies WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'User already has a company';
    END IF;

    -- Check if user already has an FBR profile
    IF EXISTS (SELECT 1 FROM fbr_profiles WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'User already has an FBR profile';
    END IF;

    -- Start transaction
    BEGIN
        -- Create company
        INSERT INTO companies (
            user_id,
            name,
            type,
            tax_id_number,
            filing_status,
            tax_year_end,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            v_company_name,
            v_company_type,
            v_tax_id_number,
            v_filing_status,
            v_tax_year_end,
            NOW(),
            NOW()
        ) RETURNING id INTO v_company_id;

        -- Create FBR profile with primary business activity
        INSERT INTO fbr_profiles (
            user_id,
            cnic_ntn,
            business_name,
            province_code,
            address,
            mobile_number,
            business_activity_id,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            v_cnic_ntn,
            v_business_name,
            v_province_code,
            v_address,
            v_mobile_number,
            v_business_activity_id,
            NOW(),
            NOW()
        );

        -- Add all business activities to user_business_activities table
        FOREACH v_activity_id IN ARRAY v_business_activities
        LOOP
            INSERT INTO user_business_activities (
                user_id,
                business_activity_id,
                is_primary,
                created_at,
                updated_at
            ) VALUES (
                p_user_id,
                v_activity_id,
                v_activity_id = v_business_activity_id, -- Primary activity
                NOW(),
                NOW()
            );
        END LOOP;

        -- Handle opening balance if provided
        v_has_opening_balance := FALSE;
        IF NOT p_skip_balance AND p_opening_balance IS NOT NULL THEN
            v_opening_amount := (p_opening_balance->>'amount')::NUMERIC(12,2);
            v_opening_date := (p_opening_balance->>'date')::DATE;
            
            IF v_opening_amount IS NOT NULL AND v_opening_date IS NOT NULL THEN
                -- Get cash and equity account IDs
                SELECT id INTO v_cash_account_id 
                FROM chart_of_accounts 
                WHERE company_id = v_company_id 
                AND account_code = '1000' 
                LIMIT 1;
                
                SELECT id INTO v_equity_account_id 
                FROM chart_of_accounts 
                WHERE company_id = v_company_id 
                AND account_code = '3000' 
                LIMIT 1;
                
                IF v_cash_account_id IS NOT NULL AND v_equity_account_id IS NOT NULL THEN
                    -- Create journal entry for opening balance
                    INSERT INTO journal_entries (
                        company_id,
                        entry_date,
                        description,
                        reference,
                        created_at,
                        updated_at
                    ) VALUES (
                        v_company_id,
                        v_opening_date,
                        'Opening Balance',
                        'OB-' || TO_CHAR(v_opening_date, 'YYYY-MM-DD'),
                        NOW(),
                        NOW()
                    ) RETURNING id INTO v_journal_entry_id;
                    
                    -- Create journal entry lines
                    INSERT INTO journal_entry_lines (
                        journal_entry_id,
                        account_id,
                        debit_amount,
                        credit_amount,
                        description,
                        created_at,
                        updated_at
                    ) VALUES 
                    (
                        v_journal_entry_id,
                        v_cash_account_id,
                        v_opening_amount,
                        0,
                        'Opening Cash Balance',
                        NOW(),
                        NOW()
                    ),
                    (
                        v_journal_entry_id,
                        v_equity_account_id,
                        0,
                        v_opening_amount,
                        'Opening Equity Balance',
                        NOW(),
                        NOW()
                    );
                    
                    v_has_opening_balance := TRUE;
                END IF;
            END IF;
        END IF;

        -- Assign accountant if available
        SELECT id INTO v_assigned_accountant_id
        FROM accountants
        WHERE is_active = TRUE
        ORDER BY RANDOM()
        LIMIT 1;

        IF v_assigned_accountant_id IS NOT NULL THEN
            INSERT INTO company_accountants (
                company_id,
                accountant_id,
                assigned_at,
                created_at,
                updated_at
            ) VALUES (
                v_company_id,
                v_assigned_accountant_id,
                NOW(),
                NOW(),
                NOW()
            );
        END IF;

        -- Create activity log
        INSERT INTO activity_logs (
            company_id,
            actor_id,
            activity,
            details,
            created_at
        ) VALUES (
            v_company_id,
            p_user_id,
            'COMPANY_CREATED',
            jsonb_build_object(
                'company_name', v_company_name,
                'company_type', v_company_type_text,
                'has_opening_balance', v_has_opening_balance,
                'business_activities_count', array_length(v_business_activities, 1)
            ),
            NOW()
        );

        -- Prepare result
        v_result := jsonb_build_object(
            'success', TRUE,
            'company_id', v_company_id,
            'has_opening_balance', v_has_opening_balance,
            'message', 'Onboarding completed successfully',
            'business_activities_count', array_length(v_business_activities, 1)
        );

        RETURN v_result;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback is automatic in case of exception
        RAISE EXCEPTION 'Onboarding failed: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup, and multiple business activities support';
