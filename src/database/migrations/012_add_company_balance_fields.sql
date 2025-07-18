-- Add balance fields to companies table
ALTER TABLE companies 
ADD COLUMN account_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
ADD COLUMN opening_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
ADD COLUMN closing_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
ADD COLUMN total_debit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
ADD COLUMN total_credit DECIMAL(15,2) NOT NULL DEFAULT 0.00;

-- Add indexes for performance
CREATE INDEX idx_companies_account_balance ON companies(account_balance);
CREATE INDEX idx_companies_total_debit ON companies(total_debit);
CREATE INDEX idx_companies_total_credit ON companies(total_credit); 