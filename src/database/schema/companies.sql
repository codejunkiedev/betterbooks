-- Create the companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    company_name VARCHAR(255) NOT NULL,
    account_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    opening_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    closing_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    number_of_invoices INTEGER NOT NULL DEFAULT 0,
    total_credit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_debit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX idx_companies_user_id ON companies(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Users can view their own companies"
    ON companies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
    ON companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
    ON companies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
    ON companies FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
-- ======================= Alter table for new name =======================

-- Rename company table to companies
ALTER TABLE company RENAME TO companies;

-- Rename the index
ALTER INDEX idx_company_user_id RENAME TO idx_companies_user_id;

-- Rename the trigger
ALTER TRIGGER update_company_updated_at ON companies RENAME TO update_companies_updated_at;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can delete their own company" ON companies;

CREATE POLICY "Users can view their own companies"
    ON companies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
    ON companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
    ON companies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
    ON companies FOR DELETE
    USING (auth.uid() = user_id);