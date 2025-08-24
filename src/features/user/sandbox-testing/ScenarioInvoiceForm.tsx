import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/shared/services/store';
import { useToast } from '@/shared/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Textarea } from '@/shared/components/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Badge } from '@/shared/components/Badge';
import { Alert, AlertDescription } from '@/shared/components/Alert';
import {
    Play,
    Target,
    FileText,
    AlertCircle,
    Plus,
    Trash2,
    Database
} from 'lucide-react';
import { FBR_SCENARIO_STATUS } from '@/shared/constants/fbr';
import {
    getScenarioById,
    updateScenarioProgress,
    getProvinceCodes
} from '@/shared/services/supabase/fbr';
import { submitSandboxTestInvoice } from '@/shared/services/api/fbr';
import { FbrScenario } from '@/shared/types/fbr';
import { InvoiceItem, ScenarioInvoiceFormData } from '@/shared/types/invoice';
import { generateRandomSampleData } from '@/shared/data/fbrSampleData';

export default function ScenarioInvoiceForm() {
    const { scenarioId } = useParams<{ scenarioId: string }>();
    const { user } = useSelector((s: RootState) => s.user);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [scenario, setScenario] = useState<FbrScenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [provinces, setProvinces] = useState<Array<{ state_province_code: number; state_province_desc: string }>>([]);
    const [formData, setFormData] = useState<ScenarioInvoiceFormData>({
        invoiceType: '',
        invoiceDate: '',
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
        items: [{
            hsCode: '',
            productDescription: '',
            rate: 0,
            uoM: '',
            quantity: 0,
            totalValues: 0,
            valueSalesExcludingST: 0,
            fixedNotifiedValueOrRetailPrice: 0,
            salesTaxApplicable: 0,
            salesTaxWithheldAtSource: 0,
            extraTax: 0,
            furtherTax: 0,
            sroScheduleNo: '',
            fedPayable: 0,
            discount: 0,
            saleType: '',
            sroItemSerialNo: ''
        }],
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

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                hsCode: '',
                productDescription: '',
                rate: 0,
                uoM: '',
                quantity: 0,
                totalValues: 0,
                valueSalesExcludingST: 0,
                fixedNotifiedValueOrRetailPrice: 0,
                salesTaxApplicable: 0,
                salesTaxWithheldAtSource: 0,
                extraTax: 0,
                furtherTax: 0,
                sroScheduleNo: '',
                fedPayable: 0,
                discount: 0,
                saleType: '',
                sroItemSerialNo: ''
            }]
        }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            setFormData(prev => {
                const newItems = prev.items.filter((_, i) => i !== index);
                const totalAmount = newItems.reduce((sum, item) => sum + (item.totalValues || 0), 0);

                return {
                    ...prev,
                    items: newItems,
                    totalAmount
                };
            });
        }
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            const item = { ...newItems[index], [field]: value };

            // Recalculate totals for quantity/rate changes
            if (field === 'quantity' || field === 'rate') {
                const quantity = field === 'quantity' ? Number(value) || 0 : item.quantity;
                const rate = field === 'rate' ? Number(value) || 0 : item.rate;
                const total = quantity * rate;
                item.totalValues = total;
                item.valueSalesExcludingST = total;
                item.fixedNotifiedValueOrRetailPrice = total;
            }

            newItems[index] = item;
            const totalAmount = newItems.reduce((sum, item) => sum + (item.totalValues || 0), 0);

            return { ...prev, items: newItems, totalAmount };
        });
    };

    const populateSampleData = () => {
        const sampleData = generateRandomSampleData(scenarioId);
        setFormData(sampleData);

        toast({
            title: "Sample Data Loaded",
            description: `Invoice populated with sample data. Total amount: Rs. ${sampleData.totalAmount.toLocaleString()}`,
        });
    };

    const clearFormData = () => {
        const emptyItem = {
            hsCode: '', productDescription: '', rate: 0, uoM: '', quantity: 0,
            totalValues: 0, valueSalesExcludingST: 0, fixedNotifiedValueOrRetailPrice: 0,
            salesTaxApplicable: 0, salesTaxWithheldAtSource: 0, extraTax: 0, furtherTax: 0,
            sroScheduleNo: '', fedPayable: 0, discount: 0, saleType: '', sroItemSerialNo: ''
        };

        setFormData({
            invoiceType: '', invoiceDate: '', sellerNTNCNIC: '', sellerBusinessName: '',
            sellerProvince: '', sellerAddress: '', buyerNTNCNIC: '', buyerBusinessName: '',
            buyerProvince: '', buyerAddress: '', buyerRegistrationType: '', invoiceRefNo: '',
            scenarioId: scenarioId || '', items: [emptyItem], totalAmount: 0, notes: ''
        });

        toast({ title: "Form Cleared", description: "All form data has been cleared." });
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
                        ...item,
                        quantity: Number(item.quantity) || 0,
                        rate: Number(item.rate) || 0,
                        totalValues: Number(item.totalValues) || 0,
                        valueSalesExcludingST: Number(item.valueSalesExcludingST) || 0,
                        fixedNotifiedValueOrRetailPrice: Number(item.fixedNotifiedValueOrRetailPrice) || 0,
                        salesTaxApplicable: Number(item.salesTaxApplicable) || 0,
                        salesTaxWithheldAtSource: Number(item.salesTaxWithheldAtSource) || 0,
                        extraTax: Number(item.extraTax) || 0,
                        furtherTax: Number(item.furtherTax) || 0,
                        fedPayable: Number(item.fedPayable) || 0,
                        discount: Number(item.discount) || 0,
                    })),
                    totalAmount: formData.totalAmount,
                    notes: formData.notes
                },
                userId: user.id
            });

            if (response.success) {
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
                <div className="bg-card rounded-xl p-6 border">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Target className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        Scenario {scenario.code}
                                    </h1>
                                    <p className="text-muted-foreground font-medium">FBR Sandbox Testing</p>
                                </div>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                                {scenario.description}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="capitalize px-4 py-2 text-sm font-medium">
                                {scenario.category}
                            </Badge>
                            <Badge variant="secondary" className="capitalize px-4 py-2 text-sm font-medium">
                                {scenario.sale_type}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Enhanced Invoice Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Create FBR Invoice
                                </CardTitle>
                                <p className="text-muted-foreground text-sm">Fill in the invoice details to complete this scenario</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={populateSampleData}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600"
                                >
                                    <Database className="h-4 w-4" />
                                    Load Sample Data
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={clearFormData}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Clear Form
                                </Button>

                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        {/* Basic Information */}
                        <div className="bg-muted/30 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs font-bold">1</span>
                                </div>
                                Basic Invoice Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="bg-muted/30 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs font-bold">2</span>
                                </div>
                                Seller Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="bg-muted/30 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs font-bold">3</span>
                                </div>
                                Buyer Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="buyerNTNCNIC" className="text-sm font-medium">Buyer NTN/CNIC</Label>
                                    <Input
                                        id="buyerNTNCNIC"
                                        value={formData.buyerNTNCNIC}
                                        onChange={(e) => updateFormData('buyerNTNCNIC', e.target.value)}
                                        placeholder="Enter NTN or CNIC"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="buyerBusinessName" className="text-sm font-medium">Buyer Business Name</Label>
                                    <Input
                                        id="buyerBusinessName"
                                        value={formData.buyerBusinessName}
                                        onChange={(e) => updateFormData('buyerBusinessName', e.target.value)}
                                        placeholder="Enter buyer business name"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="buyerProvince" className="text-sm font-medium">Buyer Province</Label>
                                    <Select
                                        value={formData.buyerProvince}
                                        onValueChange={(value) => updateFormData('buyerProvince', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select buyer province" />
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
                                    <Label htmlFor="buyerAddress" className="text-sm font-medium">Buyer Address</Label>
                                    <Input
                                        id="buyerAddress"
                                        value={formData.buyerAddress}
                                        onChange={(e) => updateFormData('buyerAddress', e.target.value)}
                                        placeholder="Enter buyer address"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="buyerRegistrationType" className="text-sm font-medium">Buyer Registration Type</Label>
                                    <Select
                                        value={formData.buyerRegistrationType}
                                        onValueChange={(value) => updateFormData('buyerRegistrationType', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select registration type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NTN">NTN</SelectItem>
                                            <SelectItem value="CNIC">CNIC</SelectItem>
                                            <SelectItem value="Passport">Passport</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
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
                        </div>

                        {/* Items */}
                        <div className="bg-muted/30 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-primary-foreground text-xs font-bold">4</span>
                                    </div>
                                    Invoice Items
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Item
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {formData.items.map((item, index) => (
                                    <div key={index} className="bg-card rounded-lg border p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold">Item #{index + 1}</h4>
                                            {formData.items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor={`hsCode-${index}`} className="text-sm font-medium">HS Code</Label>
                                                <Input
                                                    id={`hsCode-${index}`}
                                                    value={item.hsCode}
                                                    onChange={(e) => updateItem(index, 'hsCode', e.target.value)}
                                                    placeholder="Enter HS Code"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor={`productDescription-${index}`} className="text-sm font-medium">Product Description</Label>
                                                <Input
                                                    id={`productDescription-${index}`}
                                                    value={item.productDescription}
                                                    onChange={(e) => updateItem(index, 'productDescription', e.target.value)}
                                                    placeholder="Enter product description"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`rate-${index}`} className="text-sm font-medium">Rate</Label>
                                                <Input
                                                    id={`rate-${index}`}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.rate}
                                                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`uoM-${index}`} className="text-sm font-medium">UOM</Label>
                                                <Input
                                                    id={`uoM-${index}`}
                                                    value={item.uoM}
                                                    onChange={(e) => updateItem(index, 'uoM', e.target.value)}
                                                    placeholder="Enter UOM"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`quantity-${index}`} className="text-sm font-medium">Quantity</Label>
                                                <Input
                                                    id={`quantity-${index}`}
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`totalValues-${index}`} className="text-sm font-medium">Total Values</Label>
                                                <Input
                                                    id={`totalValues-${index}`}
                                                    type="number"
                                                    value={item.totalValues}
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`valueSalesExcludingST-${index}`} className="text-sm font-medium">Value Sales Excluding ST</Label>
                                                <Input
                                                    id={`valueSalesExcludingST-${index}`}
                                                    type="number"
                                                    value={item.valueSalesExcludingST}
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`fixedNotifiedValueOrRetailPrice-${index}`} className="text-sm font-medium">Fixed Notified Value or Retail Price</Label>
                                                <Input
                                                    id={`fixedNotifiedValueOrRetailPrice-${index}`}
                                                    type="number"
                                                    value={item.fixedNotifiedValueOrRetailPrice}
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`salesTaxApplicable-${index}`} className="text-sm font-medium">Sales Tax Applicable</Label>
                                                <Input
                                                    id={`salesTaxApplicable-${index}`}
                                                    type="number"
                                                    value={item.salesTaxApplicable}
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`salesTaxWithheldAtSource-${index}`} className="text-sm font-medium">Sales Tax Withheld At Source</Label>
                                                <Input
                                                    id={`salesTaxWithheldAtSource-${index}`}
                                                    type="number"
                                                    value={item.salesTaxWithheldAtSource}
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`extraTax-${index}`} className="text-sm font-medium">Extra Tax</Label>
                                                <Input
                                                    id={`extraTax-${index}`}
                                                    type="number"
                                                    value={item.extraTax}
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`furtherTax-${index}`} className="text-sm font-medium">Further Tax</Label>
                                                <Input
                                                    id={`furtherTax-${index}`}
                                                    type="number"
                                                    value={item.furtherTax}
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`sroScheduleNo-${index}`} className="text-sm font-medium">SRO Schedule No.</Label>
                                                <Input
                                                    id={`sroScheduleNo-${index}`}
                                                    value={item.sroScheduleNo}
                                                    onChange={(e) => updateItem(index, 'sroScheduleNo', e.target.value)}
                                                    placeholder="Enter SRO Schedule No."
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`fedPayable-${index}`} className="text-sm font-medium">Fed Payable</Label>
                                                <Input
                                                    id={`fedPayable-${index}`}
                                                    type="number"
                                                    value={item.fedPayable}
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`discount-${index}`} className="text-sm font-medium">Discount</Label>
                                                <Input
                                                    id={`discount-${index}`}
                                                    type="number"
                                                    value={item.discount}
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`saleType-${index}`} className="text-sm font-medium">Sale Type</Label>
                                                <Input
                                                    id={`saleType-${index}`}
                                                    value={item.saleType}
                                                    onChange={(e) => updateItem(index, 'saleType', e.target.value)}
                                                    placeholder="Enter sale type"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`sroItemSerialNo-${index}`} className="text-sm font-medium">SRO Item Serial No.</Label>
                                                <Input
                                                    id={`sroItemSerialNo-${index}`}
                                                    value={item.sroItemSerialNo}
                                                    onChange={(e) => updateItem(index, 'sroItemSerialNo', e.target.value)}
                                                    placeholder="Enter SRO Item Serial No."
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total Amount */}
                        <div className="bg-muted/30 rounded-lg p-6 border">
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
                        <div className="bg-muted/30 rounded-lg p-6 border">
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

                        {/* Submit Button */}
                        <div className="bg-muted/30 rounded-lg p-6 border">
                            <div className="flex justify-between items-center">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/fbr/sandbox-testing')}
                                    disabled={submitting}
                                    className="px-6 py-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || !formData.buyerNTNCNIC || formData.items.length === 0 || formData.items.some(item => item.quantity === 0 || item.rate === 0)}
                                    className="flex items-center gap-2 px-8 py-2 font-semibold"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4" />
                                            Complete Scenario
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
