-- Step 1: Create enum type named `status`
CREATE TYPE status AS ENUM ('pending', 'processing', 'completed', 'failed', 'approved');

-- Create enum type for invoice type
CREATE TYPE invoice_type AS ENUM ('debit', 'credit');

-- Step 2: Create the invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    file JSONB NOT NULL CHECK (jsonb_typeof(file) = 'object'),
    status status NOT NULL DEFAULT 'pending',
    type invoice_type,
    opening_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    closing_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Index on user_id only
CREATE INDEX idx_invoices_user_id ON invoices(user_id);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Step 5: Define RLS Policies
CREATE POLICY "Users can view their own invoices"
    ON invoices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
    ON invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
    ON invoices FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
    ON invoices FOR DELETE
    USING (auth.uid() = user_id);
