-- Insert sample COA template data
INSERT INTO coa_template (account_id, account_name, account_type, parent_id) VALUES
-- Assets
('1000', 'Current Assets', 'asset', NULL),
('1100', 'Cash and Cash Equivalents', 'asset', 1),
('1200', 'Accounts Receivable', 'asset', 1),
('1300', 'Inventory', 'asset', 1),
('1400', 'Prepaid Expenses', 'asset', 1),
('1500', 'Fixed Assets', 'asset', NULL),
('1600', 'Equipment', 'asset', 6),
('1700', 'Buildings', 'asset', 6),
('1800', 'Accumulated Depreciation', 'asset', 6),

-- Liabilities
('2000', 'Current Liabilities', 'liability', NULL),
('2100', 'Accounts Payable', 'liability', 10),
('2200', 'Short-term Loans', 'liability', 10),
('2300', 'Accrued Expenses', 'liability', 10),
('2400', 'Long-term Liabilities', 'liability', NULL),
('2500', 'Long-term Loans', 'liability', 14),
('2600', 'Bonds Payable', 'liability', 14),

-- Equity
('3000', 'Owner''s Equity', 'equity', NULL),
('3100', 'Common Stock', 'equity', 17),
('3200', 'Retained Earnings', 'equity', 17),
('3300', 'Owner''s Draw', 'equity', 17),

-- Revenue
('4000', 'Revenue', 'revenue', NULL),
('4100', 'Sales Revenue', 'revenue', 21),
('4200', 'Service Revenue', 'revenue', 21),
('4300', 'Interest Income', 'revenue', 21),

-- Expenses
('5000', 'Expenses', 'expense', NULL),
('5100', 'Cost of Goods Sold', 'expense', 25),
('5200', 'Operating Expenses', 'expense', 25),
('5210', 'Rent Expense', 'expense', 27),
('5220', 'Utilities Expense', 'expense', 27),
('5230', 'Salaries and Wages', 'expense', 27),
('5240', 'Office Supplies', 'expense', 27),
('5250', 'Insurance Expense', 'expense', 27),
('5260', 'Depreciation Expense', 'expense', 27),
('5300', 'Interest Expense', 'expense', 25),
('5400', 'Tax Expense', 'expense', 25); 