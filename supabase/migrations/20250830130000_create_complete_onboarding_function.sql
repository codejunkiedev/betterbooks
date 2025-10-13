-- Create a comprehensive onboarding transaction function

-- Grant execute permission to authenticated users (with full signature)
GRANT EXECUTE ON FUNCTION public.complete_onboarding_transaction(UUID, JSONB, JSONB, JSONB, BOOLEAN, BOOLEAN) TO authenticated;