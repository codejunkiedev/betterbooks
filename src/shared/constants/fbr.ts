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
