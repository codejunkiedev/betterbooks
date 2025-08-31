import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from './useToast';
import { RootState } from '@/shared/services/store';
import { validateInvoice } from '@/shared/services/api/invoiceValidation';
import type {
    InvoiceValidationResponse
} from '@/shared/services/api/invoiceValidation';
import { ValidationSeverity, ValidationResult } from '@/shared/utils/validation';
import type { ScenarioInvoiceFormData } from '@/shared/types/invoice';

interface UseInvoiceValidationOptions {
    includeFBRValidation?: boolean;
    environment?: 'sandbox' | 'production';
    autoValidate?: boolean;
}

interface UseInvoiceValidationReturn {
    // State
    validationResult: InvoiceValidationResponse | null;
    isValidating: boolean;

    // Methods
    validateInvoice: (invoiceData: ScenarioInvoiceFormData) => Promise<InvoiceValidationResponse>;
    clearValidation: () => void;
    getFieldErrors: (fieldName: string) => ValidationResult[];
    hasFieldErrors: (fieldName: string) => boolean;
    getFieldWarnings: (fieldName: string) => ValidationResult[];
    hasFieldWarnings: (fieldName: string) => boolean;

    // Computed values
    hasErrors: boolean;
    hasWarnings: boolean;
    canSubmit: boolean;
    errorCount: number;
    warningCount: number;
    successCount: number;
}

export function useInvoiceValidation(options: UseInvoiceValidationOptions = {}): UseInvoiceValidationReturn {
    const {
        includeFBRValidation = true
    } = options;

    const { user } = useSelector((s: RootState) => s.user);
    const { toast } = useToast();

    const [validationResult, setValidationResult] = useState<InvoiceValidationResponse | null>(null);

    const [isValidating, setIsValidating] = useState(false);

    const validateInvoiceData = useCallback(async (invoiceData: ScenarioInvoiceFormData): Promise<InvoiceValidationResponse> => {
        if (!user?.id) {
            throw new Error('User not authenticated');
        }

        setIsValidating(true);

        try {
            const result = await validateInvoice(invoiceData, user.id, {
                includeFBRValidation
            });

            setValidationResult(result);

            // Show toast notification based on validation result
            if (result.isValid) {
                toast({
                    title: 'Validation Successful',
                    description: 'Your invoice is ready for submission to FBR.',
                    variant: 'default'
                });
            } else if (result.summary.errors > 0) {
                const errorCount = result.summary.errors;
                const errorText = errorCount === 1 ? 'error' : 'errors';
                toast({
                    title: 'Validation Failed',
                    description: `Found ${errorCount} ${errorText} that need to be fixed.`,
                    variant: 'destructive'
                });
            } else if (result.summary.warnings > 0) {
                const warningCount = result.summary.warnings;
                const warningText = warningCount === 1 ? 'warning' : 'warnings';
                toast({
                    title: 'Validation Complete',
                    description: `Found ${warningCount} ${warningText}. You can still submit.`,
                    variant: 'default'
                });
            }

            return result;

        } catch (error) {
            console.error('Invoice validation error:', error);

            let errorMessage = 'Validation failed';
            let errorCode = 'VALIDATION_ERROR';

            // Handle specific error types
            if (error instanceof Error) {
                errorMessage = error.message;
                if (error.message.includes('API key')) {
                    errorCode = 'API_KEY_ERROR';
                } else if (error.message.includes('network') || error.message.includes('timeout')) {
                    errorCode = 'NETWORK_ERROR';
                } else if (error.message.includes('FBR')) {
                    errorCode = 'FBR_ERROR';
                }
            }

            toast({
                title: 'Validation Error',
                description: errorMessage,
                variant: 'destructive'
            });

            // Create a failed validation result
            const failedResult: InvoiceValidationResponse = {
                isValid: false,
                canSubmit: false,
                results: [{
                    field: 'validation_error',
                    severity: ValidationSeverity.ERROR,
                    message: errorMessage,
                    code: errorCode
                }],
                summary: {
                    total: 1,
                    errors: 1,
                    warnings: 0,
                    successes: 0
                }
            };

            setValidationResult(failedResult);
            return failedResult;

        } finally {
            setIsValidating(false);
        }
    }, [user?.id, includeFBRValidation, toast]);

    const clearValidation = useCallback(() => {
        setValidationResult(null);
    }, []);

    const getFieldErrors = useCallback((fieldName: string): ValidationResult[] => {
        if (!validationResult) return [];

        return validationResult.results.filter(result =>
            result.severity === ValidationSeverity.ERROR &&
            result.field === fieldName
        );
    }, [validationResult]);

    const hasFieldErrors = useCallback((fieldName: string): boolean => {
        return getFieldErrors(fieldName).length > 0;
    }, [getFieldErrors]);

    const getFieldWarnings = useCallback((fieldName: string): ValidationResult[] => {
        if (!validationResult) return [];

        return validationResult.results.filter(result =>
            result.severity === ValidationSeverity.WARNING &&
            result.field === fieldName
        );
    }, [validationResult]);

    const hasFieldWarnings = useCallback((fieldName: string): boolean => {
        return getFieldWarnings(fieldName).length > 0;
    }, [getFieldWarnings]);

    // Computed values
    const hasErrors = validationResult?.summary.errors ? validationResult.summary.errors > 0 : false;
    const hasWarnings = validationResult?.summary.warnings ? validationResult.summary.warnings > 0 : false;
    const canSubmit = validationResult?.canSubmit || false;
    const errorCount = validationResult?.summary.errors || 0;
    const warningCount = validationResult?.summary.warnings || 0;
    const successCount = validationResult?.summary.successes || 0;

    return {
        // State
        validationResult,
        isValidating,

        // Methods
        validateInvoice: validateInvoiceData,
        clearValidation,
        getFieldErrors,
        hasFieldErrors,
        getFieldWarnings,
        hasFieldWarnings,

        // Computed values
        hasErrors,
        hasWarnings,
        canSubmit,
        errorCount,
        warningCount,
        successCount
    };
}
