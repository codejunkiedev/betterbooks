-- Create province_codes table
CREATE TABLE IF NOT EXISTS public.province_codes (
    id SERIAL PRIMARY KEY,
    state_province_code INTEGER NOT NULL UNIQUE,
    state_province_desc VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE public.province_codes IS 'Stores Pakistani provinces and territories with their codes';

-- Insert the provided province data
INSERT INTO public.province_codes (state_province_code, state_province_desc) VALUES
    (2, 'BALOCHISTAN'),
    (4, 'AZAD JAMMU AND KASHMIR'),
    (5, 'CAPITAL TERRITORY'),
    (6, 'KHYBER PAKHTUNKHWA'),
    (7, 'PUNJAB'),
    (8, 'SINDH'),
    (9, 'GILGIT BALTISTAN')
ON CONFLICT (state_province_code) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.province_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for province_codes table
-- Allow all authenticated users to read province codes
CREATE POLICY province_codes_select_all ON public.province_codes
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Allow admins to manage province codes
CREATE POLICY province_codes_admin_all ON public.province_codes
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_province_codes_code ON public.province_codes(state_province_code);
CREATE INDEX IF NOT EXISTS idx_province_codes_desc ON public.province_codes(state_province_desc);
