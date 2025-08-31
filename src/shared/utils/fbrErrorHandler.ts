import { ValidationResult } from '@/shared/types/fbrValidation';
import { ValidationSeverity } from '@/shared/constants/fbr';
import {
    FBR_ERROR_MESSAGES,
    FBR_ERROR_CATEGORY,
    getFBRErrorInfo
} from '@/shared/constants/fbr';

/**
 * FBR Error Handler Utility Class
 * Provides comprehensive error handling and user-friendly error messages
 */
export class FBRErrorHandler {
    /**
     * Process FBR API response and extract all errors
     */
    static processFBRResponse(response: Record<string, unknown>): ValidationResult[] {
        const results: ValidationResult[] = [];

        // Handle different response formats
        if (response.validationResponse) {
            const validationResponse = response.validationResponse as Record<string, unknown>;
            results.push(...this.processValidationResponse(validationResponse));
        } else if (response.errors && Array.isArray(response.errors)) {
            results.push(...this.processLegacyErrors(response.errors as Array<Record<string, unknown>>));
        } else if (response.errorCode) {
            results.push(...this.processSingleError(response));
        }

        return results;
    }

    /**
     * Process validation response format
     */
    private static processValidationResponse(validationResponse: Record<string, unknown>): ValidationResult[] {
        const results: ValidationResult[] = [];

        // Handle invoice-level errors
        if (validationResponse.errorCode && validationResponse.error) {
            const errorCode = validationResponse.errorCode as string;
            const errorInfo = getFBRErrorInfo(errorCode);
            results.push({
                field: errorInfo.field || 'general',
                severity: errorInfo.severity,
                message: errorInfo.message,
                code: errorCode,
                ...(errorInfo.suggestion && { suggestion: errorInfo.suggestion })
            });
        }

        // Handle item-specific errors
        if (validationResponse.invoiceStatuses && Array.isArray(validationResponse.invoiceStatuses)) {
            (validationResponse.invoiceStatuses as Array<Record<string, unknown>>).forEach((itemStatus) => {
                if (itemStatus.status === 'Invalid' || itemStatus.statusCode === '01') {
                    const errorCode = itemStatus.errorCode as string;
                    const itemSNo = itemStatus.itemSNo as string;
                    const errorInfo = getFBRErrorInfo(errorCode);

                    results.push({
                        field: `items[${itemSNo}]`,
                        severity: errorInfo.severity,
                        message: errorInfo.message,
                        code: errorCode,
                        suggestion: errorInfo.suggestion || `Check item ${itemSNo} for the specified error`
                    });
                }
            });
        }

        return results;
    }

    /**
     * Process legacy error format
     */
    private static processLegacyErrors(errors: Array<Record<string, unknown>>): ValidationResult[] {
        return errors.map(error => {
            const errorCode = error.code as string;
            const errorField = error.field as string;
            const errorSuggestion = error.suggestion as string;
            const errorInfo = getFBRErrorInfo(errorCode);
            return {
                field: errorField || errorInfo.field || 'general',
                severity: errorInfo.severity,
                message: errorInfo.message,
                code: errorCode,
                ...((errorSuggestion || errorInfo.suggestion) && {
                    suggestion: errorSuggestion || errorInfo.suggestion
                })
            };
        });
    }

    /**
     * Process single error response
     */
    private static processSingleError(response: Record<string, unknown>): ValidationResult[] {
        const errorCode = response.errorCode as string;
        const errorInfo = getFBRErrorInfo(errorCode);
        return [{
            field: errorInfo.field || 'general',
            severity: errorInfo.severity,
            message: errorInfo.message,
            code: errorCode,
            ...(errorInfo.suggestion && { suggestion: errorInfo.suggestion })
        }];
    }

