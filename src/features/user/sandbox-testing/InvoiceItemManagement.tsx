import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/Table';
import { Badge } from '@/shared/components/Badge';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Textarea } from '@/shared/components/Textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/Dialog';
import { useToast } from '@/shared/hooks/useToast';
import {
    InvoiceItemForm,
    InvoiceItemCalculated,
    InvoiceRunningTotals,
    HSCodeSearchResult,
    UOMCode
} from '@/shared/types/invoice';
import {
    calculateInvoiceItem,
    calculateRunningTotals,
    validateInvoiceItem,
    formatCurrency,
    formatQuantity,
    formatPercentage,
    isThirdScheduleItem,
    getDefaultTaxRate,
    getDefaultUOM
} from '@/shared/utils/invoiceCalculations';
import { SYSTEM_DEFAULTS, getBestAvailableUOM } from '@/shared/constants/invoiceDefaults';
import {
    getHSCodeDetails as getCachedHSCodeDetails,
    cacheHSCode,
    bulkCacheHSCodes
} from '@/shared/services/supabase/invoice';
import { getFbrConfigStatus } from '@/shared/services/supabase/fbr';
import { Plus, Trash2, Edit, MoveUp, MoveDown } from 'lucide-react';
import { getAllHSCodes } from '@/shared/services/api/fbr';
interface InvoiceItemManagementProps {
    invoiceId: number;
    items: InvoiceItemCalculated[];
    onItemsChange: (items: InvoiceItemCalculated[]) => void;
    onRunningTotalsChange: (totals: InvoiceRunningTotals) => void;
    className?: string;
}

