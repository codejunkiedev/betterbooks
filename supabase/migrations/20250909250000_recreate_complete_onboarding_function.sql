-- Migration: Recreate complete_onboarding_transaction function with updated schema
-- This fixes the 404 error and updates the function to work with the current business activity structure

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - recreated with updated schema';