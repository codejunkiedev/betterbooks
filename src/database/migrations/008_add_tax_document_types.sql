-- Add new tax document types to the document_type enum
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'TAX_RETURN';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'TAX_VOUCHER';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'TAX_SUMMARY'; 