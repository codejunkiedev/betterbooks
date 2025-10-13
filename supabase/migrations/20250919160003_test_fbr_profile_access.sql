-- Migration: Test FBR profile creation and access
-- This migration creates a simple test function to verify FBR profile creation

-- Create a test function to check if FBR profiles are being created
CREATE OR REPLACE FUNCTION public.test_fbr_profile_existence(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_profile_count INTEGER;
    v_auth_uid UUID;
    v_profile_data JSONB;
BEGIN
    -- Get current auth.uid()
    v_auth_uid := auth.uid();

    -- Count FBR profiles for the user (bypassing RLS)
    SELECT COUNT(*) INTO v_profile_count
    FROM public.fbr_profiles
    WHERE user_id = p_user_id;

    -- Try to get the profile data (bypassing RLS)
    SELECT jsonb_build_object(
        'user_id', user_id,
        'cnic_ntn', cnic_ntn,
        'business_name', business_name,
        'created_at', created_at
    ) INTO v_profile_data
    FROM public.fbr_profiles
    WHERE user_id = p_user_id
    LIMIT 1;

    RETURN jsonb_build_object(
        'auth_uid', v_auth_uid,
        'searched_user_id', p_user_id,
        'profile_count', v_profile_count,
        'profile_data', v_profile_data,
        'auth_uid_matches', (v_auth_uid = p_user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.test_fbr_profile_existence(UUID) TO authenticated;

-- Create a function to test RLS policy specifically
CREATE OR REPLACE FUNCTION public.test_fbr_rls_policy(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_profile_count_with_rls INTEGER;
    v_profile_count_without_rls INTEGER;
    v_auth_uid UUID;
BEGIN
    -- Get current auth.uid()
    v_auth_uid := auth.uid();

    -- Count with RLS (normal query)
    SELECT COUNT(*) INTO v_profile_count_with_rls
    FROM public.fbr_profiles
    WHERE user_id = p_user_id;

    -- Count without RLS (system query)
    SET LOCAL row_security = off;
    SELECT COUNT(*) INTO v_profile_count_without_rls
    FROM public.fbr_profiles
    WHERE user_id = p_user_id;
    SET LOCAL row_security = on;

    RETURN jsonb_build_object(
        'auth_uid', v_auth_uid,
        'searched_user_id', p_user_id,
        'count_with_rls', v_profile_count_with_rls,
        'count_without_rls', v_profile_count_without_rls,
        'rls_blocking', (v_profile_count_without_rls > v_profile_count_with_rls)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.test_fbr_rls_policy(UUID) TO authenticated;