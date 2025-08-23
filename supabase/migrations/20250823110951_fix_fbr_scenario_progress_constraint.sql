-- Fix unique constraint issue for fbr_scenario_progress table
-- First, drop the existing unique constraint if it exists
DO $$ 
BEGIN
    -- Drop the unique constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fbr_scenario_progress_user_id_scenario_id_key' 
        AND table_name = 'fbr_scenario_progress'
    ) THEN
        ALTER TABLE public.fbr_scenario_progress 
        DROP CONSTRAINT fbr_scenario_progress_user_id_scenario_id_key;
    END IF;
    
    -- Drop the UNIQUE constraint we created if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fbr_scenario_progress_user_id_scenario_id_unique' 
        AND table_name = 'fbr_scenario_progress'
    ) THEN
        ALTER TABLE public.fbr_scenario_progress 
        DROP CONSTRAINT fbr_scenario_progress_user_id_scenario_id_unique;
    END IF;
    
    -- Create the unique constraint with a specific name
    ALTER TABLE public.fbr_scenario_progress 
    ADD CONSTRAINT fbr_scenario_progress_user_id_scenario_id_unique 
    UNIQUE (user_id, scenario_id);
    
EXCEPTION
    WHEN OTHERS THEN
        -- If there are duplicate records, clean them up first
        DELETE FROM public.fbr_scenario_progress 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM public.fbr_scenario_progress 
            GROUP BY user_id, scenario_id
        );
        
        -- Then add the constraint
        ALTER TABLE public.fbr_scenario_progress 
        ADD CONSTRAINT fbr_scenario_progress_user_id_scenario_id_unique 
        UNIQUE (user_id, scenario_id);
END $$;
