-- Fix the documents table foreign key and RLS policy
-- First, drop the existing foreign key constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_user_id_fkey;

-- Add the correct foreign key constraint to reference auth.users instead of profiles
ALTER TABLE documents 
ADD CONSTRAINT documents_uploaded_by_user_id_fkey 
FOREIGN KEY (uploaded_by_user_id) REFERENCES auth.users(id);

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert documents for their company" ON documents;

-- Create the corrected INSERT policy
CREATE POLICY "Users can insert documents for their company"
    ON documents FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT id FROM companies 
            WHERE user_id = auth.uid()
        ) AND
        uploaded_by_user_id = auth.uid()
    );

-- Also update the document_type enum to include RECEIPT and OTHER
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'RECEIPT';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'OTHER'; 