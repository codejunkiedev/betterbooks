import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/shared/services/store';
import { useToast } from '@/shared/hooks/useToast';
import { useInvoiceValidation } from '@/shared/hooks/useInvoiceValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Textarea } from '@/shared/components/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Badge } from '@/shared/components/Badge';
import { Alert, AlertDescription } from '@/shared/components/Alert';
import { InvoiceValidationModal } from '@/shared/components/InvoiceValidationModal';
import {
    Play,
    Target,
    FileText,
    AlertCircle,
    Trash2,
    Database,
    Eye,
    CheckCircle
} from 'lucide-react';
import { FBR_SCENARIO_STATUS } from '@/shared/constants/fbr';
import {
    getScenarioById,
    updateScenarioProgress,
    getProvinceCodes
} from '@/shared/services/supabase/fbr';
import { submitSandboxTestInvoice } from '@/shared/services/api/fbr';
import { FbrScenario } from '@/shared/types/fbr';
import { InvoiceItem, ScenarioInvoiceFormData, InvoiceItemCalculated, InvoiceRunningTotals } from '@/shared/types/invoice';
import { generateRandomSampleData, generateScenarioSpecificSampleData } from '@/shared/data/fbrSampleData';
import { saveInvoice } from '@/shared/services/supabase/invoice';

import { BuyerManagement } from '@/features/user/buyer-management';
import { InvoiceItemManagement } from './InvoiceItemManagement';
import { InvoicePreview } from './InvoicePreview';
import { InvoicePDFGenerator } from './invoicePDF';

