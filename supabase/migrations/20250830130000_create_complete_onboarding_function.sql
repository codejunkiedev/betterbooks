-- Create a comprehensive onboarding transaction function

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