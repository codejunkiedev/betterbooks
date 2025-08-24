import { FbrScenarioStatus } from "../constants/fbr";

export interface FbrScenario {
    id: string;
    code: string;
    description: string;
    sale_type: string;
    category: string;
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

export interface FbrConfigStatus {
    sandbox_status: string;
    production_status: string;
    last_sandbox_test?: string;
    last_production_test?: string;
    sandbox_api_key?: string | null;
    production_api_key?: string | null;
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
