import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from './useToast';
import { RootState } from '@/shared/services/store';
import {
    InvoiceItemCalculated,
    InvoiceRunningTotals,
    InvoiceItemForm,
    UoMValidationResult
} from '@/shared/types/invoice';
import { UoMValidationSeverity } from '@/shared/constants/uom';
import {
    getInvoiceItems,
    createInvoiceItem,
    updateInvoiceItem,
    deleteInvoiceItem,
    getCachedUoMValidation,
    cacheUoMValidation
} from '@/shared/services/supabase/invoice';
import { validateUoM as validateUoMWithFBR } from '@/shared/services/api/fbr';
import { getFbrConfigStatus } from '@/shared/services/supabase/fbr';
import { calculateRunningTotals } from '@/shared/utils/invoiceCalculations';

interface UseInvoiceItemsProps {
    invoiceId: number;
}

export interface UseInvoiceItemsReturn {
    items: InvoiceItemCalculated[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    runningTotals: InvoiceRunningTotals;
    refreshItems: () => Promise<void>;
    addItem: (item: Omit<InvoiceItemCalculated, 'id'>) => Promise<void>;
    updateItem: (id: string, updates: Partial<InvoiceItemCalculated>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    reorderItems: (fromIndex: number, toIndex: number) => void;
    validateUoM: (hsCode: string, selectedUoM: string) => Promise<UoMValidationResult>;
}

export function useInvoiceItems({ invoiceId }: UseInvoiceItemsProps): UseInvoiceItemsReturn {
    const { toast } = useToast();
    const { user } = useSelector((state: RootState) => state.user);
    const [items, setItems] = useState<InvoiceItemCalculated[]>([]);
    const [runningTotals, setRunningTotals] = useState<InvoiceRunningTotals>({
        total_quantity: 0,
        total_value_excluding_tax: 0,
        total_sales_tax: 0,
        total_amount: 0,
        total_items: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load items on mount
    useEffect(() => {
        if (invoiceId) {
            refreshItems();
        }
    }, [invoiceId]);

    // Calculate running totals whenever items change
    useEffect(() => {
        const totals = calculateRunningTotals(items);
        setRunningTotals(totals);
    }, [items]);

    const refreshItems = useCallback(async () => {
        if (!invoiceId) return;

        setIsLoading(true);
        setError(null);

        try {
            const fetchedItems = await getInvoiceItems(invoiceId);
            setItems(fetchedItems);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load invoice items';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }, [invoiceId, toast]);

    const addItem = useCallback(async (item: Omit<InvoiceItemCalculated, 'id'>) => {
        if (!invoiceId) return;

        setIsSaving(true);
        setError(null);

        try {
            const newItem = await createInvoiceItem({
                invoice_id: invoiceId,
                hs_code: item.hs_code,
                item_name: item.item_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                uom_code: item.uom_code,
                tax_rate: item.tax_rate,
                invoice_note: item.invoice_note || '',
                is_third_schedule: item.is_third_schedule
            });

            setItems(prev => [...prev, newItem]);
            toast({
                title: 'Success',
                description: 'Item added successfully'
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    }, [invoiceId, toast]);

    const updateItem = useCallback(async (id: string, updates: Partial<InvoiceItemCalculated>) => {
        setIsSaving(true);
        setError(null);

        try {
            // Convert InvoiceItemCalculated to InvoiceItemForm format
            const formUpdates: Partial<InvoiceItemForm> = {};

            if (updates.hs_code !== undefined) formUpdates.hs_code = updates.hs_code;
            if (updates.item_name !== undefined) formUpdates.item_name = updates.item_name;
            if (updates.quantity !== undefined) formUpdates.quantity = updates.quantity;
            if (updates.unit_price !== undefined) formUpdates.unit_price = updates.unit_price;
            if (updates.uom_code !== undefined) formUpdates.uom_code = updates.uom_code;
            if (updates.tax_rate !== undefined) formUpdates.tax_rate = updates.tax_rate;
            if (updates.invoice_note !== undefined) formUpdates.invoice_note = updates.invoice_note;
            if (updates.is_third_schedule !== undefined) formUpdates.is_third_schedule = updates.is_third_schedule;

            const updatedItem = await updateInvoiceItem(id, formUpdates);
            setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
            toast({
                title: 'Success',
                description: 'Item updated successfully'
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const removeItem = useCallback(async (id: string) => {
        setIsSaving(true);
        setError(null);

        try {
            await deleteInvoiceItem(id);
            setItems(prev => prev.filter(item => item.id !== id));
            toast({
                title: 'Success',
                description: 'Item removed successfully'
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
        setItems(prev => {
            const newItems = [...prev];
            const [movedItem] = newItems.splice(fromIndex, 1);
            newItems.splice(toIndex, 0, movedItem);
            return newItems;
        });
    }, []);

    const validateUoM = useCallback(async (hsCode: string, selectedUoM: string): Promise<UoMValidationResult> => {
        try {
            // First, try to get cached validation result
            const cachedValidation = await getCachedUoMValidation(hsCode);

            if (cachedValidation) {
                const isValid = cachedValidation.valid_uoms.includes(selectedUoM);
                const severity = isValid ? UoMValidationSeverity.WARNING : UoMValidationSeverity.ERROR;

                return {
                    isValid,
                    recommendedUoM: cachedValidation.recommended_uom,
                    validUoMs: cachedValidation.valid_uoms,
                    severity,
                    ...(isValid ? {} : {
                        message: `Recommended UoM for this HS Code: ${cachedValidation.recommended_uom}`,
                        isCriticalMismatch: false
                    })
                };
            }

            // If not cached, get FBR API key and validate
            const fbrConfig = await getFbrConfigStatus(user?.id || '');
            const apiKey = fbrConfig.sandbox_api_key || fbrConfig.production_api_key;

            if (!apiKey) {
                return {
                    isValid: true, // Default to valid if no API key
                    recommendedUoM: selectedUoM,
                    validUoMs: [selectedUoM],
                    severity: UoMValidationSeverity.WARNING,
                    message: 'FBR API not configured - using selected UoM'
                };
            }

            // Call FBR API for validation
            const validationResult = await validateUoMWithFBR(apiKey, hsCode, selectedUoM);

            if (validationResult.success && validationResult.data) {
                // Cache the result for future use
                try {
                    await cacheUoMValidation(hsCode, validationResult.data.validUoMs, validationResult.data.recommendedUoM);
                } catch (cacheError) {
                    console.warn('Failed to cache UoM validation:', cacheError);
                }

                return {
                    isValid: validationResult.data.isValid,
                    recommendedUoM: validationResult.data.recommendedUoM,
                    validUoMs: validationResult.data.validUoMs,
                    severity: validationResult.data.severity as UoMValidationSeverity,
                    ...(validationResult.data.message && { message: validationResult.data.message }),
                    ...(validationResult.data.isCriticalMismatch && { isCriticalMismatch: validationResult.data.isCriticalMismatch })
                };
            }

            // Fallback if API call fails
            return {
                isValid: true,
                recommendedUoM: selectedUoM,
                validUoMs: [selectedUoM],
                severity: UoMValidationSeverity.WARNING,
                message: 'Unable to validate UoM - using selected value'
            };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to validate UoM';
            return {
                isValid: true, // Default to valid on error
                recommendedUoM: selectedUoM,
                validUoMs: [selectedUoM],
                severity: UoMValidationSeverity.WARNING,
                message: errorMessage
            };
        }
    }, []);

    return {
        items,
        runningTotals,
        isLoading,
        isSaving,
        error,
        addItem,
        updateItem,
        deleteItem: removeItem,
        reorderItems,
        refreshItems,
        validateUoM
    };
}
