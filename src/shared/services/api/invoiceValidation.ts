import { HttpClientApi } from './http-client';
import type {
    ScenarioInvoiceFormData
} from '@/shared/types/invoice';
import { validateUoM } from './fbr';
import { getFbrConfigStatus } from '../supabase/fbr';

// FBR Validation API endpoints
const FBR_VALIDATION_ENDPOINTS = {
    sandbox: 'https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb',
    production: 'https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata'
} as const;

// HTTP client instance
const httpClient = new HttpClientApi();

// Validation severity levels
export enum ValidationSeverity {
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}

// Validation result interface
export interface ValidationResult {
    field: string;
    severity: ValidationSeverity;
    message: string;
    code?: string;
    suggestion?: string;
}

// Complete validation response
export interface InvoiceValidationResponse {
    isValid: boolean;
    canSubmit: boolean;
    results: ValidationResult[];
    summary: {
        total: number;
        errors: number;
        warnings: number;
        successes: number;
    };
    fbrValidation?: {
        success: boolean;
        message: string;
        data?: Record<string, unknown>;
    } | undefined;
}

// FBR Error code mapping
const FBR_ERROR_MESSAGES: Record<string, { message: string; severity: ValidationSeverity }> = {
    'E001': { message: 'Invalid NTN/CNIC format', severity: ValidationSeverity.ERROR },
    'E002': { message: 'Invalid item code', severity: ValidationSeverity.ERROR },
    'E003': { message: 'Tax calculation error', severity: ValidationSeverity.ERROR },
    'E004': { message: 'Invalid invoice date', severity: ValidationSeverity.ERROR },
    'E005': { message: 'Missing required fields', severity: ValidationSeverity.ERROR },
    'E006': { message: 'Invalid business name format', severity: ValidationSeverity.ERROR },
    'E007': { message: 'Invalid province code', severity: ValidationSeverity.ERROR },
    'E008': { message: 'Invalid HS code', severity: ValidationSeverity.ERROR },
    'E009': { message: 'Invalid UoM for HS code', severity: ValidationSeverity.ERROR },
    'E010': { message: 'Invalid tax rate', severity: ValidationSeverity.ERROR },
    'W001': { message: 'Recommended to use different UoM', severity: ValidationSeverity.WARNING },
    'W002': { message: 'Consider using standard tax rate', severity: ValidationSeverity.WARNING },
    'W003': { message: 'Invoice amount is unusually high', severity: ValidationSeverity.WARNING },
    'W004': { message: 'Missing optional fields that may be required', severity: ValidationSeverity.WARNING }
};

/**
 * Local validation functions
 */
const validateRequiredFields = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Required field checks
    if (!invoiceData.invoiceType?.trim()) {
        results.push({
            field: 'invoiceType',
            severity: ValidationSeverity.ERROR,
            message: 'Invoice type is required',
            code: 'REQUIRED_FIELD'
        });
    }

    if (!invoiceData.invoiceDate?.trim()) {
        results.push({
            field: 'invoiceDate',
            severity: ValidationSeverity.ERROR,
            message: 'Invoice date is required',
            code: 'REQUIRED_FIELD'
        });
    }

    if (!invoiceData.sellerNTNCNIC?.trim()) {
        results.push({
            field: 'sellerNTNCNIC',
            severity: ValidationSeverity.ERROR,
            message: 'Seller NTN/CNIC is required',
            code: 'REQUIRED_FIELD'
        });
    }

    if (!invoiceData.sellerBusinessName?.trim()) {
        results.push({
            field: 'sellerBusinessName',
            severity: ValidationSeverity.ERROR,
            message: 'Seller business name is required',
            code: 'REQUIRED_FIELD'
        });
    }

    if (!invoiceData.buyerNTNCNIC?.trim()) {
        results.push({
            field: 'buyerNTNCNIC',
            severity: ValidationSeverity.ERROR,
            message: 'Buyer NTN/CNIC is required',
            code: 'REQUIRED_FIELD'
        });
    }

    if (!invoiceData.buyerBusinessName?.trim()) {
        results.push({
            field: 'buyerBusinessName',
            severity: ValidationSeverity.ERROR,
            message: 'Buyer business name is required',
            code: 'REQUIRED_FIELD'
        });
    }

    return results;
};

