-- Add tax information fields to companies table
ALTER TABLE companies 
ADD COLUMN tax_id_number TEXT,
ADD COLUMN filing_status TEXT,
ADD COLUMN tax_year_end DATE;

-- Add comment to document the new fields
COMMENT ON COLUMN companies.tax_id_number IS 'Tax ID Number (EIN, SSN, etc.)';
COMMENT ON COLUMN companies.filing_status IS 'Filing status (Sole Proprietor, S-Corp, etc.)';
COMMENT ON COLUMN companies.tax_year_end IS 'Tax year end date'; 