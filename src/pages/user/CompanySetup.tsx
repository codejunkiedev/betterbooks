import { useNavigate } from "react-router-dom";
import { useToast } from "@/shared/hooks/useToast";
import { createCompany } from "@/shared/services/supabase/company";
import { createOpeningBalanceJournalEntry } from "@/shared/services/supabase/journal";
import { supabase } from "@/shared/services/supabase/client";
import {
    StepIndicator,
    CompanyInfoStep,
    OpeningBalanceStep,
    ReviewStep,
    NavigationButtons,
    validateOpeningBalance,
} from "@/features/users/company";
import { useState, useEffect } from "react";
import { copyCOATemplateToCompany } from "@/shared/services/supabase/coa";

interface CompanySetupData {
    company_name: string;
    company_type: string;
    cash_balance: string;
    balance_date: string;
    skip_balance: boolean;
}

export default function CompanySetup() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState<{ id: string } | null>(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<CompanySetupData>({
        company_name: "",
        company_type: "",
        cash_balance: "",
        balance_date: "",
        skip_balance: false,
    });
    const [isLoading, setIsLoading] = useState(false);

    // Get current user and check if company already exists
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                if (!currentUser) {
                    navigate("/login", { replace: true });
                    return;
                }
                setUser(currentUser);

                // Check if company already exists
                const { data: company } = await supabase
                    .from("companies")
                    .select("*")
                    .eq("user_id", currentUser.id)
                    .maybeSingle();

                if (company) {
                    navigate("/", { replace: true });
                }
            } catch (error) {
                console.error("Error checking user/company:", error);
                navigate("/login", { replace: true });
            }
        };

        getCurrentUser();
    }, [navigate]);


    const handleFieldChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSkipBalance = () => {
        setFormData(prev => ({ ...prev, skip_balance: true }));
    };

    const handleAddBalance = () => {
        setFormData(prev => ({ ...prev, skip_balance: false }));
    };

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Validate opening balance first (if provided)
            if (!formData.skip_balance && formData.cash_balance && formData.balance_date) {
                const amount = parseFloat(formData.cash_balance);
                const balanceDate = new Date(formData.balance_date);
                const today = new Date();

                // Validate amount
                if (amount <= 0) {
                    throw new Error("Opening balance must be greater than 0");
                }

                // Validate date (should not be in the future)
                if (balanceDate > today) {
                    throw new Error("Opening balance date cannot be in the future");
                }
            }

            // Create company first
            const company = await createCompany({
                user_id: user.id,
                name: formData.company_name,
                type: formData.company_type,
            });

            await copyCOATemplateToCompany(company.id);

            // Handle opening balance after company is created
            if (!formData.skip_balance && formData.cash_balance && formData.balance_date) {
                const amount = parseFloat(formData.cash_balance);

                await createOpeningBalanceJournalEntry(
                    company.id,
                    user.id,
                    amount,
                    formData.balance_date
                );
            }

            toast({
                title: "Success",
                description: "Company setup completed successfully!",
                variant: "default",
            });

            navigate("/");
        } catch (error) {
            console.error("Error setting up company:", error);
            toast({
                title: "Error",
                description: "Failed to set up company. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CompanyInfoStep
                        companyName={formData.company_name}
                        companyType={formData.company_type}
                        onFieldChange={handleFieldChange}
                        isLoading={isLoading}
                    />
                );
            case 2:
                return (
                    <OpeningBalanceStep
                        cashBalance={formData.cash_balance}
                        balanceDate={formData.balance_date}
                        skipBalance={formData.skip_balance}
                        onFieldChange={handleFieldChange}
                        onSkipBalance={handleSkipBalance}
                        onAddBalance={handleAddBalance}
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Setup</h1>
                    <p className="text-gray-600">Let's get your company set up in BetterBooks</p>
                </div>

                <StepIndicator currentStep={currentStep} totalSteps={3} />

                <div className="mt-8">
                    {renderCurrentStep()}
                </div>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={3}
                    onPrevious={prevStep}
                    onNext={nextStep}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    canProceed={currentStep === 1 ? !!(formData.company_name && formData.company_type) :
                        currentStep === 2 ? validateOpeningBalance(formData.cash_balance, formData.balance_date, formData.skip_balance) : true}
                />
            </div>
        </div>
    );
} 