
import type { ApiResponse } from './types';
import { HttpClientApi } from './http-client';
import { saveFbrCredentials } from '../supabase/fbr';
import type { FbrSandboxTestRequest, FbrSandboxTestResponse, SaleTypeToRateResponse } from '@/shared/types/fbr';
import type { HSCode, HSCodeSearchResult, UOMCode } from '@/shared/types/invoice';
import { FBR_SCENARIO_STATUS } from '@/shared/constants/fbr';

interface FbrApiError {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
}

const ENV_TEST_ENDPOINTS = {
    sandbox: 'https://gw.fbr.gov.pk/pdi/v1/itemdesccode',
    production: 'https://gw.fbr.gov.pk/pdi/v1/itemdesccode'
} as const;

const FBR_DATA_ENDPOINTS = {
    itemcode: 'https://gw.fbr.gov.pk/pdi/v1/itemdesccode',
    uom: 'https://gw.fbr.gov.pk/pdi/v1/uom',
    hs_uom: 'https://gw.fbr.gov.pk/pdi/v2/HS_UOM'
} as const;

const httpClient = new HttpClientApi();

const getFbrErrorMessage = (status: number): string => {
    const messages = {
        401: 'Invalid API key - Please check your credentials',
        403: 'API key not authorized - Contact FBR for access',
        404: 'FBR service endpoint not found',
        405: 'Method not allowed - CORS issue detected',
        429: 'Rate limit exceeded - Please try again later',
        500: 'FBR server error - Please try again later',
        502: 'FBR service temporarily unavailable',
        503: 'FBR service temporarily unavailable',
        504: 'FBR service temporarily unavailable'
    };
    return messages[status as keyof typeof messages] || `Unexpected error (${status})`;
};



export interface TestConnectionRequest {
    apiKey: string;
    environment: 'sandbox' | 'production';
    userId?: string | undefined;
}

export interface SaveCredentialsRequest {
    sandboxKey?: string;
    productionKey?: string;
    userId: string;
}

