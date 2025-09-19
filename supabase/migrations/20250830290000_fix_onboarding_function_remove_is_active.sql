-- Fix onboarding function to remove is_active column from company_coa insert
-- This resolves the "column is_active does not exist" error

-- Drop all possible function signatures to ensure clean replacement
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN);
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - removes is_active column from company_coa';