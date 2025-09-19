-- Migration: Drop all complete_onboarding_transaction functions
-- This removes all variants of the complete_onboarding_transaction function

-- First, let's check what functions exist (for debugging)
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Existing complete_onboarding_transaction functions:';
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

-- Drop all complete_onboarding_transaction functions with exact signatures
-- Function 1: p_user_id first
DROP FUNCTION IF EXISTS public.complete_onboarding_transaction(
    p_user_id uuid, 
    p_company_data jsonb, 
    p_fbr_data jsonb, 
    p_opening_balance jsonb, 
    p_skip_balance boolean, 
    p_skip_tax_info boolean
);

-- Function 2: p_user_id last
DROP FUNCTION IF EXISTS public.complete_onboarding_transaction(
    p_company_data jsonb, 
    p_fbr_data jsonb, 
    p_opening_balance jsonb, 
    p_skip_balance boolean, 
    p_skip_tax_info boolean, 
    p_user_id uuid
);

-- Verify no functions remain
DO $$
DECLARE
    function_count integer;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'complete_onboarding_transaction'
    AND n.nspname = 'public';
    
    IF function_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All complete_onboarding_transaction functions have been dropped';
    ELSE
        RAISE NOTICE 'WARNING: Still % complete_onboarding_transaction functions exist', function_count;
    END IF;
END $$;
