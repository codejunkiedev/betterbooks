-- Migration: Restore complete_onboarding_transaction function
-- This recreates the function with the correct table structure (business_activity_types instead of business_activity)

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
    v_business_activity_type_id INTEGER;
    v_sector_id INTEGER;

    -- Opening balance variables
    v_has_opening_balance BOOLEAN;
    v_opening_amount NUMERIC(12,2);
    v_opening_date DATE;
    v_cash_account_id BIGINT;
    v_equity_account_id BIGINT;
    v_journal_entry_id UUID;

    v_result JSONB;
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

    -- Convert company type string to enum (if enum exists)
    BEGIN
        v_company_type := v_company_type_text::company_type;
    EXCEPTION WHEN OTHERS THEN
        -- If enum doesn't exist, just use the text value
        v_company_type := NULL;
    END;

    -- Extract FBR data (use new structure)
    v_cnic_ntn := p_fbr_data->>'cnic_ntn';
    v_business_name := p_fbr_data->>'business_name';
    v_province_code := (p_fbr_data->>'province_code')::INTEGER;
    v_address := p_fbr_data->>'address';
    v_mobile_number := p_fbr_data->>'mobile_number';

    -- Handle business activity (try new structure first, fall back to old)
    IF p_fbr_data ? 'business_activity_type_id' THEN
        v_business_activity_type_id := (p_fbr_data->>'business_activity_type_id')::INTEGER;
    ELSIF p_fbr_data ? 'business_activity_id' THEN
        v_business_activity_type_id := (p_fbr_data->>'business_activity_id')::INTEGER;
    END IF;

    IF p_fbr_data ? 'sector_id' THEN
        v_sector_id := (p_fbr_data->>'sector_id')::INTEGER;
    END IF;

    -- Validate required fields
    IF v_company_name IS NULL OR v_company_name = '' THEN
        RAISE EXCEPTION 'Company name is required';
    END IF;

    IF v_cnic_ntn IS NULL OR v_business_name IS NULL THEN
        RAISE EXCEPTION 'FBR profile data is incomplete';
    END IF;

    -- Validate business activity exists (if provided)
    IF v_business_activity_type_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM business_activity_types WHERE id = v_business_activity_type_id) THEN
            RAISE EXCEPTION 'Business activity type does not exist';
        END IF;
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

        -- Create FBR profile (use new structure if available)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'fbr_profiles'
            AND column_name = 'business_activity_type_id'
        ) THEN
            -- New structure with business_activity_type_id and sector_id
            INSERT INTO fbr_profiles (
                user_id,
                cnic_ntn,
                business_name,
                province_code,
                address,
                mobile_number,
                business_activity_type_id,
                sector_id,
                created_at,
                updated_at
            ) VALUES (
                p_user_id,
                v_cnic_ntn,
                v_business_name,
                v_province_code,
                v_address,
                v_mobile_number,
                v_business_activity_type_id,
                v_sector_id,
                NOW(),
                NOW()
            );
        ELSE
            -- Old structure with business_activity_id
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
                v_business_activity_type_id,
                NOW(),
                NOW()
            );
        END IF;

        -- Add to user_business_activities table if it exists and has the right columns
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'user_business_activities'
        ) AND v_business_activity_type_id IS NOT NULL THEN

            -- The current structure uses business_activity_type_id (not business_activity_id)
            INSERT INTO user_business_activities (
                user_id,
                business_activity_type_id,
                sector_id,
                is_primary,
                created_at,
                updated_at
            ) VALUES (
                p_user_id,
                v_business_activity_type_id,
                v_sector_id,
                true,
                NOW(),
                NOW()
            ) ON CONFLICT (user_id, business_activity_type_id) DO NOTHING;
        END IF;

        -- Handle opening balance if provided (only if tables exist)
        v_has_opening_balance := FALSE;
        IF NOT p_skip_balance AND p_opening_balance IS NOT NULL THEN
            v_opening_amount := (p_opening_balance->>'amount')::NUMERIC(12,2);
            v_opening_date := (p_opening_balance->>'date')::DATE;

            IF v_opening_amount IS NOT NULL AND v_opening_date IS NOT NULL THEN
                -- Only try to create opening balance if chart_of_accounts table exists
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = 'chart_of_accounts'
                ) THEN
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
                        -- Create journal entry for opening balance (if journal_entries table exists)
                        IF EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_name = 'journal_entries'
                        ) THEN
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

                            -- Create journal entry lines (if table exists)
                            IF EXISTS (
                                SELECT 1 FROM information_schema.tables
                                WHERE table_name = 'journal_entry_lines'
                            ) THEN
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
                END IF;
            END IF;
        END IF;

        -- Assign accountant if available (if table exists)
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'accountants'
        ) THEN
            SELECT id INTO v_assigned_accountant_id
            FROM accountants
            WHERE is_active = TRUE
            ORDER BY RANDOM()
            LIMIT 1;

            IF v_assigned_accountant_id IS NOT NULL THEN
                -- Only insert if company_accountants table exists
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = 'company_accountants'
                ) THEN
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
            END IF;
        END IF;

        -- Create activity log (if table exists)
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'activity_logs'
        ) THEN
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
                    'has_opening_balance', v_has_opening_balance
                ),
                NOW()
            );
        END IF;

        -- Prepare result
        v_result := jsonb_build_object(
            'success', TRUE,
            'company_id', v_company_id,
            'has_opening_balance', v_has_opening_balance,
            'message', 'Onboarding completed successfully'
        );

        RETURN v_result;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback is automatic in case of exception
        RAISE EXCEPTION 'Onboarding failed: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup - restored with current schema compatibility';