-- Increase item_name field length from VARCHAR(200) to VARCHAR(500)
-- This allows for longer product descriptions in invoice items

ALTER TABLE public.invoice_items 
ALTER COLUMN item_name TYPE VARCHAR(500); 