-- Migration: Fix journal entries schema in complete_onboarding_transaction function
-- The current journal_entries table doesn't have a 'reference' column and uses different structure

-- Drop and recreate the function with correct journal entries schema
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
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - fixes journal entries schema';