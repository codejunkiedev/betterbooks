import type { ScenarioInvoiceFormData } from '@/shared/types/invoice';
import { validateUoM } from '../services/api/fbr';
import { getFbrConfigStatus } from '../services/supabase/fbr';
import { INVOICE_TYPE } from '../constants/invoice';

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

/**
 * Validate required fields for invoice data
 */
export const validateRequiredFields = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Required field checks
    if (!invoiceData.invoiceType?.trim()) {
        results.push({
            field: 'invoiceType',
            severity: ValidationSeverity.ERROR,
            message: 'Invoice type is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        // Check if invoice type is valid
        const validInvoiceTypes = Object.values(INVOICE_TYPE);
        if (!validInvoiceTypes.includes(invoiceData.invoiceType as typeof validInvoiceTypes[number])) {
            results.push({
                field: 'invoiceType',
                severity: ValidationSeverity.ERROR,
                message: `Invoice type must be one of: ${validInvoiceTypes.join(', ')}`,
                code: 'INVALID_INVOICE_TYPE',
                suggestion: 'Please select a valid invoice type from the dropdown'
            });
        } else {
            results.push({
                field: 'invoiceType',
                severity: ValidationSeverity.SUCCESS,
                message: 'Invoice type is valid',
                code: 'REQUIRED_FIELD_PASSED'
            });
        }
    }

    if (!invoiceData.invoiceDate?.trim()) {
        results.push({
            field: 'invoiceDate',
            severity: ValidationSeverity.ERROR,
            message: 'Invoice date is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'invoiceDate',
            severity: ValidationSeverity.SUCCESS,
            message: 'Invoice date is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    if (!invoiceData.sellerNTNCNIC?.trim()) {
        results.push({
            field: 'sellerNTNCNIC',
            severity: ValidationSeverity.ERROR,
            message: 'Seller NTN/CNIC is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'sellerNTNCNIC',
            severity: ValidationSeverity.SUCCESS,
            message: 'Seller NTN/CNIC is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    if (!invoiceData.sellerBusinessName?.trim()) {
        results.push({
            field: 'sellerBusinessName',
            severity: ValidationSeverity.ERROR,
            message: 'Seller business name is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'sellerBusinessName',
            severity: ValidationSeverity.SUCCESS,
            message: 'Seller business name is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    if (!invoiceData.buyerNTNCNIC?.trim()) {
        results.push({
            field: 'buyerNTNCNIC',
            severity: ValidationSeverity.ERROR,
            message: 'Buyer NTN/CNIC is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'buyerNTNCNIC',
            severity: ValidationSeverity.SUCCESS,
            message: 'Buyer NTN/CNIC is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    if (!invoiceData.buyerBusinessName?.trim()) {
        results.push({
            field: 'buyerBusinessName',
            severity: ValidationSeverity.ERROR,
            message: 'Buyer business name is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'buyerBusinessName',
            severity: ValidationSeverity.SUCCESS,
            message: 'Buyer business name is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    // Validate seller province and address
    if (!invoiceData.sellerProvince?.trim()) {
        results.push({
            field: 'sellerProvince',
            severity: ValidationSeverity.ERROR,
            message: 'Seller province is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'sellerProvince',
            severity: ValidationSeverity.SUCCESS,
            message: 'Seller province is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    if (!invoiceData.sellerAddress?.trim()) {
        results.push({
            field: 'sellerAddress',
            severity: ValidationSeverity.ERROR,
            message: 'Seller address is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'sellerAddress',
            severity: ValidationSeverity.SUCCESS,
            message: 'Seller address is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    // Validate buyer province and address
    if (!invoiceData.buyerProvince?.trim()) {
        results.push({
            field: 'buyerProvince',
            severity: ValidationSeverity.ERROR,
            message: 'Buyer province is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'buyerProvince',
            severity: ValidationSeverity.SUCCESS,
            message: 'Buyer province is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    if (!invoiceData.buyerAddress?.trim()) {
        results.push({
            field: 'buyerAddress',
            severity: ValidationSeverity.ERROR,
            message: 'Buyer address is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'buyerAddress',
            severity: ValidationSeverity.SUCCESS,
            message: 'Buyer address is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    // Validate buyer registration type
    if (!invoiceData.buyerRegistrationType?.trim()) {
        results.push({
            field: 'buyerRegistrationType',
            severity: ValidationSeverity.ERROR,
            message: 'Buyer registration type is required',
            code: 'REQUIRED_FIELD'
        });
    } else {
        results.push({
            field: 'buyerRegistrationType',
            severity: ValidationSeverity.SUCCESS,
            message: 'Buyer registration type is provided',
            code: 'REQUIRED_FIELD_PASSED'
        });
    }

    return results;
};

/**
 * Validate NTN/CNIC format
 */
export const validateNTNCNICFormat = (ntnCnic: string): boolean => {
    const clean = ntnCnic.replace(/\D/g, '');
    return clean.length === 7 || clean.length === 13;
};

/**
 * Validate data formats for invoice data
 */
export const validateDataFormats = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
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
    } else if (invoiceData.sellerNTNCNIC) {
        results.push({
            field: 'sellerNTNCNIC',
            severity: ValidationSeverity.SUCCESS,
            message: 'Seller NTN/CNIC format is valid',
            code: 'FORMAT_VALID'
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
    } else if (invoiceData.buyerNTNCNIC) {
        results.push({
            field: 'buyerNTNCNIC',
            severity: ValidationSeverity.SUCCESS,
            message: 'Buyer NTN/CNIC format is valid',
            code: 'FORMAT_VALID'
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
        } else {
            results.push({
                field: 'invoiceDate',
                severity: ValidationSeverity.SUCCESS,
                message: 'Invoice date format is valid',
                code: 'FORMAT_VALID'
            });
        }
    }

    return results;
};

/**
 * Validate business rules for invoice data
 */
export const validateBusinessRules = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Items validation
    if (!invoiceData.items || invoiceData.items.length === 0) {
        results.push({
            field: 'items',
            severity: ValidationSeverity.ERROR,
            message: 'At least one item is required',
            code: 'NO_ITEMS'
        });
    } else {
        results.push({
            field: 'items',
            severity: ValidationSeverity.SUCCESS,
            message: `Invoice contains ${invoiceData.items.length} item(s)`,
            code: 'ITEMS_VALID'
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
    } else {
        results.push({
            field: 'totalAmount',
            severity: ValidationSeverity.SUCCESS,
            message: `Total amount is valid: ${invoiceData.totalAmount}`,
            code: 'AMOUNT_VALID'
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
    } else if (invoiceData.sellerBusinessName) {
        results.push({
            field: 'sellerBusinessName',
            severity: ValidationSeverity.SUCCESS,
            message: 'Seller business name length is acceptable',
            code: 'NAME_LENGTH_VALID'
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
    } else if (invoiceData.buyerBusinessName) {
        results.push({
            field: 'buyerBusinessName',
            severity: ValidationSeverity.SUCCESS,
            message: 'Buyer business name length is acceptable',
            code: 'NAME_LENGTH_VALID'
        });
    }

    return results;
};

/**
 * Validate tax calculations for invoice items
 */
export const validateTaxCalculations = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
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
        } else {
            results.push({
                field: `items[${index}].sales_tax`,
                severity: ValidationSeverity.SUCCESS,
                message: `Tax calculation is correct: ${item.sales_tax.toFixed(2)}`,
                code: 'TAX_CALCULATION_VALID'
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
        } else {
            results.push({
                field: `items[${index}].tax_rate`,
                severity: ValidationSeverity.SUCCESS,
                message: `Tax rate is valid: ${item.tax_rate}%`,
                code: 'TAX_RATE_VALID'
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
        } else {
            results.push({
                field: `items[${index}].quantity`,
                severity: ValidationSeverity.SUCCESS,
                message: `Quantity is valid: ${item.quantity}`,
                code: 'QUANTITY_VALID'
            });
        }

        if (item.unit_price < 0) {
            results.push({
                field: `items[${index}].unit_price`,
                severity: ValidationSeverity.ERROR,
                message: 'Unit price cannot be negative',
                code: 'INVALID_PRICE'
            });
        } else {
            results.push({
                field: `items[${index}].unit_price`,
                severity: ValidationSeverity.SUCCESS,
                message: `Unit price is valid: ${item.unit_price}`,
                code: 'PRICE_VALID'
            });
        }
    });

    return results;
};

/**
 * Validate HS codes for invoice items
 */
export const validateHSCodes = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
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
        } else {
            results.push({
                field: `items[${index}].hs_code`,
                severity: ValidationSeverity.SUCCESS,
                message: `HS Code is valid: ${item.hs_code}`,
                code: 'HS_CODE_VALID'
            });
        }
    });

    return results;
};

/**
 * Validate UoM for all items using FBR API
 */
export const validateUoMs = async (invoiceData: ScenarioInvoiceFormData, userId: string): Promise<ValidationResult[]> => {
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
                        } else {
                            results.push({
                                field: `items[${i}].uom_code`,
                                severity: ValidationSeverity.SUCCESS,
                                message: `UoM is valid for HS Code: ${item.uom_code}`,
                                code: 'UOM_VALID'
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
 * Validate FBR API required fields for invoice items
 */
export const validateFBRRequiredFields = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!invoiceData.items) return results;

    invoiceData.items.forEach((item, index) => {
        // Check for FBR API required fields that might be missing
        const fbrRequiredFields = [
            { field: 'sales_tax_withheld_at_source', value: item.sales_tax_withheld_at_source, defaultValue: 0 },
            { field: 'extra_tax', value: item.extra_tax, defaultValue: 0 },
            { field: 'further_tax', value: item.further_tax, defaultValue: 0 },
            { field: 'sro_schedule_no', value: item.sro_schedule_no, defaultValue: '' },
            { field: 'fed_payable', value: item.fed_payable, defaultValue: 0 },
            { field: 'discount', value: item.discount, defaultValue: 0 },
            { field: 'sale_type', value: item.sale_type, defaultValue: 'Goods at standard rate (default)' },
            { field: 'sro_item_serial_no', value: item.sro_item_serial_no, defaultValue: '' }
        ];

        fbrRequiredFields.forEach(({ field, value, defaultValue }) => {
            if (value === undefined || value === null) {
                results.push({
                    field: `items[${index}].${field}`,
                    severity: ValidationSeverity.WARNING,
                    message: `FBR API requires ${field.replace(/_/g, ' ')}. Will use default value: ${defaultValue}`,
                    code: 'FBR_MISSING_FIELD',
                    suggestion: `Add ${field} field to item ${index + 1}`
                });
            } else {
                results.push({
                    field: `items[${index}].${field}`,
                    severity: ValidationSeverity.SUCCESS,
                    message: `${field.replace(/_/g, ' ')} is provided`,
                    code: 'FBR_FIELD_PRESENT'
                });
            }
        });

        // Validate field formats for FBR API
        if (item.sales_tax_withheld_at_source !== undefined && item.sales_tax_withheld_at_source < 0) {
            results.push({
                field: `items[${index}].sales_tax_withheld_at_source`,
                severity: ValidationSeverity.ERROR,
                message: 'Sales tax withheld at source cannot be negative',
                code: 'FBR_INVALID_VALUE'
            });
        }

        if (item.extra_tax !== undefined && item.extra_tax < 0) {
            results.push({
                field: `items[${index}].extra_tax`,
                severity: ValidationSeverity.ERROR,
                message: 'Extra tax cannot be negative',
                code: 'FBR_INVALID_VALUE'
            });
        }

        if (item.further_tax !== undefined && item.further_tax < 0) {
            results.push({
                field: `items[${index}].further_tax`,
                severity: ValidationSeverity.ERROR,
                message: 'Further tax cannot be negative',
                code: 'FBR_INVALID_VALUE'
            });
        }

        if (item.fed_payable !== undefined && item.fed_payable < 0) {
            results.push({
                field: `items[${index}].fed_payable`,
                severity: ValidationSeverity.ERROR,
                message: 'FED payable cannot be negative',
                code: 'FBR_INVALID_VALUE'
            });
        }

        if (item.discount !== undefined && item.discount < 0) {
            results.push({
                field: `items[${index}].discount`,
                severity: ValidationSeverity.ERROR,
                message: 'Discount cannot be negative',
                code: 'FBR_INVALID_VALUE'
            });
        }
    });

    return results;
};

/**
 * Validate field name mapping for FBR API compatibility
 */
export const validateFBRFieldMapping = (invoiceData: ScenarioInvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!invoiceData.items) return results;

    invoiceData.items.forEach((item, index) => {
        // Check if required FBR field mappings are present
        const fbrFieldMappings = [
            {
                currentField: 'hs_code',
                fbrField: 'hsCode',
                value: item.hs_code,
                required: true
            },
            {
                currentField: 'item_name',
                fbrField: 'productDescription',
                value: item.item_name,
                required: true
            },
            {
                currentField: 'uom_code',
                fbrField: 'uoM',
                value: item.uom_code,
                required: true
            },
            {
                currentField: 'tax_rate',
                fbrField: 'rate',
                value: item.tax_rate,
                required: true
            },
            {
                currentField: 'total_amount',
                fbrField: 'totalValues',
                value: item.total_amount,
                required: true
            },
            {
                currentField: 'value_sales_excluding_st',
                fbrField: 'valueSalesExcludingST',
                value: item.value_sales_excluding_st,
                required: true
            },
            {
                currentField: 'sales_tax',
                fbrField: 'salesTaxApplicable',
                value: item.sales_tax,
                required: true
            }
        ];

        fbrFieldMappings.forEach(({ currentField, fbrField, value, required }) => {
            if (required && (!value || value === '')) {
                results.push({
                    field: `items[${index}].${currentField}`,
                    severity: ValidationSeverity.ERROR,
                    message: `FBR API requires ${fbrField} (mapped from ${currentField})`,
                    code: 'FBR_MISSING_REQUIRED_FIELD',
                    suggestion: `Ensure ${currentField} is provided for item ${index + 1}`
                });
            } else if (value) {
                results.push({
                    field: `items[${index}].${currentField}`,
                    severity: ValidationSeverity.SUCCESS,
                    message: `${fbrField} mapping is valid`,
                    code: 'FBR_FIELD_MAPPING_VALID'
                });
            }
        });
    });

    return results;
};
