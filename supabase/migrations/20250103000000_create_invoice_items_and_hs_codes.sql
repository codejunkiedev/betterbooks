-- Create invoice_items table for FBR-compliant invoice item management
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    hs_code VARCHAR(20) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    sales_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    uom_code VARCHAR(10) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    value_sales_excluding_st DECIMAL(12,2),
    fixed_notified_value DECIMAL(12,2),
    retail_price DECIMAL(12,2),
    invoice_note TEXT,
    is_third_schedule BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hs_codes_cache table for caching FBR HS codes data
CREATE TABLE IF NOT EXISTS public.hs_codes_cache (
    hs_code VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    default_uom VARCHAR(10),
    default_tax_rate DECIMAL(5,2) DEFAULT 0,
    is_third_schedule BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_hs_code ON public.invoice_items(hs_code);
CREATE INDEX IF NOT EXISTS idx_hs_codes_cache_description ON public.hs_codes_cache USING gin(to_tsvector('english', description));

-- Enable RLS on invoice_items
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice_items (assuming invoices belong to companies/users)
-- Note: This will need to be adjusted based on your actual invoice ownership model
DROP POLICY IF EXISTS invoice_items_select_own ON public.invoice_items;
CREATE POLICY invoice_items_select_own
ON public.invoice_items
FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS invoice_items_insert_own ON public.invoice_items;
CREATE POLICY invoice_items_insert_own
ON public.invoice_items
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS invoice_items_update_own ON public.invoice_items;
CREATE POLICY invoice_items_update_own
ON public.invoice_items
FOR UPDATE
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS invoice_items_delete_own ON public.invoice_items;
CREATE POLICY invoice_items_delete_own
ON public.invoice_items
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Enable RLS on hs_codes_cache (read-only for all authenticated users)
ALTER TABLE public.hs_codes_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hs_codes_cache_select_all ON public.hs_codes_cache;
CREATE POLICY hs_codes_cache_select_all
ON public.hs_codes_cache
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_invoice_items_updated_at 
    BEFORE UPDATE ON public.invoice_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hs_codes_cache_updated_at 
    BEFORE UPDATE ON public.hs_codes_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
