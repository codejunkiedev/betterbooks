import { useState, useCallback } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/shared/services/store";
import { validateInvoice } from "@/shared/services/api/invoiceValidation";
import type { InvoiceValidationResponse } from "@/shared/services/api/invoiceValidation";
import { ValidationResult } from "@/shared/types/fbrValidation";
import { ValidationSeverity } from "@/shared/constants/fbr";
import type { FBRInvoicePayload } from "@/shared/types/invoice";
import { FbrEnvironment } from "../types/fbr";

interface UseInvoiceValidationOptions {
  includeFBRValidation?: boolean;
  environment?: FbrEnvironment;
  autoValidate?: boolean;
}

interface UseInvoiceValidationReturn {
  // State
  validationResult: InvoiceValidationResponse | null;
  isValidating: boolean;

  // Methods
  validateInvoice: (invoiceData: FBRInvoicePayload) => Promise<InvoiceValidationResponse>;
  clearValidation: () => void;
  getFieldErrors: (fieldName: string) => ValidationResult[];
  hasFieldErrors: (fieldName: string) => boolean;
  getFieldWarnings: (fieldName: string) => ValidationResult[];
  hasFieldWarnings: (fieldName: string) => boolean;

  // Computed values
  hasErrors: boolean;
  hasWarnings: boolean;
  canSubmit: boolean;
  errorCount: number;
  warningCount: number;
  successCount: number;
}

export function useInvoiceValidation(options: UseInvoiceValidationOptions = {}): UseInvoiceValidationReturn {
  const { includeFBRValidation = true, environment = "sandbox" } = options;

  const { user } = useSelector((s: RootState) => s.user);

  const [validationResult, setValidationResult] = useState<InvoiceValidationResponse | null>(null);

  const [isValidating, setIsValidating] = useState(false);

  const validateInvoiceData = useCallback(
    async (invoiceData: FBRInvoicePayload): Promise<InvoiceValidationResponse> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      setIsValidating(true);

      try {
        const result = await validateInvoice(invoiceData, {
          includeFBRValidation,
          userId: user.id,
          environment,
        });

        setValidationResult(result);

        return result;
      } catch (error) {
        console.error("Invoice validation error:", error);

        let errorMessage = "Validation failed";
        let errorCode = "VALIDATION_ERROR";

        // Handle specific error types
        if (error instanceof Error) {
          errorMessage = error.message;
          if (error.message.includes("network")) {
            errorCode = "NETWORK_ERROR";
          } else if (error.message.includes("timeout")) {
            errorCode = "TIMEOUT_ERROR";
          }
        }

        // Create error response
        const errorResponse: InvoiceValidationResponse = {
          isValid: false,
          canSubmit: false,
          summary: {
            total: 1,
            errors: 1,
            warnings: 0,
            successes: 0,
          },
          results: [
            {
              field: "general",
              severity: ValidationSeverity.ERROR,
              message: errorMessage,
              code: errorCode,
            },
          ],
        };

        setValidationResult(errorResponse);
        return errorResponse;
      } finally {
        setIsValidating(false);
      }
    },
    [user?.id, includeFBRValidation, environment]
  );

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  const getFieldErrors = useCallback(
    (fieldName: string): ValidationResult[] => {
      if (!validationResult?.results) return [];
      return validationResult.results.filter(
        (result: ValidationResult) => result.field === fieldName && result.severity === ValidationSeverity.ERROR
      );
    },
    [validationResult]
  );

  const hasFieldErrors = useCallback(
    (fieldName: string): boolean => {
      return getFieldErrors(fieldName).length > 0;
    },
    [getFieldErrors]
  );

  const getFieldWarnings = useCallback(
    (fieldName: string): ValidationResult[] => {
      if (!validationResult?.results) return [];
      return validationResult.results.filter(
        (result: ValidationResult) => result.field === fieldName && result.severity === ValidationSeverity.WARNING
      );
    },
    [validationResult]
  );

  const hasFieldWarnings = useCallback(
    (fieldName: string): boolean => {
      return getFieldWarnings(fieldName).length > 0;
    },
    [getFieldWarnings]
  );

  // Computed values
  const hasErrors = (validationResult?.summary?.errors || 0) > 0;
  const hasWarnings = (validationResult?.summary?.warnings || 0) > 0;
  const canSubmit = validationResult?.canSubmit || false;
  const errorCount = validationResult?.summary?.errors || 0;
  const warningCount = validationResult?.summary?.warnings || 0;
  const successCount = validationResult?.summary?.successes || 0;

  return {
    // State
    validationResult,
    isValidating,

    // Methods
    validateInvoice: validateInvoiceData,
    clearValidation,
    getFieldErrors,
    hasFieldErrors,
    getFieldWarnings,
    hasFieldWarnings,

    // Computed values
    hasErrors,
    hasWarnings,
    canSubmit,
    errorCount,
    warningCount,
    successCount,
  };
}
