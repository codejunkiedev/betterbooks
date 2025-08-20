-- Create FBR profiles table to store user FBR business info
CREATE TABLE IF NOT EXISTS public.fbr_profiles (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    cnic_ntn VARCHAR(13) NOT NULL,
    business_name VARCHAR(100) NOT NULL,
    province_code INTEGER NOT NULL REFERENCES public.province_codes(state_province_code),
    address VARCHAR(250) NOT NULL,
    mobile_number VARCHAR(13) NOT NULL,
    business_activity_id INT NOT NULL REFERENCES public.business_activity(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraints
ALTER TABLE public.fbr_profiles
    ADD CONSTRAINT fbr_profiles_cnic_ntn_format_chk CHECK (cnic_ntn ~ '^(\d{7}|\d{13})$');

ALTER TABLE public.fbr_profiles
    ADD CONSTRAINT fbr_profiles_mobile_format_chk CHECK (mobile_number ~ '^\+92\d{10}$');

ALTER TABLE public.fbr_profiles
    ADD CONSTRAINT fbr_profiles_cnic_ntn_unique UNIQUE (cnic_ntn);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_fbr_profiles_activity ON public.fbr_profiles(business_activity_id);
CREATE INDEX IF NOT EXISTS idx_fbr_profiles_province ON public.fbr_profiles(province_code);

-- Enable RLS and add policies
ALTER TABLE public.fbr_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own FBR profile
DROP POLICY IF EXISTS fbr_profiles_select_own ON public.fbr_profiles;
CREATE POLICY fbr_profiles_select_own
ON public.fbr_profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to insert their own FBR profile
DROP POLICY IF EXISTS fbr_profiles_insert_own ON public.fbr_profiles;
CREATE POLICY fbr_profiles_insert_own
ON public.fbr_profiles
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to update their own FBR profile
DROP POLICY IF EXISTS fbr_profiles_update_own ON public.fbr_profiles;
CREATE POLICY fbr_profiles_update_own
ON public.fbr_profiles
FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Admins can manage all
DROP POLICY IF EXISTS fbr_profiles_admin_all ON public.fbr_profiles;
CREATE POLICY fbr_profiles_admin_all
ON public.fbr_profiles
FOR ALL
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

-- Optional: Comment for documentation
COMMENT ON TABLE public.fbr_profiles IS 'Stores FBR business profile details for BetterBooks users.'; 