export function InvoiceItemManagement({
    items,
    onItemsChange,
    onRunningTotalsChange,
    className = ''
}: InvoiceItemManagementProps) {
    const { user } = useAppSelector((state) => state.user);
    const { toast } = useToast();
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<InvoiceItemForm>({
        hs_code: '',
        item_name: '',
        quantity: SYSTEM_DEFAULTS.DEFAULT_QUANTITY,
        unit_price: SYSTEM_DEFAULTS.MIN_UNIT_PRICE,
        uom_code: '',
        tax_rate: SYSTEM_DEFAULTS.MIN_TAX_RATE,
        invoice_note: '',
        is_third_schedule: false
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [hsCodeSearchTerm, setHsCodeSearchTerm] = useState('');
    const [hsCodeResults, setHsCodeResults] = useState<HSCodeSearchResult[]>([]);
    const [isSearchingHSCodes, setIsSearchingHSCodes] = useState(false);
    const [uomOptions, setUomOptions] = useState<UOMCode[]>([]);
    const [allHSCodes, setAllHSCodes] = useState<HSCodeSearchResult[]>([]);
    const [isCaching, setIsCaching] = useState(false);
    const [hasLoadedData, setHasLoadedData] = useState(false);

    // Calculate running totals only when items change
    useEffect(() => {
        const totals = calculateRunningTotals(items);
        onRunningTotalsChange(totals);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]); // Only depend on items, not the callback

    // OPTIMIZATION: Load FBR data with multiple safeguards to prevent excessive API calls:
    // 1. Check if data already exists in memory before making API calls
    // 2. Use isCaching flag to prevent concurrent calls
    // 3. Use hasLoadedData flag to prevent repeated loads on re-renders
    // 4. Removed isCaching from useCallback dependencies to prevent infinite loops

    const loadFbrApiKeyAndAllData = useCallback(async () => {
        if (!user?.id) return;

        // Prevent multiple simultaneous calls
        if (isCaching) return;

        try {
            setIsCaching(true);

            // Get FBR API configuration
            const fbrConfig = await getFbrConfigStatus(user.id);
            const apiKey = fbrConfig.sandbox_api_key || fbrConfig.production_api_key;

            if (!apiKey) {
                toast({
                    title: 'FBR API Not Configured',
                    description: 'Please configure your FBR API credentials first',
                    variant: 'destructive'
                });
                return;
            }

            // Check if we already have data in memory to avoid unnecessary API calls
            if (allHSCodes.length > 0 && uomOptions.length > 0) {
                console.log('FBR data already loaded, skipping API calls');
                setHasLoadedData(true);
                return;
            }

            // Load all HS codes from FBR API only if not already loaded
            if (allHSCodes.length === 0) {
                const hsCodeResponse = await getAllHSCodes(apiKey);

                if (hsCodeResponse.success) {
                    setAllHSCodes(hsCodeResponse.data);

                    // Check if cache is already populated
                    try {
                        const { checkCacheStatus } = await import('@/shared/services/supabase/invoice');
                        const cacheStatus = await checkCacheStatus();

                        if (!cacheStatus.hasData) {
                            console.log('Populating HS code cache...');
                            const hsCodeCache = hsCodeResponse.data.map(item => ({
                                hs_code: item.hS_CODE,
                                description: item.description,
                                default_uom: getDefaultUOM(item.hS_CODE, undefined, uomOptions.map(u => u.uom_code)),
                                default_tax_rate: getDefaultTaxRate(item.hS_CODE),
                                is_third_schedule: isThirdScheduleItem(item.hS_CODE)
                            }));

                            // Cache in batches to avoid overwhelming the database
                            const batchSize = 50;
                            for (let i = 0; i < hsCodeCache.length; i += batchSize) {
                                const batch = hsCodeCache.slice(i, i + batchSize);
                                await bulkCacheHSCodes(batch);
                            }

                            console.log(`Successfully cached ${hsCodeCache.length} HS codes`);
                        } else {
                            console.log(`HS code cache already populated with ${cacheStatus.count} items, skipping...`);
                        }
                    } catch (cacheError) {
                        console.warn('Failed to populate HS code cache:', cacheError);
                        // Don't throw error as this is optional
                    }
                } else {
                    throw new Error(hsCodeResponse.message);
                }
            }

            // Load UOM codes from FBR API only if not already loaded
            if (uomOptions.length === 0) {
                const { getUOMCodes } = await import('@/shared/services/api/fbr');
                const uomResponse = await getUOMCodes(apiKey);

                if (uomResponse.success) {
                    // Filter out duplicates to ensure unique keys
                    const uniqueUomOptions = uomResponse.data.filter((uom, index, self) =>
                        index === self.findIndex(u => u.uom_code === uom.uom_code)
                    );
                    console.log('Loaded UOM options:', uniqueUomOptions.length, uniqueUomOptions.slice(0, 5));
                    setUomOptions(uniqueUomOptions);
                } else {
                    throw new Error(uomResponse.message);
                }
            }
        } catch (error) {
            console.error('Failed to load FBR data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load data from FBR API',
                variant: 'destructive'
            });
        } finally {
            setIsCaching(false);
            setHasLoadedData(true);
        }
    }, [user?.id, toast]); // Dependencies for memoization - removed length dependencies to prevent re-creation

    // Load FBR API key and all data on component mount (only once)
    useEffect(() => {
        if (!hasLoadedData) {
            loadFbrApiKeyAndAllData();
        }
    }, [loadFbrApiKeyAndAllData, hasLoadedData]);

    const searchHSCodesFromFrontend = useCallback((searchTerm: string) => {
        if (!searchTerm.trim()) {
            setHsCodeResults([]);
            return;
        }

        if (!allHSCodes.length) {
            toast({
                title: 'No HS Codes Available',
                description: 'Please wait for HS codes to load from FBR API',
                variant: 'default'
            });
            return;
        }

        setIsSearchingHSCodes(true);

        // Use setTimeout to make the search non-blocking
        setTimeout(() => {
            // Filter HS codes on frontend with null safety
            const searchTermLower = searchTerm.toLowerCase();
            const filteredResults = allHSCodes.filter(item => {
                // Ensure both hs_code and description are strings before using toLowerCase
                const hsCode = item.hS_CODE?.toString() || '';
                const description = item.description?.toString() || '';

                return hsCode.toLowerCase().includes(searchTermLower) ||
                    description.toLowerCase().includes(searchTermLower);
            }).slice(0, 50);

            setHsCodeResults(filteredResults);
            setIsSearchingHSCodes(false);
        }, 0);
    }, [allHSCodes, toast]);

    const handleHSCodeSearch = useCallback((searchTerm: unknown) => {
        debounce((term: unknown) => {
            searchHSCodesFromFrontend(term as string);
        }, 100)(searchTerm); // Further reduced debounce for better responsiveness
    }, [searchHSCodesFromFrontend]);

    const handleHSCodeSelect = async (hsCode: string) => {
        try {
            // Find the selected HS code from the frontend data
            const selectedHSCode = allHSCodes.find(item => item.hS_CODE === hsCode);

            if (!selectedHSCode) {
                toast({
                    title: 'Error',
                    description: 'Selected HS code not found',
                    variant: 'destructive'
                });
                return;
            }

            // Get HS code details from cache or use defaults
            let hsCodeDetails = await getCachedHSCodeDetails(hsCode);

            if (!hsCodeDetails) {
                // Use dynamic values based on the selected HS code and available options
                const availableUOMs = uomOptions.map(u => u.uom_code);
                hsCodeDetails = {
                    hs_code: hsCode,
                    description: selectedHSCode.description,
                    default_uom: getDefaultUOM(hsCode, undefined, availableUOMs),
                    default_tax_rate: getDefaultTaxRate(hsCode),
                    is_third_schedule: isThirdScheduleItem(hsCode)
                };

                // Cache the HS code for future use
                try {
                    await cacheHSCode(hsCodeDetails);
                } catch (error) {
                    console.warn('Failed to cache HS code:', error);
                }
            }

            // Update form with HS code details using dynamic defaults
            const availableUOMs = uomOptions.map(u => u.uom_code);
            const bestUom = hsCodeDetails.default_uom || getBestAvailableUOM(availableUOMs);
            const bestTaxRate = hsCodeDetails.default_tax_rate !== undefined ? hsCodeDetails.default_tax_rate : SYSTEM_DEFAULTS.DEFAULT_TAX_RATE;

            console.log('Setting HS code details:', { hsCode, bestUom, bestTaxRate, description: hsCodeDetails.description });

            setFormData(prev => ({
                ...prev,
                hs_code: hsCode,
                item_name: hsCodeDetails.description,
                uom_code: bestUom,
                tax_rate: bestTaxRate,
                is_third_schedule: hsCodeDetails.is_third_schedule || false
            }));

            setHsCodeResults([]);
            setHsCodeSearchTerm(hsCode);
        } catch (error) {
            console.error('Failed to get HS code details:', error);
            toast({
                title: 'Error',
                description: 'Failed to get HS code details',
                variant: 'destructive'
            });
        }
    };

    const handleFormChange = (field: keyof InvoiceItemForm, value: string | number | boolean) => {
        console.log('Form change:', field, value);

        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-calculate if quantity or unit price changes
            if (field === 'quantity' || field === 'unit_price') {
                const calculated = calculateInvoiceItem(updated);
                return {
                    ...updated,
                    // Update MRP fields for 3rd schedule items
                    mrp_including_tax: calculated.fixed_notified_value || 0,
                    mrp_excluding_tax: calculated.retail_price || 0
                };
            }

            // Validate UoM code exists in options
            if (field === 'uom_code' && typeof value === 'string') {
                const validUom = uomOptions.find(uom => uom.uom_code === value);
                if (!validUom && value) {
                    console.warn('Selected UoM code not found in options:', value);
                } else if (validUom) {
                    console.log('Valid UoM selected:', validUom);
                }
            }

            return updated;
        });

        // Clear validation errors for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const validation = validateInvoiceItem(formData);
        setValidationErrors(validation.errors);
        return validation.isValid;
    };

    const handleSaveItem = () => {
        if (!validateForm()) {
            toast({
                title: 'Validation Error',
                description: 'Please fix the errors in the form',
                variant: 'destructive'
            });
            return;
        }

        const calculatedItem = calculateInvoiceItem(formData);

        if (editingItemIndex !== null) {
            // Update existing item
            const updatedItems = [...items];
            updatedItems[editingItemIndex] = calculatedItem;
            onItemsChange(updatedItems);
            setEditingItemIndex(null);
        } else {
            // Add new item
            onItemsChange([...items, calculatedItem]);
        }

        // Reset form with dynamic defaults
        setFormData({
            hs_code: '',
            item_name: '',
            quantity: SYSTEM_DEFAULTS.DEFAULT_QUANTITY,
            unit_price: SYSTEM_DEFAULTS.MIN_UNIT_PRICE,
            uom_code: '',
            tax_rate: SYSTEM_DEFAULTS.MIN_TAX_RATE,
            invoice_note: '',
            is_third_schedule: false
        });
        setValidationErrors({});
        setIsAddItemOpen(false);

        toast({
            title: 'Success',
            description: editingItemIndex !== null ? 'Item updated successfully' : 'Item added successfully'
        });
    };

    const handleEditItem = (index: number) => {
        const item = items[index];
        setFormData({
            id: item.id || '',
            hs_code: item.hs_code,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            uom_code: item.uom_code,
            tax_rate: item.tax_rate,
            mrp_including_tax: item.fixed_notified_value || 0,
            mrp_excluding_tax: item.retail_price || 0,
            invoice_note: item.invoice_note || '',
            is_third_schedule: item.is_third_schedule
        });
        setEditingItemIndex(index);
        setIsAddItemOpen(true);
    };

    const handleDeleteItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        onItemsChange(updatedItems);
        toast({
            title: 'Success',
            description: 'Item deleted successfully'
        });
    };

    const handleMoveItem = (fromIndex: number, direction: 'up' | 'down') => {
        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= items.length) return;

        const updatedItems = [...items];
        [updatedItems[fromIndex], updatedItems[toIndex]] = [updatedItems[toIndex], updatedItems[fromIndex]];
        onItemsChange(updatedItems);
    };

    const runningTotals = calculateRunningTotals(items);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Items Table */}
            <Card>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Invoice Items</h3>
                        <Button
                            onClick={() => setIsAddItemOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </Button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No items added yet. Click "Add Item" to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>HS Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead>UoM</TableHead>
                                        <TableHead className="text-right">Tax Rate</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={item.id || index}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-mono text-sm">{item.hs_code}</div>
                                                    {item.is_third_schedule && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            3rd Schedule
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate" title={item.item_name}>
                                                    {item.item_name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatQuantity(item.quantity)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(item.unit_price)}
                                            </TableCell>
                                            <TableCell className="font-mono">{item.uom_code}</TableCell>
                                            <TableCell className="text-right">
                                                {formatPercentage(item.tax_rate)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold">
                                                {formatCurrency(item.total_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditItem(index)}
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveItem(index, 'up')}
                                                        disabled={index === 0}
                                                        title="Move Up"
                                                    >
                                                        <MoveUp className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveItem(index, 'down')}
                                                        disabled={index === items.length - 1}
                                                        title="Move Down"
                                                    >
                                                        <MoveDown className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteItem(index)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Running Totals */}
            {items.length > 0 && (
                <Card>
                    <div className="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold mb-4">Running Totals</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                                    {runningTotals.total_items}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Items</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-xl sm:text-2xl font-bold text-green-600">
                                    {formatCurrency(runningTotals.total_value_excluding_tax)}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 font-medium">Value Excluding Tax</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="text-xl sm:text-2xl font-bold text-orange-600">
                                    {formatCurrency(runningTotals.total_sales_tax)}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 font-medium">Sales Tax</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                                    {formatCurrency(runningTotals.total_amount)}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Amount</div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Add/Edit Item Dialog */}
            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItemIndex !== null ? 'Edit Item' : 'Add New Item'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItemIndex !== null
                                ? 'Modify the details of this invoice item below.'
                                : 'Enter the details for a new invoice item below.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* HS Code Search */}
                        <div className="space-y-2">
                            <Label htmlFor="hs-code">HS Code *</Label>
                            <div className="relative">
                                <Input
                                    id="hs-code"
                                    placeholder="Search HS Code..."
                                    value={hsCodeSearchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setHsCodeSearchTerm(value);
                                        handleHSCodeSearch(value);
                                    }}
                                    className={validationErrors.hs_code ? 'border-red-500' : ''}
                                />
                                {isSearchingHSCodes && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                            {validationErrors.hs_code && (
                                <p className="text-sm text-red-500">{validationErrors.hs_code}</p>
                            )}

                            {/* HS Code Search Results */}
                            {hsCodeResults.length > 0 && (
                                <div className="border rounded-md max-h-48 overflow-y-auto">
                                    {hsCodeResults.map((result) => (
                                        <div
                                            key={result.hS_CODE}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                            onClick={() => handleHSCodeSelect(result.hS_CODE)}
                                        >
                                            <div className="font-mono text-sm font-semibold">
                                                {result.hS_CODE}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {result.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Description */}
                        <div className="space-y-2">
                            <Label htmlFor="item-name">Product Description *</Label>
                            <Input
                                id="item-name"
                                value={formData.item_name}
                                onChange={(e) => handleFormChange('item_name', e.target.value)}
                                className={validationErrors.item_name ? 'border-red-500' : ''}
                            />
                            {validationErrors.item_name && (
                                <p className="text-sm text-red-500">{validationErrors.item_name}</p>
                            )}
                        </div>

                        {/* Quantity and Unit Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity *</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min={SYSTEM_DEFAULTS.MIN_QUANTITY}
                                    step="0.001"
                                    value={formData.quantity}
                                    onChange={(e) => handleFormChange('quantity', parseFloat(e.target.value) || 0)}
                                    className={validationErrors.quantity ? 'border-red-500' : ''}
                                />
                                {validationErrors.quantity && (
                                    <p className="text-sm text-red-500">{validationErrors.quantity}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit-price">Unit Price *</Label>
                                <Input
                                    id="unit-price"
                                    type="number"
                                    min={SYSTEM_DEFAULTS.MIN_UNIT_PRICE}
                                    step="0.01"
                                    value={formData.unit_price}
                                    onChange={(e) => handleFormChange('unit_price', parseFloat(e.target.value) || 0)}
                                    className={validationErrors.unit_price ? 'border-red-500' : ''}
                                />
                                {validationErrors.unit_price && (
                                    <p className="text-sm text-red-500">{validationErrors.unit_price}</p>
                                )}
                            </div>
                        </div>

                        {/* UoM and Tax Rate */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="uom">Unit of Measure *</Label>
                                <Select
                                    {...(formData.uom_code ? { value: formData.uom_code } : {})}
                                    onValueChange={(value) => handleFormChange('uom_code', value)}
                                >
                                    <SelectTrigger className={validationErrors.uom_code ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select UoM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uomOptions.length > 0 ? (
                                            uomOptions.map((uom, index) => (
                                                <SelectItem key={`${uom.uom_code}-${index}`} value={uom.uom_code}>
                                                    {uom.uom_code} - {uom.description}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="__loading__" disabled>
                                                Loading UoM options...
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {validationErrors.uom_code && (
                                    <p className="text-sm text-red-500">{validationErrors.uom_code}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tax-rate">Tax Rate (%) *</Label>
                                <Input
                                    id="tax-rate"
                                    type="number"
                                    min={SYSTEM_DEFAULTS.MIN_TAX_RATE}
                                    max={SYSTEM_DEFAULTS.MAX_TAX_RATE}
                                    step="0.01"
                                    value={formData.tax_rate}
                                    onChange={(e) => handleFormChange('tax_rate', parseFloat(e.target.value) || 0)}
                                    className={validationErrors.tax_rate ? 'border-red-500' : ''}
                                />
                                {validationErrors.tax_rate && (
                                    <p className="text-sm text-red-500">{validationErrors.tax_rate}</p>
                                )}
                            </div>
                        </div>

                        {/* 3rd Schedule Fields */}
                        {formData.is_third_schedule && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mrp-including-tax">MRP Including Tax</Label>
                                    <Input
                                        id="mrp-including-tax"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.mrp_including_tax || ''}
                                        onChange={(e) => handleFormChange('mrp_including_tax', parseFloat(e.target.value) || 0)}
                                        className={validationErrors.mrp_including_tax ? 'border-red-500' : ''}
                                    />
                                    {validationErrors.mrp_including_tax && (
                                        <p className="text-sm text-red-500">{validationErrors.mrp_including_tax}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mrp-excluding-tax">MRP Excluding Tax</Label>
                                    <Input
                                        id="mrp-excluding-tax"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.mrp_excluding_tax || ''}
                                        onChange={(e) => handleFormChange('mrp_excluding_tax', parseFloat(e.target.value) || 0)}
                                        className={validationErrors.mrp_excluding_tax ? 'border-red-500' : ''}
                                        disabled
                                    />
                                    {validationErrors.mrp_excluding_tax && (
                                        <p className="text-sm text-red-500">{validationErrors.mrp_excluding_tax}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Invoice Note */}
                        <div className="space-y-2">
                            <Label htmlFor="invoice-note">Invoice Note (Optional)</Label>
                            <Textarea
                                id="invoice-note"
                                value={formData.invoice_note}
                                onChange={(e) => handleFormChange('invoice_note', e.target.value)}
                                placeholder="Additional notes for this item..."
                                maxLength={SYSTEM_DEFAULTS.MAX_DESCRIPTION_LENGTH}
                                className={validationErrors.invoice_note ? 'border-red-500' : ''}
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Max {SYSTEM_DEFAULTS.MAX_DESCRIPTION_LENGTH} characters</span>
                                <span>{formData.invoice_note?.length || 0}/{SYSTEM_DEFAULTS.MAX_DESCRIPTION_LENGTH}</span>
                            </div>
                            {validationErrors.invoice_note && (
                                <p className="text-sm text-red-500">{validationErrors.invoice_note}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddItemOpen(false);
                                    setEditingItemIndex(null);
                                    setFormData({
                                        hs_code: '',
                                        item_name: '',
                                        quantity: SYSTEM_DEFAULTS.DEFAULT_QUANTITY,
                                        unit_price: SYSTEM_DEFAULTS.MIN_UNIT_PRICE,
                                        uom_code: '',
                                        tax_rate: SYSTEM_DEFAULTS.MIN_TAX_RATE,
                                        invoice_note: '',
                                        is_third_schedule: false
                                    });
                                    setValidationErrors({});
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSaveItem}>
                                {editingItemIndex !== null ? 'Update Item' : 'Add Item'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Debounce utility function
function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
