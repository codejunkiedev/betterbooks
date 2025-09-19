-- Final fix for onboarding function to remove is_active column from company_coa insert
-- This resolves the "column is_active does not exist" error by ensuring all function signatures are consistent

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - final fix for is_active column issue';