-- Migration: Fix updated_at trigger issue in user_business_activities table
-- The trigger expects updated_at to be present in NEW record, but INSERT statements don't include it

-- Drop the existing trigger
DROP TRIGGER IF EXISTS user_business_activities_set_updated_at ON public.user_business_activities;

-- Create a new trigger function that handles both INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists in the NEW record
    -- For INSERT operations, we'll set it explicitly in the INSERT statement
    -- For UPDATE operations, we'll set it here
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger only for UPDATE operations
CREATE TRIGGER user_business_activities_set_updated_at
    BEFORE UPDATE ON public.user_business_activities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- Grant execute permission to authenticated users (with full signature)
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;

-- Add comment (with full signature)
COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup, and support for both new business activity/sector structure and legacy structure - fixed for updated_at trigger issues by including updated_at columns in all INSERT statements';
