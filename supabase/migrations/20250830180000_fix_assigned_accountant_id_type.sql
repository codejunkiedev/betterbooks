-- Fix onboarding function to handle assigned_accountant_id as UUID
-- Drop the function if it exists and recreate it
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding_transaction IS 'Completes user onboarding with company creation, FBR profile setup - fixes assigned_accountant_id type';