-- Create invoices table to store invoice data
CREATE TABLE IF NOT EXISTS public.invoices (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_ref_no VARCHAR(100) NOT NULL,
    invoice_type VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    seller_ntn_cnic VARCHAR(13) NOT NULL,
    seller_business_name VARCHAR(100) NOT NULL,
    seller_province VARCHAR(50) NOT NULL,
    seller_address VARCHAR(250) NOT NULL,
    buyer_ntn_cnic VARCHAR(13) NOT NULL,
    buyer_business_name VARCHAR(100) NOT NULL,
    buyer_province VARCHAR(50) NOT NULL,
    buyer_address VARCHAR(250) NOT NULL,
    buyer_registration_type VARCHAR(50) NOT NULL,
    scenario_id VARCHAR(50),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    notes TEXT,
    fbr_response JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_ref_no ON public.invoices(invoice_ref_no);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);

-- Create unique constraint on invoice_ref_no per user
ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_user_ref_no_unique UNIQUE (user_id, invoice_ref_no);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
DROP POLICY IF EXISTS invoices_select_own ON public.invoices;
CREATE POLICY invoices_select_own
ON public.invoices
FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to insert their own invoices
DROP POLICY IF EXISTS invoices_insert_own ON public.invoices;
CREATE POLICY invoices_insert_own
ON public.invoices
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to update their own invoices
DROP POLICY IF EXISTS invoices_update_own ON public.invoices;
CREATE POLICY invoices_update_own
ON public.invoices
FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to delete their own invoices
DROP POLICY IF EXISTS invoices_delete_own ON public.invoices;
CREATE POLICY invoices_delete_own
ON public.invoices
FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_updated_at();
