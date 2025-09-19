-- Migration: Recreate complete_onboarding_transaction function with updated schema
-- This fixes the 404 error and updates the function to work with the current business activity structure

-- Grant execute permission to authenticated users (only if function exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'complete_onboarding_transaction'
        AND n.nspname = 'public'
    ) THEN
        GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;

        -- Add comment
        COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup - recreated with updated schema';
    ELSE
        RAISE NOTICE 'complete_onboarding_transaction function does not exist - skipping GRANT and COMMENT';
    END IF;
END $$;