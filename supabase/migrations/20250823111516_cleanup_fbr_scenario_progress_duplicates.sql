-- Clean up duplicate records in fbr_scenario_progress table
-- First, remove duplicate records keeping only the latest one for each user_id + scenario_id combination

-- Delete duplicate records, keeping the one with the highest id (most recent)
DELETE FROM public.fbr_scenario_progress 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM public.fbr_scenario_progress 
    GROUP BY user_id, scenario_id
);

-- Drop the existing unique constraint if it exists
ALTER TABLE public.fbr_scenario_progress 
DROP CONSTRAINT IF EXISTS fbr_scenario_progress_user_id_scenario_id_unique;

-- Drop the original unique constraint if it exists
ALTER TABLE public.fbr_scenario_progress 
DROP CONSTRAINT IF EXISTS fbr_scenario_progress_user_id_scenario_id_key;

-- Add the unique constraint back
ALTER TABLE public.fbr_scenario_progress 
ADD CONSTRAINT fbr_scenario_progress_user_id_scenario_id_unique 
UNIQUE (user_id, scenario_id);