export default function ScenarioInvoiceForm() {
    const { scenarioId } = useParams<{ scenarioId: string }>();
    const { user } = useSelector((s: RootState) => s.user);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Invoice validation hook
    const {
        validationResult,
        isValidating,
        validateInvoice: validateInvoiceData
    } = useInvoiceValidation({
        includeFBRValidation: true,
        environment: 'sandbox'
    });

    const [scenario, setScenario] = useState<FbrScenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadingSampleData, setLoadingSampleData] = useState(false);
    const [clearingForm, setClearingForm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [provinces, setProvinces] = useState<Array<{ state_province_code: number; state_province_desc: string }>>([]);
    const [formData, setFormData] = useState<ScenarioInvoiceFormData>({
        invoiceType: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        sellerNTNCNIC: '',
        sellerBusinessName: '',
        sellerProvince: '',
        sellerAddress: '',
        buyerNTNCNIC: '',
        buyerBusinessName: '',
        buyerProvince: '',
        buyerAddress: '',
        buyerRegistrationType: '',
        invoiceRefNo: '',
        scenarioId: '',
        items: [],
        totalAmount: 0,
        notes: ''
    });

    useEffect(() => {
        if (scenarioId && user?.id) {
            loadScenario();
        }
        loadProvinces();
    }, [scenarioId, user?.id]);

    const loadProvinces = async () => {
        try {
            const { data, error } = await getProvinceCodes();
            if (data && !error) {
                setProvinces(data);
            }
        } catch (error) {
            console.error('Error loading provinces:', error);
        }
    };

    const loadScenario = async () => {
        if (!scenarioId || !user?.id) return;

        try {
            setLoading(true);
            const scenarioData = await getScenarioById(scenarioId);

            if (scenarioData) {
                setScenario(scenarioData);
            } else {
                toast({
                    title: "Scenario Not Found",
                    description: "The requested scenario could not be found.",
                    variant: "destructive"
                });
                navigate('/fbr/sandbox-testing');
            }
        } catch (error) {
            console.error('Error loading scenario:', error);
            toast({
                title: "Error",
                description: "Failed to load scenario details.",
                variant: "destructive"
            });
            navigate('/fbr/sandbox-testing');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field: keyof ScenarioInvoiceFormData, value: string | number | InvoiceItem[] | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBuyerSelect = (buyerData: {
        buyerNTNCNIC: string;
        buyerBusinessName: string;
        buyerProvince: string;
        buyerAddress: string;
        buyerRegistrationType: string;
    }) => {
        setFormData(prev => ({
            ...prev,
            buyerNTNCNIC: buyerData.buyerNTNCNIC,
            buyerBusinessName: buyerData.buyerBusinessName,
            buyerProvince: buyerData.buyerProvince,
            buyerAddress: buyerData.buyerAddress,
            buyerRegistrationType: buyerData.buyerRegistrationType
        }));
    };

    const handleItemsChange = useCallback((newItems: InvoiceItemCalculated[]) => {
        setFormData(prev => ({
            ...prev,
            items: newItems
        }));
    }, []);

    const handleRunningTotalsChange = useCallback((runningTotals: InvoiceRunningTotals) => {
        setFormData(prev => ({
            ...prev,
            totalAmount: runningTotals.total_amount
        }));
    }, []);

    const populateSampleData = async () => {
        setLoadingSampleData(true);
        try {
            // Simulate some loading time for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            let sampleData: ScenarioInvoiceFormData;

            // Use scenario-specific data if scenario is loaded, otherwise use random data
            if (scenario?.code) {
                sampleData = generateScenarioSpecificSampleData(scenario.code, scenarioId || '');
            } else {
                sampleData = generateRandomSampleData(scenarioId || '');
            }

            setFormData(sampleData);

            toast({
                title: "Sample Data Loaded",
                description: `Invoice populated with ${scenario?.code ? 'scenario-specific' : 'random'} sample data. Total amount: Rs. ${sampleData.totalAmount.toLocaleString()}`,
            });
        } catch (error) {
            console.error('Error loading sample data:', error);
            toast({
                title: "Error",
                description: "Failed to load sample data. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoadingSampleData(false);
        }
    };



    const clearFormData = async () => {
        setClearingForm(true);
        try {
            // Simulate some loading time for better UX
            await new Promise(resolve => setTimeout(resolve, 300));

            setFormData({
                invoiceType: '', invoiceDate: new Date().toISOString().split('T')[0], sellerNTNCNIC: '', sellerBusinessName: '',
                sellerProvince: '', sellerAddress: '', buyerNTNCNIC: '', buyerBusinessName: '',
                buyerProvince: '', buyerAddress: '', buyerRegistrationType: '', invoiceRefNo: '',
                scenarioId: scenarioId || '', items: [], totalAmount: 0, notes: ''
            });

            toast({ title: "Form Cleared", description: "All form data has been cleared." });
        } catch (error) {
            console.error('Error clearing form:', error);
            toast({
                title: "Error",
                description: "Failed to clear form. Please try again.",
                variant: "destructive"
            });
        } finally {
            setClearingForm(false);
        }
    };

    const handlePreview = () => {
        setShowPreview(true);
    };



    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPDF(true);
            await InvoicePDFGenerator.downloadPDF(formData);
            toast({
                title: "PDF Downloaded",
                description: "Invoice PDF has been downloaded successfully.",
            });
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast({
                title: "Download Failed",
                description: "Failed to download PDF. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleValidateInvoice = async () => {
        try {
            await validateInvoiceData(formData);
            setShowValidationModal(true);
        } catch (error) {
            console.error('Validation error:', error);
        }
    };

    const handleSubmit = async () => {
        if (!scenario || !user?.id) return;

        try {
            setSubmitting(true);


            // Submit the invoice to FBR
            const response = await submitSandboxTestInvoice({
                scenarioId: scenario.code,
                invoiceData: {
                    invoiceType: formData.invoiceType,
                    invoiceDate: formData.invoiceDate,
                    sellerNTNCNIC: formData.sellerNTNCNIC,
                    sellerBusinessName: formData.sellerBusinessName,
                    sellerProvince: formData.sellerProvince,
                    sellerAddress: formData.sellerAddress,
                    buyerNTNCNIC: formData.buyerNTNCNIC,
                    buyerBusinessName: formData.buyerBusinessName,
                    buyerProvince: formData.buyerProvince,
                    buyerAddress: formData.buyerAddress,
                    buyerRegistrationType: formData.buyerRegistrationType,
                    invoiceRefNo: formData.invoiceRefNo,
                    items: formData.items.map(item => ({
                        hsCode: item.hs_code,
                        productDescription: item.item_name,
                        rate: item.tax_rate, // Tax rate percentage
                        uoM: item.uom_code,
                        quantity: item.quantity,
                        totalValues: item.total_amount,
                        valueSalesExcludingST: item.value_sales_excluding_st,
                        fixedNotifiedValueOrRetailPrice: item.fixed_notified_value || 0,
                        salesTaxApplicable: item.sales_tax,
                        salesTaxWithheldAtSource: 0,
                        extraTax: 0,
                        furtherTax: 0,
                        sroScheduleNo: item.is_third_schedule ? '3' : '',
                        fedPayable: item.sales_tax,
                        discount: 0,
                        saleType: 'Goods at standard rate (default)',
                        sroItemSerialNo: ''
                    })),
                    totalAmount: formData.totalAmount,
                    notes: formData.notes
                },
                userId: user.id
            });

            if (response.success) {
                // Save invoice to database
                const saveResult = await saveInvoice(user.id, formData, response.data?.fbrResponse as Record<string, unknown>);

                if (!saveResult.success) {
                    console.error('Failed to save invoice:', saveResult.error);
                    toast({
                        title: "Warning",
                        description: "Invoice submitted to FBR but failed to save locally. Please contact support.",
                        variant: "destructive"
                    });
                }

                // Mark scenario as completed using scenario code
                const progressResult = await updateScenarioProgress(
                    user.id,
                    scenario.id,
                    FBR_SCENARIO_STATUS.COMPLETED,
                    JSON.stringify(response.data?.fbrResponse)
                );

                toast({
                    title: "Scenario Completed!",
                    description: `You have successfully completed this FBR scenario on attempt ${progressResult.newAttempts}.`,
                });

                // Navigate back to sandbox testing with a flag to refresh
                navigate('/fbr/sandbox-testing', { state: { refresh: true } });
            } else {
                // Mark scenario as failed using scenario code
                const progressResult = await updateScenarioProgress(
                    user.id,
                    scenario.id,
                    FBR_SCENARIO_STATUS.FAILED,
                    response.message
                );

                toast({
                    title: "Scenario Failed",
                    description: `${response.message} (Attempt ${progressResult.newAttempts})`,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error submitting scenario:', error);

            // Mark scenario as failed on error using scenario code
            if (scenario && user?.id) {
                await updateScenarioProgress(
                    user.id,
                    scenario.id,
                    FBR_SCENARIO_STATUS.FAILED,
                    error instanceof Error ? error.message : 'Unknown error occurred'
                );
            }

            toast({
                title: "Error",
                description: "Failed to submit scenario. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!scenario) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Scenario not found. Please return to sandbox testing.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Enhanced Header */}
                <div className="bg-card rounded-xl p-4 sm:p-6 border">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                        Scenario {scenario.code}
                                    </h1>
                                    <p className="text-muted-foreground font-medium text-sm sm:text-base">FBR Sandbox Testing</p>
                                </div>
                            </div>
                            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                                {scenario.description}
                            </p>
                        </div>
                        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
                            <Badge variant="outline" className="capitalize px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium">
                                {scenario.category}
                            </Badge>
                            <Badge variant="secondary" className="capitalize px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium">
                                {scenario.sale_type}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Enhanced Invoice Form */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                    Create FBR Invoice
                                </CardTitle>
                                <p className="text-muted-foreground text-sm">Fill in the invoice details to complete this scenario</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={populateSampleData}
                                    disabled={loadingSampleData || clearingForm}
                                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 px-3 sm:px-4 py-2"
                                >
                                    {loadingSampleData ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span className="hidden sm:inline">Loading...</span>
                                            <span className="sm:hidden">Loading</span>
                                        </>
                                    ) : (
                                        <>
                                            <Database className="h-4 w-4" />
                                            <span className="hidden sm:inline">Load Sample Data</span>
                                            <span className="sm:hidden">Load Data</span>
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={clearFormData}
                                    disabled={loadingSampleData || clearingForm}
                                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2"
                                >
                                    {clearingForm ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span className="hidden sm:inline">Clearing...</span>
                                            <span className="sm:hidden">Clearing</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="hidden sm:inline">Clear Form</span>
                                            <span className="sm:hidden">Clear</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                        {/* Basic Information */}
                        <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs font-bold">1</span>
                                </div>
                                Basic Invoice Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <Label htmlFor="invoiceType" className="text-sm font-medium">Invoice Type</Label>
                                    <Select
                                        value={formData.invoiceType}
                                        onValueChange={(value) => updateFormData('invoiceType', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select invoice type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sale Invoice">Sale Invoice</SelectItem>
                                            <SelectItem value="Purchase Invoice">Purchase Invoice</SelectItem>
                                            <SelectItem value="Credit Note">Credit Note</SelectItem>
                                            <SelectItem value="Debit Note">Debit Note</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="invoiceDate" className="text-sm font-medium">Invoice Date</Label>
                                    <Input
                                        id="invoiceDate"
                                        type="date"
                                        value={formData.invoiceDate}
                                        onChange={(e) => updateFormData('invoiceDate', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seller Information */}
                        <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs font-bold">2</span>
                                </div>
                                Seller Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <Label htmlFor="sellerNTNCNIC" className="text-sm font-medium">Seller NTN/CNIC</Label>
                                    <Input
                                        id="sellerNTNCNIC"
                                        value={formData.sellerNTNCNIC}
                                        onChange={(e) => updateFormData('sellerNTNCNIC', e.target.value)}
                                        placeholder="Enter NTN (7 digits) or CNIC (13 digits)"
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Must be 7 digits for NTN or 13 digits for CNIC
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="sellerBusinessName" className="text-sm font-medium">Seller Business Name</Label>
                                    <Input
                                        id="sellerBusinessName"
                                        value={formData.sellerBusinessName}
                                        onChange={(e) => updateFormData('sellerBusinessName', e.target.value)}
                                        placeholder="Enter seller business name"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sellerProvince" className="text-sm font-medium">Seller Province</Label>
                                    <Select
                                        value={formData.sellerProvince}
                                        onValueChange={(value) => updateFormData('sellerProvince', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select seller province" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map((province) => (
                                                <SelectItem key={province.state_province_code} value={province.state_province_desc}>
                                                    {province.state_province_desc}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="sellerAddress" className="text-sm font-medium">Seller Address</Label>
                                    <Input
                                        id="sellerAddress"
                                        value={formData.sellerAddress}
                                        onChange={(e) => updateFormData('sellerAddress', e.target.value)}
                                        placeholder="Enter seller address"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buyer Information */}
                        <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs font-bold">3</span>
                                </div>
                                Buyer Information
                            </h3>

                            <BuyerManagement
                                onBuyerSelect={handleBuyerSelect}
                                currentBuyerData={{
                                    buyerNTNCNIC: formData.buyerNTNCNIC,
                                    buyerBusinessName: formData.buyerBusinessName,
                                    buyerProvince: formData.buyerProvince,
                                    buyerAddress: formData.buyerAddress,
                                    buyerRegistrationType: formData.buyerRegistrationType
                                }}
                            />

                            <div className="mt-6">
                                <Label htmlFor="invoiceRefNo" className="text-sm font-medium">Invoice Reference No.</Label>
                                <Input
                                    id="invoiceRefNo"
                                    value={formData.invoiceRefNo}
                                    onChange={(e) => updateFormData('invoiceRefNo', e.target.value)}
                                    placeholder="Enter invoice reference number"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Invoice Items Management */}
                        <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                            <div className="flex items-center mb-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-primary-foreground text-xs font-bold">4</span>
                                    </div>
                                    Invoice Items
                                </h3>
                            </div>

                            <InvoiceItemManagement
                                invoiceId={1} // This will be the actual invoice ID when integrated
                                items={formData.items}
                                onItemsChange={handleItemsChange}
                                onRunningTotalsChange={handleRunningTotalsChange}
                            />
                        </div>

                        {/* Total Amount */}
                        <div className="bg-muted/30 rounded-lg p-4 sm:p-6 border">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Label className="text-lg font-semibold">Total Amount</Label>
                                    <p className="text-sm text-muted-foreground">Sum of all item values</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-green-600">
                                        Rs. {formData.totalAmount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-muted/30 rounded-lg p-4 sm:p-6 border">
                            <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => updateFormData('notes', e.target.value)}
                                placeholder="Add any additional notes or comments about this invoice..."
                                rows={3}
                                className="mt-1"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-muted/30 rounded-lg p-4 sm:p-6 border">
                            <div className="flex flex-col gap-4">
                                {/* Main Action Buttons Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handlePreview}
                                        disabled={!formData.buyerNTNCNIC || formData.items.length === 0 || formData.items.some(item => item.quantity === 0 || item.unit_price === 0)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 h-10"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span className="hidden sm:inline">Preview Invoice</span>
                                        <span className="sm:hidden">Preview</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleValidateInvoice}
                                        disabled={isValidating || !formData.buyerNTNCNIC || formData.items.length === 0 || formData.items.some(item => item.quantity === 0 || item.unit_price === 0)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 h-10"
                                    >
                                        {isValidating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span className="hidden sm:inline">Validating...</span>
                                                <span className="sm:hidden">Validating</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="hidden sm:inline">Validate Invoice</span>
                                                <span className="sm:hidden">Validate</span>
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitting || !formData.buyerNTNCNIC || formData.items.length === 0 || formData.items.some(item => item.quantity === 0 || item.unit_price === 0) || !validationResult?.isValid}
                                        className="flex items-center justify-center gap-2 px-4 py-2 h-10 font-semibold"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span className="hidden sm:inline">Submitting...</span>
                                                <span className="sm:hidden">Submitting</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4" />
                                                <span className="hidden sm:inline">Complete Scenario</span>
                                                <span className="sm:hidden">Complete</span>
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Cancel Button Row */}
                                <div className="flex justify-center sm:justify-start">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/fbr/sandbox-testing')}
                                        disabled={submitting}
                                        className="px-6 py-2 h-10 w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Preview Modal */}
            <InvoicePreview
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                invoiceData={formData}
                onDownloadPDF={handleDownloadPDF}
                isGeneratingPDF={isGeneratingPDF}
            />

            {/* Invoice Validation Modal */}
            <InvoiceValidationModal
                isOpen={showValidationModal}
                onClose={() => setShowValidationModal(false)}
                validationResult={validationResult}
                isLoading={isValidating}
                onValidate={handleValidateInvoice}
            />
        </div>
    );
}
