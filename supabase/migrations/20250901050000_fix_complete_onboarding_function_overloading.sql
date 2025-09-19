-- Migration: Fix complete_onboarding_transaction function overloading
-- This removes the duplicate function that has p_user_id as the last parameter

-- First, let's check what functions exist (for debugging)
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Existing functions:';
    FOR rec IN
        SELECT pg_get_function_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'complete_onboarding_transaction'
        AND n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Function signature: complete_onboarding_transaction(%)', rec.arguments;
    END LOOP;
END $$;

-- Drop the function with p_user_id as the last parameter
-- This is the one causing the conflict
DROP FUNCTION IF EXISTS public.complete_onboarding_transaction(
    p_company_data jsonb, 
    p_fbr_data jsonb, 
    p_opening_balance jsonb, 
    p_skip_balance boolean, 
    p_skip_tax_info boolean, 
    p_user_id uuid
);

-- Verify function state after cleanup (non-blocking)
DO $$
DECLARE
    function_count integer;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'complete_onboarding_transaction'
    AND n.nspname = 'public';

    IF function_count = 1 THEN
        RAISE NOTICE 'SUCCESS: Only one complete_onboarding_transaction function remains';
        -- Display the remaining function signature
        FOR rec IN
            SELECT pg_get_function_arguments(p.oid) as arguments
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE p.proname = 'complete_onboarding_transaction'
            AND n.nspname = 'public'
        LOOP
            RAISE NOTICE 'Remaining function: complete_onboarding_transaction(%)', rec.arguments;
        END LOOP;
    ELSIF function_count = 0 THEN
        RAISE NOTICE 'INFO: No complete_onboarding_transaction function found - this is expected if function creation migrations haven''t run yet';
    ELSE
        RAISE NOTICE 'WARNING: Still % complete_onboarding_transaction functions exist - may need manual cleanup', function_count;
        -- List all remaining functions
        FOR rec IN
            SELECT pg_get_function_arguments(p.oid) as arguments
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE p.proname = 'complete_onboarding_transaction'
            AND n.nspname = 'public'
        LOOP
            RAISE NOTICE 'Found function: complete_onboarding_transaction(%)', rec.arguments;
        END LOOP;
    END IF;
END $$;
