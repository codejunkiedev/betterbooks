import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
    updateSetupField,
    skipBalance,
    addBalance,
    nextStep,
    previousStep,
    setError,
    clearError,
    CompanySetupData,
} from '@/shared/services/store/companySlice';

export type { CompanySetupData };

export function useCompanySetup() {
    const dispatch = useAppDispatch();
    const {
        currentStep,
        totalSteps,
        setupData: formData,
        error,
        isLoading,
    } = useAppSelector(state => state.company);

    const updateField = useCallback((field: string, value: string) => {
        dispatch(updateSetupField({ field: field as keyof CompanySetupData, value }));
        dispatch(clearError());
    }, [dispatch]);

    const handleSkipBalance = useCallback(() => {
        dispatch(skipBalance());
        dispatch(clearError());
    }, [dispatch]);

    const handleAddBalance = useCallback(() => {
        dispatch(addBalance());
        dispatch(clearError());
    }, [dispatch]);

    const validateCurrentStep = useCallback(() => {
        switch (currentStep) {
            case 1:
                if (!formData.company_name.trim()) {
                    setError("Company name is required.");
                    return false;
                }
                if (!formData.company_type) {
                    setError("Company type is required.");
                    return false;
                }
                break;
            case 2:
                if (!formData.skip_balance) {
                    if (!formData.cash_balance.trim()) {
                        setError("Cash balance is required when not skipping.");
                        return false;
                    }
                    if (!formData.balance_date) {
                        setError("Balance date is required when not skipping.");
                        return false;
                    }
                }
                break;
        }
        dispatch(clearError());
        return true;
    }, [currentStep, formData, dispatch]);

    const handleNextStep = useCallback(() => {
        if (validateCurrentStep()) {
            dispatch(nextStep());
        }
    }, [validateCurrentStep, dispatch]);

    const handlePreviousStep = useCallback(() => {
        dispatch(previousStep());
        dispatch(clearError());
    }, [dispatch]);

    const canProceed = useCallback(() => {
        switch (currentStep) {
            case 1:
                return Boolean(formData.company_name.trim() && formData.company_type);
            case 2:
                return Boolean(formData.skip_balance || (formData.cash_balance.trim() && formData.balance_date));
            default:
                return true;
        }
    }, [currentStep, formData]);

    const submitForm = useCallback(async (onSubmit: (data: CompanySetupData) => void) => {
        try {
            await onSubmit(formData);
        } catch (error) {
            dispatch(setError(error instanceof Error ? error.message : "An error occurred"));
        }
    }, [formData, dispatch]);

    return {
        currentStep,
        totalSteps,
        formData,
        error,
        isLoading,
        updateField,
        skipBalance: handleSkipBalance,
        addBalance: handleAddBalance,
        nextStep: handleNextStep,
        previousStep: handlePreviousStep,
        canProceed,
        submitForm,
    };
} 