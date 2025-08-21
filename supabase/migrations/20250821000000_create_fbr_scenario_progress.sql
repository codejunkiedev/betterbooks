-- Create FBR scenario progress table to track user scenario completion status
CREATE TABLE IF NOT EXISTS public.fbr_scenario_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scenario_id VARCHAR(10) NOT NULL,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')) DEFAULT 'not_started',
    attempts INT DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    fbr_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, scenario_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_fbr_scenario_progress_user ON public.fbr_scenario_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_fbr_scenario_progress_status ON public.fbr_scenario_progress(status);
CREATE INDEX IF NOT EXISTS idx_fbr_scenario_progress_scenario ON public.fbr_scenario_progress(scenario_id);

-- Enable RLS
ALTER TABLE public.fbr_scenario_progress ENABLE ROW LEVEL SECURITY;

-- User can manage their own scenario progress
DROP POLICY IF EXISTS fbr_scenario_progress_self ON public.fbr_scenario_progress;
CREATE POLICY fbr_scenario_progress_self
ON public.fbr_scenario_progress
FOR ALL
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fbr_scenario_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_fbr_scenario_progress_updated_at ON public.fbr_scenario_progress;
CREATE TRIGGER trigger_update_fbr_scenario_progress_updated_at
    BEFORE UPDATE ON public.fbr_scenario_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_fbr_scenario_progress_updated_at();
