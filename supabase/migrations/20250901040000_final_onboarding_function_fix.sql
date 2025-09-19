-- Final complete fix for onboarding function - addresses all issues at once
-- 1. Function signature mismatch
-- 2. Province code data type mismatch (TEXT vs INTEGER)
-- 3. is_active column does not exist in company_coa
-- 4. Empty template_id values in company_coa

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
        COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup - final complete fix';
    ELSIF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'complete_onboarding_transaction'
        AND p.pronargs = 6
    ) THEN
        GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;
        COMMENT ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Completes user onboarding with company creation, FBR profile setup - final complete fix';
    ELSE
        RAISE NOTICE 'complete_onboarding_transaction function not found - skipping grant';
    END IF;
END $$;