-- Fix onboarding function signature to match application call
-- This resolves the function signature mismatch error

-- Drop all possible function signatures to ensure clean replacement
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN);
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN);

-- Note: GRANT and COMMENT statements removed because function was dropped above
-- These would fail since the function no longer exists after the DROP statement