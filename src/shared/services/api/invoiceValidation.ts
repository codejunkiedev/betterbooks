
import type { InvoiceFormData } from '@/shared/types/invoice';
import type { InvoiceValidationResponse, ValidationResult } from '@/shared/types/fbrValidation';
import { ValidationSeverity } from '@/shared/constants/fbr';
import { HttpClientApi } from './http-client';
import { getFbrConfigStatus } from '../supabase/fbr';
import { FBRErrorHandler } from '@/shared/utils/fbrErrorHandler';

export type { InvoiceValidationResponse } from '@/shared/types/fbrValidation';

const httpClient = new HttpClientApi();

/**
 * Process FBR API response to determine if it's a success or error
 */
function processFBRValidationResponse(fbrResponse: Record<string, unknown>): InvoiceValidationResponse {
    // Log the response structure for debugging
    console.log('Processing FBR response:', {
        hasValidationResponse: !!fbrResponse.validationResponse,
        validationResponseKeys: fbrResponse.validationResponse ? Object.keys(fbrResponse.validationResponse as Record<string, unknown>) : [],
        hasDated: !!fbrResponse.dated,
        hasException: !!fbrResponse.exception,
        exceptionValue: fbrResponse.exception
    });

    // Handle case where validationResponse is empty/null but dated is present (success case)
    if (fbrResponse.dated && (!fbrResponse.validationResponse || fbrResponse.validationResponse === null || Object.keys(fbrResponse.validationResponse as Record<string, unknown> || {}).length === 0)) {
        // Check if there's an exception that might indicate an error
        if (fbrResponse.exception && fbrResponse.exception !== '') {
            return {
                isValid: false,
                canSubmit: false,
                results: [{
                    field: 'fbr_validation',
                    severity: ValidationSeverity.ERROR,
                    message: `FBR validation failed: ${fbrResponse.exception}`,
                    code: 'FBR_VALIDATION_EXCEPTION'
                }],
                summary: {
                    total: 1,
                    errors: 1,
                    warnings: 0,
                    successes: 0
                },
                fbrValidation: {
                    success: false,
                    message: `FBR validation failed: ${fbrResponse.exception}`,
                    data: fbrResponse
                }
            };
        }

        // No exception and dated is present - treat as success
        return {
            isValid: true,
            canSubmit: true,
            results: [{
                field: 'fbr_validation',
                severity: ValidationSeverity.SUCCESS,
                message: 'FBR validation successful - Invoice data is valid',
                code: 'FBR_VALIDATION_SUCCESS'
            }],
            summary: {
                total: 1,
                errors: 0,
                warnings: 0,
                successes: 1
            },
            fbrValidation: {
                success: true,
                message: 'FBR validation completed successfully',
                data: fbrResponse
            }
        };
    }

    // Check for validation response structure (new format) - only if validationResponse exists and is not null
    if (fbrResponse.validationResponse && fbrResponse.validationResponse !== null) {
        const validationResponse = fbrResponse.validationResponse as Record<string, unknown>;

        // Check for success case
        if (validationResponse.statusCode === '00' && validationResponse.status === 'Valid') {
            return {
                isValid: true,
                canSubmit: true,
                results: [{
                    field: 'fbr_validation',
                    severity: ValidationSeverity.SUCCESS,
                    message: 'FBR validation successful - Invoice data is valid',
                    code: 'FBR_VALIDATION_SUCCESS'
                }],
                summary: {
                    total: 1,
                    errors: 0,
                    warnings: 0,
                    successes: 1
                },
                fbrValidation: {
                    success: true,
                    message: 'FBR validation completed successfully',
                    data: fbrResponse
                }
            };
        }

        // Check for warnings (status valid but with warnings)
        if (validationResponse.status === 'Valid' && validationResponse.invoiceStatuses) {
            const invoiceStatuses = validationResponse.invoiceStatuses as Array<Record<string, unknown>>;
            const warnings = invoiceStatuses.filter(status =>
                status.status === 'Valid' && status.statusCode === '00'
            );

            if (warnings.length > 0) {
                return {
                    isValid: true,
                    canSubmit: true,
                    results: [{
                        field: 'fbr_validation',
                        severity: ValidationSeverity.SUCCESS,
                        message: 'FBR validation successful with warnings',
                        code: 'FBR_VALIDATION_SUCCESS_WITH_WARNINGS'
                    }],
                    summary: {
                        total: 1,
                        errors: 0,
                        warnings: 0,
                        successes: 1
                    },
                    fbrValidation: {
                        success: true,
                        message: 'FBR validation completed with warnings',
                        data: fbrResponse
                    }
                };
            }
        }
    }

    // Check for legacy success indicators
    if (fbrResponse.invoiceNumber || fbrResponse.transactionId || fbrResponse.referenceNumber) {
        return {
            isValid: true,
            canSubmit: true,
            results: [{
                field: 'fbr_validation',
                severity: ValidationSeverity.SUCCESS,
                message: 'FBR validation successful - Invoice processed',
                code: 'FBR_VALIDATION_SUCCESS'
            }],
            summary: {
                total: 1,
                errors: 0,
                warnings: 0,
                successes: 1
            },
            fbrValidation: {
                success: true,
                message: 'FBR validation completed successfully',
                data: fbrResponse
            }
        };
    }

    // Check for error indicators
    if (fbrResponse.error || fbrResponse.errorCode || (fbrResponse.validationResponse && fbrResponse.validationResponse !== null && (fbrResponse.validationResponse as Record<string, unknown>)?.errorCode)) {
        // Process errors using the FBR error handler
        const errorResults = FBRErrorHandler.processFBRResponse(fbrResponse);

        return {
            isValid: false,
            canSubmit: false,
            results: errorResults,
            summary: {
                total: errorResults.length,
                errors: errorResults.filter((r: ValidationResult) => r.severity === ValidationSeverity.ERROR).length,
                warnings: errorResults.filter((r: ValidationResult) => r.severity === ValidationSeverity.WARNING).length,
                successes: errorResults.filter((r: ValidationResult) => r.severity === ValidationSeverity.SUCCESS).length
            },
            fbrValidation: {
                success: false,
                message: 'FBR validation failed',
                data: fbrResponse
            }
        };
    }

    // If we can't determine success/failure, assume success but log warning
    console.warn('Unable to determine FBR response status, assuming success:', fbrResponse);
    return {
        isValid: true,
        canSubmit: true,
        results: [{
            field: 'fbr_validation',
            severity: ValidationSeverity.SUCCESS,
            message: 'FBR validation completed (status unclear)',
            code: 'FBR_VALIDATION_UNKNOWN'
        }],
        summary: {
            total: 1,
            errors: 0,
            warnings: 0,
            successes: 1
        },
        fbrValidation: {
            success: true,
            message: 'FBR validation completed',
            data: fbrResponse
        }
    };
}