    /**
     * Get user-friendly error summary
     */
    static getErrorSummary(errors: ValidationResult[]): {
        total: number;
        byCategory: Record<FBR_ERROR_CATEGORY, number>;
        bySeverity: Record<ValidationSeverity, number>;
        criticalErrors: ValidationResult[];
        suggestions: string[];
    } {
        const byCategory: Record<FBR_ERROR_CATEGORY, number> = {
            [FBR_ERROR_CATEGORY.AUTHENTICATION]: 0,
            [FBR_ERROR_CATEGORY.VALIDATION]: 0,
            [FBR_ERROR_CATEGORY.BUSINESS_RULE]: 0,
            [FBR_ERROR_CATEGORY.TAX_CALCULATION]: 0,
            [FBR_ERROR_CATEGORY.FORMAT]: 0,
            [FBR_ERROR_CATEGORY.SYSTEM]: 0
        };

        const bySeverity: Record<ValidationSeverity, number> = {
            [ValidationSeverity.ERROR]: 0,
            [ValidationSeverity.WARNING]: 0,
            [ValidationSeverity.SUCCESS]: 0
        };

        const criticalErrors: ValidationResult[] = [];
        const suggestions: string[] = [];

        errors.forEach(error => {
            // Count by severity
            bySeverity[error.severity]++;

            // Get error info for categorization
            if (error.code) {
                const errorInfo = FBR_ERROR_MESSAGES[error.code as string];
                if (errorInfo) {
                    byCategory[errorInfo.category]++;

                    // Collect critical errors (authentication and system errors)
                    if (errorInfo.category === FBR_ERROR_CATEGORY.AUTHENTICATION ||
                        errorInfo.category === FBR_ERROR_CATEGORY.SYSTEM) {
                        criticalErrors.push(error);
                    }

                    // Collect suggestions
                    if (errorInfo.suggestion && !suggestions.includes(errorInfo.suggestion)) {
                        suggestions.push(errorInfo.suggestion);
                    }
                }
            }
        });

        return {
            total: errors.length,
            byCategory,
            bySeverity,
            criticalErrors,
            suggestions
        };
    }

