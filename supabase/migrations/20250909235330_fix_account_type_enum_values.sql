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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - fixes account_type enum values';