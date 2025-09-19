-- Migration: Fix onboarding function to remove updated_at column references that don't exist


-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup, and support for both new business activity/sector structure and legacy structure - fixed for missing updated_at columns';
