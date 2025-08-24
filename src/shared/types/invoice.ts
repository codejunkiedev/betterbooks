import { UploadedFile } from "./storage";

export type InvoiceStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type InvoiceType = 'debit' | 'credit';

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
    items: InvoiceItem[];
    totalAmount: number;
    notes: string;
    [key: string]: unknown;
} 