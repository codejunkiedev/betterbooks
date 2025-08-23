import { FbrScenarioStatus } from "../constants/fbr";

export interface FbrScenario {
    scenarioId: string;
    description: string;
    saleType: string;
    category: string;
    mandatoryFields?: readonly string[];
    sampleData?: {
        invoiceType: string;
        items: ReadonlyArray<{
            itemName: string;
            quantity: number;
            unitPrice: number;
            totalAmount: number;
        }>;
        [key: string]: unknown;
    };
    requirements?: readonly string[];
    expectedOutcomes?: readonly string[];
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

export interface FbrScenarioWithProgress extends FbrScenario {
    progress?: FbrScenarioProgress;
}

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
