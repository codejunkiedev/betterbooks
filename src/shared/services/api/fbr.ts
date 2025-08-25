
import type { ApiResponse } from './types';
import { HttpClientApi } from './http-client';
import { updateFbrConnectionStatus, saveFbrCredentials } from '../supabase/fbr';
import { FBR_API_STATUS } from '@/shared/constants/fbr';
import { UoMValidationSeverity } from '@/shared/constants/uom';
import type { FbrSandboxTestRequest, FbrSandboxTestResponse } from '@/shared/types/fbr';
import type { HSCode, HSCodeSearchResult, UOMCode } from '@/shared/types/invoice';

// Error type for FBR API responses
interface FbrApiError {
    response?: {
        status?: number;
        data?: { message?: string };
    };
    message?: string;
}

// FBR API endpoints for testing connections
const ENV_TEST_ENDPOINTS = {
    sandbox: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb',
    production: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata'
} as const;

// FBR API endpoints for data retrieval
const FBR_DATA_ENDPOINTS = {
    itemcode: 'https://gw.fbr.gov.pk/di_data/v1/di/itemcode',
    uom: 'https://gw.fbr.gov.pk/di_data/v1/di/uom',
    hscodeuom: 'https://gw.fbr.gov.pk/di_data/v1/di/hscodeuom'
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

        // Validate NTN/CNIC formats
        const validateNTNCNIC = (ntnCnic: string): boolean => {
            const clean = ntnCnic.replace(/\D/g, '');
            return clean.length === 7 || clean.length === 13;
        };

        const validationErrors = [];
        if (!validateNTNCNIC(params.invoiceData.sellerNTNCNIC)) {
            validationErrors.push('seller NTN/CNIC');
        }
        if (!validateNTNCNIC(params.invoiceData.buyerNTNCNIC)) {
            validationErrors.push('buyer NTN/CNIC');
        }

        if (validationErrors.length > 0) {
            return {
                success: false,
                message: `Invalid ${validationErrors.join(' and ')} format. Must be 7 digits (NTN) or 13 digits (CNIC).`
            };
        }

        // Format invoice data according to FBR API requirements
        const cleanNTNCNIC = (value: string) => value.replace(/\D/g, '');

        // Ensure all numeric values are properly formatted
        const formatNumber = (value: number | string): number => {
            const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
            return Math.round(num * 100) / 100; // Round to 2 decimal places
        };

        // Format rate as percentage string (e.g., "16%")
        const formatRate = (rate: number | string): string => {
            const num = typeof rate === 'string' ? parseFloat(rate) || 0 : rate;
            return `${num}%`;
        };

        const invoiceData = {
            invoiceType: params.invoiceData.invoiceType || "Sale Invoice",
            invoiceDate: params.invoiceData.invoiceDate,
            sellerNTNCNIC: cleanNTNCNIC(params.invoiceData.sellerNTNCNIC),
            sellerBusinessName: params.invoiceData.sellerBusinessName,
            sellerProvince: params.invoiceData.sellerProvince,
            sellerAddress: params.invoiceData.sellerAddress,
            buyerNTNCNIC: cleanNTNCNIC(params.invoiceData.buyerNTNCNIC),
            buyerBusinessName: params.invoiceData.buyerBusinessName,
            buyerProvince: params.invoiceData.buyerProvince,
            buyerAddress: params.invoiceData.buyerAddress,
            buyerRegistrationType: params.invoiceData.buyerRegistrationType || "Registered",
            invoiceRefNo: params.invoiceData.invoiceRefNo || "",
            scenarioId: params.scenarioId,
            items: params.invoiceData.items.map(({ hsCode, productDescription, rate, uoM, quantity, totalValues, valueSalesExcludingST, fixedNotifiedValueOrRetailPrice, salesTaxApplicable, salesTaxWithheldAtSource, extraTax, furtherTax, sroScheduleNo, fedPayable, discount, saleType, sroItemSerialNo }) => ({
                hsCode: hsCode || "",
                productDescription: productDescription || "",
                rate: formatRate(rate),
                uoM: uoM || "PCS",
                quantity: formatNumber(quantity),
                totalValues: formatNumber(totalValues),
                valueSalesExcludingST: formatNumber(valueSalesExcludingST),
                fixedNotifiedValueOrRetailPrice: formatNumber(fixedNotifiedValueOrRetailPrice),
                salesTaxApplicable: formatNumber(salesTaxApplicable),
                salesTaxWithheldAtSource: formatNumber(salesTaxWithheldAtSource),
                extraTax: formatNumber(extraTax),
                furtherTax: formatNumber(furtherTax),
                sroScheduleNo: sroScheduleNo || "",
                fedPayable: formatNumber(fedPayable),
                discount: formatNumber(discount),
                saleType: saleType || "Goods at standard rate (default)",
                sroItemSerialNo: sroItemSerialNo || ""
            }))
        };

        // Log the exact JSON being sent for debugging
        console.log('FBR API Request Data:', JSON.stringify(invoiceData, null, 2));

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

        // Check if FBR returned an error response
        if (response.data && typeof response.data === 'object' && 'error' in response.data) {
            const errorMessage = typeof response.data.error === 'string' ? response.data.error : 'Unknown FBR error';
            return {
                success: false,
                message: `FBR API Error: ${errorMessage}`,
                data: {
                    fbrResponse: response.data,
                    scenarioId: params.scenarioId,
                    status: 'failed',
                    timestamp: new Date().toISOString(),
                    errorDetails: errorMessage
                }
            };
        }

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

/**
 * Get HS codes from FBR API
 */
export async function getHSCodes(apiKey: string, searchTerm?: string): Promise<ApiResponse<HSCodeSearchResult[]>> {
    try {
        const params = searchTerm ? { search: searchTerm } : {};

        const response = await httpClient.request({
            method: 'GET',
            url: FBR_DATA_ENDPOINTS.itemcode,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            params
        });

        return {
            success: true,
            message: 'HS codes retrieved successfully',
            data: (response.data as HSCodeSearchResult[]) || []
        };
    } catch (error: unknown) {
        console.error('Failed to fetch HS codes:', error);
        const fbrError = error as FbrApiError;
        return {
            success: false,
            message: getFbrErrorMessage(fbrError.response?.status || 500),
            data: []
        };
    }
}

/**
 * Get UOM codes from FBR API
 */
export async function getUOMCodes(apiKey: string): Promise<ApiResponse<UOMCode[]>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: FBR_DATA_ENDPOINTS.uom,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        return {
            success: true,
            message: 'UOM codes retrieved successfully',
            data: (response.data as UOMCode[]) || []
        };
    } catch (error: unknown) {
        console.error('Failed to fetch UOM codes:', error);
        const fbrError = error as FbrApiError;
        return {
            success: false,
            message: getFbrErrorMessage(fbrError.response?.status || 500),
            data: []
        };
    }
}

