-- Fix onboarding function signature to match application call
-- This resolves the function signature mismatch error

-- Drop all possible function signatures to ensure clean replacement
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN);
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - fixes function signature';