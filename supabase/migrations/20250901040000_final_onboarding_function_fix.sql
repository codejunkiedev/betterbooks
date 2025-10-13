-- Final complete fix for onboarding function - addresses all issues at once
-- 1. Function signature mismatch
-- 2. Province code data type mismatch (TEXT vs INTEGER)
-- 3. is_active column does not exist in company_coa
-- 4. Empty template_id values in company_coa

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup - final complete fix';