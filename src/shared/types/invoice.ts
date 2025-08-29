import { UploadedFile } from "./storage";
import { INVOICE_STATUS, INVOICE_TYPE, BUYER_REGISTRATION_TYPE } from "@/shared/constants/invoice";

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];

export type InvoiceType = typeof INVOICE_TYPE[keyof typeof INVOICE_TYPE];
export type BuyerRegistrationType = typeof BUYER_REGISTRATION_TYPE[keyof typeof BUYER_REGISTRATION_TYPE];

export interface InvoiceFile {
    path: string;
    name: string;
    size: number;
    type: string;
}

export interface InvoiceData {
    id: string;
    user_id: string;
    file: InvoiceFile;
    status: InvoiceStatus;
    type: InvoiceType;
    opening_balance: number;
    closing_balance: number;
    data: Record<string, unknown>;
    ocr_response: Record<string, unknown>;
    deepseek_response: Record<string, unknown>;
    ai_response: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface CreateInvoiceData {
    files: UploadedFile[] | null;
    type: InvoiceType;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
    status?: InvoiceStatus;
}

export interface InvoiceItem {
    hsCode: string;
    productDescription: string;
    rate: number;
    uoM: string;
    quantity: number;
    totalValues: number;
    valueSalesExcludingST: number;
    fixedNotifiedValueOrRetailPrice: number;
    salesTaxApplicable: number;
    salesTaxWithheldAtSource: number;
    extraTax: number;
    furtherTax: number;
    sroScheduleNo: string;
    fedPayable: number;
    discount: number;
    saleType: string;
    sroItemSerialNo: string;
}

export interface ScenarioInvoiceFormData {
    invoiceType: string;
    invoiceDate: string;
    sellerNTNCNIC: string;
    sellerBusinessName: string;
    sellerProvince: string;
    sellerAddress: string;
    buyerNTNCNIC: string;
    buyerBusinessName: string;
    buyerProvince: string;
    buyerAddress: string;
    buyerRegistrationType: string;
    invoiceRefNo: string;
    scenarioId: string;
    items: InvoiceItemCalculated[];
    totalAmount: number;
    notes: string;
    [key: string]: unknown;
}

// New types for Invoice Item Management
export interface HSCode {
    hs_code: string;
    description: string;
    default_uom?: string;
    default_tax_rate?: number;
    is_third_schedule?: boolean;
    last_updated?: string;
}

export interface HSCodeSearchResult {
    hS_CODE: string;
    description: string;
    hierarchy?: string;
}

export interface UOMCode {
    uoM_ID: number;
    description: string;
}

export interface InvoiceItemForm {
    id?: string;
    hs_code: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    uom_code: string;
    tax_rate: number;
    mrp_including_tax?: number;
    mrp_excluding_tax?: number;
    invoice_note?: string;
    is_third_schedule: boolean;
}

export interface InvoiceItemCalculated {
    id?: string | undefined;
    hs_code: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    uom_code: string;
    tax_rate: number;
    value_sales_excluding_st: number;
    sales_tax: number;
    total_amount: number;
    unit_price_excluding_tax: number;
    fixed_notified_value?: number | undefined;
    retail_price?: number | undefined;
    invoice_note?: string | undefined;
    is_third_schedule: boolean;
}

export interface InvoiceRunningTotals {
    total_quantity: number;
    total_value_excluding_tax: number;
    total_sales_tax: number;
    total_amount: number;
    total_items: number;
}

export interface InvoiceItemValidation {
    isValid: boolean;
    errors: Record<string, string>;
}

// UoM Validation Types
import { UoMValidationSeverity } from '@/shared/constants/uom';

export interface UoMValidationResult {
    isValid: boolean;
    recommendedUoM: string;
    validUoMs: string[];
    severity: UoMValidationSeverity;
    message?: string;
    isCriticalMismatch?: boolean;
}

export interface UoMValidationCache {
    hs_code: string;
    valid_uoms: string[];
    recommended_uom: string;
    last_updated: string;
    expires_at: string;
} 