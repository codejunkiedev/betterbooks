import { BUYER_REGISTRATION_TYPE, INVOICE_TYPE } from '../constants/invoice';
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
        { field: 'buyerRegistrationType', value: data.buyerRegistrationType, name: 'Buyer registration type' },
        { field: 'scenarioId', value: data.scenarioId, name: 'Scenario ID' }
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

    // Validate buyer registration type
    if (data.buyerRegistrationType && !Object.values(BUYER_REGISTRATION_TYPE).includes(data.buyerRegistrationType as typeof BUYER_REGISTRATION_TYPE[keyof typeof BUYER_REGISTRATION_TYPE])) {
        results.push({
            field: 'buyerRegistrationType',
            severity: ValidationSeverity.ERROR,
            message: `Buyer registration type must be one of: ${Object.values(BUYER_REGISTRATION_TYPE).join(', ')}`,
            code: 'INVALID_BUYER_REGISTRATION_TYPE'
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

    // Validate that seller and buyer are different
    if (data.sellerNTNCNIC && data.buyerNTNCNIC && data.sellerNTNCNIC === data.buyerNTNCNIC) {
        results.push({
            field: 'buyerNTNCNIC',
            severity: ValidationSeverity.ERROR,
            message: 'Buyer and seller cannot be the same',
            code: 'SAME_SELLER_BUYER'
        });
    }

    return results;
};

// Validate tax calculations
export const validateTaxCalculations = (data: InvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!data.items) return results;

    data.items.forEach((item, index) => {
        // Validate tax rate
        if (item.tax_rate < 0 || item.tax_rate > 100) {
            results.push({
                field: `items[${index}].tax_rate`,
                severity: ValidationSeverity.ERROR,
                message: 'Tax rate must be between 0 and 100',
                code: 'INVALID_TAX_RATE'
            });
        }

        // Validate quantity
        if (item.quantity <= 0) {
            results.push({
                field: `items[${index}].quantity`,
                severity: ValidationSeverity.ERROR,
                message: 'Quantity must be greater than zero',
                code: 'INVALID_QUANTITY'
            });
        }

        // Validate unit price
        if (item.unit_price <= 0) {
            results.push({
                field: `items[${index}].unit_price`,
                severity: ValidationSeverity.ERROR,
                message: 'Unit price must be greater than zero',
                code: 'INVALID_UNIT_PRICE'
            });
        }

        // Validate total amount calculation
        const expectedTotal = item.quantity * item.unit_price;
        const totalDifference = Math.abs(item.total_amount - expectedTotal);

        if (totalDifference > 0.01) {
            results.push({
                field: `items[${index}].total_amount`,
                severity: ValidationSeverity.ERROR,
                message: `Total amount calculation mismatch. Expected: ${expectedTotal.toFixed(2)}, Actual: ${item.total_amount.toFixed(2)}`,
                code: 'TOTAL_CALCULATION_ERROR'
            });
        }

        // Validate sales tax calculation
        const expectedTax = (expectedTotal * item.tax_rate) / 100;
        const taxDifference = Math.abs(item.sales_tax - expectedTax);

        if (taxDifference > 0.01) {
            results.push({
                field: `items[${index}].sales_tax`,
                severity: ValidationSeverity.ERROR,
                message: `Sales tax calculation mismatch. Expected: ${expectedTax.toFixed(2)}, Actual: ${item.sales_tax.toFixed(2)}`,
                code: 'TAX_CALCULATION_ERROR'
            });
        }

        // Validate value sales excluding ST
        const expectedValueExcludingST = expectedTotal;
        const valueExcludingSTDifference = Math.abs((item.value_sales_excluding_st || 0) - expectedValueExcludingST);

        if (valueExcludingSTDifference > 0.01) {
            results.push({
                field: `items[${index}].value_sales_excluding_st`,
                severity: ValidationSeverity.ERROR,
                message: `Value sales excluding ST calculation mismatch. Expected: ${expectedValueExcludingST.toFixed(2)}, Actual: ${(item.value_sales_excluding_st || 0).toFixed(2)}`,
                code: 'VALUE_EXCLUDING_ST_CALCULATION_ERROR'
            });
        }

        // Validate that total amount is not negative
        if (item.total_amount < 0) {
            results.push({
                field: `items[${index}].total_amount`,
                severity: ValidationSeverity.ERROR,
                message: 'Total amount cannot be negative',
                code: 'NEGATIVE_TOTAL'
            });
        }

        // Validate that sales tax is not negative
        if (item.sales_tax < 0) {
            results.push({
                field: `items[${index}].sales_tax`,
                severity: ValidationSeverity.ERROR,
                message: 'Sales tax cannot be negative',
                code: 'NEGATIVE_TAX'
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
                message: 'HS Code format is valid',
                code: 'HS_CODE_VALID'
            });
        }
    });

    return results;
};

// Validate item details
export const validateItemDetails = (data: InvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!data.items) return results;

    data.items.forEach((item, index) => {
        // Validate item name
        if (!item.item_name?.trim()) {
            results.push({
                field: `items[${index}].item_name`,
                severity: ValidationSeverity.ERROR,
                message: 'Item name is required',
                code: 'MISSING_ITEM_NAME'
            });
        } else if (item.item_name.length < 3) {
            results.push({
                field: `items[${index}].item_name`,
                severity: ValidationSeverity.WARNING,
                message: 'Item name should be at least 3 characters long',
                code: 'SHORT_ITEM_NAME'
            });
        }

        // Validate UOM code
        if (!item.uom_code?.trim()) {
            results.push({
                field: `items[${index}].uom_code`,
                severity: ValidationSeverity.ERROR,
                message: 'Unit of measure is required',
                code: 'MISSING_UOM'
            });
        }

        // Validate invoice note length if provided
        if (item.invoice_note && item.invoice_note.length > 500) {
            results.push({
                field: `items[${index}].invoice_note`,
                severity: ValidationSeverity.WARNING,
                message: 'Invoice note should be less than 500 characters',
                code: 'LONG_INVOICE_NOTE'
            });
        }
    });

    return results;
};

// Validate invoice totals
export const validateInvoiceTotals = (data: InvoiceFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!data.items || data.items.length === 0) return results;

    // Calculate expected totals
    const expectedTotals = data.items.reduce((acc, item) => {
        acc.subtotal += item.value_sales_excluding_st || 0;
        acc.tax += item.sales_tax || 0;
        acc.total += item.total_amount || 0;
        return acc;
    }, { subtotal: 0, tax: 0, total: 0 });

    // Validate total amount
    const totalDifference = Math.abs(data.totalAmount - expectedTotals.total);
    if (totalDifference > 0.01) {
        results.push({
            field: 'totalAmount',
            severity: ValidationSeverity.ERROR,
            message: `Invoice total mismatch. Expected: ${expectedTotals.total.toFixed(2)}, Actual: ${data.totalAmount.toFixed(2)}`,
            code: 'INVOICE_TOTAL_MISMATCH'
        });
    }

    return results;
};