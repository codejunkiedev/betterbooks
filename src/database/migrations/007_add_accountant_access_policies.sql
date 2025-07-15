-- Add RLS policies to allow accountants to access their assigned clients' data

-- Companies: Allow accountants to view companies assigned to them
CREATE POLICY "Accountants can view their assigned companies"
    ON companies FOR SELECT
    USING (
        assigned_accountant_id IN (
            SELECT id FROM accountants 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Documents: Allow accountants to view documents from their assigned companies
CREATE POLICY "Accountants can view documents from assigned companies"
    ON documents FOR SELECT
    USING (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() 
            AND a.is_active = true
        )
    );

-- Documents: Allow accountants to update document status for their assigned companies
CREATE POLICY "Accountants can update documents from assigned companies"
    ON documents FOR UPDATE
    USING (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() 
            AND a.is_active = true
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN accountants a ON c.assigned_accountant_id = a.id
            WHERE a.user_id = auth.uid() 
            AND a.is_active = true
        )
    ); 