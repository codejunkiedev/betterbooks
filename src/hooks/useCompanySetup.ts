import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Company, CompanyType } from '../core/domain/entities/Company';
import { CreateCompanyUseCase } from '../core/application/use-cases/company/CreateCompanyUseCase';
import { Container } from '../infrastructure/di/Container';
import { useToast } from './use-toast';

export interface CompanySetupData {
    name: string;
    type: CompanyType;
    openingBalance?: number;
    openingBalanceDate?: Date;
}

export const useCompanySetup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [companyData, setCompanyData] = useState<Partial<CompanySetupData>>({});
    const navigate = useNavigate();
    const { toast } = useToast();

    // Get dependencies from container
    const container = Container.getInstance();
    const createCompanyUseCase = new CreateCompanyUseCase(container.getCompanyRepository());

    const updateCompanyData = (data: Partial<CompanySetupData>) => {
        setCompanyData(prev => {
            const updated = { ...prev, ...data };

            // Convert openingBalanceDate string to Date object if needed
            if (data.openingBalanceDate && typeof data.openingBalanceDate === 'string') {
                const dateValue = new Date(data.openingBalanceDate);
                if (!isNaN(dateValue.getTime())) {
                    updated.openingBalanceDate = dateValue;
                }
            }

            return updated;
        });
    };

    const nextStep = () => {
        if (canProceedToNextStep()) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const goToStep = (step: number) => {
        setCurrentStep(Math.max(1, Math.min(step, 3)));
    };

    const createCompany = async (userId: string): Promise<Company | null> => {
        if (!companyData.name || !companyData.type) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return null;
        }

        setIsLoading(true);

        try {
            const result = await createCompanyUseCase.execute({
                userId,
                name: companyData.name,
                type: companyData.type,
                openingBalance: companyData.openingBalance,
                openingBalanceDate: companyData.openingBalanceDate
            });

            if (result.isSuccess) {
                toast({
                    title: "Success",
                    description: "Company created successfully!",
                });

                // Navigate to dashboard after successful creation
                navigate('/');
                return result.value.company;
            } else {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                });
                return null;
            }
        } catch (error) {
            console.error("Error creating company:", error);
            toast({
                title: "Error",
                description: "Failed to create company. Please try again.",
                variant: "destructive"
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const canProceedToNextStep = (): boolean => {
        switch (currentStep) {
            case 1:
                return !!(companyData.name?.trim() && companyData.type);
            case 2:
                return true; // Opening balance is optional
            case 3:
                return true; // Review step
            default:
                return false;
        }
    };

    const getStepProgress = (): number => {
        return (currentStep / 3) * 100;
    };

    return {
        // State
        isLoading,
        currentStep,
        companyData,

        // Actions
        updateCompanyData,
        nextStep,
        prevStep,
        goToStep,
        createCompany,

        // Computed
        canProceedToNextStep: canProceedToNextStep(),
        stepProgress: getStepProgress(),

        // Validation
        isStepValid: canProceedToNextStep()
    };
}; 