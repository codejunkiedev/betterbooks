-- Migration: Fix user_business_activities table updated_at column issue
-- This migration ensures the user_business_activities table has the updated_at column and fixes the onboarding function

-- First, let's ensure the user_business_activities table has the updated_at column
ALTER TABLE public.user_business_activities
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have updated_at values
UPDATE public.user_business_activities
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- Grant execute permission to authenticated users (with full signature)
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;

-- Add comment (with full signature)
COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup, and support for both new business activity/sector structure and legacy structure - ensures user_business_activities table has updated_at column';