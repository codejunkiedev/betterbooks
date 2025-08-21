
import type { ApiResponse } from './types';
import { HttpClientApi } from './http-client';
import { updateFbrConnectionStatus, saveFbrCredentials, updateScenarioProgress, getFbrConfigStatus } from '../supabase/fbr';
import { supabase } from '../supabase/client';
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
    userId?: string;
}

export interface SaveCredentialsRequest {
    sandboxKey?: string;
    productionKey?: string;
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
            const message = error.message;
            
            // Check if it's a CORS error
            if (message.includes('CORS') || message.includes('cors')) {
                return {
                    success: false,
                    message: 'CORS error - FBR API does not allow browser requests. Please contact support.',
                    data: {
                        status: 'failed',
                        configStatus: updatedStatus
                    }
                };
            }

            // Check if it's an HTTP error
            const statusMatch = message.match(/HTTP (\d+)/);
            if (statusMatch) {
                const status = parseInt(statusMatch[1]);
                const errorMessage = getFbrErrorMessage(status);
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
                message: message || 'Connection failed',
                data: {
                    status: 'failed',
                    configStatus: updatedStatus
                }
            };
        }

        return {
            success: false,
            message: 'Connection failed',
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
            message: 'FBR credentials saved successfully',
            data: null
        };
    } catch (error) {
        console.error('Error saving FBR credentials:', error);
        return {
            success: false,
            message: 'Failed to save FBR credentials',
            data: null
        };
    }
}

/**
 * Get scenarios by business sector
 */
export async function getScenariosByBusinessSector(businessSectorId: number): Promise<ApiResponse<{ scenarios: string[] }>> {
    try {
        // Get scenarios for the business activity
        const { data: scenarios, error } = await supabase
            .from('business_activity_scenario')
            .select(`
                scenario_id,
                scenario:scenario_id(code)
            `)
            .eq('business_activity_id', businessSectorId);

        if (error) {
            console.error('Failed to get scenarios for business activity:', error);
            return {
                success: false,
                message: 'Failed to retrieve scenarios for business sector',
                data: null
            };
        }

        // Extract scenario codes from the response
        const scenarioCodes = scenarios?.map((s: { scenario?: { code?: string }[] }) => {
            if (s.scenario && Array.isArray(s.scenario) && s.scenario.length > 0) {
                return s.scenario[0].code;
            }
            return null;
        }).filter((code): code is string => Boolean(code)) || [];

        return {
            success: true,
            message: 'Scenarios retrieved successfully',
            data: { scenarios: scenarioCodes }
        };
    } catch (error) {
        console.error('Error getting scenarios by business sector:', error);
        return {
            success: false,
            message: 'Failed to retrieve scenarios',
            data: null
        };
    }
}

/**
 * Submit FBR sandbox test invoice
 */
export async function submitSandboxTestInvoice(params: FbrSandboxTestRequest): Promise<FbrSandboxTestResponse> {
    try {
        // Get user's sandbox API key
        const configStatus = await getFbrConfigStatus(params.userId);
        
        if (!configStatus.sandbox_api_key) {
            return {
                success: false,
                message: 'Sandbox API key not configured. Please configure your sandbox API key first.'
            };
        }

        if (configStatus.sandbox_status !== FBR_API_STATUS.CONNECTED) {
            return {
                success: false,
                message: 'Sandbox API connection not established. Please test your sandbox connection first.'
            };
        }

        // Update scenario status to in_progress
        await updateScenarioProgress(params.userId, params.scenarioId, 'in_progress');

        // Prepare invoice data with scenario ID
        const invoiceData = {
            ...params.invoiceData,
            scenarioId: params.scenarioId
        };

        // Submit to FBR sandbox
        const response = await httpClient.request({
            method: 'POST',
            url: ENV_TEST_ENDPOINTS.sandbox,
            headers: {
                'Authorization': `Bearer ${configStatus.sandbox_api_key}`,
                'Content-Type': 'application/json',
            },
            data: invoiceData
        });

        // Update scenario status to completed
        const scenarioStatus = await updateScenarioProgress(
            params.userId, 
            params.scenarioId, 
            'completed',
            JSON.stringify(response.data)
        );

        return {
            success: true,
            message: 'Sandbox test invoice submitted successfully',
            data: {
                fbrResponse: response.data,
                scenarioStatus
            }
        };
    } catch (error) {
        // Update scenario status to failed
        let scenarioStatus;
        try {
            scenarioStatus = await updateScenarioProgress(
                params.userId, 
                params.scenarioId, 
                'failed',
                error instanceof Error ? error.message : 'Unknown error'
            );
        } catch (updateError) {
            console.error('Failed to update scenario status:', updateError);
        }

        // Handle different types of errors
        if (error instanceof Error) {
            const message = error.message;
            
            // Check if it's an HTTP error
            const statusMatch = message.match(/HTTP (\d+)/);
            if (statusMatch) {
                const status = parseInt(statusMatch[1]);
                const errorMessage = getFbrErrorMessage(status);
                return {
                    success: false,
                    message: `Sandbox test failed: ${errorMessage}`,
                    data: {
                        fbrResponse: null,
                        scenarioStatus
                    }
                };
            }

            return {
                success: false,
                message: `Sandbox test failed: ${message}`,
                data: {
                    fbrResponse: null,
                    scenarioStatus
                }
            };
        }

        return {
            success: false,
            message: 'Sandbox test failed: Unknown error',
            data: {
                fbrResponse: null,
                scenarioStatus
            }
        };
    }
}


