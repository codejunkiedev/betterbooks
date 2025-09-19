-- Migration: Fix FBR profile RLS policy to work with onboarding function
-- The issue is that SECURITY DEFINER functions create records but RLS blocks regular queries

-- First, let's check and update the RLS policy for fbr_profiles
-- We need to ensure that the policy allows users to see their own profiles

-- Drop and recreate the select policy with better logic
DO $$
BEGIN
    -- Drop existing select policy if it exists
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fbr_profiles_select_own' AND tablename = 'fbr_profiles') THEN
        DROP POLICY fbr_profiles_select_own ON public.fbr_profiles;
    END IF;

    -- Create new select policy that works properly
    CREATE POLICY fbr_profiles_select_own ON public.fbr_profiles
        FOR SELECT USING (
            -- Allow if auth.uid() matches user_id
            auth.uid() = user_id
            OR
            -- Allow if user is authenticated and the record exists (for SECURITY DEFINER functions)
            (auth.role() = 'authenticated' AND user_id IS NOT NULL)
        );
END $$;

-- Also ensure the insert policy allows the function to create records
DO $$
BEGIN
    -- Drop existing insert policy if it exists
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fbr_profiles_insert_own' AND tablename = 'fbr_profiles') THEN
        DROP POLICY fbr_profiles_insert_own ON public.fbr_profiles;
    END IF;

    -- Create new insert policy
    CREATE POLICY fbr_profiles_insert_own ON public.fbr_profiles
        FOR INSERT WITH CHECK (
            -- Allow if auth.uid() matches user_id
            auth.uid() = user_id
            OR
            -- Allow if it's a SECURITY DEFINER function (no auth.uid() but authenticated role)
            (auth.role() = 'authenticated' AND user_id IS NOT NULL)
        );
END $$;

-- Alternative approach: Create a more permissive policy specifically for authenticated users
-- This is safer than the above approach

DO $$
BEGIN
    -- Drop the overly permissive policies we just created
    DROP POLICY IF EXISTS fbr_profiles_select_own ON public.fbr_profiles;
    DROP POLICY IF EXISTS fbr_profiles_insert_own ON public.fbr_profiles;

    -- Create a simpler, more secure policy that just checks authentication
    -- and lets authenticated users see records where user_id matches auth.uid()
    CREATE POLICY fbr_profiles_select_own ON public.fbr_profiles
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY fbr_profiles_insert_own ON public.fbr_profiles
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- The real fix is to ensure auth.uid() is properly set when the function runs
    -- Let's modify the complete_onboarding_transaction function to handle this better
END $$;

-- The key insight is that SECURITY DEFINER functions run with elevated privileges
-- but we need to ensure the user context is maintained for RLS
-- Let's create a wrapper function that maintains user context

CREATE OR REPLACE FUNCTION public.complete_onboarding_transaction_wrapper(
    p_user_id UUID,
    p_company_data JSONB,
    p_fbr_data JSONB,
    p_opening_balance JSONB DEFAULT NULL,
    p_skip_balance BOOLEAN DEFAULT FALSE,
    p_skip_tax_info BOOLEAN DEFAULT FALSE
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Verify that the authenticated user matches the user_id parameter
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'User ID mismatch: authenticated user does not match provided user ID';
    END IF;

    -- Call the original function
    SELECT public.complete_onboarding_transaction(
        p_user_id,
        p_company_data,
        p_fbr_data,
        p_opening_balance,
        p_skip_balance,
        p_skip_tax_info
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;  -- Note: SECURITY INVOKER instead of DEFINER

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction_wrapper(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.complete_onboarding_transaction_wrapper(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) IS 'Wrapper for complete_onboarding_transaction that maintains user context for RLS';