export async function testFbrConnection(params: TestConnectionRequest): Promise<ApiResponse<unknown>> {
    try {
        if (!params.userId) {
            return {
                success: false,
                message: 'User ID is required for testing connection',
                data: { status: 'failed' }
            };
        }

        console.log('FBR connection test request:', params);

        // First, save the API key being tested
        try {
            const savePayload = {
                userId: params.userId,
                ...(params.environment === 'sandbox' ? { sandboxKey: params.apiKey } : {}),
                ...(params.environment === 'production' ? { productionKey: params.apiKey } : {})
            };
            await saveFbrCredentials(savePayload.userId, savePayload.sandboxKey, savePayload.productionKey);
        } catch (saveError) {
            console.warn('Failed to save API key before testing:', saveError);
            // Continue with the test even if saving fails
        }

        // Test the FBR API connection directly
        const testEndpoint = 'https://gw.fbr.gov.pk/pdi/v1/itemdesccode';

        try {
            const response = await httpClient.request({
                method: 'GET',
                url: testEndpoint,
                headers: {
                    'Authorization': `Bearer ${params.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const isSuccess = response.success;
            const status = isSuccess ? 'connected' : 'failed';

            // Update the connection status in the database
            const { updateFbrConnectionStatus } = await import('../supabase/fbr');
            const configStatus = await updateFbrConnectionStatus(params.userId, params.environment, status);

            if (isSuccess) {
                return {
                    success: true,
                    message: `FBR ${params.environment} connection successful`,
                    data: {
                        status: 'connected',
                        configStatus
                    }
                };
            } else {
                return {
                    success: false,
                    message: `FBR ${params.environment} connection failed`,
                    data: {
                        status: 'failed',
                        configStatus
                    }
                };
            }
        } catch (error) {
            console.error('Error testing FBR connection:', error);

            // Update status to failed
            const { updateFbrConnectionStatus } = await import('../supabase/fbr');
            const configStatus = await updateFbrConnectionStatus(params.userId, params.environment, 'failed');

            return {
                success: false,
                message: `FBR ${params.environment} connection failed: Network error`,
                data: {
                    status: 'failed',
                    configStatus
                }
            };
        }
    } catch (error) {
        console.error('Error in testFbrConnection:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error while testing connection',
            data: { status: 'failed' }
        };
    }
}

export async function saveFbrApiCredentials(params: SaveCredentialsRequest): Promise<ApiResponse<unknown>> {
    try {
        await saveFbrCredentials(params.userId, params.sandboxKey, params.productionKey);
        return { success: true, message: 'FBR API credentials saved successfully', data: null };
    } catch (error) {
        console.error('Error saving FBR credentials:', error);
        return { success: false, message: 'Failed to save FBR API credentials', data: null };
    }
}

export async function submitSandboxTestInvoice(params: FbrSandboxTestRequest): Promise<FbrSandboxTestResponse> {
    try {
        const { getFbrConfigStatus } = await import('../supabase/fbr');
        const config = await getFbrConfigStatus(params.userId);

        if (!config.sandbox_api_key) {
            return { success: false, message: 'Sandbox API key not configured' };
        }

        // Validate required fields
        const { invoiceData } = params;
        if (!invoiceData.invoiceType || !invoiceData.buyerNTNCNIC || !invoiceData.items?.length) {
            return { success: false, message: 'Invalid invoice data - missing required fields' };
        }

        // Validate NTN/CNIC formats
        const validateNTNCNIC = (ntnCnic: string) => {
            const clean = ntnCnic.replace(/\D/g, '');
            return clean.length === 7 || clean.length === 13;
        };

        const validationErrors = [];
        if (!validateNTNCNIC(invoiceData.sellerNTNCNIC)) validationErrors.push('seller NTN/CNIC');
        if (!validateNTNCNIC(invoiceData.buyerNTNCNIC)) validationErrors.push('buyer NTN/CNIC');

        if (validationErrors.length > 0) {
            return { success: false, message: `Invalid ${validationErrors.join(' and ')} format` };
        }

        // Format data
        const cleanNTNCNIC = (value: string) => value.replace(/\D/g, '');
        const formatNumber = (value: number | string, isQuantity: boolean = false) => {
            const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
            return isQuantity ? Math.round(numValue * 1000) / 1000 : Math.round(numValue * 100) / 100;
        };
        const formatRate = (rate: number | string) => `${typeof rate === 'string' ? parseFloat(rate) || 0 : rate}%`;

        const formattedInvoiceData = {
            invoiceType: invoiceData.invoiceType || "Sale Invoice",
            invoiceDate: invoiceData.invoiceDate,
            sellerNTNCNIC: cleanNTNCNIC(invoiceData.sellerNTNCNIC),
            sellerBusinessName: invoiceData.sellerBusinessName,
            sellerProvince: invoiceData.sellerProvince,
            sellerAddress: invoiceData.sellerAddress,
            buyerNTNCNIC: cleanNTNCNIC(invoiceData.buyerNTNCNIC),
            buyerBusinessName: invoiceData.buyerBusinessName,
            buyerProvince: invoiceData.buyerProvince,
            buyerAddress: invoiceData.buyerAddress,
            buyerRegistrationType: invoiceData.buyerRegistrationType || "Registered",
            invoiceRefNo: invoiceData.invoiceRefNo || "",
            scenarioId: params.scenarioId,
            items: invoiceData.items.map(item => ({
                hsCode: item.hsCode || "",
                productDescription: item.productDescription || "",
                rate: formatRate(item.rate),
                uoM: item.uoM || "PCS",
                quantity: formatNumber(item.quantity, true), // Quantity supports 3 decimal places
                totalValues: formatNumber(item.totalValues),
                valueSalesExcludingST: formatNumber(item.valueSalesExcludingST),
                fixedNotifiedValueOrRetailPrice: formatNumber(item.fixedNotifiedValueOrRetailPrice),
                salesTaxApplicable: formatNumber(item.salesTaxApplicable),
                salesTaxWithheldAtSource: formatNumber(item.salesTaxWithheldAtSource),
                extraTax: formatNumber(item.extraTax),
                furtherTax: formatNumber(item.furtherTax),
                sroScheduleNo: item.sroScheduleNo || "",
                fedPayable: formatNumber(item.fedPayable),
                discount: formatNumber(item.discount),
                saleType: item.saleType || "Goods at standard rate (default)",
                sroItemSerialNo: item.sroItemSerialNo || ""
            }))
        };

        const response = await httpClient.request({
            method: 'POST',
            url: ENV_TEST_ENDPOINTS.sandbox,
            headers: {
                'Authorization': `Bearer ${config.sandbox_api_key}`,
                'Content-Type': 'application/json',
            },
            data: formattedInvoiceData
        });

        if (response.data && typeof response.data === 'object' && 'error' in response.data) {
            const errorMessage = typeof response.data.error === 'string' ? response.data.error : 'Unknown FBR error';
            return { success: false, message: `FBR API Error: ${errorMessage}` };
        }

        return {
            success: true,
            message: 'Test invoice submitted successfully to FBR sandbox',
            data: { fbrResponse: response.data, scenarioId: params.scenarioId, status: FBR_SCENARIO_STATUS.COMPLETED }
        };
    } catch (error: unknown) {
        console.error('Error submitting sandbox test invoice:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit test invoice';
        return { success: false, message: errorMessage };
    }
}

export async function getHSCodes(apiKey: string, searchTerm?: string): Promise<ApiResponse<HSCodeSearchResult[]>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: FBR_DATA_ENDPOINTS.itemcode,
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            params: searchTerm ? { search: searchTerm } : {}
        });
        return { success: true, message: 'HS codes retrieved successfully', data: (response.data as HSCodeSearchResult[]) || [] };
    } catch (error) {
        const fbrError = error as FbrApiError;
        return { success: false, message: getFbrErrorMessage(fbrError.response?.status || 500), data: [] };
    }
}

export async function getAllHSCodes(apiKey: string): Promise<ApiResponse<HSCodeSearchResult[]>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: FBR_DATA_ENDPOINTS.itemcode,
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
        });
        return { success: true, message: 'All HS codes retrieved successfully', data: (response.data as HSCodeSearchResult[]) || [] };
    } catch (error) {
        const fbrError = error as FbrApiError;
        return { success: false, message: getFbrErrorMessage(fbrError.response?.status || 500), data: [] };
    }
}

export async function getUOMCodes(apiKey: string): Promise<ApiResponse<UOMCode[]>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: FBR_DATA_ENDPOINTS.uom,
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
        });
        return { success: true, message: 'UOM codes retrieved successfully', data: (response.data as UOMCode[]) || [] };
    } catch (error) {
        const fbrError = error as FbrApiError;
        return { success: false, message: getFbrErrorMessage(fbrError.response?.status || 500), data: [] };
    }
}

export async function getHSCodeUOMMapping(apiKey: string, hsCode: string): Promise<ApiResponse<UOMCode[]>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: FBR_DATA_ENDPOINTS.hs_uom,
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            params: { hs_code: hsCode, annexure_id: 3 }
        });
        return { success: true, message: 'HS code UOM mapping retrieved successfully', data: (response.data as UOMCode[]) || [] };
    } catch (error) {
        const fbrError = error as FbrApiError;
        return { success: false, message: getFbrErrorMessage(fbrError.response?.status || 500), data: [] };
    }
}

export async function getHSCodeDetails(apiKey: string, hsCode: string): Promise<ApiResponse<HSCode | null>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: `${FBR_DATA_ENDPOINTS.itemcode}/${hsCode}`,
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
        });
        return { success: true, message: 'HS code details retrieved successfully', data: response.data as HSCode };
    } catch (error) {
        const fbrError = error as FbrApiError;
        return { success: false, message: getFbrErrorMessage(fbrError.response?.status || 500), data: null };
    }
}

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
            url: FBR_DATA_ENDPOINTS.hs_uom,
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            params: { hs_code: hsCode, annexure_id: 3 }
        });

        const data = response.data as { validUOMs?: string[]; recommendedUOM?: string };

        // Simple validation - if response has validUOMs array, check if selectedUoM is in it
        if (data?.validUOMs && Array.isArray(data.validUOMs)) {
            const isValid = data.validUOMs.includes(selectedUoM);
            return {
                success: true,
                message: 'UoM validation completed',
                data: {
                    isValid,
                    recommendedUoM: data.recommendedUOM || selectedUoM,
                    validUoMs: data.validUOMs,
                    severity: isValid ? 'warning' : 'error',
                    ...(isValid ? {} : { message: `Invalid UoM for HS Code ${hsCode}` })
                }
            };
        }

        // Fallback - assume valid if we can't validate
        return {
            success: true,
            message: 'UoM validation skipped',
            data: {
                isValid: true,
                recommendedUoM: selectedUoM,
                validUoMs: [selectedUoM],
                severity: 'warning',
                message: 'UoM validation not available'
            }
        };

    } catch {
        // Simple error handling - just return valid
        return {
            success: true,
            message: 'UoM validation failed',
            data: {
                isValid: true,
                recommendedUoM: selectedUoM,
                validUoMs: [selectedUoM],
                severity: 'warning',
                message: 'UoM validation error - using selected value'
            }
        };
    }
}

/**
 * Get tax rates from FBR SaleTypeToRate API
 * @param apiKey - FBR API key for authentication
 * @param date - Invoice date in YYYY-MM-DD format (defaults to today)
 * @param transTypeId - Type of transaction (18 = standard goods sale)
 * @param originationSupplier - Province ID of seller (defaults to 1)
 * @returns Promise with available tax rates for the given parameters
 */
export async function getSaleTypeToRate(
    apiKey: string,
    date: string = new Date().toISOString().split('T')[0], // Invoice date
    transTypeId: number = 18, // Type of transaction (e.g., standard goods sale)
    originationSupplier: number = 1 // Province ID of seller
): Promise<ApiResponse<SaleTypeToRateResponse[]>> {
    try {
        const response = await httpClient.request({
            method: 'GET',
            url: 'https://gw.fbr.gov.pk/pdi/v1/SaleTypeToRate',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            params: {
                date,
                transTypeId,
                originationSupplier
            }
        });

        return {
            success: true,
            message: 'Sale type to rate data retrieved successfully',
            data: (response.data as SaleTypeToRateResponse[]) || []
        };
    } catch (error) {
        const fbrError = error as FbrApiError;
        return {
            success: false,
            message: getFbrErrorMessage(fbrError.response?.status || 500),
            data: []
        };
    }
}
