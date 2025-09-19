-- Fix onboarding function data type issues
-- Drop the function if it exists and recreate it
DROP FUNCTION IF EXISTS complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN);

-- Note: GRANT and COMMENT statements removed because function was dropped above
-- These would fail since the function no longer exists after the DROP statement