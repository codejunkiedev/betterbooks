-- Migration: Fix complete_onboarding_transaction function parameter order
-- This creates the function with the correct parameter order to match the TypeScript code

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - fixes parameter order';