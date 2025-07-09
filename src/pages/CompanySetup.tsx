import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";
import { useCompanySetup, CompanySetupData } from "@/hooks/useCompanySetup";
import { createCompany } from "@/lib/supabase/company";
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
import { useEffect } from "react";

export default function CompanySetup() {
    const navigate = useNavigate();
    const user = useAppSelector(state => state.user.user);
    const { toast } = useToast();

    const {
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
    } = useCompanySetup();

    // Check if company already exists
    useEffect(() => {
        const checkCompany = async () => {
            if (!user) return;

            try {
                const company = await getCompanyByUserId(user.id);
                if (company) {
                    navigate("/", { replace: true });
                }
            } catch (error) {
                console.error("Error checking company:", error);
            }
        };

        checkCompany();
    }, [user, navigate]);

    // If user is not authenticated, redirect to login
    if (!user) {
        navigate("/login", { replace: true });
        return null;
    }

    const handleSubmit = async (data: CompanySetupData) => {
        if (!user) {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive"
            });
            return;
        }

        try {
            const company = await createCompany({
                user_id: user.id,
                name: data.company_name,
                type: data.company_type,
            });

            await copyCOATemplateToCompany(company.id);

            toast({
                title: "Success",
                description: "Company setup completed successfully!",
            });

            navigate("/");
        } catch (error) {
            console.error("Error creating company:", error);
            toast({
                title: "Error",
                description: "Failed to create company. Please try again.",
                variant: "destructive"
            });
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CompanyInfoStep
                        companyName={formData.company_name}
                        companyType={formData.company_type}
                        onFieldChange={updateField}
                        isLoading={isLoading}
                    />
                );
            case 2:
                return (
                    <OpeningBalanceStep
                        cashBalance={formData.cash_balance}
                        balanceDate={formData.balance_date}
                        skipBalance={formData.skip_balance}
                        onFieldChange={updateField}
                        onSkipBalance={skipBalance}
                        onAddBalance={addBalance}
                        isLoading={isLoading}
                    />
                );
            case 3:
                return (
                    <ReviewStep
                        companyName={formData.company_name}
                        companyType={formData.company_type}
                        skipBalance={formData.skip_balance}
                        cashBalance={formData.cash_balance}
                        balanceDate={formData.balance_date}
                    />
                );
            default:
                return null;
        }
    };

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
                    totalSteps={totalSteps}
                />

                <div className="space-y-6">
                    {renderCurrentStep()}

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                            {error}
                        </div>
                    )}

                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        onPrevious={previousStep}
                        onNext={nextStep}
                        onSubmit={() => submitForm(handleSubmit)}
                        isLoading={isLoading}
                        canProceed={canProceed()}
                    />
                </div>
            </div>
        </div>
    );
} 