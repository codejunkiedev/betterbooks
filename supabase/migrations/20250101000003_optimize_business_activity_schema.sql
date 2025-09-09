-- Migration: Optimize Business Activity Schema
-- This migration consolidates and simplifies the business activity tables
-- to remove redundancy and confusion

-- Step 1: Create the new optimized structure

-- Rename business_activities to business_activity_types for clarity
CREATE TABLE IF NOT EXISTS public.business_activity_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keep sectors table as is (already optimized)
CREATE TABLE IF NOT EXISTS public.sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- The user_business_activities table will be created in a later migration
-- We'll add the missing columns when the table exists
DO $$
BEGIN
    -- Only add columns if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public') THEN
        ALTER TABLE public.user_business_activities 
        ADD COLUMN IF NOT EXISTS business_activity_type_id INTEGER REFERENCES public.business_activity_types(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS sector_id INTEGER REFERENCES public.sectors(id) ON DELETE SET NULL;

        -- Add unique constraint for the new structure (only if it doesn't exist)
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'user_business_activities_user_activity_sector_unique'
        ) THEN
            ALTER TABLE public.user_business_activities 
            ADD CONSTRAINT user_business_activities_user_activity_sector_unique 
            UNIQUE(user_id, business_activity_type_id, sector_id);
        END IF;
    END IF;
END $$;

-- Simplified scenario assignments
-- Scenarios can be assigned to business activity types and sectors independently
-- Only create if scenario table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scenario' AND table_schema = 'public') THEN
        CREATE TABLE IF NOT EXISTS public.business_activity_scenarios (
            id SERIAL PRIMARY KEY,
            business_activity_type_id INTEGER REFERENCES public.business_activity_types(id) ON DELETE CASCADE,
            sector_id INTEGER REFERENCES public.sectors(id) ON DELETE CASCADE,
            scenario_id INTEGER NOT NULL REFERENCES public.scenario(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(business_activity_type_id, sector_id, scenario_id)
        );
    END IF;
END $$;

-- Step 2: Migrate data from old tables (only if source tables exist)

-- Migrate business activities (only if source table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activities' AND table_schema = 'public') THEN
        INSERT INTO public.business_activity_types (name, description)
        SELECT DISTINCT name, description 
        FROM public.business_activities
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;

-- Migrate sectors (if not already migrated)
INSERT INTO public.sectors (name, description)
SELECT DISTINCT name, description 
FROM public.sectors
ON CONFLICT (name) DO NOTHING;

-- Migrate user business activities (only if table exists and has the required columns)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_business_activities' AND column_name = 'business_activity_type_id' AND table_schema = 'public') THEN
        -- Update existing records to populate the new columns based on business_activity table
        UPDATE public.user_business_activities 
        SET 
            business_activity_type_id = bat.id,
            sector_id = s.id
        FROM public.business_activity ba
        LEFT JOIN public.sectors s ON ba.sector = s.name
        JOIN public.business_activity_types bat ON ba.business_activity = bat.name
        WHERE user_business_activities.business_activity_id = ba.id
        AND user_business_activities.business_activity_type_id IS NULL;
    END IF;
END $$;

-- Migrate scenarios (only if tables exist)
DO $$
BEGIN
    -- Migrate from business_activity_scenario
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenario' AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        INSERT INTO public.business_activity_scenarios (business_activity_type_id, scenario_id)
        SELECT 
            bat.id as business_activity_type_id,
            bas.scenario_id
        FROM public.business_activity_scenario bas
        JOIN public.business_activity ba ON bas.business_activity_id = ba.id
        JOIN public.business_activity_types bat ON ba.business_activity = bat.name
        ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;
    END IF;

    -- Migrate from business_activity_sector_scenario
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_sector_scenario' AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        INSERT INTO public.business_activity_scenarios (business_activity_type_id, sector_id, scenario_id)
        SELECT 
            bat.id as business_activity_type_id,
            s.id as sector_id,
            bass.scenario_id
        FROM public.business_activity_sector_scenario bass
        JOIN public.business_activity_sector_combinations basc ON bass.business_activity_sector_combination_id = basc.id
        JOIN public.business_activities ba ON basc.business_activity_id = ba.id
        JOIN public.business_activity_types bat ON ba.name = bat.name
        JOIN public.sectors s ON basc.sector_id = s.id
        ON CONFLICT (business_activity_type_id, sector_id, scenario_id) DO NOTHING;
    END IF;
END $$;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_activity_types_name ON public.business_activity_types(name);
CREATE INDEX IF NOT EXISTS idx_sectors_name ON public.sectors(name);

-- Create indexes for user_business_activities only if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_user_business_activities_user_id ON public.user_business_activities(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_business_activities_activity_type ON public.user_business_activities(business_activity_type_id);
        CREATE INDEX IF NOT EXISTS idx_user_business_activities_sector ON public.user_business_activities(sector_id);
        CREATE INDEX IF NOT EXISTS idx_user_business_activities_primary ON public.user_business_activities(user_id, is_primary) WHERE is_primary = true;
    END IF;
END $$;

-- Create indexes for business_activity_scenarios only if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_business_activity_scenarios_activity_type ON public.business_activity_scenarios(business_activity_type_id);
        CREATE INDEX IF NOT EXISTS idx_business_activity_scenarios_sector ON public.business_activity_scenarios(sector_id);
        CREATE INDEX IF NOT EXISTS idx_business_activity_scenarios_scenario ON public.business_activity_scenarios(scenario_id);
    END IF;
END $$;

-- Step 4: Enable RLS
ALTER TABLE public.business_activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

-- Enable RLS for user_business_activities only if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public') THEN
        ALTER TABLE public.user_business_activities ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS for business_activity_scenarios only if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        ALTER TABLE public.business_activity_scenarios ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 5: Create RLS policies
-- Public read access for reference tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'business_activity_types_select_all' AND tablename = 'business_activity_types') THEN
        CREATE POLICY business_activity_types_select_all ON public.business_activity_types FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sectors_select_all' AND tablename = 'sectors') THEN
        CREATE POLICY sectors_select_all ON public.sectors FOR SELECT USING (true);
    END IF;
END $$;

-- Create policies for business_activity_scenarios only if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'business_activity_scenarios_select_all' AND tablename = 'business_activity_scenarios') THEN
            CREATE POLICY business_activity_scenarios_select_all ON public.business_activity_scenarios FOR SELECT USING (true);
        END IF;
    END IF;
END $$;

-- Create policies for user_business_activities only if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_business_activities_select_own' AND tablename = 'user_business_activities') THEN
            CREATE POLICY user_business_activities_select_own ON public.user_business_activities
                FOR SELECT USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_business_activities_insert_own' AND tablename = 'user_business_activities') THEN
            CREATE POLICY user_business_activities_insert_own ON public.user_business_activities
                FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_business_activities_update_own' AND tablename = 'user_business_activities') THEN
            CREATE POLICY user_business_activities_update_own ON public.user_business_activities
                FOR UPDATE USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_business_activities_delete_own' AND tablename = 'user_business_activities') THEN
            CREATE POLICY user_business_activities_delete_own ON public.user_business_activities
                FOR DELETE USING (auth.uid() = user_id);
        END IF;
    END IF;
END $$;

-- Step 6: Create updated_at trigger (only if table exists and trigger doesn't exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'user_business_activities_set_updated_at' AND event_object_table = 'user_business_activities') THEN
            CREATE TRIGGER user_business_activities_set_updated_at
                BEFORE UPDATE ON public.user_business_activities
                FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
        END IF;
    END IF;
END $$;

-- Step 7: Create helper functions (only if tables exist)
-- Create get_user_business_activities function
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_types' AND table_schema = 'public') THEN
        -- Drop existing function if it exists
        DROP FUNCTION IF EXISTS public.get_user_business_activities(uuid);
        
        EXECUTE '
        CREATE OR REPLACE FUNCTION public.get_user_business_activities(p_user_id uuid)
        RETURNS TABLE (
            id uuid,
            business_activity_type_id integer,
            business_activity_name varchar,
            sector_id integer,
            sector_name varchar,
            is_primary boolean,
            created_at timestamp with time zone
        ) AS $func$
        BEGIN
            RETURN QUERY
            SELECT 
                uba.id,
                uba.business_activity_type_id,
                bat.name as business_activity_name,
                uba.sector_id,
                s.name as sector_name,
                uba.is_primary,
                uba.created_at
            FROM public.user_business_activities uba
            JOIN public.business_activity_types bat ON uba.business_activity_type_id = bat.id
            LEFT JOIN public.sectors s ON uba.sector_id = s.id
            WHERE uba.user_id = p_user_id
            ORDER BY uba.is_primary DESC, uba.created_at ASC;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER';
    END IF;
END $$;

-- Create get_user_primary_business_activity function
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_types' AND table_schema = 'public') THEN
        -- Drop existing function if it exists
        DROP FUNCTION IF EXISTS public.get_user_primary_business_activity(uuid);
        
        EXECUTE '
        CREATE OR REPLACE FUNCTION public.get_user_primary_business_activity(p_user_id uuid)
        RETURNS TABLE (
            id uuid,
            business_activity_type_id integer,
            business_activity_name varchar,
            sector_id integer,
            sector_name varchar
        ) AS $func$
        BEGIN
            RETURN QUERY
            SELECT 
                uba.id,
                uba.business_activity_type_id,
                bat.name as business_activity_name,
                uba.sector_id,
                s.name as sector_name
            FROM public.user_business_activities uba
            JOIN public.business_activity_types bat ON uba.business_activity_type_id = bat.id
            LEFT JOIN public.sectors s ON uba.sector_id = s.id
            WHERE uba.user_id = p_user_id 
            AND uba.is_primary = true
            LIMIT 1;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER';
    END IF;
END $$;

-- Create add_user_business_activity function
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_types' AND table_schema = 'public') THEN
        -- Drop existing function if it exists
        DROP FUNCTION IF EXISTS public.add_user_business_activity(uuid, integer, integer, boolean);
        
        EXECUTE '
        CREATE OR REPLACE FUNCTION public.add_user_business_activity(
            p_user_id uuid,
            p_business_activity_type_id integer,
            p_sector_id integer DEFAULT NULL,
            p_is_primary boolean DEFAULT false
        )
        RETURNS void AS $func$
        BEGIN
            INSERT INTO public.user_business_activities (user_id, business_activity_type_id, sector_id, is_primary)
            VALUES (p_user_id, p_business_activity_type_id, p_sector_id, p_is_primary)
            ON CONFLICT (user_id, business_activity_type_id, sector_id) DO UPDATE SET
                is_primary = EXCLUDED.is_primary,
                updated_at = NOW();
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER';
    END IF;
END $$;

-- Create get_available_scenarios_for_user function
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scenario' AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public') THEN
        -- Drop existing function if it exists
        DROP FUNCTION IF EXISTS public.get_available_scenarios_for_user(uuid);
        
        EXECUTE '
        CREATE OR REPLACE FUNCTION public.get_available_scenarios_for_user(p_user_id uuid)
        RETURNS TABLE (
            scenario_id integer,
            scenario_code varchar,
            scenario_description text
        ) AS $func$
        BEGIN
            RETURN QUERY
            SELECT DISTINCT 
                s.id as scenario_id,
                s.code as scenario_code,
                s.description as scenario_description
            FROM public.scenario s
            JOIN public.business_activity_scenarios bas ON s.id = bas.scenario_id
            JOIN public.user_business_activities uba ON (
                (bas.business_activity_type_id = uba.business_activity_type_id) AND
                (bas.sector_id IS NULL OR bas.sector_id = uba.sector_id)
            )
            WHERE uba.user_id = p_user_id
            ORDER BY s.code;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER';
    END IF;
END $$;

-- Step 8: Grant permissions
GRANT SELECT ON public.business_activity_types TO authenticated;
GRANT SELECT ON public.sectors TO authenticated;

-- Grant permissions conditionally
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        GRANT SELECT ON public.business_activity_scenarios TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_business_activities TO authenticated;
    END IF;
    
    -- Grant function permissions if functions exist
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_business_activities' AND routine_schema = 'public') THEN
        GRANT EXECUTE ON FUNCTION public.get_user_business_activities(uuid) TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_primary_business_activity' AND routine_schema = 'public') THEN
        GRANT EXECUTE ON FUNCTION public.get_user_primary_business_activity(uuid) TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'add_user_business_activity' AND routine_schema = 'public') THEN
        GRANT EXECUTE ON FUNCTION public.add_user_business_activity(uuid, integer, integer, boolean) TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_available_scenarios_for_user' AND routine_schema = 'public') THEN
        GRANT EXECUTE ON FUNCTION public.get_available_scenarios_for_user(uuid) TO authenticated;
    END IF;
END $$;

-- Step 9: Add comments
COMMENT ON TABLE public.business_activity_types IS 'Types of business activities (Manufacturer, Importer, etc.)';
COMMENT ON TABLE public.sectors IS 'Business sectors (Steel, FMCG, etc.)';

-- Add comments conditionally
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_business_activities' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.user_business_activities IS 'User assignments to business activity types and sectors';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_activity_scenarios' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.business_activity_scenarios IS 'Scenarios available for specific business activity types and sectors';
    END IF;
END $$;

-- Step 10: Insert default data
INSERT INTO public.business_activity_types (name, description) VALUES
('Manufacturer', 'Businesses that manufacture products'),
('Importer', 'Businesses that import goods'),
('Distributor', 'Businesses that distribute products'),
('Wholesaler', 'Businesses that sell in wholesale'),
('Exporter', 'Businesses that export goods'),
('Retailer', 'Businesses that sell directly to consumers'),
('Service Provider', 'Businesses that provide services'),
('Other', 'Other types of business activities')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.sectors (name, description) VALUES
('All Other Sectors', 'General sector for miscellaneous businesses'),
('Steel', 'Steel and metal industry'),
('FMCG', 'Fast Moving Consumer Goods'),
('Textile', 'Textile and clothing industry'),
('Telecom', 'Telecommunications industry'),
('Petroleum', 'Petroleum and oil industry'),
('Electricity Distribution', 'Electricity distribution and utilities'),
('Gas Distribution', 'Gas distribution and utilities'),
('Services', 'Service industry'),
('Automobile', 'Automotive industry'),
('CNG Stations', 'Compressed Natural Gas stations'),
('Pharmaceuticals', 'Pharmaceutical and healthcare industry'),
('Wholesale / Retails', 'Wholesale and retail trade')
ON CONFLICT (name) DO NOTHING;
