import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyInfoStep } from "./CompanyInfoStep";
import { OpeningBalanceStep } from "./OpeningBalanceStep";
import { ReviewStep } from "./ReviewStep";
import { StepIndicator } from "./StepIndicator";
import { NavigationButtons } from "./NavigationButtons";

interface CompanySetupData {
    company_name: string;
    company_type: string;
    cash_balance: string;
    balance_date: string;
    skip_balance: boolean;
}

export default function CompanySetup() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<CompanySetupData>({
        company_name: "",
        company_type: "",
        cash_balance: "",
        balance_date: "",
        skip_balance: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
        setIsLoading(true);
        // TODO: Implement company setup submission
        setTimeout(() => {
            setIsLoading(false);
            navigate("/dashboard");
        }, 2000);
    };

    const renderStep = () => {
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
                    {renderStep()}
                </div>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={3}
                    onPrevious={prevStep}
                    onNext={nextStep}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    canProceed={currentStep === 1 ? !!(formData.company_name && formData.company_type) : true}
                />
            </div>
        </div>
    );
} 