    /**
     * Get prioritized error messages for display
     */
    static getPrioritizedErrors(errors: ValidationResult[], maxDisplay: number = 5): ValidationResult[] {
        const priorityOrder = [
            FBR_ERROR_CATEGORY.AUTHENTICATION,
            FBR_ERROR_CATEGORY.SYSTEM,
            FBR_ERROR_CATEGORY.VALIDATION,
            FBR_ERROR_CATEGORY.FORMAT,
            FBR_ERROR_CATEGORY.TAX_CALCULATION,
            FBR_ERROR_CATEGORY.BUSINESS_RULE
        ];

        return errors
            .sort((a, b) => {
                if (!a.code || !b.code) return 0;

                const aInfo = FBR_ERROR_MESSAGES[a.code as string];
                const bInfo = FBR_ERROR_MESSAGES[b.code as string];

                if (!aInfo || !bInfo) return 0;

                const aPriority = priorityOrder.indexOf(aInfo.category);
                const bPriority = priorityOrder.indexOf(bInfo.category);

                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }

                // If same category, prioritize errors over warnings
                if (a.severity !== b.severity) {
                    return a.severity === ValidationSeverity.ERROR ? -1 : 1;
                }

                return 0;
            })
            .slice(0, maxDisplay);
    }

    /**
     * Check if errors require immediate user action
     */
    static requiresImmediateAction(errors: ValidationResult[]): boolean {
        return errors.some(error => {
            if (!error.code) return false;
            const errorInfo = FBR_ERROR_MESSAGES[error.code as string];
            return errorInfo?.requiresAction && error.severity === ValidationSeverity.ERROR;
        });
    }

    /**
     * Get field-specific error messages
     */
    static getFieldErrors(errors: ValidationResult[], field: string): ValidationResult[] {
        return errors.filter(error => error.field === field);
    }

    /**
     * Format error message for display
     */
    static formatErrorMessage(error: ValidationResult): string {
        if (!error.code) {
            return error.message;
        }

        const errorInfo = FBR_ERROR_MESSAGES[error.code as string];
        if (!errorInfo) {
            return error.message;
        }

        let message = errorInfo.message;

        // Add field context if available (but not for items array)
        if (error.field && error.field !== 'general' && !error.field.startsWith('items[')) {
            const fieldName = this.getFieldDisplayName(error.field);
            message = `${fieldName}: ${message}`;
        }

        return message;
    }

    /**
     * Get user-friendly field names
     */
    private static getFieldDisplayName(field: string): string {
        const fieldMap: Record<string, string> = {
            'sellerNTNCNIC': 'Seller NTN/CNIC',
            'buyerNTNCNIC': 'Buyer NTN/CNIC',
            'sellerBusinessName': 'Seller Business Name',
            'buyerBusinessName': 'Buyer Business Name',
            'invoiceType': 'Invoice Type',
            'invoiceDate': 'Invoice Date',
            'invoiceNumber': 'Invoice Number',
            'hsCode': 'HS Code',
            'taxRate': 'Tax Rate',
            'quantity': 'Quantity',
            'salesTax': 'Sales Tax',
            'valueSalesExcludingST': 'Value (Excluding ST)',
            'salesTaxWithheldAtSource': 'ST Withheld at Source',
            'extraTax': 'Extra Tax',
            'furtherTax': 'Further Tax',
            'fedPayable': 'FED Payable',
            'discount': 'Discount',
            'uoM': 'Unit of Measure',
            'buyerRegistrationType': 'Buyer Registration Type',
            'sellerProvince': 'Seller Province',
            'buyerProvince': 'Buyer Province',
            'sellerAddress': 'Seller Address',
            'buyerAddress': 'Buyer Address',
            'invoiceRefNo': 'Invoice Reference Number',
            'sroScheduleNo': 'SRO/Schedule Number',
            'sroItemSerialNo': 'Item Serial Number',
            'fixedNotifiedValueOrRetailPrice': 'Fixed/Notified Value',
            'totalValueOfSales': 'Total Value of Sales',
            'reason': 'Reason',
            'reasonRemarks': 'Reason Remarks'
        };

        return fieldMap[field] || field;
    }

    /**
     * Check if invoice can be submitted despite errors
     */
    static canSubmitWithErrors(errors: ValidationResult[]): boolean {
        const summary = this.getErrorSummary(errors);

        // Cannot submit if there are critical errors
        if (summary.criticalErrors.length > 0) {
            return false;
        }

        // Cannot submit if there are validation errors
        if (summary.byCategory[FBR_ERROR_CATEGORY.VALIDATION] > 0) {
            return false;
        }

        // Can submit with warnings only
        return summary.bySeverity[ValidationSeverity.ERROR] === 0;
    }

    /**
     * Get error resolution suggestions
     */
    static getResolutionSuggestions(errors: ValidationResult[]): string[] {
        const suggestions: string[] = [];
        const errorCodes = errors
            .map(error => error.code as string)
            .filter((code): code is string => !!code);

        // Authentication errors
        if (errorCodes.includes('0401') || errorCodes.includes('0402')) {
            suggestions.push('Verify your FBR API credentials and ensure they are properly configured.');
        }

        // Format errors
        if (errorCodes.some(code => ['0002', '0005', '0088', '0113', '0300'].includes(code))) {
            suggestions.push('Check data formats: NTN/CNIC should be 7 or 13 digits, dates should be YYYY-MM-DD format.');
        }

        // Tax calculation errors
        if (errorCodes.some(code => ['0008', '0102', '0103', '0104', '0105'].includes(code))) {
            suggestions.push('Verify tax calculations and ensure they match the expected formulas.');
        }

        // Business rule errors
        if (errorCodes.some(code => ['0058', '0070', '0100', '0101'].includes(code))) {
            suggestions.push('Review business rules and ensure compliance with FBR requirements.');
        }

        return suggestions;
    }
}
