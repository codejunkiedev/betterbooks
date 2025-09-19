-- Migration: Update complete_onboarding_transaction function to support new business activity and sector structure


-- Grant execute permission to authenticated users (check function signature first)
DO $$
BEGIN
    -- Check if function exists with 5 parameters (actual signature)
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'complete_onboarding_transaction'
        AND p.pronargs = 5
    ) THEN
        GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN) TO authenticated;
    ELSIF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'complete_onboarding_transaction'
        AND p.pronargs = 6
    ) THEN
        GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;
    ELSE
        RAISE NOTICE 'complete_onboarding_transaction function not found - skipping grant';
    END IF;
END $$;

-- Add comment (with full signature)
COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup, and support for both new business activity/sector structure and legacy structure';
