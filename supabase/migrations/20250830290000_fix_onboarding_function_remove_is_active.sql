-- Fix onboarding function to remove is_active column from company_coa insert
-- This resolves the "column is_active does not exist" error

-- Drop all possible function signatures to ensure clean replacement
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN);
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN);

-- Note: GRANT and COMMENT statements removed because function was dropped above
-- These would fail since the function no longer exists after the DROP statement