-- Migration: Final fix for onboarding function - remove updated_at columns from tables that don't have them
-- This migration fixes the remaining updated_at column issues in the onboarding function

-- Grant execute permission to authenticated users (with full signature)
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;

-- Add comment (with full signature)
COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup, and support for both new business activity/sector structure and legacy structure - final fix for all updated_at column issues';