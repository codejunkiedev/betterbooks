-- Fix onboarding function to remove is_active column from company_coa insert
-- This resolves the "column is_active does not exist" error

-- Drop all possible function signatures to ensure clean replacement
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN);
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN);

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
    v_province_code TEXT;
    v_address TEXT;
    v_mobile_number TEXT;
    v_business_activity_id INTEGER;
    
    -- Opening balance variables
    v_has_opening_balance BOOLEAN;
    v_opening_amount NUMERIC;
    v_opening_date DATE;
    v_cash_account_id BIGINT;
    v_equity_account_id BIGINT;
    v_journal_entry_id UUID;
    
    v_result JSONB;
BEGIN
    -- Extract company data
    v_company_name := p_company_data->>'name';
    v_company_type_text := p_company_data->>'type';
    v_tax_id_number := p_company_data->>'tax_id_number';
    v_filing_status := p_company_data->>'filing_status';
    v_tax_year_end := (p_company_data->>'tax_year_end')::DATE;
    v_assigned_accountant_id := NULL;
    
    -- Extract FBR data
    v_cnic_ntn := p_fbr_data->>'cnic_ntn';
    v_business_name := p_fbr_data->>'business_name';
    v_province_code := p_fbr_data->>'province_code';
    v_address := p_fbr_data->>'address';
    v_mobile_number := p_fbr_data->>'mobile_number';
    
    -- Validate business activity ID
    IF p_fbr_data->>'business_activity_id' IS NULL OR p_fbr_data->>'business_activity_id' = '' THEN
        RAISE EXCEPTION 'Business activity ID is required';
    END IF;
    
    BEGIN
        v_business_activity_id := (p_fbr_data->>'business_activity_id')::INTEGER;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Invalid business activity ID: %. Must be a valid integer', p_fbr_data->>'business_activity_id';
    END;
    
    -- Validate business activity exists
    IF NOT EXISTS (SELECT 1 FROM business_activity WHERE id = v_business_activity_id) THEN
        RAISE EXCEPTION 'Business activity with ID % does not exist', v_business_activity_id;
    END IF;
    
    -- Extract opening balance data
    v_has_opening_balance := p_opening_balance IS NOT NULL;
    IF v_has_opening_balance THEN
        v_opening_amount := (p_opening_balance->>'amount')::NUMERIC;
        v_opening_date := (p_opening_balance->>'date')::DATE;
        
        IF v_opening_amount IS NULL OR v_opening_amount <= 0 THEN
            RAISE EXCEPTION 'Opening balance amount must be greater than 0';
        END IF;
        
        IF v_opening_date IS NULL THEN
            RAISE EXCEPTION 'Opening balance date is required';
        END IF;
    END IF;
    
    -- Validate required fields
    IF v_company_name IS NULL OR v_company_name = '' THEN
        RAISE EXCEPTION 'Company name is required';
    END IF;
    
    IF v_company_type_text IS NULL OR v_company_type_text = '' THEN
        RAISE EXCEPTION 'Company type is required';
    END IF;
    
    IF v_cnic_ntn IS NULL OR v_business_name IS NULL OR v_business_activity_id IS NULL THEN
        RAISE EXCEPTION 'CNIC/NTN, business name, and business activity are required';
    END IF;
    
    -- Now safely cast to enum using explicit casting
    BEGIN
        v_company_type := v_company_type_text::company_type;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Failed to cast company type "%" to enum. Error: %', v_company_type_text, SQLERRM;
    END;
    
    -- Start transaction
    BEGIN
        -- Step 1: Create company with explicit enum casting
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
            v_company_type::company_type,
            CASE WHEN p_skip_tax_info THEN NULL ELSE v_tax_id_number END,
            CASE WHEN p_skip_tax_info THEN NULL ELSE v_filing_status END,
            CASE WHEN p_skip_tax_info THEN NULL ELSE v_tax_year_end END,
            v_assigned_accountant_id,
            TRUE,
            NOW(),
            NOW()
        ) RETURNING id INTO v_company_id;
        
        -- Step 2: Copy COA template to company (removed is_active column)
        INSERT INTO company_coa (
            company_id,
            account_id,
            account_name,
            account_type,
            parent_id,
            created_at,
            updated_at
        )
        SELECT 
            v_company_id,
            account_id,
            account_name,
            account_type,
            parent_id,
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
            
            -- Create journal entry lines
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
        );
        
        -- Return success result
        v_result := jsonb_build_object(
            'success', true,
            'message', 'Onboarding completed successfully',
            'company_id', v_company_id,
            'has_opening_balance', v_has_opening_balance
        );
        
        RETURN v_result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback transaction
            RAISE EXCEPTION 'Onboarding failed: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
