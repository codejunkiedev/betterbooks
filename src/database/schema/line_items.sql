-- Create the line_items table
CREATE TABLE line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2),
    is_asset BOOLEAN NOT NULL DEFAULT FALSE,
    asset_type TEXT,
    asset_life_months INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on invoice_id for faster lookups
CREATE INDEX idx_line_items_invoice_id ON line_items(invoice_id);

-- Enable Row Level Security (RLS)
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies based on invoice ownership
CREATE POLICY "Users can view their own invoice line items"
    ON line_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = line_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own invoice line items"
    ON line_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = line_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own invoice line items"
    ON line_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = line_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = line_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own invoice line items"
    ON line_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = line_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    ); 