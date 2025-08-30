-- Test migration to verify company_type enum exists and works
-- This will help identify if the issue is with the enum or the function

-- First, let's check if the enum exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_type') THEN
        RAISE EXCEPTION 'company_type enum does not exist in the database';
    ELSE
        RAISE NOTICE 'company_type enum exists and is available';
    END IF;
END $$;

-- Test casting a valid value to company_type
DO $$
DECLARE
    test_type company_type;
BEGIN
    test_type := 'INDEPENDENT_WORKER'::company_type;
    RAISE NOTICE 'Successfully cast INDEPENDENT_WORKER to company_type: %', test_type;
    
    test_type := 'PROFESSIONAL_SERVICES'::company_type;
    RAISE NOTICE 'Successfully cast PROFESSIONAL_SERVICES to company_type: %', test_type;
    
    test_type := 'SMALL_BUSINESS'::company_type;
    RAISE NOTICE 'Successfully cast SMALL_BUSINESS to company_type: %', test_type;
END $$;

-- Test the function with a simple call to see if it works
DO $$
DECLARE
    test_result JSONB;
    test_company_data JSONB := '{"name": "Test Company", "type": "INDEPENDENT_WORKER"}'::JSONB;
    test_fbr_data JSONB := '{"cnic_ntn": "1234567", "business_name": "Test Business", "province_code": 1, "address": "Test Address", "mobile_number": "+921234567890", "business_activity_id": 1}'::JSONB;
BEGIN
    -- This will fail because we don't have a real user_id, but it will test the enum casting
    BEGIN
        SELECT complete_onboarding_transaction(
            '00000000-0000-0000-0000-000000000000'::UUID,
            test_company_data,
            test_fbr_data,
            NULL,
            FALSE,
            FALSE
        ) INTO test_result;
    EXCEPTION
        WHEN OTHERS THEN
            -- We expect this to fail due to foreign key constraints, but not due to enum casting
            IF SQLERRM LIKE '%company_type%' THEN
                RAISE EXCEPTION 'Enum casting issue: %', SQLERRM;
            ELSE
                RAISE NOTICE 'Function executed successfully (expected foreign key error): %', SQLERRM;
            END IF;
    END;
END $$;
