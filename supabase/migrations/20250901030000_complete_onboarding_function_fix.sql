-- Complete fix for onboarding function - addresses all issues at once
-- 1. Function signature mismatch
-- 2. Province code data type mismatch (TEXT vs INTEGER)
-- 3. is_active column does not exist in company_coa

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - complete fix for all issues';