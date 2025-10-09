import { UploadedFile } from "./storage";
import { INVOICE_STATUS, INVOICE_TYPE, BUYER_REGISTRATION_TYPE } from "@/shared/constants/invoice";
import { UoMValidationSeverity } from "@/shared/constants/uom";

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];
export type InvoiceType = (typeof INVOICE_TYPE)[keyof typeof INVOICE_TYPE];
export type BuyerRegistrationType = (typeof BUYER_REGISTRATION_TYPE)[keyof typeof BUYER_REGISTRATION_TYPE];

// FBR API Item interface
export interface FBRInvoiceItem {
  hsCode: string;
  productDescription: string;
  rate: string;
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

// FBR API interface - single source of truth
export interface FBRInvoiceData {
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
}

// Internal application state
export interface InvoiceFormData extends FBRInvoiceData {
  totalAmount: number;
  notes: string;
}

export interface FBRInvoicePayload {
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
  items: Array<{
    hsCode: string;
    productDescription: string;
    rate: string;
    uoM: string;
    quantity: number;
    totalValues: number;
    valueSalesExcludingST: number;
    fixedNotifiedValueOrRetailPrice: number;
    salesTaxApplicable: number;
    salesTaxWithheldAtSource: number;
    extraTax: number | string;
    furtherTax: number;
    sroScheduleNo: string;
    fedPayable: number;
    discount: number;
    saleType: string;
    sroItemSerialNo: string;
  }>;
}

// Database interfaces - matching actual database schema
export interface InvoiceDB {
  id: number;
  user_id: string;
  invoice_ref_no: string;
  invoice_type: string;
  invoice_date: string;
  seller_ntn_cnic: string;
  seller_business_name: string;
  seller_province: string;
  seller_address: string;
  buyer_ntn_cnic: string;
  buyer_business_name: string;
  buyer_province: string;
  buyer_address: string;
  buyer_registration_type: string;
  scenario_id: string | null;
  total_amount: number;
  notes: string | null;
  fbr_response: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItemDB {
  id: number;
  invoice_id: number;
  hs_code: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  sales_tax: number;
  uom_code: string;
  tax_rate: number;
  value_sales_excluding_st: number | null;
  fixed_notified_value: number | null;
  retail_price: number | null;
  invoice_note: string | null;
  is_third_schedule: boolean;
  created_at: string;
  updated_at: string;
}

// Create invoice data for database insertion
export interface CreateInvoiceDB {
  user_id: string;
  invoice_ref_no: string;
  invoice_type: string;
  invoice_date: string;
  seller_ntn_cnic: string;
  seller_business_name: string;
  seller_province: string;
  seller_address: string;
  buyer_ntn_cnic: string;
  buyer_business_name: string;
  buyer_province: string;
  buyer_address: string;
  buyer_registration_type: string;
  scenario_id?: string;
  total_amount: number;
  notes?: string;
  fbr_response?: Record<string, unknown>;
  status?: string;
}

export interface CreateInvoiceItemDB {
  invoice_id: number;
  hs_code: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  sales_tax: number;
  uom_code: string;
  tax_rate: number;
  value_sales_excluding_st?: number;
  fixed_notified_value?: number;
  retail_price?: number;
  invoice_note?: string;
  is_third_schedule?: boolean;
}

// Database interfaces
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

// FBR API validation interfaces
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

export interface InvoiceItemForm {
  id?: string;
  hs_code: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  uom_code: string;
  tax_rate: number;
  tax_unit?: "percentage" | "rupee" | "fixed" | "compound";
  fixed_rate_per_unit?: number; // For compound tax (e.g., Rs. 60 per kg)
  rate_description?: string; // FBR rate description (e.g., "18% along with rupees 60 per kilogram")
  invoice_note?: string;
  is_third_schedule: boolean;
  mrp_including_tax?: number;
  mrp_excluding_tax?: number;
  sroScheduleNo?: string;
  sroItemSerialNo?: string;
}

export interface InvoiceItemCalculated extends InvoiceItemForm {
  id: string;
  total_amount: number;
  sales_tax: number;
  value_sales_excluding_st: number;
  fixed_notified_value: number;
  retail_price: number;
  invoice_note?: string;
  mrp_including_tax?: number;
  mrp_excluding_tax?: number;
  sroScheduleNo?: string;
  sroItemSerialNo?: string;
  created_at?: string;
  updated_at?: string;
  rate_description?: string; // FBR rate description for compound rates
}

export interface InvoiceRunningTotals {
  total_items: number;
  total_value_excluding_tax: number;
  total_sales_tax: number;
  total_amount: number;
}
