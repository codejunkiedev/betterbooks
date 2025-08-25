
import type { ApiResponse } from './types';
import { HttpClientApi } from './http-client';
import { updateFbrConnectionStatus, saveFbrCredentials } from '../supabase/fbr';
import { FBR_API_STATUS } from '@/shared/constants/fbr';
import { UoMValidationSeverity } from '@/shared/constants/uom';
import type { FbrSandboxTestRequest, FbrSandboxTestResponse } from '@/shared/types/fbr';
import type { HSCode, HSCodeSearchResult, UOMCode } from '@/shared/types/invoice';

interface FbrApiError {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
}

const ENV_TEST_ENDPOINTS = {
    sandbox: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb',
    production: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata'
} as const;

const FBR_DATA_ENDPOINTS = {
    itemcode: 'https://gw.fbr.gov.pk/di_data/v1/di/itemcode',
    uom: 'https://gw.fbr.gov.pk/di_data/v1/di/uom',
    hscodeuom: 'https://gw.fbr.gov.pk/di_data/v1/di/hscodeuom'
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

const createFallbackStatus = (environment: string, status: string) => ({
    sandbox_status: environment === 'sandbox' ? status : FBR_API_STATUS.NOT_CONFIGURED,
    production_status: environment === 'production' ? status : FBR_API_STATUS.NOT_CONFIGURED,
    last_sandbox_test: environment === 'sandbox' ? new Date().toISOString() : null,
    last_production_test: environment === 'production' ? new Date().toISOString() : null
});

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

export async function testFbrConnection(params: TestConnectionRequest): Promise<ApiResponse<unknown>> {
    try {
        await httpClient.request({
            method: 'GET',
            url: ENV_TEST_ENDPOINTS[params.environment],
            headers: {
                'Authorization': `Bearer ${params.apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        let updatedStatus = null;
        if (params.userId) {
            try {
                updatedStatus = await updateFbrConnectionStatus(params.userId, params.environment, FBR_API_STATUS.CONNECTED);
            } catch (err) {
                console.error('Failed to update connection status:', err);
                updatedStatus = createFallbackStatus(params.environment, FBR_API_STATUS.CONNECTED);
            }
        }

        return {
            success: true,
            message: 'Connection Successful - FBR API is accessible',
            data: { status: 'connected', configStatus: updatedStatus }
        };
    } catch (error) {
        let updatedStatus = null;
        if (params.userId) {
            try {
                updatedStatus = await updateFbrConnectionStatus(params.userId, params.environment, FBR_API_STATUS.FAILED);
            } catch (err) {
                console.error('Failed to update connection status:', err);
                updatedStatus = createFallbackStatus(params.environment, FBR_API_STATUS.FAILED);
            }
        }

        if (error instanceof Error) {
            const status = (error as { status?: number; response?: { status?: number } }).status || (error as { status?: number; response?: { status?: number } }).response?.status;
            const message = status ? getFbrErrorMessage(status) :
                error.message.includes('CORS') ? 'CORS error - FBR API does not allow browser requests' :
                    error.message;

            return {
                success: false,
                message,
                data: { status: 'failed', configStatus: updatedStatus, originalError: error.message }
            };
        }

        return {
            success: false,
            message: 'Unknown error occurred',
            data: { status: 'failed', configStatus: updatedStatus }
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
        const formatNumber = (value: number | string) => Math.round((typeof value === 'string' ? parseFloat(value) || 0 : value) * 100) / 100;
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
                quantity: formatNumber(item.quantity),
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
            data: { fbrResponse: response.data, scenarioId: params.scenarioId, status: 'completed' }
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
            url: FBR_DATA_ENDPOINTS.hscodeuom,
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            params: { hs_code: hsCode }
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
            url: FBR_DATA_ENDPOINTS.hscodeuom,
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            params: { hscode: hsCode }
        });

        const data = response.data as { validUOMs: string[]; recommendedUOM: string; criticalMismatch?: boolean };
        const isValid = data.validUOMs.includes(selectedUoM);
        const severity = data.criticalMismatch ? UoMValidationSeverity.ERROR : UoMValidationSeverity.WARNING;

        let message: string | undefined;
        if (!isValid) {
            message = data.criticalMismatch
                ? `Critical mismatch: ${selectedUoM} is not valid for HS Code ${hsCode}`
                : `Recommended UoM for this HS Code: ${data.recommendedUOM}`;
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
    } catch (error) {
        const fbrError = error as FbrApiError;
        return {
            success: false,
            message: getFbrErrorMessage(fbrError.response?.status || 500),
            data: {
                isValid: true,
                recommendedUoM: selectedUoM,
                validUoMs: [selectedUoM],
                severity: 'warning',
                message: 'Unable to validate UoM - using selected value'
            }
        };
    }
}
