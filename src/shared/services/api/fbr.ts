
import type { ApiResponse } from './types';
import { HttpClientApi } from './http-client';
import { updateFbrConnectionStatus, saveFbrCredentials } from '../supabase/fbr';
import { FBR_API_STATUS } from '@/shared/constants/fbr';
import type { FbrSandboxTestRequest, FbrSandboxTestResponse } from '@/shared/types/fbr';

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

        // Handle different types of errors
        if (error instanceof Error) {
            const errorMessage = error.message;
            const status = (error as { status?: number; response?: { status?: number } }).status || (error as { status?: number; response?: { status?: number } }).response?.status;

            if (status) {
                const userFriendlyMessage = getFbrErrorMessage(status);
                return {
                    success: false,
                    message: userFriendlyMessage,
                    data: {
                        status: 'failed',
                        configStatus: updatedStatus,
                        originalError: errorMessage
                    }
                };
            }

            // Handle CORS errors specifically
            if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
                return {
                    success: false,
                    message: 'CORS error - FBR API does not allow browser requests. Please contact support.',
                    data: {
                        status: 'failed',
                        configStatus: updatedStatus,
                        originalError: errorMessage
                    }
                };
            }

            return {
                success: false,
                message: errorMessage,
                data: {
                    status: 'failed',
                    configStatus: updatedStatus
                }
            };
        }

        return {
            success: false,
            message: 'Unknown error occurred',
            data: {
                status: 'failed',
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
            message: 'FBR API credentials saved successfully',
            data: null
        };
    } catch (error) {
        console.error('Error saving FBR credentials:', error);
        return {
            success: false,
            message: 'Failed to save FBR API credentials',
            data: null
        };
    }
}

/**
 * Submit test invoice to FBR sandbox
 */
export async function submitSandboxTestInvoice(params: FbrSandboxTestRequest): Promise<FbrSandboxTestResponse> {
    try {
        // Get user's sandbox API key
        const { getFbrConfigStatus } = await import('../supabase/fbr');
        const config = await getFbrConfigStatus(params.userId);

        if (!config.sandbox_api_key) {
            return {
                success: false,
                message: 'Sandbox API key not configured. Please configure your sandbox API key first.'
            };
        }

        // Validate invoice data
        if (!params.invoiceData.invoiceType || !params.invoiceData.buyerNTNCNIC || !params.invoiceData.items || params.invoiceData.items.length === 0) {
            return {
                success: false,
                message: 'Invalid invoice data. Please ensure all required fields are filled.'
            };
        }

        // Calculate total amount from items
        const calculatedTotal = params.invoiceData.items.reduce((sum: number, item: { quantity: number; rate: number; totalValues: number }) => sum + item.totalValues, 0);

        // Prepare invoice data with scenario ID and validated total
        const invoiceData = {
            ...params.invoiceData,
            scenarioId: params.scenarioId,
            totalAmount: calculatedTotal,
            timestamp: new Date().toISOString(),
            environment: 'sandbox'
        };

        // Submit to FBR sandbox
        const response = await httpClient.request({
            method: 'POST',
            url: ENV_TEST_ENDPOINTS.sandbox,
            headers: {
                'Authorization': `Bearer ${config.sandbox_api_key}`,
                'Content-Type': 'application/json',
            },
            data: invoiceData
        });

        // If we reach here, the request was successful
        return {
            success: true,
            message: 'Test invoice submitted successfully to FBR sandbox',
            data: {
                fbrResponse: response.data,
                scenarioId: params.scenarioId,
                status: 'completed',
                timestamp: new Date().toISOString()
            }
        };
    } catch (error: unknown) {
        console.error('Error submitting sandbox test invoice:', error);

        let errorMessage = 'Failed to submit test invoice to FBR sandbox';
        // Handle specific error types
        if (error && typeof error === 'object' && 'response' in error) {
            const response = (error as { response: { status?: number; data?: { message?: string } } }).response;
            const status = response.status;
            if (status) {
                errorMessage = getFbrErrorMessage(status);
            }

            // Add more specific error details if available
            if (response.data && response.data.message) {
                errorMessage += `: ${response.data.message}`;
            }
        } else if (error && typeof error === 'object' && 'request' in error) {
            errorMessage = 'No response received from FBR. Please check your internet connection and try again.';
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return {
            success: false,
            message: errorMessage,
            data: {
                fbrResponse: (error as { response?: { data?: unknown } }).response?.data || null,
                scenarioId: params.scenarioId,
                status: 'failed',
                errorDetails: (error as { message?: string }).message || 'Unknown error'
            }
        };
    }
}