const validateNTNCNICFormat = (ntnCnic: string): boolean => {
    const clean = ntnCnic.replace(/\D/g, '');
    return clean.length === 7 || clean.length === 13;
};

const validateDataFormats = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // NTN/CNIC format validation
    if (invoiceData.sellerNTNCNIC && !validateNTNCNICFormat(invoiceData.sellerNTNCNIC)) {
        results.push({
            field: 'sellerNTNCNIC',
            severity: ValidationSeverity.ERROR,
            message: 'Invalid NTN/CNIC format. Must be 7 digits (NTN) or 13 digits (CNIC)',
            code: 'INVALID_FORMAT',
            suggestion: 'Remove any non-numeric characters and ensure correct length'
        });
    }

    if (invoiceData.buyerNTNCNIC && !validateNTNCNICFormat(invoiceData.buyerNTNCNIC)) {
        results.push({
            field: 'buyerNTNCNIC',
            severity: ValidationSeverity.ERROR,
            message: 'Invalid NTN/CNIC format. Must be 7 digits (NTN) or 13 digits (CNIC)',
            code: 'INVALID_FORMAT',
            suggestion: 'Remove any non-numeric characters and ensure correct length'
        });
    }

    // Date format validation
    if (invoiceData.invoiceDate) {
        const date = new Date(invoiceData.invoiceDate);
        if (isNaN(date.getTime())) {
            results.push({
                field: 'invoiceDate',
                severity: ValidationSeverity.ERROR,
                message: 'Invalid date format',
                code: 'INVALID_FORMAT',
                suggestion: 'Use YYYY-MM-DD format'
            });
        } else if (date > new Date()) {
            results.push({
                field: 'invoiceDate',
                severity: ValidationSeverity.WARNING,
                message: 'Invoice date is in the future',
                code: 'FUTURE_DATE',
                suggestion: 'Consider using current or past date'
            });
        }
    }

    return results;
};

const validateBusinessRules = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Items validation
    if (!invoiceData.items || invoiceData.items.length === 0) {
        results.push({
            field: 'items',
            severity: ValidationSeverity.ERROR,
            message: 'At least one item is required',
            code: 'NO_ITEMS'
        });
    }

    // Total amount validation
    if (invoiceData.totalAmount <= 0) {
        results.push({
            field: 'totalAmount',
            severity: ValidationSeverity.ERROR,
            message: 'Total amount must be greater than zero',
            code: 'INVALID_AMOUNT'
        });
    }

    // Business name length validation
    if (invoiceData.sellerBusinessName && invoiceData.sellerBusinessName.length > 100) {
        results.push({
            field: 'sellerBusinessName',
            severity: ValidationSeverity.WARNING,
            message: 'Seller business name is very long',
            code: 'LONG_NAME',
            suggestion: 'Consider using a shorter business name'
        });
    }

    if (invoiceData.buyerBusinessName && invoiceData.buyerBusinessName.length > 100) {
        results.push({
            field: 'buyerBusinessName',
            severity: ValidationSeverity.WARNING,
            message: 'Buyer business name is very long',
            code: 'LONG_NAME',
            suggestion: 'Consider using a shorter business name'
        });
    }

    return results;
};

