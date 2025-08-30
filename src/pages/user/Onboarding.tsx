import { useNavigate } from "react-router-dom";
import { useToast } from "@/shared/hooks/useToast";
import { useAppSelector, useAppDispatch } from "@/shared/hooks/useRedux";
import { setCurrentCompany, checkOnboardingStatus } from "@/shared/services/store/companySlice";
import {
    StepIndicator,
    CompanyInfoStep,
    OpeningBalanceStep,
    TaxInformationStep,
    ReviewStep,
    NavigationButtons,
    validateOpeningBalance,
    validateTaxInformation,
} from "@/features/user/company";
import { useState } from "react";
import { getBusinessActivities } from "@/shared/services/supabase/fbr";
import { completeOnboarding } from "@/shared/services/supabase/onboarding";
import { formatOnboardingError } from "@/shared/utils/onboarding";
import logo from "@/assets/logo.png";
import FbrProfile from "./FbrProfile";
import { CompanySetupData, OnboardingPayload } from "@/shared/types/onboarding";

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
        fbr_cnic_ntn: "",
        fbr_business_name: "",
        fbr_province_code: "",
        fbr_address: "",
        fbr_mobile_number: "",
        fbr_activity_name: "",
        fbr_sector: "",
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

    const validateFbrProfile = (data: CompanySetupData) => {
        return !!(
            data.fbr_cnic_ntn &&
            data.fbr_cnic_ntn.match(/^\d{7}$|^\d{13}$/) &&
            data.fbr_business_name &&
            data.fbr_business_name.length <= 100 &&
            data.fbr_province_code &&
            data.fbr_address &&
            data.fbr_address.length <= 250 &&
            data.fbr_mobile_number &&
            data.fbr_mobile_number.match(/^\+92\d{10}$/) &&
            data.fbr_activity_name &&
            data.fbr_sector
        );
    };

    const nextStep = () => {
        if (currentStep < 5) {
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
            // Get business activity ID from the activity name and sector
            const { data: activities } = await getBusinessActivities();
            const selectedActivity = activities?.find(
                (a: { id: number; business_activity: string; sector: string }) =>
                    a.business_activity === formData.fbr_activity_name && a.sector === formData.fbr_sector
            );

            if (!selectedActivity) {
                throw new Error("Selected business activity not found");
            }

            // Prepare the payload for the database function
            const payload: OnboardingPayload = {
                user_id: user.id,
                company_data: {
                    name: formData.company_name,
                    type: formData.company_type,
                    tax_id_number: formData.tax_id_number,
                    filing_status: formData.filing_status,
                    tax_year_end: formData.tax_year_end,
                },
                fbr_data: {
                    cnic_ntn: formData.fbr_cnic_ntn,
                    business_name: formData.fbr_business_name,
                    province_code: parseInt(formData.fbr_province_code),
                    address: formData.fbr_address,
                    mobile_number: formData.fbr_mobile_number,
                    business_activity_id: selectedActivity.id,
                },
                opening_balance: formData.skip_balance ? null : {
                    amount: parseFloat(formData.cash_balance) || 0,
                    date: formData.balance_date,
                },
                skip_balance: formData.skip_balance,
                skip_tax_info: formData.skip_tax_info,
            };

            // Call the onboarding service
            const data = await completeOnboarding(payload);

            // Create company object for Redux
            const company = {
                id: data.data.company_id,
                name: data.data.company_name,
                type: formData.company_type,
                user_id: user.id,
                is_active: true,
                created_at: new Date().toISOString(),
            };

            // Update Redux store with the new company
            dispatch(setCurrentCompany(company));

            // Refresh onboarding status in Redux
            await dispatch(checkOnboardingStatus(user.id));

            toast({
                title: "Success",
                description: "Company setup completed successfully!",
                variant: "default",
            });

            // Navigate to user dashboard after a brief delay to ensure state is updated
            setTimeout(() => {
                navigate("/", { replace: true });
            }, 100);

        } catch (error: unknown) {
            console.error("Error setting up company:", error);

            const errorInfo = error instanceof Error
                ? formatOnboardingError(error)
                : {
                    title: "Setup Failed",
                    message: "We encountered an issue while setting up your company. Please try again or contact support if the problem persists."
                };

            toast({
                title: errorInfo.title,
                description: errorInfo.message,
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
                    <FbrProfile
                        cnicNtn={formData.fbr_cnic_ntn}
                        businessName={formData.fbr_business_name}
                        provinceCode={formData.fbr_province_code}
                        address={formData.fbr_address}
                        mobileNumber={formData.fbr_mobile_number}
                        activityName={formData.fbr_activity_name}
                        sector={formData.fbr_sector}
                        onFieldChange={handleFieldChange}
                    />
                );
            case 5:
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
                        fbrCnicNtn={formData.fbr_cnic_ntn}
                        fbrBusinessName={formData.fbr_business_name}
                        fbrProvinceCode={formData.fbr_province_code}
                        fbrAddress={formData.fbr_address}
                        fbrMobileNumber={formData.fbr_mobile_number}
                        fbrActivityName={formData.fbr_activity_name}
                        fbrSector={formData.fbr_sector}
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

                    <StepIndicator currentStep={currentStep} totalSteps={5} />

                    <div className="mt-8">
                        {renderCurrentStep()}
                    </div>

                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={5}
                        onPrevious={prevStep}
                        onNext={nextStep}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        canProceed={currentStep === 1 ? !!(formData.company_name && formData.company_type) :
                            currentStep === 2 ? validateOpeningBalance(formData.cash_balance, formData.balance_date, formData.skip_balance) :
                                currentStep === 3 ? validateTaxInformation(formData.tax_id_number, formData.filing_status, formData.tax_year_end, formData.skip_tax_info) :
                                    currentStep === 4 ? validateFbrProfile(formData) : true}
                    />
                </div>
            </div>
        </div>
    );
} 