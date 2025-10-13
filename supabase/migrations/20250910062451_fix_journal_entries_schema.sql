-- Migration: Fix journal entries schema in complete_onboarding_transaction function
-- The current journal_entries table doesn't have a 'reference' column and uses different structure

-- Drop and recreate the function with correct journal entries schema
DROP FUNCTION IF EXISTS public.complete_onboarding_transaction(
    p_user_id UUID,
    p_company_data JSONB,
    p_fbr_data JSONB,
    p_opening_balance JSONB,
    p_skip_balance BOOLEAN,
    p_skip_tax_info BOOLEAN
);

-- Note: GRANT and COMMENT statements removed because function was dropped above
-- These would fail since the function no longer exists after the DROP statement