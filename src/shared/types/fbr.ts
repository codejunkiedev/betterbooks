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
        buyerNTNCNIC: string;
        items: Array<{
            itemName: string;
            quantity: number;
            unitPrice: number;
            totalAmount: number;
        }>;
        totalAmount: number;
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
