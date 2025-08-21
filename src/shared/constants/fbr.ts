export const FBR_API_STATUS = {
    NOT_CONFIGURED: 'not_configured',
    CONNECTED: 'connected',
    FAILED: 'failed'
} as const;

export type FbrApiStatus = typeof FBR_API_STATUS[keyof typeof FBR_API_STATUS];

export function isFbrApiStatus(value: string): value is FbrApiStatus {
    return Object.values(FBR_API_STATUS).includes(value as FbrApiStatus);
}

export const FBR_SCENARIO_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed'
} as const;

export type FbrScenarioStatus = typeof FBR_SCENARIO_STATUS[keyof typeof FBR_SCENARIO_STATUS];

// FBR Sandbox Scenarios data
export const FBR_SCENARIOS: Record<string, {
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
}> = {
    'SN001': {
        description: 'Basic Sales Invoice',
        mandatoryFields: ['invoiceType', 'buyerNTNCNIC', 'items', 'totalAmount'],
        sampleData: {
            invoiceType: 'Sale Invoice',
            buyerNTNCNIC: '1234567890123',
            items: [
                {
                    itemName: 'Test Product 1',
                    quantity: 2,
                    unitPrice: 1000,
                    totalAmount: 2000
                }
            ]
        },
        requirements: [
            'Create a basic sales invoice with single item',
            'Include buyer NTN/CNIC',
            'Calculate total amount correctly'
        ],
        expectedOutcomes: [
            'Invoice successfully submitted to FBR',
            'Receive confirmation response',
            'Invoice number generated'
        ]
    },
    'SN002': {
        description: 'Sales Invoice with Multiple Items',
        mandatoryFields: ['invoiceType', 'buyerNTNCNIC', 'items', 'totalAmount'],
        sampleData: {
            invoiceType: 'Sale Invoice',
            buyerNTNCNIC: '1234567890123',
            items: [
                {
                    itemName: 'Product A',
                    quantity: 3,
                    unitPrice: 500,
                    totalAmount: 1500
                },
                {
                    itemName: 'Product B',
                    quantity: 2,
                    unitPrice: 750,
                    totalAmount: 1500
                }
            ]
        },
        requirements: [
            'Create sales invoice with multiple items',
            'Calculate subtotals for each item',
            'Calculate grand total correctly'
        ],
        expectedOutcomes: [
            'Multiple items processed successfully',
            'Correct total calculation',
            'FBR accepts multi-item invoice'
        ]
    },
    'SN003': {
        description: 'Sales Invoice with Discount',
        mandatoryFields: ['invoiceType', 'buyerNTNCNIC', 'items', 'discount', 'totalAmount'],
        sampleData: {
            invoiceType: 'Sale Invoice',
            buyerNTNCNIC: '1234567890123',
            items: [
                {
                    itemName: 'Discounted Product',
                    quantity: 1,
                    unitPrice: 1000,
                    totalAmount: 1000
                }
            ]
        },
        requirements: [
            'Apply discount to invoice',
            'Calculate discounted total',
            'Include discount in FBR submission'
        ],
        expectedOutcomes: [
            'Discount applied correctly',
            'Final amount calculated properly',
            'FBR processes discounted invoice'
        ]
    },
    'SN004': {
        description: 'Export Invoice',
        mandatoryFields: ['invoiceType', 'buyerNTNCNIC', 'items', 'exportDetails', 'totalAmount'],
        sampleData: {
            invoiceType: 'Export Invoice',
            buyerNTNCNIC: '1234567890123',
            items: [
                {
                    itemName: 'Export Product',
                    quantity: 10,
                    unitPrice: 500,
                    totalAmount: 5000
                }
            ]
        },
        requirements: [
            'Create export invoice',
            'Include export-specific details',
            'Handle zero-rated tax for exports'
        ],
        expectedOutcomes: [
            'Export invoice processed',
            'Zero-rated tax applied',
            'Export documentation included'
        ]
    },
    'SN005': {
        description: 'Purchase Invoice',
        mandatoryFields: ['invoiceType', 'sellerNTNCNIC', 'items', 'totalAmount'],
        sampleData: {
            invoiceType: 'Purchase Invoice',
            buyerNTNCNIC: '1234567890123',
            items: [
                {
                    itemName: 'Raw Material',
                    quantity: 5,
                    unitPrice: 200,
                    totalAmount: 1000
                }
            ]
        },
        requirements: [
            'Create purchase invoice',
            'Include seller details',
            'Handle input tax calculations'
        ],
        expectedOutcomes: [
            'Purchase invoice submitted',
            'Input tax recorded',
            'Seller details validated'
        ]
    }
};
