import { FbrScenarioStatus } from "../constants/fbr";

export interface FbrScenario {
    id: string;
    code: string;
    description: string;
    sale_type: string;
    category: string;
    status: FbrScenarioStatus;
    attempts: number;
    last_attempt: string | null;
    completion_timestamp: string | null;
}

export interface ScenarioFilters {
    searchTerm?: string;
    category?: string;
    saleType?: string;
    scenarioId?: string;
}

export interface ScenarioWithProgress {
    id: string;
    code: string;
    category: string;
    sale_type: string;
    description: string;
    status: FbrScenarioStatus;
    attempts: number;
    last_attempt: string | null;
    completion_timestamp: string | null;
}

export interface FbrScenarioProgress {
    id: number;
    user_id: string;
    scenario_id: string;
    status: FbrScenarioStatus;
    attempts: number;
    last_attempt: string | null;
    fbr_response: string | null;
    completion_timestamp: string | null;
    created_at: string;
    updated_at: string;
}

export interface FbrScenarioProgressResult extends FbrScenarioProgress {
    newAttempts: number;
}

export interface FbrConfigStatus {
    sandbox_status: string;
    production_status: string;
    last_sandbox_test?: string;
    last_production_test?: string;
    sandbox_api_key?: string | null;
    production_api_key?: string | null;
}

export interface FbrProfile {
    user_id: string;
    cnic_ntn: string;
    business_name: string;
    province_code: number;
    address: string;
    mobile_number: string;
    business_activity_id: number;
    created_at: string;
    updated_at: string;
}

export type FbrProfilePayload = {
    user_id: string;
    cnic_ntn: string;
    business_name: string;
    province_code: number;
    address: string;
    mobile_number: string;
    business_activity_id: number;
    ntn_number?: string;
    strn_number?: string;
};

export interface FbrSandboxTestRequest {
    scenarioId: string;
    invoiceData: {
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
        items: Array<{
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
        }>;
        totalAmount: number;
        notes: string;
        [key: string]: unknown;
    };
    userId: string;
}

export interface FbrSandboxTestResponse {
    success: boolean;
    message: string;
    data?: {
        fbrResponse: unknown;
        scenarioId: string;
        status: FbrScenarioStatus;
        timestamp?: string;
        errorDetails?: string;
    };
}

/**
 * Response from FBR SaleTypeToRate API
 * This API returns available tax rates based on transaction type, date, and seller province
 */
export interface SaleTypeToRateResponse {
    ratE_ID: number;      // Unique rate identifier
    ratE_DESC: string;    // Rate description (e.g., "18% along with rupees 60 per kilogram")
    ratE_VALUE: number;   // Tax rate percentage value
}

/**
 * Parameters for SaleTypeToRate API call
 */
export interface SaleTypeToRateParams {
    date: string;              // Invoice date in YYYY-MM-DD format
    transTypeId: number;       // Type of transaction (18 = standard goods sale)
    originationSupplier: number; // Province ID of seller
}
