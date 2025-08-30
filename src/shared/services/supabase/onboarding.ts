import { supabase } from './client';
import { OnboardingPayload, OnboardingResponse } from '@/shared/types/onboarding';

export const completeOnboarding = async (payload: OnboardingPayload): Promise<OnboardingResponse> => {
    const { data, error } = await supabase.rpc('complete_onboarding_transaction', {
        p_user_id: payload.user_id,
        p_company_data: payload.company_data,
        p_fbr_data: payload.fbr_data,
        p_opening_balance: payload.opening_balance || null,
        p_skip_balance: payload.skip_balance,
        p_skip_tax_info: payload.skip_tax_info
    });

    if (error) {
        throw new Error(error.message || 'Onboarding failed');
    }

    if (!data?.success) {
        throw new Error(data?.error || 'Onboarding failed');
    }

    return data as OnboardingResponse;
};
