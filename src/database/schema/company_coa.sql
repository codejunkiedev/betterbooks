-- Create the company_coa table
CREATE TABLE public.company_coa (
  id bigserial primary key,
  template_id bigint not null references public.coa_template(id) on delete cascade,
  account_id text not null,
  account_name text not null,
  account_type account_type,
  parent_id bigint references public.company_coa(id) on delete set null,
  company_id bigint not null references public.companies(id) on delete cascade,
  credit_balance numeric default 0,
  debit_balance numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(template_id, company_id)
);

-- Create index on account_id
CREATE INDEX idx_company_coa_account_id ON company_coa(account_id);

-- Create index on parent_id
CREATE INDEX idx_company_coa_parent_id ON company_coa(parent_id);

-- Create index on company_id
CREATE INDEX idx_company_coa_company_id ON company_coa(company_id);

-- Create index on template_id
CREATE INDEX idx_company_coa_template_id ON company_coa(template_id);

-- Create composite index on template_id and company_id
CREATE INDEX idx_company_coa_template_company ON company_coa(template_id, company_id);

-- Enable Row Level Security (RLS)
ALTER TABLE company_coa ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Users can view their own company COA"
    ON company_coa FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM companies 
        WHERE companies.id = company_coa.company_id 
        AND companies.user_id = auth.uid()
      )
    );

CREATE POLICY "Users can insert their own company COA"
    ON company_coa FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM companies 
        WHERE companies.id = company_coa.company_id 
        AND companies.user_id = auth.uid()
      )
    );

CREATE POLICY "Users can update their own company COA"
    ON company_coa FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM companies 
        WHERE companies.id = company_coa.company_id 
        AND companies.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM companies 
        WHERE companies.id = company_coa.company_id 
        AND companies.user_id = auth.uid()
      )
    );

CREATE POLICY "Users can delete their own company COA"
    ON company_coa FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM companies 
        WHERE companies.id = company_coa.company_id 
        AND companies.user_id = auth.uid()
      )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_coa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_coa_updated_at
    BEFORE UPDATE ON company_coa
    FOR EACH ROW
    EXECUTE FUNCTION update_company_coa_updated_at(); 