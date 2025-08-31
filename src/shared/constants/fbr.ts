import { ValidationSeverity } from '@/shared/utils/validation';

// FBR API Status
export enum FBR_API_STATUS {
    CONFIGURED = 'configured',
    NOT_CONFIGURED = 'not_configured',
    PENDING = 'pending',
    CONNECTED = 'connected',
    FAILED = 'failed'
}

// FBR Scenario Status
export enum FBR_SCENARIO_STATUS {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

// Type alias for scenario status
export type FbrScenarioStatus = FBR_SCENARIO_STATUS;

// FBR HTTP Status Codes
export enum FBR_HTTP_STATUS {
    OK = 200,
    UNAUTHORIZED = 401,
    INTERNAL_SERVER_ERROR = 500
}

// FBR Error Categories
export enum FBR_ERROR_CATEGORY {
    AUTHENTICATION = 'authentication',
    VALIDATION = 'validation',
    BUSINESS_RULE = 'business_rule',
    TAX_CALCULATION = 'tax_calculation',
    FORMAT = 'format',
    SYSTEM = 'system'
}

// FBR Error Interface
export interface FBRErrorInfo {
    message: string;
    severity: ValidationSeverity;
    category: FBR_ERROR_CATEGORY;
    field?: string;
    suggestion?: string;
    requiresAction?: boolean;
}

// Complete FBR Sales Error Codes Mapping
export const FBR_ERROR_MESSAGES: Record<string, FBRErrorInfo> = {
    // Authentication Errors (0401-0402)
    '0401': {
        message: 'The provided seller NTN/CNIC does not have a valid or authorized access token',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.AUTHENTICATION,
        field: 'sellerNTNCNIC',
        suggestion: 'Verify seller registration number is 13 digits (CNIC) or 7 digits (NTN) and has valid authorization',
        requiresAction: true
    },
    '0402': {
        message: 'The provided buyer NTN/CNIC does not have a valid or authorized access token',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.AUTHENTICATION,
        field: 'buyerNTNCNIC',
        suggestion: 'Verify buyer registration number is 13 digits (CNIC) or 7 digits (NTN) and has valid authorization',
        requiresAction: true
    },

    // Registration and Validation Errors (0001-0013)
    '0001': {
        message: 'Seller not registered for sales tax, please provide valid registration/NTN',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'sellerNTNCNIC',
        suggestion: 'Ensure seller is registered for sales tax with valid NTN/CNIC',
        requiresAction: true
    },
    '0002': {
        message: 'Invalid Buyer Registration No or NTN',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.FORMAT,
        field: 'buyerNTNCNIC',
        suggestion: 'Provide buyer registration number in 13 digits or NTN in 7 or 9 digits',
        requiresAction: true
    },
    '0003': {
        message: 'Provide proper invoice type',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'invoiceType',
        suggestion: 'Select a valid invoice type from the available options',
        requiresAction: true
    },
    '0005': {
        message: 'Please provide date in valid format 01-DEC-2021',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.FORMAT,
        field: 'invoiceDate',
        suggestion: 'Provide invoice date in "YYYY-MM-DD" format (e.g., 2025-05-25)',
        requiresAction: true
    },
    '0006': {
        message: 'Sale invoice not exist',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'invoiceNumber',
        suggestion: 'Verify the sales invoice exists against STWH',
        requiresAction: true
    },
    '0007': {
        message: 'Wrong Sale type is selected with invoice no',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'saleType',
        suggestion: 'Select the actual invoice type associated with the registration number',
        requiresAction: true
    },
    '0008': {
        message: 'ST withheld at source should either be zero or same as sales tax/fed in st mode',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.TAX_CALCULATION,
        field: 'salesTaxWithheldAtSource',
        suggestion: 'Enter ST withheld at source as zero or equal to sales tax',
        requiresAction: true
    },
    '0009': {
        message: 'Provide Buyer registration No',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'buyerNTNCNIC',
        suggestion: 'Provide proper buyer registration number',
        requiresAction: true
    },
    '0010': {
        message: 'Provide Buyer Name',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'buyerBusinessName',
        suggestion: 'Provide valid buyer name',
        requiresAction: true
    },
    '0011': {
        message: 'Provide invoice type',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'invoiceType',
        suggestion: 'Provide valid invoice type',
        requiresAction: true
    },
    '0012': {
        message: 'Provide Buyer Registration Type',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'buyerRegistrationType',
        suggestion: 'Provide valid Buyer Registration type',
        requiresAction: true
    },
    '0013': {
        message: 'Provide valid Sale type',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'saleType',
        suggestion: 'Provide valid sale type',
        requiresAction: true
    },

    // Item-level Validation Errors (0018-0024)
    '0018': {
        message: 'Please provide Sales Tax/FED in ST Mode',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'salesTax',
        suggestion: 'Provide valid Sales Tax/FED',
        requiresAction: true
    },
    '0019': {
        message: 'Please provide HSCode',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'hsCode',
        suggestion: 'Provide valid HS Code',
        requiresAction: true
    },
    '0020': {
        message: 'Please provide Rate',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'taxRate',
        suggestion: 'Provide Rate',
        requiresAction: true
    },
    '0021': {
        message: 'Please provide Value of Sales Excl. ST /Quantity',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'valueSalesExcludingST',
        suggestion: 'Provide valid Value of Sales Excl. ST /Quantity',
        requiresAction: true
    },
    '0022': {
        message: 'Please provide ST withheld at Source or STS Withheld',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'salesTaxWithheldAtSource',
        suggestion: 'Provide valid ST withheld at Source or STS Withheld',
        requiresAction: true
    },
    '0023': {
        message: 'Please provide Sales Tax',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'salesTax',
        suggestion: 'Provide valid Sales Tax',
        requiresAction: true
    },
    '0024': {
        message: 'Please provide ST withheld',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'salesTaxWithheld',
        suggestion: 'Provide valid Sales Tax withheld',
        requiresAction: true
    },

    // Debit/Credit Note Errors (0026-0037)
    '0026': {
        message: 'Invoice Reference No. is required',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'invoiceRefNo',
        suggestion: 'Provide valid Invoice Reference No. for debit/credit note',
        requiresAction: true
    },
    '0027': {
        message: 'Reason is required',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'reason',
        suggestion: 'Provide valid reason for debit/credit note',
        requiresAction: true
    },
    '0028': {
        message: 'Reason Remarks are required',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'reasonRemarks',
        suggestion: 'Provide valid remarks when reason is selected as "Others"',
        requiresAction: true
    },
    '0029': {
        message: 'Invoice date must be greater or equal to original invoice no',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'invoiceDate',
        suggestion: 'Debit/Credit note date should be equal or greater from original invoice date',
        requiresAction: true
    },
    '0030': {
        message: 'Unregistered distributer type not allowed before date',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'buyerRegistrationType',
        suggestion: 'Unregistered distributer type not allowed before system cut of date',
        requiresAction: true
    },
    '0031': {
        message: 'Provide Sales Tax',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'salesTax',
        suggestion: 'Provide Sales Tax',
        requiresAction: true
    },
    '0032': {
        message: 'STWH can only be created for GOV/FTN Holders',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'sellerNTNCNIC',
        suggestion: 'STWH can only be created for GOV/FTN Holders without sales invoice',
        requiresAction: true
    },
    '0034': {
        message: 'Debit/Credit note can only be added within 180 days of original invoice date',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'invoiceDate',
        suggestion: 'Ensure note date is within 180 days of original invoice date',
        requiresAction: true
    },
    '0035': {
        message: 'Note Date must be greater or equal to original invoice date',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'invoiceDate',
        suggestion: 'Note Date must be greater or equal to original invoice date',
        requiresAction: true
    },
    '0036': {
        message: 'Credit Note Value of Sale must be less or equal to the value of Sale in original invoice',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'valueSalesExcludingST',
        suggestion: 'Reduce credit note value to match or be less than original invoice value',
        requiresAction: true
    },
    '0037': {
        message: 'Credit Note Value of ST Withheld must be less or equal to the value of ST Withheld in original invoice',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'salesTaxWithheldAtSource',
        suggestion: 'Reduce credit note ST withheld value to match or be less than original invoice',
        requiresAction: true
    },

    // Additional Validation Errors (0039-0058)
    '0039': {
        message: 'Sale invoice not exist',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'invoiceNumber',
        suggestion: 'For registered users, STWH invoice fields must be same as sale invoice',
        requiresAction: true
    },
    '0041': {
        message: 'Provide invoice No',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'invoiceNumber',
        suggestion: 'Provide invoice number',
        requiresAction: true
    },
    '0042': {
        message: 'Provide invoice date',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'invoiceDate',
        suggestion: 'Provide invoice date',
        requiresAction: true
    },
    '0043': {
        message: 'Provide valid Date',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.FORMAT,
        field: 'invoiceDate',
        suggestion: 'Provide valid invoice date',
        requiresAction: true
    },
    '0044': {
        message: 'Provide HS Code',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'hsCode',
        suggestion: 'Provide HS Code',
        requiresAction: true
    },
    '0046': {
        message: 'Provide rate',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'taxRate',
        suggestion: 'Provide valid rate as per selected Sales Type',
        requiresAction: true
    },
    '0050': {
        message: 'Please provide valid Sales Tax withheld. For sale type \'Cotton ginners\', Sales Tax Withheld must be equal to Sales Tax or zero',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.TAX_CALCULATION,
        field: 'salesTaxWithheld',
        suggestion: 'For Cotton ginners, Sales Tax Withheld must be equal to Sales Tax or zero',
        requiresAction: true
    },
    '0052': {
        message: 'HS Code that does not match with provided sale type',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'hsCode',
        suggestion: 'Provide valid HS Code against sale type',
        requiresAction: true
    },
    '0053': {
        message: 'Provided buyer registration type is invalid',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'buyerRegistrationType',
        suggestion: 'Provide valid Buyer Registration Type',
        requiresAction: true
    },
    '0055': {
        message: 'Please Provide ST Withheld as WH Agent',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'salesTaxWithheldAtSource',
        suggestion: 'Provide valid sales tax withheld',
        requiresAction: true
    },
    '0056': {
        message: 'Buyer not exists in steel sector',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'buyerNTNCNIC',
        suggestion: 'Buyer does not exist in steel sector',
        requiresAction: true
    },
    '0057': {
        message: 'Reference Invoice does not exist',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'invoiceRefNo',
        suggestion: 'Provide valid Invoice Reference No',
        requiresAction: true
    },
    '0058': {
        message: 'Self-invoicing not allowed',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'buyerNTNCNIC',
        suggestion: 'Buyer and Seller Registration number cannot be the same',
        requiresAction: true
    },

    // Additional Business Rule Errors (0064-0108)
    '0064': {
        message: 'Reference invoice already exist',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'invoiceRefNo',
        suggestion: 'Credit note is already added to this invoice',
        requiresAction: true
    },
    '0067': {
        message: 'Sales Tax value of Debit Note is greater than original invoice\'s sales tax',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'salesTax',
        suggestion: 'Reduce debit note sales tax value to match or be less than original invoice',
        requiresAction: true
    },
    '0068': {
        message: 'Sales Tax value of Credit Note is less than original invoice\'s sales tax according to the rate',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'salesTax',
        suggestion: 'Adjust credit note sales tax value according to the rate',
        requiresAction: true
    },
    '0070': {
        message: 'STWH cannot be created for unregistered buyers',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'buyerNTNCNIC',
        suggestion: 'STWH is allowed only for registered users',
        requiresAction: true
    },
    '0071': {
        message: 'Entry of Credit note against the declared invoice is not allowed',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'invoiceType',
        suggestion: 'Credit note allowed to add only for specific users',
        requiresAction: true
    },
    '0073': {
        message: 'Provide Sale Origination Province of Supplier',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'sellerProvince',
        suggestion: 'Provide valid Sale Origination Province of Supplier',
        requiresAction: true
    },
    '0074': {
        message: 'Provide Destination of Supply',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'buyerProvince',
        suggestion: 'Provide valid Destination of Supply',
        requiresAction: true
    },
    '0077': {
        message: 'Provide SRO/Schedule No',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'sroScheduleNo',
        suggestion: 'Provide valid SRO/Schedule Number',
        requiresAction: true
    },
    '0078': {
        message: 'Provide Item Sr. No',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'sroItemSerialNo',
        suggestion: 'Provide valid item serial number',
        requiresAction: true
    },
    '0079': {
        message: 'If sales value is greater than 20,000 than rate 5% is not allowed',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'taxRate',
        suggestion: 'Use appropriate tax rate for sales value greater than 20,000',
        requiresAction: true
    },
    '0080': {
        message: 'Please provide Further Tax',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'furtherTax',
        suggestion: 'Provide valid Further Tax',
        requiresAction: true
    },
    '0081': {
        message: 'Input Credit not Allowed cannot be empty',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'inputCreditNotAllowed',
        suggestion: 'Provide Input Credit not Allowed value',
        requiresAction: true
    },
    '0082': {
        message: 'The Seller is not registered for sales tax. Please provide a valid registration/NTN',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'sellerNTNCNIC',
        suggestion: 'Provide a valid registration/NTN',
        requiresAction: true
    },
    '0083': {
        message: 'Mismatch Seller Registration No',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'sellerNTNCNIC',
        suggestion: 'Provide valid Seller Registration Number',
        requiresAction: true
    },
    '0085': {
        message: 'Total Value of Sales is not provided',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'totalValueOfSales',
        suggestion: 'Provide valid Total Value of Sales (In case of PFAD only)',
        requiresAction: true
    },
    '0086': {
        message: 'You are not an EFS license holder who has imported Compressor Scrap in the last 12 months',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'sellerNTNCNIC',
        suggestion: 'Only EFS license holders with recent Compressor Scrap imports are allowed',
        requiresAction: true
    },
    '0087': {
        message: 'Petroleum Levy rates not configured properly',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.SYSTEM,
        field: 'taxRate',
        suggestion: 'Please update levy rates properly',
        requiresAction: true
    },
    '0088': {
        message: 'Invoice number is not valid',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.FORMAT,
        field: 'invoiceNumber',
        suggestion: 'Provide valid invoice number in alphanumeric format (e.g., Inv-001)',
        requiresAction: true
    },
    '0089': {
        message: 'Please provide FED Charged',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'fedPayable',
        suggestion: 'Provide valid FED Charged',
        requiresAction: true
    },
    '0090': {
        message: 'Fixed / notified value or Retail Price cannot be empty',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'fixedNotifiedValueOrRetailPrice',
        suggestion: 'Provide valid Fixed / notified value or Retail Price',
        requiresAction: true
    },
    '0091': {
        message: 'Extra tax must be empty',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'extraTax',
        suggestion: 'Extra tax must be empty',
        requiresAction: true
    },
    '0092': {
        message: 'Purchase type cannot be empty',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'purchaseType',
        suggestion: 'Provide valid purchase type',
        requiresAction: true
    },
    '0093': {
        message: 'Selected Sale Type are not allowed to Manufacturer',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'saleType',
        suggestion: 'Select proper sale type for Manufacturer',
        requiresAction: true
    },
    '0095': {
        message: 'Please provide Extra Tax',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'extraTax',
        suggestion: 'Provide valid extra tax',
        requiresAction: true
    },
    '0096': {
        message: 'For provided HS Code, only KWH UOM is allowed',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'uoM',
        suggestion: 'Use KWH UOM for this HS Code',
        requiresAction: true
    },
    '0097': {
        message: 'Please provide UOM in KG',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'uoM',
        suggestion: 'Provide UOM in KG',
        requiresAction: true
    },
    '0098': {
        message: 'Quantity / Electricity Unit cannot be empty',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'quantity',
        suggestion: 'Provide valid Quantity / Electricity Unit',
        requiresAction: true
    },
    '0099': {
        message: 'UOM is not valid. UOM must be according to given HS Code',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'uoM',
        suggestion: 'Use UOM according to the given HS Code',
        requiresAction: true
    },
    '0100': {
        message: 'Registered user cannot add sale invoice. Only cotton ginner sale type is allowed for registered users',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'saleType',
        suggestion: 'Use cotton ginner sale type for registered users',
        requiresAction: true
    },
    '0101': {
        message: 'Sale type is not selected properly',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'saleType',
        suggestion: 'Use Toll Manufacturing Sale Type for Steel Sector',
        requiresAction: true
    },
    '0102': {
        message: 'The calculated sales tax not calculated as per 3rd schedule calculation formula',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.TAX_CALCULATION,
        field: 'salesTax',
        suggestion: 'Verify tax calculation according to 3rd schedule formula',
        requiresAction: true
    },
    '0103': {
        message: 'Calculated tax not matched for potassium chlorate',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.TAX_CALCULATION,
        field: 'salesTax',
        suggestion: 'Verify calculation for potassium chlorate sales invoices',
        requiresAction: true
    },
    '0104': {
        message: 'Calculated percentage of sales tax not matched',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.TAX_CALCULATION,
        field: 'salesTax',
        suggestion: 'Verify calculation with respect to provided rate',
        requiresAction: true
    },
    '0105': {
        message: 'The calculated sales tax for the quantity is incorrect',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.TAX_CALCULATION,
        field: 'salesTax',
        suggestion: 'Verify sales tax calculation for the given quantity',
        requiresAction: true
    },
    '0106': {
        message: 'The Buyer is not registered for sales tax. Please provide a valid registration/NTN',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'buyerNTNCNIC',
        suggestion: 'Provide a valid registration/NTN',
        requiresAction: true
    },
    '0107': {
        message: 'Mismatch Buyer Registration No',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'buyerNTNCNIC',
        suggestion: 'Provide valid Buyer Registration Number',
        requiresAction: true
    },
    '0108': {
        message: 'Seller Reg No. is not valid',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'sellerNTNCNIC',
        suggestion: 'Provide valid Seller Registration Number/NTN',
        requiresAction: true
    },
    '0109': {
        message: 'Invoice type is not selected properly',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'invoiceType',
        suggestion: 'Select proper invoice type',
        requiresAction: true
    },
    '0111': {
        message: 'Purchase type is not selected properly',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.VALIDATION,
        field: 'purchaseType',
        suggestion: 'Provide proper purchase type',
        requiresAction: true
    },
    '0113': {
        message: 'Date is not in proper format',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.FORMAT,
        field: 'invoiceDate',
        suggestion: 'Provide date in "YYYY-MM-DD" format (e.g., 2025-05-25)',
        requiresAction: true
    },

    // Sale Type and Scenario Validation Errors (0200-0299)
    '0204': {
        message: 'Sale type does not match with provided scenario number',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.BUSINESS_RULE,
        field: 'saleType',
        suggestion: 'Verify that the sale type matches the scenario requirements. Check scenario details and update sale type accordingly.',
        requiresAction: true
    },

    // Decimal Value Validation Error (0300)
    '0300': {
        message: 'Decimal value is not valid at field',
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.FORMAT,
        field: 'general',
        suggestion: 'Check decimal values for discount, total, FED payable, extra tax, further tax, ST withheld, and quantity fields',
        requiresAction: true
    }
};

// HTTP Status Code Messages
export const FBR_HTTP_MESSAGES: Record<number, string> = {
    200: 'OK',
    401: 'Unauthorized',
    500: 'Internal Server Error (Contact Administrator)'
};

// Helper function to get error info by code
export function getFBRErrorInfo(errorCode: string): FBRErrorInfo {
    return FBR_ERROR_MESSAGES[errorCode] || {
        message: `Unknown FBR error code: ${errorCode}`,
        severity: ValidationSeverity.ERROR,
        category: FBR_ERROR_CATEGORY.SYSTEM,
        requiresAction: true
    };
}

// Helper function to categorize errors
export function categorizeFBRErrors(errors: Array<{ code: string; field?: string }>): Record<FBR_ERROR_CATEGORY, string[]> {
    const categorized: Record<FBR_ERROR_CATEGORY, string[]> = {
        [FBR_ERROR_CATEGORY.AUTHENTICATION]: [],
        [FBR_ERROR_CATEGORY.VALIDATION]: [],
        [FBR_ERROR_CATEGORY.BUSINESS_RULE]: [],
        [FBR_ERROR_CATEGORY.TAX_CALCULATION]: [],
        [FBR_ERROR_CATEGORY.FORMAT]: [],
        [FBR_ERROR_CATEGORY.SYSTEM]: []
    };

    errors.forEach(error => {
        const errorInfo = getFBRErrorInfo(error.code);
        categorized[errorInfo.category].push(error.code);
    });

    return categorized;
}
