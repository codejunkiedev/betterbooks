-- Drop the function if it exists and recreate it
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN);

-- Create a comprehensive onboarding transaction function
CREATE OR REPLACE FUNCTION complete_onboarding_transaction(
    p_user_id UUID,
    p_company_data JSONB,
    p_fbr_data JSONB,
    p_opening_balance JSONB DEFAULT NULL,
    p_skip_balance BOOLEAN DEFAULT FALSE,
    p_skip_tax_info BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_company_id UUID;
    v_company_name TEXT;
    v_company_type company_type;
    v_tax_id_number TEXT;
    v_filing_status TEXT;
    v_tax_year_end DATE;
    v_assigned_accountant_id TEXT;
    
    -- FBR data variables
    v_cnic_ntn TEXT;
    v_business_name TEXT;
    v_province_code INTEGER;
    v_address TEXT;
    v_mobile_number TEXT;
    v_business_activity_id INTEGER;
    
    -- Opening balance variables
    v_opening_amount DECIMAL;
    v_opening_date DATE;
    
    -- Account IDs for opening balance
    v_cash_account_id BIGINT;
    v_equity_account_id BIGINT;
    
    -- Journal entry variables
    v_journal_entry_id UUID;
    
    -- FBR profile variables
    v_fbr_profile_id UUID;
    v_existing_profile_user_id UUID;
    
    -- Scenario progress variables
    v_scenario_id VARCHAR(10);
    v_scenario_cursor CURSOR FOR
        SELECT id FROM fbr_scenarios 
        WHERE business_activity_id = v_business_activity_id 
        AND is_mandatory = true;
    
    -- Activity log variables
    v_activity_id BIGINT;
    
    -- Result variables
    v_result JSONB;
    v_has_opening_balance BOOLEAN := FALSE;
    v_has_fbr_profile BOOLEAN := FALSE;
    
BEGIN
    -- Extract company data with proper validation
    v_company_name := p_company_data->>'name';
    
    -- Validate and cast company type with better error handling
    IF p_company_data->>'type' IS NULL OR p_company_data->>'type' = '' THEN
        RAISE EXCEPTION 'Company type is required';
    END IF;
    
    BEGIN
        v_company_type := (p_company_data->>'type')::company_type;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Invalid company type: %. Valid types are: INDEPENDENT_WORKER, PROFESSIONAL_SERVICES, SMALL_BUSINESS', p_company_data->>'type';
    END;
    
    v_tax_id_number := p_company_data->>'tax_id_number';
    v_filing_status := p_company_data->>'filing_status';
    v_tax_year_end := CASE 
        WHEN p_company_data->>'tax_year_end' IS NOT NULL AND p_company_data->>'tax_year_end' != '' 
        THEN (p_company_data->>'tax_year_end')::DATE 
        ELSE NULL 
    END;
    v_assigned_accountant_id := '';
    
    -- Extract FBR data
    v_cnic_ntn := p_fbr_data->>'cnic_ntn';
    v_business_name := p_fbr_data->>'business_name';
    v_province_code := (p_fbr_data->>'province_code')::INTEGER;
    v_address := p_fbr_data->>'address';
    v_mobile_number := p_fbr_data->>'mobile_number';
    v_business_activity_id := (p_fbr_data->>'business_activity_id')::INTEGER;
    
    -- Extract opening balance data
    IF NOT p_skip_balance AND p_opening_balance IS NOT NULL THEN
        v_opening_amount := (p_opening_balance->>'amount')::DECIMAL;
        v_opening_date := (p_opening_balance->>'date')::DATE;
        
        -- Validate opening balance
        IF v_opening_amount <= 0 THEN
            RAISE EXCEPTION 'Opening balance must be greater than 0';
        END IF;
        
        IF v_opening_date > CURRENT_DATE THEN
            RAISE EXCEPTION 'Opening balance date cannot be in the future';
        END IF;
        
        v_has_opening_balance := TRUE;
    END IF;
    
    -- Validate required fields
    IF v_company_name IS NULL OR v_company_name = '' THEN
        RAISE EXCEPTION 'Company name is required';
    END IF;
    
    IF v_company_type IS NULL THEN
        RAISE EXCEPTION 'Company type is required';
    END IF;
    
    IF v_cnic_ntn IS NULL OR v_business_name IS NULL OR v_business_activity_id IS NULL THEN
        RAISE EXCEPTION 'FBR profile data is required: CNIC/NTN, business name, and business activity';
    END IF;
    
    -- Check if CNIC/NTN already exists for different user
    SELECT user_id INTO v_existing_profile_user_id
    FROM fbr_profiles 
    WHERE cnic_ntn = v_cnic_ntn 
    AND user_id != p_user_id;
    
    IF FOUND THEN
        RAISE EXCEPTION 'CNIC/NTN % is already registered by another user', v_cnic_ntn;
    END IF;
    
    -- Start transaction
    BEGIN
        -- Step 1: Create company
        INSERT INTO companies (
            user_id,
            name,
            type,
            tax_id_number,
            filing_status,
            tax_year_end,
            assigned_accountant_id,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            v_company_name,
            v_company_type,
            CASE WHEN p_skip_tax_info THEN NULL ELSE v_tax_id_number END,
            CASE WHEN p_skip_tax_info THEN NULL ELSE v_filing_status END,
            CASE WHEN p_skip_tax_info THEN NULL ELSE v_tax_year_end END,
            v_assigned_accountant_id,
            TRUE,
            NOW(),
            NOW()
        ) RETURNING id INTO v_company_id;
        
        -- Step 2: Copy COA template to company (fixed table and column names)
        INSERT INTO company_coa (
            company_id,
            account_id,
            account_name,
            account_type,
            parent_id,
            is_active,
            created_at,
            updated_at
        )
        SELECT 
            v_company_id,
            account_id,
            account_name,
            account_type,
            parent_id,
            TRUE,
            NOW(),
            NOW()
        FROM coa_template 
        WHERE account_id IS NOT NULL;
        
        -- Step 3: Handle opening balance if provided
        IF v_has_opening_balance THEN
            -- Find cash account (account_id = '1000')
            SELECT id INTO v_cash_account_id
            FROM company_coa
            WHERE company_id = v_company_id 
            AND account_id = '1000';
            
            IF v_cash_account_id IS NULL THEN
                RAISE EXCEPTION 'Cash account not found for opening balance';
            END IF;
            
            -- Find equity account (account_id = '3000')
            SELECT id INTO v_equity_account_id
            FROM company_coa
            WHERE company_id = v_company_id 
            AND account_id = '3000';
            
            IF v_equity_account_id IS NULL THEN
                RAISE EXCEPTION 'Equity account not found for opening balance';
            END IF;
            
            -- Create journal entry
            INSERT INTO journal_entries (
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
            
            -- Create journal entry lines (fixed account_id type to bigint)
            INSERT INTO journal_entry_lines (
                journal_entry_id,
                account_id,
                type,
                amount
            ) VALUES 
            (v_journal_entry_id, v_cash_account_id, 'DEBIT', v_opening_amount),
            (v_journal_entry_id, v_equity_account_id, 'CREDIT', v_opening_amount);
        END IF;
        
        -- Step 4: Create FBR profile
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
        ) RETURNING user_id INTO v_fbr_profile_id;
        
        v_has_fbr_profile := TRUE;
        
        -- Step 5: Initialize scenario progress for mandatory scenarios (fixed structure)
        FOR v_scenario_id IN v_scenario_cursor LOOP
            INSERT INTO fbr_scenario_progress (
                user_id,
                scenario_id,
                status,
                created_at,
                updated_at
            ) VALUES (
                p_user_id,
                v_scenario_id,
                'not_started',
                NOW(),
                NOW()
            );
        END LOOP;
        
        -- Step 6: Log activity for company creation (fixed column names)
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
                'company_type', v_company_type,
                'has_opening_balance', v_has_opening_balance,
                'opening_balance_amount', COALESCE(v_opening_amount, 0),
                'opening_balance_date', v_opening_date,
                'has_fbr_profile', v_has_fbr_profile
            ),
            NOW()
        ) RETURNING id INTO v_activity_id;
        
        -- Return success result
        v_result := jsonb_build_object(
            'success', TRUE,
            'data', jsonb_build_object(
                'company_id', v_company_id,
                'company_name', v_company_name,
                'fbr_profile_id', CASE WHEN v_has_fbr_profile THEN 'created' ELSE NULL END,
                'journal_entry_id', CASE WHEN v_has_opening_balance THEN 'created' ELSE NULL END,
                'activity_id', v_activity_id,
                'has_opening_balance', v_has_opening_balance,
                'opening_balance_amount', COALESCE(v_opening_amount, 0),
                'opening_balance_date', v_opening_date,
                'has_fbr_profile', v_has_fbr_profile
            ),
            'message', 'Onboarding completed successfully'
        );
        
        RETURN v_result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback will happen automatically due to transaction
            RAISE EXCEPTION 'Onboarding failed: %', SQLERRM;
    END;
END;
$$;
