import { HttpClientApi } from './http-client';
import { saveInvoice } from '../supabase/invoice';
import { ScenarioInvoiceFormData } from '@/shared/types/invoice';

// FBR API endpoints
const FBR_ENDPOINTS = {
    sandbox: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb',
    production: 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata'
} as const;

// HTTP client instance
const httpClient = new HttpClientApi();

export interface FBRSubmissionRequest {
    userId: string;
    invoiceData: ScenarioInvoiceFormData;
    environment: 'sandbox' | 'production';
    apiKey: string;
    maxRetries?: number;
    timeout?: number;
}

export interface FBRSubmissionResponse {
    success: boolean;
    data?: {
        fbrReference?: string;
        transactionId?: string;
        response?: Record<string, unknown>;
        invoiceId?: string | undefined;
    };
    error?: string;
    attempt?: number;
    isTimeout?: boolean;
}

export interface FBRInvoiceData {
    invoiceType: string;
    invoiceDate: string;
    sellerNTNCNIC: string;
    sellerBusinessName: string;
    sellerProvince: string;
    sellerAddress: string;
    buyerNTNCNIC: string;
    buyerBusinessName: string;
    buyerProvince: string;
    buyerAddress: string;
    buyerRegistrationType: string;
    invoiceRefNo: string;
    scenarioId?: string;
    items: Array<{
        itemCode: string;
        itemName: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
        salesTax: number;
        unitOfMeasurement: string;
        taxRate: number;
        valueSalesExcludingST: number;
        fixedNotifiedValue: number;
        retailPrice: number;
        invoiceNote?: string | undefined;
    }>;
    totalAmount: number;
    totalSalesTax: number;
    totalValueSalesExcludingST: number;
}

/**
 * Format invoice data according to FBR API requirements
 */
function formatInvoiceDataForFBR(invoiceData: ScenarioInvoiceFormData): FBRInvoiceData {
    // Clean NTN/CNIC by removing non-digits
    const cleanNTNCNIC = (value: string) => value.replace(/\D/g, '');

    // Format number to 2 decimal places
    const formatNumber = (value: number | string): number => {
        const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
        return Math.round(num * 100) / 100;
    };

    // Calculate totals
    const totalSalesTax = invoiceData.items.reduce((sum, item) => sum + (item.sales_tax || 0), 0);
    const totalValueSalesExcludingST = invoiceData.items.reduce((sum, item) => sum + (item.value_sales_excluding_st || 0), 0);

    return {
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
        scenarioId: invoiceData.scenarioId,
        items: invoiceData.items.map(item => ({
            itemCode: item.hs_code,
            itemName: item.item_name,
            quantity: formatNumber(item.quantity),
            unitPrice: formatNumber(item.unit_price),
            totalAmount: formatNumber(item.total_amount),
            salesTax: formatNumber(item.sales_tax || 0),
            unitOfMeasurement: item.uom_code,
            taxRate: formatNumber(item.tax_rate),
            valueSalesExcludingST: formatNumber(item.value_sales_excluding_st),
            fixedNotifiedValue: formatNumber(item.fixed_notified_value || 0),
            retailPrice: formatNumber(item.retail_price || 0),
            invoiceNote: item.invoice_note || undefined
        })),
        totalAmount: formatNumber(invoiceData.totalAmount),
        totalSalesTax: formatNumber(totalSalesTax),
        totalValueSalesExcludingST: formatNumber(totalValueSalesExcludingST)
    };
}

/**
 * Validate invoice data before submission
 */
