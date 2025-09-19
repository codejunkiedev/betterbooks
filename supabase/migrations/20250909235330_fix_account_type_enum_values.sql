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

-- Note: GRANT and COMMENT statements removed because function was dropped above
-- These would fail since the function no longer exists after the DROP statement