const validateTaxCalculations = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!invoiceData.items) return results;

    invoiceData.items.forEach((item, index) => {
        // Calculate expected tax
        const expectedTax = (item.unit_price * item.quantity * item.tax_rate) / 100;
        const taxDifference = Math.abs(item.sales_tax - expectedTax);

        if (taxDifference > 0.01) {
            results.push({
                field: `items[${index}].sales_tax`,
                severity: ValidationSeverity.ERROR,
                message: `Tax calculation mismatch. Expected: ${expectedTax.toFixed(2)}, Actual: ${item.sales_tax.toFixed(2)}`,
                code: 'TAX_CALCULATION_ERROR',
                suggestion: 'Recalculate tax based on unit price, quantity, and tax rate'
            });
        }

        // Validate tax rate
        if (item.tax_rate < 0 || item.tax_rate > 100) {
            results.push({
                field: `items[${index}].tax_rate`,
                severity: ValidationSeverity.ERROR,
                message: 'Tax rate must be between 0 and 100',
                code: 'INVALID_TAX_RATE'
            });
        }

        // Validate quantities and prices
        if (item.quantity <= 0) {
            results.push({
                field: `items[${index}].quantity`,
                severity: ValidationSeverity.ERROR,
                message: 'Quantity must be greater than zero',
                code: 'INVALID_QUANTITY'
            });
        }

        if (item.unit_price < 0) {
            results.push({
                field: `items[${index}].unit_price`,
                severity: ValidationSeverity.ERROR,
                message: 'Unit price cannot be negative',
                code: 'INVALID_PRICE'
            });
        }
    });

    return results;
};

const validateHSCodes = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!invoiceData.items) return results;

    invoiceData.items.forEach((item, index) => {
        if (!item.hs_code?.trim()) {
            results.push({
                field: `items[${index}].hs_code`,
                severity: ValidationSeverity.ERROR,
                message: 'HS Code is required',
                code: 'MISSING_HS_CODE'
            });
        } else if (!/^\d{2,8}$/.test(item.hs_code.replace(/\D/g, ''))) {
            results.push({
                field: `items[${index}].hs_code`,
                severity: ValidationSeverity.ERROR,
                message: 'Invalid HS Code format. Must be 2-8 digits',
                code: 'INVALID_HS_CODE_FORMAT'
            });
        }
    });

    return results;
};

/**
 * Validate UoM for all items using FBR API
 */
