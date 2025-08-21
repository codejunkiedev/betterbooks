import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { useToast } from "@/shared/hooks/useToast";
import { submitSandboxTestInvoice } from "@/shared/services/api/fbr";
import { FBR_SCENARIOS } from "@/shared/constants/fbr";
import type { RootState } from "@/shared/services/store";
import {
    ArrowLeft,
    Play,
    AlertCircle,
    FileText,
    Calculator
} from "lucide-react";

interface ScenarioData {
    invoiceType: string;
    buyerNTNCNIC: string;
    items: Array<{
        itemName: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
    }>;
}

export default function FbrScenarioInvoice() {
    const { user } = useSelector((s: RootState) => s.user);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [scenarioId, setScenarioId] = useState<string>('');
    const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null);
    const [formData, setFormData] = useState({
        invoiceType: '',
        buyerNTNCNIC: '',
        items: [] as Array<{
            itemName: string;
            quantity: number;
            unitPrice: number;
            totalAmount: number;
        }>
    });

    useEffect(() => {
        // Get scenario data from navigation state
        const state = location.state as { scenarioId?: string; scenarioData?: ScenarioData };
        if (state?.scenarioId && state?.scenarioData) {
            setScenarioId(state.scenarioId);
            setScenarioData(state.scenarioData);

            // Pre-populate form with scenario data
            setFormData({
                invoiceType: state.scenarioData.invoiceType,
                buyerNTNCNIC: state.scenarioData.buyerNTNCNIC,
                items: state.scenarioData.items.map(item => ({ ...item }))
            });
        } else {
            // No scenario data, redirect back to sandbox testing
            navigate('/fbr/sandbox-testing');
        }
    }, [location.state, navigate]);

    const scenario = scenarioId ? FBR_SCENARIOS[scenarioId] : null;

    const updateItem = (index: number, field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };
                    // Recalculate total amount
                    if (field === 'quantity' || field === 'unitPrice') {
                        updatedItem.totalAmount = updatedItem.quantity * updatedItem.unitPrice;
                    }
                    return updatedItem;
                }
                return item;
            })
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                itemName: '',
                quantity: 1,
                unitPrice: 0,
                totalAmount: 0
            }]
        }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const getTotalAmount = () => {
        return formData.items.reduce((total, item) => total + item.totalAmount, 0);
    };

    const validateForm = () => {
        if (!formData.invoiceType.trim()) {
            toast({
                title: "Validation Error",
                description: "Invoice type is required.",
                variant: "destructive"
            });
            return false;
        }

        if (!formData.buyerNTNCNIC.trim()) {
            toast({
                title: "Validation Error",
                description: "Buyer NTN/CNIC is required.",
                variant: "destructive"
            });
            return false;
        }

        if (formData.items.length === 0) {
            toast({
                title: "Validation Error",
                description: "At least one item is required.",
                variant: "destructive"
            });
            return false;
        }

        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (!item.itemName.trim()) {
                toast({
                    title: "Validation Error",
                    description: `Item name is required for item ${i + 1}.`,
                    variant: "destructive"
                });
                return false;
            }
            if (item.quantity <= 0) {
                toast({
                    title: "Validation Error",
                    description: `Quantity must be greater than 0 for item ${i + 1}.`,
                    variant: "destructive"
                });
                return false;
            }
            if (item.unitPrice <= 0) {
                toast({
                    title: "Validation Error",
                    description: `Unit price must be greater than 0 for item ${i + 1}.`,
                    variant: "destructive"
                });
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!user?.id || !scenarioId) return;

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await submitSandboxTestInvoice({
                userId: user.id,
                scenarioId,
                invoiceData: {
                    ...formData,
                    totalAmount: getTotalAmount(),
                    scenarioId
                }
            });

            if (response.success) {
                toast({
                    title: "Success",
                    description: response.message,
                });

                // Navigate back to sandbox testing
                navigate('/fbr/sandbox-testing');
            } else {
                toast({
                    title: "Test Failed",
                    description: response.message,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('FBR sandbox test error:', error);
            toast({
                title: "Error",
                description: "Failed to submit sandbox test. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!scenario || !scenarioData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Scenario</h2>
                        <p className="text-gray-500 mb-4">The requested scenario could not be found.</p>
                        <Button onClick={() => navigate('/fbr/sandbox-testing')}>
                            Back to Sandbox Testing
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/fbr/sandbox-testing')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Testing
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">FBR Scenario Test</h1>
                            <p className="text-gray-500">Complete the scenario to validate your integration</p>
                        </div>
                    </div>
                    <Badge variant="secondary">{scenarioId}</Badge>
                </div>

                {/* Scenario Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {scenario.description}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Requirements:</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    {scenario.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-gray-400">•</span>
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Expected Outcomes:</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    {scenario.expectedOutcomes.map((outcome, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-gray-400">•</span>
                                            <span>{outcome}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Invoice Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Invoice Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="invoiceType">Invoice Type</Label>
                                <Input
                                    id="invoiceType"
                                    value={formData.invoiceType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceType: e.target.value }))}
                                    placeholder="e.g., Sale Invoice"
                                />
                            </div>
                            <div>
                                <Label htmlFor="buyerNTNCNIC">Buyer NTN/CNIC</Label>
                                <Input
                                    id="buyerNTNCNIC"
                                    value={formData.buyerNTNCNIC}
                                    onChange={(e) => setFormData(prev => ({ ...prev, buyerNTNCNIC: e.target.value }))}
                                    placeholder="1234567890123"
                                />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-700">Invoice Items</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                >
                                    Add Item
                                </Button>
                            </div>

                            {formData.items.map((item, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h5 className="font-medium text-gray-700">Item {index + 1}</h5>
                                        {formData.items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-4">
                                        <div>
                                            <Label htmlFor={`itemName-${index}`}>Item Name</Label>
                                            <Input
                                                id={`itemName-${index}`}
                                                value={item.itemName}
                                                onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                                placeholder="Product name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                                            <Input
                                                id={`quantity-${index}`}
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                                            <Input
                                                id={`unitPrice-${index}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Total Amount</Label>
                                            <div className="flex items-center h-10 px-3 bg-gray-50 border border-gray-200 rounded-md">
                                                <span className="text-gray-700">Rs. {item.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-end">
                            <div className="text-right space-y-2">
                                <div className="text-lg font-semibold text-gray-900">
                                    Total Amount: Rs. {getTotalAmount().toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Submitting to FBR...</span>
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                <span>Submit to FBR Sandbox</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
