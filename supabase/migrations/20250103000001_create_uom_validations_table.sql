-- Create uom_validations table for caching FBR UoM validation results
CREATE TABLE IF NOT EXISTS public.uom_validations (
    id BIGSERIAL PRIMARY KEY,
    hs_code VARCHAR(20) NOT NULL,
    valid_uoms JSON NOT NULL,
    recommended_uom VARCHAR(10),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    UNIQUE(hs_code)
);

-- Create index for uom_validations
CREATE INDEX IF NOT EXISTS idx_uom_validations_hs_code ON public.uom_validations(hs_code);
CREATE INDEX IF NOT EXISTS idx_uom_validations_expires_at ON public.uom_validations(expires_at);

-- Enable RLS on uom_validations
ALTER TABLE public.uom_validations ENABLE ROW LEVEL SECURITY;

-- Create policies for uom_validations (read-only for all authenticated users)
DROP POLICY IF EXISTS uom_validations_select_all ON public.uom_validations;
CREATE POLICY uom_validations_select_all
ON public.uom_validations
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS uom_validations_insert_all ON public.uom_validations;
CREATE POLICY uom_validations_insert_all
ON public.uom_validations
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS uom_validations_update_all ON public.uom_validations;
CREATE POLICY uom_validations_update_all
ON public.uom_validations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_uom_validations_updated_at 
    BEFORE UPDATE ON public.uom_validations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
