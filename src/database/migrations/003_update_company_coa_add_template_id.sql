-- Add template_id column to company_coa table
ALTER TABLE public.company_coa 
ADD COLUMN template_id bigint REFERENCES public.coa_template(id) ON DELETE CASCADE;

-- Add composite unique constraint
ALTER TABLE public.company_coa 
ADD CONSTRAINT company_coa_template_company_unique UNIQUE(template_id, company_id);

-- Create index on template_id
CREATE INDEX idx_company_coa_template_id ON company_coa(template_id);

-- Create composite index on template_id and company_id
CREATE INDEX idx_company_coa_template_company ON company_coa(template_id, company_id);

-- Make template_id NOT NULL after adding the column
-- Note: This should be done after populating existing records with template_id values
-- ALTER TABLE public.company_coa ALTER COLUMN template_id SET NOT NULL; 