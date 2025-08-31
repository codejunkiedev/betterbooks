import { INVOICE_TYPE } from '../constants/invoice';
import { InvoiceFormData } from '../types/invoice';

export enum ValidationSeverity {
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}

export interface ValidationResult {
    field: string;
    severity: ValidationSeverity;
    message: string;
    code?: string;
    suggestion?: string;
}

// Validate required fields
export const validateRequiredFields = (data: InvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const requiredFields = [
        { field: 'invoiceType', value: data.invoiceType, name: 'Invoice type' },
        { field: 'invoiceDate', value: data.invoiceDate, name: 'Invoice date' },
        { field: 'sellerNTNCNIC', value: data.sellerNTNCNIC, name: 'Seller NTN/CNIC' },
        { field: 'sellerBusinessName', value: data.sellerBusinessName, name: 'Seller business name' },
        { field: 'sellerProvince', value: data.sellerProvince, name: 'Seller province' },
        { field: 'sellerAddress', value: data.sellerAddress, name: 'Seller address' },
        { field: 'buyerNTNCNIC', value: data.buyerNTNCNIC, name: 'Buyer NTN/CNIC' },
        { field: 'buyerBusinessName', value: data.buyerBusinessName, name: 'Buyer business name' },
        { field: 'buyerProvince', value: data.buyerProvince, name: 'Buyer province' },
        { field: 'buyerAddress', value: data.buyerAddress, name: 'Buyer address' },
        { field: 'buyerRegistrationType', value: data.buyerRegistrationType, name: 'Buyer registration type' }
    ];

    requiredFields.forEach(({ field, value, name }) => {
        if (!value?.trim()) {
            results.push({
                field,
                severity: ValidationSeverity.ERROR,
                message: `${name} is required`,
                code: 'REQUIRED_FIELD'
            });
        } else {
            results.push({
                field,
                severity: ValidationSeverity.SUCCESS,
                message: `${name} is provided`,
                code: 'REQUIRED_FIELD_PASSED'
            });
        }
    });

    // Validate invoice type
    if (data.invoiceType && !Object.values(INVOICE_TYPE).includes(data.invoiceType as typeof INVOICE_TYPE[keyof typeof INVOICE_TYPE])) {
        results.push({
            field: 'invoiceType',
            severity: ValidationSeverity.ERROR,
            message: `Invoice type must be one of: ${Object.values(INVOICE_TYPE).join(', ')}`,
            code: 'INVALID_INVOICE_TYPE'
        });
    }

    return results;
};

// Validate NTN/CNIC format
export const validateNTNCNICFormat = (ntnCnic: string): boolean => {
    const clean = ntnCnic.replace(/\D/g, '');
    return clean.length === 7 || clean.length === 13;
};

// Validate data formats
export const validateDataFormats = (data: InvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // NTN/CNIC validation
    if (data.sellerNTNCNIC && !validateNTNCNICFormat(data.sellerNTNCNIC)) {
        results.push({
            field: 'sellerNTNCNIC',
            severity: ValidationSeverity.ERROR,
            message: 'Invalid NTN/CNIC format. Must be 7 digits (NTN) or 13 digits (CNIC)',
            code: 'INVALID_FORMAT'
        });
    }

    if (data.buyerNTNCNIC && !validateNTNCNICFormat(data.buyerNTNCNIC)) {
        results.push({
            field: 'buyerNTNCNIC',
            severity: ValidationSeverity.ERROR,
            message: 'Invalid NTN/CNIC format. Must be 7 digits (NTN) or 13 digits (CNIC)',
            code: 'INVALID_FORMAT'
        });
    }

    // Date validation
    if (data.invoiceDate) {
        const date = new Date(data.invoiceDate);
        if (isNaN(date.getTime())) {
            results.push({
                field: 'invoiceDate',
                severity: ValidationSeverity.ERROR,
                message: 'Invalid date format. Use YYYY-MM-DD format',
                code: 'INVALID_FORMAT'
            });
        } else if (date > new Date()) {
            results.push({
                field: 'invoiceDate',
                severity: ValidationSeverity.WARNING,
                message: 'Invoice date is in the future',
                code: 'FUTURE_DATE'
            });
        }
    }

    return results;
};

// Validate business rules
export const validateBusinessRules = (data: InvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Items validation
    if (!data.items || data.items.length === 0) {
        results.push({
            field: 'items',
            severity: ValidationSeverity.ERROR,
            message: 'At least one item is required',
            code: 'NO_ITEMS'
        });
    }

    // Total amount validation
    if (data.totalAmount <= 0) {
        results.push({
            field: 'totalAmount',
            severity: ValidationSeverity.ERROR,
            message: 'Total amount must be greater than zero',
            code: 'INVALID_AMOUNT'
        });
    }

    return results;
};

// Validate tax calculations
export const validateTaxCalculations = (data: InvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!data.items) return results;

    data.items.forEach((item, index) => {
        const taxRate = parseFloat(item.rate.replace('%', ''));
        const unitPrice = item.totalValues / item.quantity;
        const expectedTax = (unitPrice * item.quantity * taxRate) / 100;
        const taxDifference = Math.abs(item.salesTaxApplicable - expectedTax);

        if (taxDifference > 0.01) {
            results.push({
                field: `items[${index}].salesTaxApplicable`,
                severity: ValidationSeverity.ERROR,
                message: `Tax calculation mismatch. Expected: ${expectedTax.toFixed(2)}, Actual: ${item.salesTaxApplicable.toFixed(2)}`,
                code: 'TAX_CALCULATION_ERROR'
            });
        }

        if (taxRate < 0 || taxRate > 100) {
            results.push({
                field: `items[${index}].rate`,
                severity: ValidationSeverity.ERROR,
                message: 'Tax rate must be between 0 and 100',
                code: 'INVALID_TAX_RATE'
            });
        }

        if (item.quantity <= 0) {
            results.push({
                field: `items[${index}].quantity`,
                severity: ValidationSeverity.ERROR,
                message: 'Quantity must be greater than zero',
                code: 'INVALID_QUANTITY'
            });
        }

        if (item.totalValues < 0) {
            results.push({
                field: `items[${index}].totalValues`,
                severity: ValidationSeverity.ERROR,
                message: 'Total values cannot be negative',
                code: 'INVALID_PRICE'
            });
        }
    });

    return results;
};

// Validate HS codes
export const validateHSCodes = (data: InvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!data.items) return results;

    data.items.forEach((item, index) => {
        if (!item.hsCode?.trim()) {
            results.push({
                field: `items[${index}].hsCode`,
                severity: ValidationSeverity.ERROR,
                message: 'HS Code is required',
                code: 'MISSING_HS_CODE'
            });
        } else if (!/^\d{2,8}$/.test(item.hsCode.replace(/\D/g, ''))) {
            results.push({
                field: `items[${index}].hsCode`,
                severity: ValidationSeverity.ERROR,
                message: 'Invalid HS Code format. Must be 2-8 digits',
                code: 'INVALID_HS_CODE_FORMAT'
            });
        }
    });

    return results;
};