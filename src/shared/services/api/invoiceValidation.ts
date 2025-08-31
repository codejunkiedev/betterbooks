
import type { ScenarioInvoiceFormData } from '@/shared/types/invoice';
import {
    ValidationSeverity,
    ValidationResult,
    validateRequiredFields,
    validateDataFormats,
    validateBusinessRules,
    validateTaxCalculations,
    validateHSCodes,
    validateUoMs,
    validateFBRRequiredFields,
    validateFBRFieldMapping
} from '@/shared/utils/validation';
import type { InvoiceValidationResponse } from '@/shared/types/fbrValidation';
export type { InvoiceValidationResponse } from '@/shared/types/fbrValidation';

export async function validateInvoice(
    invoiceData: ScenarioInvoiceFormData,
    userId: string,
    options: {
        includeFBRValidation?: boolean;
    } = {}
): Promise<InvoiceValidationResponse> {
    const { includeFBRValidation = true } = options;

    const results: ValidationResult[] = [];

    // Run local validations
    results.push(...validateRequiredFields(invoiceData));
    results.push(...validateDataFormats(invoiceData));
    results.push(...validateBusinessRules(invoiceData));
    results.push(...validateTaxCalculations(invoiceData));
    results.push(...validateHSCodes(invoiceData));

    // Run FBR-specific validations
    if (includeFBRValidation) {
        results.push(...validateFBRRequiredFields(invoiceData));
        results.push(...validateFBRFieldMapping(invoiceData));

        results.push({
            field: 'fbr_validation',
            severity: ValidationSeverity.SUCCESS,
            message: 'FBR API validation completed - checking required fields and field mappings',
            code: 'FBR_VALIDATION_COMPLETED'
        });
    }

    // Run UoM validations
    const uomResults = await validateUoMs(invoiceData, userId);
    results.push(...uomResults);

    const summary = {
        total: results.length,
        errors: results.filter(r => r.severity === ValidationSeverity.ERROR).length,
        warnings: results.filter(r => r.severity === ValidationSeverity.WARNING).length,
        successes: results.filter(r => r.severity === ValidationSeverity.SUCCESS).length
    };

    const hasErrors = summary.errors > 0;
    const isValid = !hasErrors;
    const canSubmit = isValid || summary.warnings > 0;

    return {
        isValid,
        canSubmit,
        results,
        summary
    };
}
