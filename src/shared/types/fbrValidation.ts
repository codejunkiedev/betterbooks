import { ValidationSeverity } from '@/shared/constants/fbr';

export interface ValidationResult {
    field: string;
    severity: ValidationSeverity;
    message: string;
    code?: string;
    suggestion?: string;
}

// Complete validation response
export interface InvoiceValidationResponse {
    isValid: boolean;
    canSubmit: boolean;
    results: ValidationResult[];
    summary: {
        total: number;
        errors: number;
        warnings: number;
        successes: number;
    };
    fbrValidation?: {
        success: boolean;
        message: string;
        data?: Record<string, unknown>;
        errorCategories?: Record<string, string[]>;
    };
}

// FBR API Response Interface
export interface FBRValidationResponse {
    // Success response
    invoiceNumber?: string;
    dated?: string;

    // Validation response structure
    validationResponse?: {
        statusCode?: string;
        status?: string;
        errorCode?: string;
        error?: string;
        invoiceStatuses?: Array<{
            itemSNo: string;
            statusCode: string;
            status: string;
            invoiceNo?: string | null;
            errorCode: string;
            error: string;
        }> | null;
    };

    // HTTP error responses
    Code?: string;
    statusCode?: string;
    message?: string;

    // Legacy format support
    status?: string;
    errorCode?: string;
    error?: string;
    invoiceStatuses?: Array<{
        itemSNo: string;
        statusCode: string;
        status: string;
        errorCode: string;
        error: string;
    }>;
    errors?: Array<{
        code: string;
        message: string;
        field?: string;
        suggestion?: string;
    }>;
}
