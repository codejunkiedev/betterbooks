-- Create invoice_sequences table for auto-incrementing invoice numbers per user per year
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    last_number INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_sequences_user_year ON public.invoice_sequences(user_id, year);

-- Enable RLS on invoice_sequences
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice_sequences
DROP POLICY IF EXISTS invoice_sequences_select_own ON public.invoice_sequences;
CREATE POLICY invoice_sequences_select_own
ON public.invoice_sequences
FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to insert their own invoice sequences
DROP POLICY IF EXISTS invoice_sequences_insert_own ON public.invoice_sequences;
CREATE POLICY invoice_sequences_insert_own
ON public.invoice_sequences
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to update their own invoice sequences
DROP POLICY IF EXISTS invoice_sequences_update_own ON public.invoice_sequences;
CREATE POLICY invoice_sequences_update_own
ON public.invoice_sequences
FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Create function to get next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number(user_uuid uuid, invoice_year integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number integer;
    invoice_number text;
BEGIN
    -- Insert or update the sequence for this user and year
    INSERT INTO public.invoice_sequences (user_id, year, last_number)
    VALUES (user_uuid, invoice_year, 1)
    ON CONFLICT (user_id, year)
    DO UPDATE SET 
        last_number = public.invoice_sequences.last_number + 1,
        updated_at = NOW()
    RETURNING last_number INTO next_number;
    
    -- Format: {YYYY}-{user_id}-{sequence}
    invoice_number := invoice_year::text || '-' || user_uuid::text || '-' || next_number::text;
    
    RETURN invoice_number;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_next_invoice_number(uuid, integer) TO authenticated;