/**
 * Get HS code UOM mapping from FBR API
 */
export async function getHSCodeUOMMapping(apiKey: string, hsCode: string): Promise<ApiResponse<UOMCode[]>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: FBR_DATA_ENDPOINTS.hscodeuom,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            params: { hs_code: hsCode }
        });

        return {
            success: true,
            message: 'HS code UOM mapping retrieved successfully',
            data: (response.data as UOMCode[]) || []
        };
    } catch (error: unknown) {
        console.error('Failed to fetch HS code UOM mapping:', error);
        const fbrError = error as FbrApiError;
        return {
            success: false,
            message: getFbrErrorMessage(fbrError.response?.status || 500),
            data: []
        };
    }
}

/**
 * Get specific HS code details
 */
export async function getHSCodeDetails(apiKey: string, hsCode: string): Promise<ApiResponse<HSCode | null>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: `${FBR_DATA_ENDPOINTS.itemcode}/${hsCode}`,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        return {
            success: true,
            message: 'HS code details retrieved successfully',
            data: response.data as HSCode
        };
    } catch (error: unknown) {
        console.error('Failed to fetch HS code details:', error);
        const fbrError = error as FbrApiError;
        return {
            success: false,
            message: getFbrErrorMessage(fbrError.response?.status || 500),
            data: null
        };
    }
}

/**
 * Validate UoM against HS code using FBR API
 */
export async function validateUoM(apiKey: string, hsCode: string, selectedUoM: string): Promise<ApiResponse<{
    isValid: boolean;
    recommendedUoM: string;
    validUoMs: string[];
    severity: 'warning' | 'error';
    message?: string;
    isCriticalMismatch?: boolean;
}>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: FBR_DATA_ENDPOINTS.hscodeuom,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            params: { hscode: hsCode }
        });

        const data = response.data as { validUOMs: string[]; recommendedUOM: string; criticalMismatch?: boolean };

        const isValid = data.validUOMs.includes(selectedUoM);
        const severity = data.criticalMismatch ? UoMValidationSeverity.ERROR : UoMValidationSeverity.WARNING;

        let message: string | undefined;
        if (!isValid) {
            if (data.criticalMismatch) {
                message = `Critical mismatch: ${selectedUoM} is not valid for HS Code ${hsCode}. FBR will reject this invoice.`;
            } else {
                message = `Recommended UoM for this HS Code: ${data.recommendedUOM}`;
            }
        }

        return {
            success: true,
            message: 'UoM validation completed',
            data: {
                isValid,
                recommendedUoM: data.recommendedUOM,
                validUoMs: data.validUOMs,
                severity,
                ...(message && { message }),
                ...(data.criticalMismatch && { isCriticalMismatch: data.criticalMismatch })
            }
        };
    } catch (error: unknown) {
        console.error('Failed to validate UoM:', error);
        const fbrError = error as FbrApiError;
        return {
            success: false,
            message: getFbrErrorMessage(fbrError.response?.status || 500),
            data: {
                isValid: true, // Default to valid if API fails
                recommendedUoM: selectedUoM,
                validUoMs: [selectedUoM],
                severity: 'warning',
                message: 'Unable to validate UoM - using selected value'
            }
        };
    }
}
