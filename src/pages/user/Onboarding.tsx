import { useNavigate } from "react-router-dom";
import { useToast } from "@/shared/hooks/useToast";
import { useAppSelector, useAppDispatch } from "@/shared/hooks/useRedux";
import { createCompany } from "@/shared/services/supabase/company";
import { CompanyType } from "@/shared/constants/company";
import { setCurrentCompany } from "@/shared/services/store/companySlice";
import { createOpeningBalanceJournalEntry } from "@/shared/services/supabase/journal";
import {
    StepIndicator,
    CompanyInfoStep,
    OpeningBalanceStep,
    TaxInformationStep,
    ReviewStep,
    NavigationButtons,
    validateOpeningBalance,
    validateTaxInformation,
} from "@/features/users/company";
import { useState } from "react";
import { copyCOATemplateToCompany } from "@/shared/services/supabase/coa";
import logo from "@/assets/logo.png";

interface CompanySetupData {
    company_name: string;
    company_type: string;
    cash_balance: string;
    balance_date: string;
    skip_balance: boolean;
    tax_id_number: string;
    filing_status: string;
    tax_year_end: string;
    skip_tax_info: boolean;
}

export default function Onboarding() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.user);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<CompanySetupData>({
        company_name: "",
        company_type: "",
        cash_balance: "",
        balance_date: "",
        skip_balance: false,
        tax_id_number: "",
        filing_status: "",
        tax_year_end: "",
        skip_tax_info: false,
    });
    const [isLoading, setIsLoading] = useState(false);





    const handleFieldChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSkipBalance = () => {
        setFormData(prev => ({ ...prev, skip_balance: true }));
    };

    const handleAddBalance = () => {
        setFormData(prev => ({ ...prev, skip_balance: false }));
    };

    const handleSkipTaxInfo = () => {
        setFormData(prev => ({ ...prev, skip_tax_info: true }));
    };

    const handleAddTaxInfo = () => {
        setFormData(prev => ({ ...prev, skip_tax_info: false }));
    };

    const nextStep = () => {
        if (currentStep < 4) {
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
            const companyData: {
                user_id: string;
                name: string;
                type: CompanyType;
                tax_id_number?: string;
                filing_status?: string;
                tax_year_end?: string;
                assigned_accountant_id?: string;
            } = {
                user_id: user.id,
                name: formData.company_name,
                type: formData.company_type as CompanyType,
                assigned_accountant_id: '',
            };

            if (!formData.skip_tax_info) {
                if (formData.tax_id_number) companyData.tax_id_number = formData.tax_id_number;
                if (formData.filing_status) companyData.filing_status = formData.filing_status;
                if (formData.tax_year_end) companyData.tax_year_end = formData.tax_year_end;
            }

            const company = await createCompany(companyData);

            // Update Redux store with the new company
            dispatch(setCurrentCompany(company));

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
                    <TaxInformationStep
                        taxIdNumber={formData.tax_id_number}
                        filingStatus={formData.filing_status}
                        taxYearEnd={formData.tax_year_end}
                        skipTaxInfo={formData.skip_tax_info}
                        onFieldChange={handleFieldChange}
                        onSkipTaxInfo={handleSkipTaxInfo}
                        onAddTaxInfo={handleAddTaxInfo}
                        isLoading={isLoading}
                    />
                );
            case 4:
                return (
                    <ReviewStep
                        companyName={formData.company_name}
                        companyType={formData.company_type}
                        skipBalance={formData.skip_balance}
                        cashBalance={formData.cash_balance}
                        balanceDate={formData.balance_date}
                        skipTaxInfo={formData.skip_tax_info}
                        taxIdNumber={formData.tax_id_number}
                        filingStatus={formData.filing_status}
                        taxYearEnd={formData.tax_year_end}
                    />
                );
            default:
                return null;
        }
    };



    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={logo} alt="BetterBooks" className="h-8 w-auto" />
                            <h1 className="text-xl font-semibold text-gray-900">BetterBooks</h1>
                        </div>
                        <div className="text-sm text-gray-500">
                            Welcome! Let's get you set up
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Company Setup</h2>
                        <p className="text-gray-600">Let's get your company set up in BetterBooks</p>
                    </div>

                    <StepIndicator currentStep={currentStep} totalSteps={4} />

                    <div className="mt-8">
                        {renderCurrentStep()}
                    </div>

                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={4}
                        onPrevious={prevStep}
                        onNext={nextStep}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        canProceed={currentStep === 1 ? !!(formData.company_name && formData.company_type) :
                            currentStep === 2 ? validateOpeningBalance(formData.cash_balance, formData.balance_date, formData.skip_balance) :
                                currentStep === 3 ? validateTaxInformation(formData.tax_id_number, formData.filing_status, formData.tax_year_end, formData.skip_tax_info) : true}
                    />
                </div>
            </div>
        </div>
    );
} 