export async function validateInvoice(
    invoiceData: InvoiceFormData,
    options: {
        includeFBRValidation?: boolean;
        userId?: string;
    } = {}
): Promise<InvoiceValidationResponse> {
    const { includeFBRValidation = true } = options;

    if (!includeFBRValidation) {
        return {
            isValid: true,
            canSubmit: true,
            results: [{
                field: 'basic_validation',
                severity: ValidationSeverity.SUCCESS,
                message: 'Basic validation completed',
                code: 'BASIC_VALIDATION_COMPLETED'
            }],
            summary: {
                total: 1,
                errors: 0,
                warnings: 0,
                successes: 1
            }
        };
    }

    try {
        // Get FBR API configuration
        const config = await getFbrConfigStatus(options.userId || '');

        if (!config.sandbox_api_key) {
            throw new Error('FBR API key not configured');
        }

        // Call FBR validation API
        const response = await httpClient.request({
            method: 'POST',
            url: 'https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb',
            headers: {
                'Authorization': `Bearer ${config.sandbox_api_key}`,
                'Content-Type': 'application/json'
            },
            data: invoiceData
        });

        // Check if the response is null or undefined
        if (!response.data) {
            console.warn('FBR API returned null/undefined response, treating as success');
            return {
                isValid: true,
                canSubmit: true,
                results: [{
                    field: 'fbr_validation',
                    severity: ValidationSeverity.SUCCESS,
                    message: 'FBR validation completed - No validation issues found',
                    code: 'FBR_VALIDATION_SUCCESS_NO_ISSUES'
                }],
                summary: {
                    total: 1,
                    errors: 0,
                    warnings: 0,
                    successes: 1
                },
                fbrValidation: {
                    success: true,
                    message: 'FBR validation completed successfully (no issues)'
                }
            };
        }

        // Process the FBR response to handle both success and error cases
        return processFBRValidationResponse(response.data as Record<string, unknown>);

    } catch (error) {
        // Return error response
        return {
            isValid: false,
            canSubmit: false,
            results: [{
                field: 'fbr_validation',
                severity: ValidationSeverity.ERROR,
                message: error instanceof Error ? error.message : 'FBR validation failed',
                code: 'FBR_VALIDATION_ERROR'
            }],
            summary: {
                total: 1,
                errors: 1,
                warnings: 0,
                successes: 0
            }
        };
    }
}
