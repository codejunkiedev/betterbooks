
import type { ApiResponse } from './types';
import { HttpClientApi } from './http-client';
import { updateFbrConnectionStatus, saveFbrCredentials } from '../supabase/fbr';
import { FBR_API_STATUS } from '@/shared/constants/fbr';

// FBR API endpoints for testing connections
const ENV_TEST_ENDPOINTS = {
    sandbox: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb',
    production: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata'
} as const;

// HTTP client instance
const httpClient = new HttpClientApi();

// Get user-friendly error message from FBR response
function getFbrErrorMessage(status: number): string {
    switch (status) {
        case 401:
            return 'Invalid API key - Please check your credentials';
        case 403:
            return 'API key not authorized - Contact FBR for access';
        case 404:
            return 'FBR service endpoint not found';
        case 405:
            return 'Method not allowed - CORS issue detected';
        case 429:
            return 'Rate limit exceeded - Please try again later';
        case 500:
            return 'FBR server error - Please try again later';
        case 502:
        case 503:
        case 504:
            return 'FBR service temporarily unavailable';
        default:
            return `Unexpected error (${status})`;
    }
}

export interface TestConnectionRequest {
    apiKey: string;
    environment: 'sandbox' | 'production';
    userId?: string | undefined;
}

export interface SaveCredentialsRequest {
    sandboxKey?: string | undefined;
    productionKey?: string | undefined;
    userId: string;
}

/**
 * Test FBR API connection
 */
export async function testFbrConnection(params: TestConnectionRequest): Promise<ApiResponse<unknown>> {
    try {
        const endpoint = ENV_TEST_ENDPOINTS[params.environment];

        console.log('testFbrConnection', {
            endpoint,
            apiKey: params.apiKey,
            environment: params.environment,
            userId: params.userId
        });
        // Test connection using HTTP client
        await httpClient.request({
            method: 'GET',
            url: endpoint,
            headers: {
                'Authorization': `Bearer ${params.apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        // Update database status if we have userId
        let updatedStatus = null;
        if (params.userId) {
            try {
                updatedStatus = await updateFbrConnectionStatus(params.userId, params.environment, FBR_API_STATUS.CONNECTED);
            } catch (err) {
                console.error('Failed to update connection status:', err);
            }
        }

        return {
            success: true,
            message: 'Connection Successful - FBR API is accessible',
            data: {
                status: 'connected',
                configStatus: updatedStatus
            }
        };
    } catch (error) {
        // Update database status to failed if we have userId
        let updatedStatus = null;
        if (params.userId) {
            try {
                updatedStatus = await updateFbrConnectionStatus(params.userId, params.environment, FBR_API_STATUS.FAILED);
            } catch (err) {
                console.error('Failed to update connection status:', err);
            }
        }

        // Handle HTTP client errors
        if (error instanceof Error) {
            const statusMatch = error.message.match(/HTTP (\d+):/);
            if (statusMatch) {
                const status = parseInt(statusMatch[1]);
                const errorMessage = getFbrErrorMessage(status);
                return {
                    success: false,
                    message: errorMessage,
                    data: {
                        status: 'failed',
                        httpStatus: status,
                        configStatus: updatedStatus
                    }
                };
            }
        }

        // Check if it's a CORS error
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            return {
                success: false,
                message: 'CORS error - FBR API does not allow browser requests. Please contact support.',
                data: { status: 'failed', error: 'cors' }
            };
        }

        return {
            success: false,
            message: 'Network error - please check your internet connection',
            data: {
                status: 'failed',
                error: 'network',
                configStatus: updatedStatus
            }
        };
    }
}

/**
 * Save FBR API credentials securely
 */
export async function saveFbrApiCredentials(params: SaveCredentialsRequest): Promise<ApiResponse<unknown>> {
    try {
        await saveFbrCredentials(params.userId, params.sandboxKey, params.productionKey);

        return {
            success: true,
            message: 'Credentials saved successfully',
            data: { saved: true }
        };
    } catch (error) {
        console.error('Error saving FBR credentials:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to save credentials - please try again',
            data: null
        };
    }
}


