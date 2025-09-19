-- Migration: Fix business activity table references
-- This migration fixes the references to use the correct table names and structure

-- First, ensure the business_activities table exists (it should from previous migrations)
-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.business_activities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the sectors table exists
CREATE TABLE IF NOT EXISTS public.sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the business_activity_sector_combinations table exists
CREATE TABLE IF NOT EXISTS public.business_activity_sector_combinations (
    id SERIAL PRIMARY KEY,
    business_activity_id INTEGER NOT NULL REFERENCES public.business_activities(id) ON DELETE CASCADE,
    sector_id INTEGER NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
    sr INTEGER UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_activity_id, sector_id)
);

-- Enable RLS on tables if not already enabled
ALTER TABLE public.business_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_activity_sector_combinations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (these tables should be readable by all authenticated users)
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS business_activities_select_all ON public.business_activities;
    DROP POLICY IF EXISTS sectors_select_all ON public.sectors;
    DROP POLICY IF EXISTS business_activity_sector_combinations_select_all ON public.business_activity_sector_combinations;
    
    -- Create new policies
    CREATE POLICY business_activities_select_all ON public.business_activities FOR SELECT USING (true);
    CREATE POLICY sectors_select_all ON public.sectors FOR SELECT USING (true);
    CREATE POLICY business_activity_sector_combinations_select_all ON public.business_activity_sector_combinations FOR SELECT USING (true);
EXCEPTION
    WHEN OTHERS THEN
        -- If policies already exist, continue
        NULL;
END $$;

-- Update the user_business_activities table to ensure it has the correct structure
-- Add the business_activity_sector_combination_id column if it doesn't exist
ALTER TABLE public.user_business_activities 
ADD COLUMN IF NOT EXISTS business_activity_sector_combination_id INTEGER REFERENCES public.business_activity_sector_combinations(id) ON DELETE CASCADE;

-- Create index for the new column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_business_activities_combination ON public.user_business_activities(business_activity_sector_combination_id);

-- Update the foreign key constraint to reference the correct table
-- First, drop the old constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_business_activities_business_activity_id_fkey'
        AND table_name = 'user_business_activities'
    ) THEN
        ALTER TABLE public.user_business_activities 
        DROP CONSTRAINT user_business_activities_business_activity_id_fkey;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If constraint doesn't exist or can't be dropped, continue
        NULL;
END $$;

-- Add the correct foreign key constraint
DO $$
BEGIN
    ALTER TABLE public.user_business_activities 
    ADD CONSTRAINT user_business_activities_business_activity_id_fkey 
    FOREIGN KEY (business_activity_id) REFERENCES public.business_activities(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, continue
        NULL;
    WHEN OTHERS THEN
        -- Other errors, continue
        NULL;
END $$;

-- Recreate the functions with the correct table references
-- Drop all functions first since we're changing their return types/signatures
DROP FUNCTION IF EXISTS public.get_user_primary_business_activity(uuid);
DROP FUNCTION IF EXISTS public.get_user_business_activities(uuid);
DROP FUNCTION IF EXISTS public.add_user_business_activity(uuid, integer, boolean);
DROP FUNCTION IF EXISTS public.remove_user_business_activity(uuid, integer);
DROP FUNCTION IF EXISTS public.set_primary_business_activity(uuid, integer);
DROP FUNCTION IF EXISTS public.get_available_sectors_for_activities(integer[]);
DROP FUNCTION IF EXISTS public.get_scenarios_for_combinations(integer[], integer[]);

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

-- Create or update the add_user_business_activity function
CREATE OR REPLACE FUNCTION public.add_user_business_activity(
    p_user_id uuid,
    p_business_activity_id integer,
    p_is_primary boolean DEFAULT false
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_business_activities (user_id, business_activity_id, is_primary)
    VALUES (p_user_id, p_business_activity_id, p_is_primary)
    ON CONFLICT (user_id, business_activity_id) DO UPDATE SET
        is_primary = EXCLUDED.is_primary,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update the remove_user_business_activity function
CREATE OR REPLACE FUNCTION public.remove_user_business_activity(
    p_user_id uuid,
    p_business_activity_id integer
)
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_business_activities 
    WHERE user_id = p_user_id AND business_activity_id = p_business_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update the set_primary_business_activity function
CREATE OR REPLACE FUNCTION public.set_primary_business_activity(
    p_user_id uuid,
    p_business_activity_id integer
)
RETURNS void AS $$
BEGIN
    -- First, set all activities for this user to non-primary
    UPDATE public.user_business_activities 
    SET is_primary = false, updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Then set the specified activity as primary
    UPDATE public.user_business_activities 
    SET is_primary = true, updated_at = NOW()
    WHERE user_id = p_user_id AND business_activity_id = p_business_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the get_available_sectors_for_activities function
CREATE OR REPLACE FUNCTION public.get_available_sectors_for_activities(p_business_activity_ids integer[])
RETURNS TABLE (
    id integer,
    name varchar,
    description text
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT s.id, s.name, s.description
    FROM public.sectors s
    JOIN public.business_activity_sector_combinations basc ON s.id = basc.sector_id
    WHERE basc.business_activity_id = ANY(p_business_activity_ids)
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the get_scenarios_for_combinations function
CREATE OR REPLACE FUNCTION public.get_scenarios_for_combinations(
    p_business_activity_ids integer[],
    p_sector_ids integer[]
)
RETURNS TABLE (
    scenario_id integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT bass.scenario_id
    FROM public.business_activity_sector_scenario bass
    JOIN public.business_activity_sector_combinations basc ON bass.business_activity_sector_combination_id = basc.id
    WHERE basc.business_activity_id = ANY(p_business_activity_ids)
    AND basc.sector_id = ANY(p_sector_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_primary_business_activity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_business_activities(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_business_activity(uuid, integer, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_business_activity(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_primary_business_activity(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_sectors_for_activities(integer[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_scenarios_for_combinations(integer[], integer[]) TO authenticated;
