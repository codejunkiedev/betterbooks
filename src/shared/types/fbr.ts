export interface FbrScenarioProgress {
    id: number;
    user_id: string;
    scenario_id: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    attempts: number;
    last_attempt?: string;
    fbr_response?: string;
    created_at: string;
    updated_at: string;
}

export interface FbrScenario {
    scenarioId: string;
    description: string;
    mandatoryFields: string[];
    sampleData: {
        invoiceType: string;
        buyerNTNCNIC: string;
        items: Array<{
            itemName: string;
            quantity: number;
            unitPrice: number;
            totalAmount: number;
        }>;
    };
    requirements: string[];
    expectedOutcomes: string[];
}

export interface FbrSandboxTestRequest {
    userId: string;
    scenarioId: string;
    invoiceData: Record<string, any>;
}

export interface FbrSandboxTestResponse {
    success: boolean;
    message: string;
    data?: {
        fbrResponse: any;
        scenarioStatus: FbrScenarioProgress;
    };
}

export interface FbrScenarioSummary {
    totalScenarios: number;
    completedScenarios: number;
    inProgressScenarios: number;
    failedScenarios: number;
    notStartedScenarios: number;
    completionPercentage: number;
    isComplete: boolean;
}
