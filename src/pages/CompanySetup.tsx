import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";
import { useCompanySetup } from "@/hooks/useCompanySetup";
import { useToast } from "@/hooks/use-toast";
import {
    StepIndicator,
    CompanyInfoStep,
    OpeningBalanceStep,
    ReviewStep,
    NavigationButtons,
} from "@/components/company-setup";
import { copyCOATemplateToCompany } from "@/lib/supabase/coa";
import { getCompanyByUserId } from "@/lib/supabase/company";
import { useEffect, memo, useCallback, useState } from "react";

const CompanySetup = memo(() => {
    const navigate = useNavigate();
    const user = useAppSelector(state => state.user.user);
    const { toast } = useToast();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const {
        currentStep,
        companyData,
        isLoading,
        updateCompanyData,
        nextStep,
        prevStep,
        canProceedToNextStep,
        createCompany,
    } = useCompanySetup();

    // Memoized company check function
    const checkCompany = useCallback(async () => {
        if (!user) return;

        try {
            const company = await getCompanyByUserId(user.id);
            if (company) {
                navigate("/", { replace: true });
            }
        } catch (error) {
            console.error("Error checking company:", error);
        }
    }, [user, navigate]);

    // Check authentication and redirect if needed
    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
        } else {
            setIsCheckingAuth(false);
        }
    }, [user, navigate]);

    const handleSubmit = useCallback(async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive"
            });
            return;
        }

        try {
            const company = await createCompany(user.id);
            if (company) {
                await copyCOATemplateToCompany(company.id);
                toast({
                    title: "Success",
                    description: "Company setup completed successfully!",
                });
                navigate("/");
            }
        } catch (error) {
            console.error("Error creating company:", error);
            toast({
                title: "Error",
                description: "Failed to create company. Please try again.",
                variant: "destructive"
            });
        }
    }, [user, createCompany, toast, navigate]);

    const handleFieldChange = useCallback((field: string, value: string | number) => {
        updateCompanyData({ [field]: value });
    }, [updateCompanyData]);

    const handleSkipBalance = useCallback(() => {
        updateCompanyData({
            openingBalance: undefined,
            openingBalanceDate: undefined
        });
    }, [updateCompanyData]);

    const handleAddBalance = useCallback(() => {
        updateCompanyData({
            openingBalance: 0,
            openingBalanceDate: new Date()
        });
    }, [updateCompanyData]);

    // Helper function to safely convert date to string
    const formatDateForDisplay = useCallback((dateValue: string | Date | undefined): string => {
        if (!dateValue) return '';

        try {
            const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    }, []);

    const renderCurrentStep = useCallback(() => {
        switch (currentStep) {
            case 1:
                return (
                    <CompanyInfoStep
                        companyName={companyData.name || ''}
                        companyType={companyData.type || ''}
                        onFieldChange={handleFieldChange}
                        isLoading={isLoading}
                    />
                );
            case 2:
                return (
                    <OpeningBalanceStep
                        cashBalance={companyData.openingBalance?.toString() || ''}
                        balanceDate={formatDateForDisplay(companyData.openingBalanceDate)}
                        skipBalance={companyData.openingBalance === undefined || companyData.openingBalance === null}
                        onFieldChange={handleFieldChange}
                        onSkipBalance={handleSkipBalance}
                        onAddBalance={handleAddBalance}
                        isLoading={isLoading}
                    />
                );
            case 3:
                return (
                    <ReviewStep
                        companyName={companyData.name || ''}
                        companyType={companyData.type || ''}
                        skipBalance={companyData.openingBalance === undefined || companyData.openingBalance === null}
                        cashBalance={companyData.openingBalance?.toString() || ''}
                        balanceDate={formatDateForDisplay(companyData.openingBalanceDate)}
                    />
                );
            default:
                return null;
        }
    }, [currentStep, companyData, handleFieldChange, handleSkipBalance, handleAddBalance, isLoading, formatDateForDisplay]);

    // Check if company already exists
    useEffect(() => {
        if (!isCheckingAuth && user) {
            checkCompany();
        }
    }, [checkCompany, isCheckingAuth, user]);

    // Show loading while checking authentication
    if (isCheckingAuth || !user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                        Company Onboarding Process
                    </h1>
                </div>

                <StepIndicator
                    currentStep={currentStep}
                    totalSteps={3}
                />

                <div className="space-y-6">
                    {renderCurrentStep()}

                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={3}
                        onPrevious={prevStep}
                        onNext={nextStep}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        canProceed={canProceedToNextStep}
                    />
                </div>
            </div>
        </div>
    );
});

export default CompanySetup; 