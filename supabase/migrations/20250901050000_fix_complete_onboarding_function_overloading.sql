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

-- Verify only one function remains
DO $$
DECLARE
    function_count integer;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'complete_onboarding_transaction'
    AND n.nspname = 'public';
    
    IF function_count = 1 THEN
        RAISE NOTICE 'SUCCESS: Only one complete_onboarding_transaction function remains';
    ELSIF function_count = 0 THEN
        RAISE EXCEPTION 'ERROR: No complete_onboarding_transaction function found!';
    ELSE
        RAISE EXCEPTION 'ERROR: Still % complete_onboarding_transaction functions exist', function_count;
    END IF;
END $$;

-- Display the remaining function signature for confirmation
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT pg_get_function_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'complete_onboarding_transaction'
        AND n.nspname = 'public'
    LOOP
        RAISE NOTICE 'Remaining function: complete_onboarding_transaction(%)', rec.arguments;
    END LOOP;
END $$;