function validateInvoiceData(invoiceData: ScenarioInvoiceFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!invoiceData.invoiceType) errors.push('Invoice type is required');
    if (!invoiceData.invoiceDate) errors.push('Invoice date is required');
    if (!invoiceData.sellerNTNCNIC) errors.push('Seller NTN/CNIC is required');
    if (!invoiceData.sellerBusinessName) errors.push('Seller business name is required');
    if (!invoiceData.buyerNTNCNIC) errors.push('Buyer NTN/CNIC is required');
    if (!invoiceData.buyerBusinessName) errors.push('Buyer business name is required');
    if (!invoiceData.items || invoiceData.items.length === 0) errors.push('At least one item is required');

    // NTN/CNIC format validation
    const validateNTNCNIC = (ntnCnic: string): boolean => {
        const clean = ntnCnic.replace(/\D/g, '');
        return clean.length === 7 || clean.length === 13;
    };

    if (!validateNTNCNIC(invoiceData.sellerNTNCNIC)) {
        errors.push('Seller NTN/CNIC must be 7 digits (NTN) or 13 digits (CNIC)');
    }
    if (!validateNTNCNIC(invoiceData.buyerNTNCNIC)) {
        errors.push('Buyer NTN/CNIC must be 7 digits (NTN) or 13 digits (CNIC)');
    }

    // Items validation
    if (invoiceData.items) {
        invoiceData.items.forEach((item, index) => {
            if (!item.hs_code) errors.push(`Item ${index + 1}: HS Code is required`);
            if (!item.item_name) errors.push(`Item ${index + 1}: Item name is required`);
            if (item.quantity <= 0) errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
            if (item.unit_price <= 0) errors.push(`Item ${index + 1}: Unit price must be greater than 0`);
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get user-friendly error message from FBR response
 */
function getFBRErrorMessage(status: number, responseData?: Record<string, unknown>): string {
    switch (status) {
        case 400:
            return (responseData?.message as string) || 'Invalid request data - Please check your invoice details';
        case 401:
            return 'Invalid API key - Please check your FBR credentials';
        case 403:
            return 'API key not authorized - Contact FBR for access';
        case 404:
            return 'FBR service endpoint not found';
        case 429:
            return 'Rate limit exceeded - Please try again later';
        case 500:
            return 'FBR server error - Please try again later';
        case 502:
        case 503:
        case 504:
            return 'FBR service temporarily unavailable';
        default:
            return (responseData?.message as string) || `Unexpected error (${status})`;
    }
}

/**
 * Submit invoice to FBR with retry logic and timeout handling
 */
export async function submitInvoiceToFBR(params: FBRSubmissionRequest): Promise<FBRSubmissionResponse> {
    const { userId, invoiceData, environment, apiKey, maxRetries = 3, timeout = 90000 } = params;

    // Validate invoice data
    const validation = validateInvoiceData(invoiceData);
    if (!validation.isValid) {
        return {
            success: false,
            error: `Validation failed: ${validation.errors.join(', ')}`,
            attempt: 0
        };
    }

    // Format invoice data for FBR
    const fbrInvoiceData = formatInvoiceDataForFBR(invoiceData);
    const endpoint = FBR_ENDPOINTS[environment];

    console.log('FBR Submission Request:', {
        endpoint,
        environment,
        invoiceData: fbrInvoiceData
    });

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`FBR Submission Attempt ${attempt}/${maxRetries}`);

            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), timeout);
            });

            // Create submission promise
            const submissionPromise = httpClient.request({
                method: 'POST',
                url: endpoint,
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                data: fbrInvoiceData
            });

            // Race between submission and timeout
            const response = await Promise.race([submissionPromise, timeoutPromise]);

            // Check if FBR returned an error response
            if (response.data && typeof response.data === 'object') {
                const responseData = response.data as Record<string, unknown>;

                if ('error' in responseData) {
                    const errorMessage = typeof responseData.error === 'string'
                        ? responseData.error
                        : 'Unknown FBR error';

                    return {
                        success: false,
                        error: `FBR API Error: ${errorMessage}`,
                        attempt,
                        data: {
                            response: responseData
                        }
                    };
                }

                // Check for success indicators in response
                const hasSuccessIndicator = responseData.transactionId ||
                    responseData.referenceNumber ||
                    responseData.status === 'success' ||
                    responseData.success === true;

                if (hasSuccessIndicator) {
                    // Save invoice to database
                    const saveResult = await saveInvoice(userId, invoiceData, responseData);

                    if (!saveResult.success) {
                        console.error('Failed to save invoice:', saveResult.error);
                        return {
                            success: false,
                            error: 'Invoice submitted to FBR but failed to save locally',
                            attempt,
                            data: {
                                response: responseData
                            }
                        };
                    }

                    return {
                        success: true,
                        data: {
                            fbrReference: responseData.transactionId as string || responseData.referenceNumber as string,
                            transactionId: responseData.transactionId as string,
                            response: responseData,
                            invoiceId: saveResult.invoiceId
                        },
                        attempt
                    };
                }
            }

            // If we reach here, the request was successful but no clear success indicator
            return {
                success: true,
                data: {
                    response: response.data as Record<string, unknown>
                },
                attempt
            };

        } catch (error: unknown) {
            console.error(`FBR Submission Attempt ${attempt} failed:`, error);

            let errorMessage = 'Failed to submit invoice to FBR';
            let isTimeout = false;

            // Handle different types of errors
            if (error instanceof Error && error.message === 'Request timeout') {
                errorMessage = 'Request timeout - FBR server took too long to respond';
                isTimeout = true;
            } else if (error && typeof error === 'object' && 'response' in error) {
                const errorObj = error as { response: { status: number; data: unknown } };
                const status = errorObj.response.status;
                errorMessage = getFBRErrorMessage(status, errorObj.response.data as Record<string, unknown>);
            } else if (error && typeof error === 'object' && 'request' in error) {
                errorMessage = 'No response received from FBR - Please check your internet connection';
            } else if (error instanceof Error && error.message) {
                errorMessage = error.message;
            }

            // If this is the last attempt, return error
            if (attempt === maxRetries) {
                return {
                    success: false,
                    error: errorMessage,
                    attempt,
                    isTimeout
                };
            }

            // Wait before retrying with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return {
        success: false,
        error: 'Maximum retry attempts exceeded',
        attempt: maxRetries
    };
}

/**
 * Log submission attempt to database
 */
export async function logSubmissionAttempt(
    userId: string,
    invoiceId: string,
    attempt: number,
    status: 'success' | 'failed',
    response: Record<string, unknown>,
    error?: string
): Promise<void> {
    try {
        // This would typically go to a submission_logs table
        // For now, we'll just log to console
        console.log('Submission Log:', {
            userId,
            invoiceId,
            attempt,
            status,
            response,
            error,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to log submission attempt:', error);
    }
}

/**
 * Get submission statistics for dashboard
 */
export async function getSubmissionStats(): Promise<{
    totalSubmissions: number;
    successfulSubmissions: number;
    failedSubmissions: number;
    successRate: number;
}> {
    try {
        // This would typically query the database
        // For now, return mock data
        return {
            totalSubmissions: 0,
            successfulSubmissions: 0,
            failedSubmissions: 0,
            successRate: 0
        };
    } catch (error) {
        console.error('Failed to get submission stats:', error);
        return {
            totalSubmissions: 0,
            successfulSubmissions: 0,
            failedSubmissions: 0,
            successRate: 0
        };
    }
}
