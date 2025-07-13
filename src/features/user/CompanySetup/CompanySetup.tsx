import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Textarea } from '@/shared/components/textarea';
import { LoadingSpinner } from '@/shared/components/loading';
import { Alert, AlertDescription } from '@/shared/components/alert';
import {
    Building,
    DollarSign,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    FileText,
    Settings
} from 'lucide-react';

interface CompanySetupData {
    // Step 1: Basic Information
    companyName: string;
    companyType: string;
    industry: string;
    description: string;

    // Step 2: Financial Information
    fiscalYearStart: string;
    currency: string;
    taxId: string;
    businessAddress: string;

    // Step 3: Chart of Accounts
    selectedTemplate: string;
    customAccounts: Array<{
        accountName: string;
        accountType: string;
        description: string;
    }>;

    // Step 4: Opening Balance
    openingBalance: {
        cash: number;
        accountsReceivable: number;
        accountsPayable: number;
        equity: number;
        asOfDate: string;
    };
}

const COMPANY_TYPES = [
    { value: 'INDEPENDENT_WORKER', label: 'Independent Worker' },
    { value: 'PROFESSIONAL_SERVICES', label: 'Professional Services' },
    { value: 'SMALL_BUSINESS', label: 'Small Business' },
    { value: 'CONSULTING', label: 'Consulting' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
    { value: 'OTHER', label: 'Other' }
];

const COA_TEMPLATES = [
    {
        id: 'simple_freelancer',
        name: 'Simple Freelancer',
        description: 'Basic accounts for independent contractors and freelancers',
        accounts: ['Cash', 'Accounts Receivable', 'Revenue', 'Expenses']
    },
    {
        id: 'professional_services',
        name: 'Professional Services',
        description: 'Comprehensive accounts for service-based businesses',
        accounts: ['Cash', 'Accounts Receivable', 'Accounts Payable', 'Revenue', 'Expenses', 'Equipment', 'Depreciation']
    },
    {
        id: 'small_business',
        name: 'Small Business',
        description: 'Full-featured accounts for growing businesses',
        accounts: ['Cash', 'Accounts Receivable', 'Accounts Payable', 'Inventory', 'Revenue', 'COGS', 'Expenses', 'Equipment', 'Depreciation', 'Loans']
    }
];

export const CompanySetup: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CompanySetupData>({
        companyName: '',
        companyType: '',
        industry: '',
        description: '',
        fiscalYearStart: '01-01',
        currency: 'USD',
        taxId: '',
        businessAddress: '',
        selectedTemplate: '',
        customAccounts: [],
        openingBalance: {
            cash: 0,
            accountsReceivable: 0,
            accountsPayable: 0,
            equity: 0,
            asOfDate: new Date().toISOString().split('T')[0]
        }
    });

    const totalSteps = 4;

    const updateFormData = (updates: Partial<CompanySetupData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setError(null);
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!formData.companyName || !formData.companyType) {
                    setError('Please fill in all required fields');
                    return false;
                }
                break;
            case 2:
                if (!formData.fiscalYearStart || !formData.currency) {
                    setError('Please fill in all required fields');
                    return false;
                }
                break;
            case 3:
                if (!formData.selectedTemplate) {
                    setError('Please select a Chart of Accounts template');
                    return false;
                }
                break;
            case 4:
                // Opening balance is optional
                break;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Implement actual company creation API call
            // This should create the company and set up the chart of accounts
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulate success for now
            navigate('/dashboard');
        } catch {
            setError('Failed to save company setup. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStepIcon = (step: number) => {
        if (step < currentStep) {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }

        switch (step) {
            case 1:
                return <Building className="h-5 w-5" />;
            case 2:
                return <Settings className="h-5 w-5" />;
            case 3:
                return <FileText className="h-5 w-5" />;
            case 4:
                return <DollarSign className="h-5 w-5" />;
            default:
                return <CheckCircle className="h-5 w-5" />;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ companyName: e.target.value })}
                                placeholder="Enter your company name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="companyType">Company Type *</Label>
                            <Select value={formData.companyType} onValueChange={(value: string) => updateFormData({ companyType: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your company type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMPANY_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="industry">Industry</Label>
                            <Input
                                id="industry"
                                value={formData.industry}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ industry: e.target.value })}
                                placeholder="e.g., Technology, Healthcare, Retail"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData({ description: e.target.value })}
                                placeholder="Brief description of your business"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="fiscalYearStart">Fiscal Year Start *</Label>
                            <Select value={formData.fiscalYearStart} onValueChange={(value: string) => updateFormData({ fiscalYearStart: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select fiscal year start" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="01-01">January 1st</SelectItem>
                                    <SelectItem value="04-01">April 1st</SelectItem>
                                    <SelectItem value="07-01">July 1st</SelectItem>
                                    <SelectItem value="10-01">October 1st</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="currency">Currency *</Label>
                            <Select value={formData.currency} onValueChange={(value: string) => updateFormData({ currency: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="taxId">Tax ID / EIN</Label>
                            <Input
                                id="taxId"
                                value={formData.taxId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ taxId: e.target.value })}
                                placeholder="Enter your Tax ID or EIN"
                            />
                        </div>

                        <div>
                            <Label htmlFor="businessAddress">Business Address</Label>
                            <Textarea
                                id="businessAddress"
                                value={formData.businessAddress}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData({ businessAddress: e.target.value })}
                                placeholder="Enter your business address"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label>Chart of Accounts Template *</Label>
                            <div className="grid gap-4 mt-2">
                                {COA_TEMPLATES.map((template) => (
                                    <Card
                                        key={template.id}
                                        className={`cursor-pointer transition-all ${formData.selectedTemplate === template.id
                                            ? 'ring-2 ring-blue-500 bg-blue-50'
                                            : 'hover:bg-gray-50'
                                            }`}
                                        onClick={() => updateFormData({ selectedTemplate: template.id })}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium">{template.name}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {template.accounts.map((account) => (
                                                            <span
                                                                key={account}
                                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                                            >
                                                                {account}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {formData.selectedTemplate === template.id && (
                                                    <CheckCircle className="h-5 w-5 text-blue-500" />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <Alert>
                            <AlertDescription>
                                Setting up an opening balance is optional. You can skip this step and add it later.
                            </AlertDescription>
                        </Alert>

                        <div>
                            <Label htmlFor="asOfDate">Balance as of Date</Label>
                            <Input
                                id="asOfDate"
                                type="date"
                                value={formData.openingBalance.asOfDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({
                                    openingBalance: { ...formData.openingBalance, asOfDate: e.target.value }
                                })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cash">Cash Balance</Label>
                                <Input
                                    id="cash"
                                    type="number"
                                    step="0.01"
                                    value={formData.openingBalance.cash}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({
                                        openingBalance: { ...formData.openingBalance, cash: parseFloat(e.target.value) || 0 }
                                    })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="accountsReceivable">Accounts Receivable</Label>
                                <Input
                                    id="accountsReceivable"
                                    type="number"
                                    step="0.01"
                                    value={formData.openingBalance.accountsReceivable}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({
                                        openingBalance: { ...formData.openingBalance, accountsReceivable: parseFloat(e.target.value) || 0 }
                                    })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="accountsPayable">Accounts Payable</Label>
                                <Input
                                    id="accountsPayable"
                                    type="number"
                                    step="0.01"
                                    value={formData.openingBalance.accountsPayable}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({
                                        openingBalance: { ...formData.openingBalance, accountsPayable: parseFloat(e.target.value) || 0 }
                                    })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="equity">Owner's Equity</Label>
                                <Input
                                    id="equity"
                                    type="number"
                                    step="0.01"
                                    value={formData.openingBalance.equity}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({
                                        openingBalance: { ...formData.openingBalance, equity: parseFloat(e.target.value) || 0 }
                                    })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === currentStep
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : step < currentStep
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-gray-300 text-gray-500'
                                    }`}>
                                    {getStepIcon(step)}
                                </div>
                                {step < totalSteps && (
                                    <div className={`w-16 h-0.5 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Setup Card */}
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-semibold">
                            {currentStep === 1 && 'Company Information'}
                            {currentStep === 2 && 'Financial Settings'}
                            {currentStep === 3 && 'Chart of Accounts'}
                            {currentStep === 4 && 'Opening Balance'}
                        </CardTitle>
                        <CardDescription>
                            Step {currentStep} of {totalSteps}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {renderStepContent()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2">Setting up...</span>
                                    </>
                                ) : currentStep === totalSteps ? (
                                    <>
                                        <span>Complete Setup</span>
                                        <CheckCircle className="ml-2 h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        <span>Next</span>
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}; 