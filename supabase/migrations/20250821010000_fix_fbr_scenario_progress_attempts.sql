-- Fix FBR scenario progress attempts counter
-- Create function to automatically increment attempts
CREATE OR REPLACE FUNCTION increment_fbr_scenario_attempts()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment attempts when status changes to in_progress, completed, or failed
    IF NEW.status IN ('in_progress', 'completed', 'failed') AND 
       (OLD.status IS NULL OR OLD.status = 'not_started') THEN
        NEW.attempts = COALESCE(OLD.attempts, 0) + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically increment attempts
DROP TRIGGER IF EXISTS trigger_increment_fbr_scenario_attempts ON public.fbr_scenario_progress;
CREATE TRIGGER trigger_increment_fbr_scenario_attempts
    BEFORE UPDATE ON public.fbr_scenario_progress
    FOR EACH ROW
    EXECUTE FUNCTION increment_fbr_scenario_attempts();
