import { useState, useCallback } from 'react';

export interface CompanySetupData {
    company_name: string;
    company_type: string;
    cash_balance: string;
    balance_date: string;
    skip_balance: boolean;
}

export function useCompanySetup() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<CompanySetupData>({
        company_name: "",
        company_type: "",
        cash_balance: "",
        balance_date: "",
        skip_balance: false,
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const totalSteps = 3;

    const updateField = useCallback((field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        setError(""); // Clear error when user makes changes
    }, []);

    const skipBalance = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            skip_balance: true,
            cash_balance: "",
            balance_date: "",
        }));
        setError("");
    }, []);

    const addBalance = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            skip_balance: false,
        }));
        setError("");
    }, []);

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
        setError("");
        return true;
    }, [currentStep, formData]);

    const nextStep = useCallback(() => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    }, [validateCurrentStep, totalSteps]);

    const previousStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError("");
    }, []);

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
        setIsLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [formData]);

    return {
        currentStep,
        totalSteps,
        formData,
        error,
        isLoading,
        updateField,
        skipBalance,
        addBalance,
        nextStep,
        previousStep,
        canProceed,
        submitForm,
    };
} 