const validateUoMs = async (invoiceData: ScenarioInvoiceFormData, userId: string): Promise<ValidationResult[]> => {
    const results: ValidationResult[] = [];

    if (!invoiceData.items) return results;

    try {
        const fbrConfig = await getFbrConfigStatus(userId);
        const apiKey = fbrConfig.sandbox_api_key || fbrConfig.production_api_key;

        if (!apiKey) {
            // Add warning if no API key available
            invoiceData.items.forEach((_, index) => {
                results.push({
                    field: `items[${index}].uom_code`,
                    severity: ValidationSeverity.WARNING,
                    message: 'FBR API not configured - UoM validation skipped',
                    code: 'NO_API_KEY'
                });
            });
            return results;
        }

        // Validate each item's UoM
        for (let i = 0; i < invoiceData.items.length; i++) {
            const item = invoiceData.items[i];
            if (item.hs_code && item.uom_code) {
                try {
                    const validationResult = await validateUoM(apiKey, item.hs_code, item.uom_code);

                    if (validationResult.success && validationResult.data) {
                        const { isValid, message, isCriticalMismatch } = validationResult.data;

                        if (!isValid) {
                            results.push({
                                field: `items[${i}].uom_code`,
                                severity: isCriticalMismatch ? ValidationSeverity.ERROR : ValidationSeverity.WARNING,
                                message: message || 'Invalid UoM for this HS Code',
                                code: isCriticalMismatch ? 'CRITICAL_UOM_MISMATCH' : 'UOM_MISMATCH',
                                suggestion: `Recommended UoM: ${validationResult.data.recommendedUoM}`
                            });
                        }
                    }
                } catch {
                    results.push({
                        field: `items[${i}].uom_code`,
                        severity: ValidationSeverity.WARNING,
                        message: 'Failed to validate UoM with FBR',
                        code: 'UOM_VALIDATION_FAILED'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error validating UoMs:', error);
    }

    return results;
};

/**
 * Call FBR validation API
 */
const validateWithFBR = async (
    invoiceData: ScenarioInvoiceFormData,
    userId: string,
    environment: 'sandbox' | 'production' = 'sandbox'
): Promise<{ success: boolean; message: string; data?: Record<string, unknown> }> => {
    try {
        const fbrConfig = await getFbrConfigStatus(userId);
        const apiKey = environment === 'sandbox' ? fbrConfig.sandbox_api_key : fbrConfig.production_api_key;

        if (!apiKey) {
            return {
                success: false,
                message: `${environment === 'sandbox' ? 'Sandbox' : 'Production'} API key not configured`
            };
        }

        // Format data for FBR API
        const cleanNTNCNIC = (value: string) => {
            const cleaned = value.replace(/\D/g, '');
            // Validate NTN/CNIC format
            if (cleaned.length !== 7 && cleaned.length !== 13) {
                throw new Error(`Invalid NTN/CNIC format. Must be 7 digits (NTN) or 13 digits (CNIC). Current length: ${cleaned.length}`);
            }
            return cleaned;
        };
        const formatNumber = (value: number | string) => {
            const num = typeof value === 'string' ? parseFloat(value) : value;
            return isNaN(num) ? '0' : num.toString();
        };
        const formatRate = (value: number | string) => {
            const num = typeof value === 'string' ? parseFloat(value) : value;
            return isNaN(num) ? '0%' : `${num}%`;
        };

        // Validate required fields before sending to FBR
        if (!invoiceData.invoiceType || !invoiceData.invoiceDate || !invoiceData.sellerNTNCNIC ||
            !invoiceData.sellerBusinessName || !invoiceData.buyerNTNCNIC || !invoiceData.buyerBusinessName ||
            !invoiceData.scenarioId || !invoiceData.items || invoiceData.items.length === 0) {
            return {
                success: false,
                message: 'Missing required fields for FBR validation'
            };
        }

        const fbrRequestData = {
            invoiceType: invoiceData.invoiceType,
            invoiceDate: invoiceData.invoiceDate,
            sellerNTNCNIC: cleanNTNCNIC(invoiceData.sellerNTNCNIC),
            sellerBusinessName: invoiceData.sellerBusinessName,
            buyerNTNCNIC: cleanNTNCNIC(invoiceData.buyerNTNCNIC),
            buyerBusinessName: invoiceData.buyerBusinessName,
            scenarioId: invoiceData.scenarioId,
            items: invoiceData.items?.map(item => ({
                hsCode: item.hs_code || "",
                productDescription: item.item_name || "",
                rate: formatRate(item.unit_price),
                uoM: item.uom_code || "PCS",
                quantity: formatNumber(item.quantity),
                totalValues: formatNumber(item.total_amount),
                valueSalesExcludingST: formatNumber(item.value_sales_excluding_st),
                fixedNotifiedValueOrRetailPrice: formatNumber(item.fixed_notified_value || 0),
                salesTaxApplicable: formatNumber(item.sales_tax),
                salesTaxWithheldAtSource: formatNumber(0),
                extraTax: formatNumber(0),
                furtherTax: formatNumber(0),
                sroScheduleNo: "",
                fedPayable: formatNumber(0),
                discount: formatNumber(0),
                saleType: "Goods at standard rate (default)",
                sroItemSerialNo: ""
            })) || []
        };

        // Debug logging
        console.log('FBR Validation Request:', {
            url: FBR_VALIDATION_ENDPOINTS[environment],
            sellerNTNCNIC: fbrRequestData.sellerNTNCNIC,
            buyerNTNCNIC: fbrRequestData.buyerNTNCNIC,
            data: fbrRequestData
        });

        // Additional validation for NTN/CNIC format
        if (fbrRequestData.sellerNTNCNIC.length !== 7 && fbrRequestData.sellerNTNCNIC.length !== 13) {
            return {
                success: false,
                message: `Invalid seller NTN/CNIC format. Must be 7 digits (NTN) or 13 digits (CNIC). Current: ${fbrRequestData.sellerNTNCNIC} (${fbrRequestData.sellerNTNCNIC.length} digits)`
            };
        }

        if (fbrRequestData.buyerNTNCNIC.length !== 7 && fbrRequestData.buyerNTNCNIC.length !== 13) {
            return {
                success: false,
                message: `Invalid buyer NTN/CNIC format. Must be 7 digits (NTN) or 13 digits (CNIC). Current: ${fbrRequestData.buyerNTNCNIC} (${fbrRequestData.buyerNTNCNIC.length} digits)`
            };
        }

        const response = await httpClient.request({
            method: 'POST',
            url: FBR_VALIDATION_ENDPOINTS[environment],
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            data: fbrRequestData,
            timeout: 60000 // 60 seconds timeout
        });

        return {
            success: true,
            message: 'FBR validation completed successfully',
            data: response.data as Record<string, unknown>
        };

    } catch (error: unknown) {
        console.error('FBR validation error:', error);

        let errorMessage = 'FBR validation failed';
        const errorObj = error as { response?: { status?: number; data?: unknown }; code?: string };

        // Log detailed error information
        if (errorObj.response) {
            console.error('FBR Response Status:', errorObj.response.status);
            console.error('FBR Response Data:', errorObj.response.data);
        }

        if (errorObj.response?.status) {
            const status = errorObj.response.status;
            switch (status) {
                case 401:
                    errorMessage = 'Invalid API key - Please check your credentials';
                    break;
                case 403:
                    errorMessage = 'API key not authorized - Contact FBR for access';
                    break;
                case 404:
                    errorMessage = 'FBR validation endpoint not found - Please check the API endpoint';
                    break;
                case 429:
                    errorMessage = 'Rate limit exceeded - Please try again later';
                    break;
                case 500:
                    errorMessage = 'FBR server error - Please try again later';
                    break;
                default:
                    errorMessage = `FBR validation failed (${status})`;
            }
        } else if (errorObj.code === 'ECONNABORTED') {
            errorMessage = 'FBR validation timed out - Please try again';
        }

        return {
            success: false,
            message: errorMessage,
            data: errorObj.response?.data as Record<string, unknown>
        };
    }
};

/**
 * Main validation function
 */
export async function validateInvoice(
    invoiceData: ScenarioInvoiceFormData,
    userId: string,
    options: {
        includeFBRValidation?: boolean;
        environment?: 'sandbox' | 'production';
    } = {}
): Promise<InvoiceValidationResponse> {
    const { includeFBRValidation = true, environment = 'sandbox' } = options;

    const results: ValidationResult[] = [];

    // Run local validations
    results.push(...validateRequiredFields(invoiceData));
    results.push(...validateDataFormats(invoiceData));
    results.push(...validateBusinessRules(invoiceData));
    results.push(...validateTaxCalculations(invoiceData));
    results.push(...validateHSCodes(invoiceData));

    // Run UoM validations
    const uomResults = await validateUoMs(invoiceData, userId);
    results.push(...uomResults);

    // Run FBR validation if requested
    let fbrValidation;
    if (includeFBRValidation) {
        fbrValidation = await validateWithFBR(invoiceData, userId, environment);

        // Process FBR validation results
        if (!fbrValidation.success) {
            results.push({
                field: 'fbr_validation',
                severity: ValidationSeverity.ERROR,
                message: fbrValidation.message,
                code: 'FBR_VALIDATION_FAILED'
            });
        } else if (fbrValidation.data?.errors) {
            // Process FBR error codes
            const errors = fbrValidation.data.errors as Array<Record<string, unknown>>;
            errors.forEach((error: Record<string, unknown>) => {
                const errorCode = error.code as string;
                const errorInfo = FBR_ERROR_MESSAGES[errorCode] || {
                    message: (error.message as string) || 'Unknown FBR error',
                    severity: ValidationSeverity.ERROR
                };

                results.push({
                    field: (error.field as string) || 'general',
                    severity: errorInfo.severity,
                    message: errorInfo.message,
                    code: errorCode,
                    suggestion: error.suggestion as string
                });
            });
        }
    }

    // Calculate summary
    const summary = {
        total: results.length,
        errors: results.filter(r => r.severity === ValidationSeverity.ERROR).length,
        warnings: results.filter(r => r.severity === ValidationSeverity.WARNING).length,
        successes: results.filter(r => r.severity === ValidationSeverity.SUCCESS).length
    };

    // Determine if invoice is valid and can be submitted
    const hasErrors = summary.errors > 0;
    const isValid = !hasErrors;
    const canSubmit = isValid || summary.warnings > 0; // Can submit with warnings

    return {
        isValid,
        canSubmit,
        results,
        summary,
        fbrValidation: fbrValidation || undefined
    };
}
