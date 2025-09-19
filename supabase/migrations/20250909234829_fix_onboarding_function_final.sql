-- Migration: Final fix for complete_onboarding_transaction function
-- This recreates the function with the correct schema for company_coa and business activities

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - final fix';