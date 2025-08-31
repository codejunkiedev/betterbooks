import { getScenarioDetails } from '../services/supabase/fbr';
import type { ScenarioInvoiceFormData } from '@/shared/types/invoice';

/**
 * Get correct saleType based on scenarioId from database
 */
export const getSaleTypeFromScenario = async (scenarioId: string): Promise<string> => {
    try {
        const scenarioDetails = await getScenarioDetails(scenarioId);
        return scenarioDetails?.sale_type || 'Goods at standard rate (default)';
    } catch (error) {
        console.error('Error fetching scenario details:', error);
        return 'Goods at standard rate (default)';
    }
};

/**
 * Ensure proper rate formatting - returns string like "18%"
 */
export const formatRate = (taxRate: number | string): string => {
    if (!taxRate) return "0%";

    // If it's already a string with %, return as is
    if (typeof taxRate === 'string' && taxRate.includes('%')) {
        return taxRate;
    }

    // If it's a number, convert to percentage string
    const rate = parseFloat(taxRate.toString());
    return `${rate}%`;
};

/**
 * Clean NTN/CNIC - ensure proper format
 * For business NTN, use first 7 digits
 * For individual CNIC, use all 13 digits
 */
export const cleanNTNCNIC = (value: string): string => {
    if (!value) return "";

    // Remove any non-digit characters
    const cleaned = value.toString().replace(/\D/g, '');

    // For business NTN, use first 7 digits
    // For individual CNIC, use all 13 digits
    if (cleaned.length >= 13) {
        return cleaned.substring(0, 13); // CNIC format
    } else if (cleaned.length >= 7) {
        return cleaned.substring(0, 7); // NTN format
    }

    return cleaned;
};

/**
 * Format numbers properly for FBR API
 */
export const formatNumber = (value: number | string): string => {
    if (!value && value !== 0) return "0";
    return parseFloat(value.toString()).toString();
};

/**
 * Transform invoice data to FBR API format
 */
export function transformInvoiceDataForFBR(invoiceData: ScenarioInvoiceFormData) {
    // Clean NTN/CNIC by removing non-digits
    const cleanNTNCNIC = (value: string) => value.replace(/\D/g, '');

    // Format number to 2 decimal places
    const formatNumber = (value: number | string): number => {
        const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
        return Math.round(num * 100) / 100;
    };

    // Format rate as percentage string
    const formatRate = (rate: number | string): string => {
        const num = typeof rate === 'string' ? parseFloat(rate) || 0 : rate;
        return `${num}%`;
    };

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
            hsCode: item.hs_code,
            productDescription: item.item_name,
            rate: formatRate(item.tax_rate),
            uoM: item.uom_code,
            quantity: formatNumber(item.quantity),
            totalValues: formatNumber(item.total_amount),
            valueSalesExcludingST: formatNumber(item.value_sales_excluding_st),
            fixedNotifiedValueOrRetailPrice: formatNumber(item.fixed_notified_value || item.retail_price || 0),
            salesTaxApplicable: formatNumber(item.sales_tax),
            salesTaxWithheldAtSource: formatNumber(item.sales_tax_withheld_at_source || 0),
            extraTax: formatNumber(item.extra_tax || 0),
            furtherTax: formatNumber(item.further_tax || 0),
            sroScheduleNo: item.sro_schedule_no || "",
            fedPayable: formatNumber(item.fed_payable || 0),
            discount: formatNumber(item.discount || 0),
            saleType: item.sale_type || "Goods at standard rate (default)",
            sroItemSerialNo: item.sro_item_serial_no || ""
        })),
        totalAmount: formatNumber(invoiceData.totalAmount),
        totalSalesTax: formatNumber(invoiceData.items.reduce((sum, item) => sum + (item.sales_tax || 0), 0)),
        totalValueSalesExcludingST: formatNumber(invoiceData.items.reduce((sum, item) => sum + (item.value_sales_excluding_st || 0), 0))
    };
}

interface FBRResponse {
    Code?: string;
    error?: string;
    validationResponse?: {
        errorCode?: string;
        error?: string;
        invoiceStatuses?: Array<{
            status?: string;
            statusCode?: string;
            error?: string;
        }>;
    };
}

/**
 * Validate FBR API response and extract errors
 */
export function validateFBRResponse(response: FBRResponse): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for malformed JSON error
    if (response.Code === "03" && response.error === "Requested JSON in Malformed") {
        errors.push("FBR API Error: Malformed JSON - missing required fields");
        return { isValid: false, errors, warnings };
    }

    // Check for other error codes
    if (response.Code && response.Code !== "00") {
        errors.push(`FBR API Error Code ${response.Code}: ${response.error || 'Unknown error'}`);
    }

    // Check for validation response errors
    if (response.validationResponse) {
        if (response.validationResponse.errorCode && response.validationResponse.error) {
            errors.push(`Validation Error: ${response.validationResponse.error}`);
        }

        if (response.validationResponse.invoiceStatuses) {
            response.validationResponse.invoiceStatuses.forEach((status, index) => {
                if (status.status === 'Invalid' || status.statusCode === '01') {
                    errors.push(`Item ${index + 1}: ${status.error || 'Unknown error'}`);
                }
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Get missing FBR required fields for an item
 */
export function getMissingFBRFields(item: Record<string, unknown>): string[] {
    const requiredFields = [
        'salesTaxWithheldAtSource',
        'extraTax',
        'furtherTax',
        'sroScheduleNo',
        'fedPayable',
        'discount',
        'saleType',
        'sroItemSerialNo'
    ];

    return requiredFields.filter(field => item[field] === undefined || item[field] === null);
}

/**
 * Add default values for missing FBR fields
 */
export function addDefaultFBRFields(item: Record<string, unknown>): Record<string, unknown> {
    return {
        ...item,
        salesTaxWithheldAtSource: item.salesTaxWithheldAtSource ?? 0,
        extraTax: item.extraTax ?? 0,
        furtherTax: item.furtherTax ?? 0,
        sroScheduleNo: item.sroScheduleNo ?? "",
        fedPayable: item.fedPayable ?? 0,
        discount: item.discount ?? 0,
        saleType: item.saleType ?? "Goods at standard rate (default)",
        sroItemSerialNo: item.sroItemSerialNo ?? ""
    };
}
