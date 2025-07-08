-- Create the coa_template table
CREATE TABLE public.coa_template (
  id bigserial primary key,
  account_id text not null,
  account_name text not null,
  account_type account_type,
  parent_id bigint references public.coa_template(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index on account_id
CREATE INDEX idx_coa_template_account_id ON coa_template(account_id);

-- Create index on parent_id
CREATE INDEX idx_coa_template_parent_id ON coa_template(parent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE coa_template ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies - Allow all authenticated users to read template
CREATE POLICY "Allow authenticated users to read coa_template"
    ON coa_template FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coa_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coa_template_updated_at
    BEFORE UPDATE ON coa_template
    FOR EACH ROW
    EXECUTE FUNCTION update_coa_template_updated_at(); 