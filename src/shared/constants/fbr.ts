export const FBR_API_STATUS = {
    NOT_CONFIGURED: 'not_configured',
    CONNECTED: 'connected',
    FAILED: 'failed'
} as const;

export type FbrApiStatus = typeof FBR_API_STATUS[keyof typeof FBR_API_STATUS];

export function isFbrApiStatus(value: string): value is FbrApiStatus {
    return Object.values(FBR_API_STATUS).includes(value as FbrApiStatus);
}
