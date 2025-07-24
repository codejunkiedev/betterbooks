-- Create account_type enum
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'CONTRA_REVENUE', 'COGS', 'EXPENSE');

-- Update existing tables to use the enum
ALTER TABLE coa_template ALTER COLUMN account_type TYPE account_type USING account_type::account_type;
ALTER TABLE company_coa ALTER COLUMN account_type TYPE account_type USING account_type::account_type; 