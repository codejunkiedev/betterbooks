-- Migration to support multiple business activities per user
-- This replaces the single business_activity_id in fbr_profiles with a many-to-many relationship

-- Create user_business_activities junction table
CREATE TABLE IF NOT EXISTS public.user_business_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_activity_id INTEGER NOT NULL REFERENCES public.business_activities(id) ON DELETE CASCADE,
    business_activity_sector_combination_id INTEGER REFERENCES public.business_activity_sector_combinations(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_activity_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_business_activities_user_id ON public.user_business_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_business_activities_business_activity_id ON public.user_business_activities(business_activity_id);

-- Enable RLS
ALTER TABLE public.user_business_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY user_business_activities_select_own ON public.user_business_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_business_activities_insert_own ON public.user_business_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_business_activities_update_own ON public.user_business_activities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_business_activities_delete_own ON public.user_business_activities
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY user_business_activities_admin_all ON public.user_business_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_business_activities_set_updated_at
    BEFORE UPDATE ON public.user_business_activities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Data migration will be handled in a separate migration after the column is added

-- Add a comment to the table
COMMENT ON TABLE public.user_business_activities IS 'Junction table linking users to their business activities. Supports multiple activities per user with one primary activity.';

-- View creation will be handled in a separate migration after the column is added

-- Function to get user's primary business activity
CREATE OR REPLACE FUNCTION public.get_user_primary_business_activity(p_user_id uuid)
RETURNS TABLE (
    id integer,
    sr integer,
    business_activity varchar,
    sector varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        basc.id,
        basc.sr,
        ba.name as business_activity,
        s.name as sector
    FROM public.user_business_activities uba
    JOIN public.business_activities ba ON uba.business_activity_id = ba.id
    LEFT JOIN public.business_activity_sector_combinations basc ON uba.business_activity_sector_combination_id = basc.id
    LEFT JOIN public.sectors s ON basc.sector_id = s.id
    WHERE uba.user_id = p_user_id 
    AND uba.is_primary = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all user business activities
CREATE OR REPLACE FUNCTION public.get_user_business_activities(p_user_id uuid)
RETURNS TABLE (
    id integer,
    sr integer,
    business_activity varchar,
    sector varchar,
    is_primary boolean,
    created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        basc.id,
        basc.sr,
        ba.name as business_activity,
        s.name as sector,
        uba.is_primary,
        uba.created_at
    FROM public.user_business_activities uba
    JOIN public.business_activities ba ON uba.business_activity_id = ba.id
    LEFT JOIN public.business_activity_sector_combinations basc ON uba.business_activity_sector_combination_id = basc.id
    LEFT JOIN public.sectors s ON basc.sector_id = s.id
    WHERE uba.user_id = p_user_id
    ORDER BY uba.is_primary DESC, uba.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add business activity to user
CREATE OR REPLACE FUNCTION public.add_user_business_activity(
    p_user_id uuid,
    p_business_activity_id integer,
    p_is_primary boolean DEFAULT false
)
RETURNS uuid AS $$
DECLARE
    v_id uuid;
BEGIN
    -- If setting as primary, unset other primary activities
    IF p_is_primary THEN
        UPDATE public.user_business_activities 
        SET is_primary = false 
        WHERE user_id = p_user_id;
    END IF;
    
    -- Insert the new business activity
    INSERT INTO public.user_business_activities (user_id, business_activity_id, is_primary)
    VALUES (p_user_id, p_business_activity_id, p_is_primary)
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove business activity from user
CREATE OR REPLACE FUNCTION public.remove_user_business_activity(
    p_user_id uuid,
    p_business_activity_id integer
)
RETURNS boolean AS $$
DECLARE
    v_was_primary boolean;
    v_remaining_count integer;
BEGIN
    -- Check if this was the primary activity
    SELECT is_primary INTO v_was_primary
    FROM public.user_business_activities
    WHERE user_id = p_user_id AND business_activity_id = p_business_activity_id;
    
    -- Delete the business activity
    DELETE FROM public.user_business_activities
    WHERE user_id = p_user_id AND business_activity_id = p_business_activity_id;
    
    -- If it was primary and there are other activities, make the first one primary
    IF v_was_primary THEN
        SELECT COUNT(*) INTO v_remaining_count
        FROM public.user_business_activities
        WHERE user_id = p_user_id;
        
        IF v_remaining_count > 0 THEN
            UPDATE public.user_business_activities
            SET is_primary = true
            WHERE user_id = p_user_id
            AND id = (
                SELECT id FROM public.user_business_activities
                WHERE user_id = p_user_id
                ORDER BY created_at ASC
                LIMIT 1
            );
        END IF;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set primary business activity
CREATE OR REPLACE FUNCTION public.set_primary_business_activity(
    p_user_id uuid,
    p_business_activity_id integer
)
RETURNS boolean AS $$
BEGIN
    -- Unset all primary activities for this user
    UPDATE public.user_business_activities 
    SET is_primary = false 
    WHERE user_id = p_user_id;
    
    -- Set the specified activity as primary
    UPDATE public.user_business_activities 
    SET is_primary = true 
    WHERE user_id = p_user_id AND business_activity_id = p_business_activity_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
