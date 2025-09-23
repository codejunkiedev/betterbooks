import { FBRInvoiceItem } from "@/shared/types/invoice";
import { InvoiceItemForm, InvoiceItemCalculated, InvoiceRunningTotals } from "@/shared/types/invoice";
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Calculate running totals for invoice items
 */
export function calculateRunningTotals(items: FBRInvoiceItem[]): InvoiceRunningTotals {
  const totals = items.reduce(
    (acc, item) => {
      acc.total_quantity += item.quantity;
      acc.total_value_excluding_tax += item.valueSalesExcludingST;
      acc.total_sales_tax += item.salesTaxApplicable;
      acc.total_amount += item.totalValues;
      acc.total_items += 1;
      return acc;
    },
    {
      total_quantity: 0,
      total_value_excluding_tax: 0,
      total_sales_tax: 0,
      total_amount: 0,
      total_items: 0,
    }
  );

  return totals;
}

/**
 * Calculate item totals based on quantity and unit price
 */
export function calculateItemTotals(
  quantity: number,
  unitPrice: number,
  taxRate: number
): {
  valueSalesExcludingST: number;
  salesTaxApplicable: number;
  totalValues: number;
} {
  const valueSalesExcludingST = quantity * unitPrice;
  const salesTaxApplicable = valueSalesExcludingST * (taxRate / 100);
  const totalValues = valueSalesExcludingST + salesTaxApplicable;

  return {
    valueSalesExcludingST: Math.round(valueSalesExcludingST * 100) / 100,
    salesTaxApplicable: Math.round(salesTaxApplicable * 100) / 100,
    totalValues: Math.round(totalValues * 100) / 100,
  };
}

/**
 * Validate invoice items
 */
export function validateInvoiceItems(items: FBRInvoiceItem[]): ValidationErrors {
  const errors: ValidationErrors = {};

  items.forEach((item, index) => {
    // Validate HS Code
    if (!item.hsCode?.trim()) {
      errors[`item_${index}_hsCode`] = "HS Code is required";
    } else if (!/^\d{2,8}$/.test(item.hsCode.replace(/\D/g, ""))) {
      errors[`item_${index}_hsCode`] = "Invalid HS Code format";
    }

    // Validate product description
    if (!item.productDescription?.trim()) {
      errors[`item_${index}_productDescription`] = "Product description is required";
    }

    // Validate quantity
    if (item.quantity <= 0) {
      errors[`item_${index}_quantity`] = "Quantity must be greater than 0";
    }

    // Validate total values
    if (item.totalValues <= 0) {
      errors[`item_${index}_totalValues`] = "Total value must be greater than 0";
    }

    // Validate tax rate
    const taxRate = parseFloat(item.rate.replace("%", ""));
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
      errors[`item_${index}_rate`] = "Tax rate must be between 0% and 100%";
    }

    // Validate UoM
    if (!item.uoM?.trim()) {
      errors[`item_${index}_uoM`] = "Unit of measure is required";
    }
  });

  return errors;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse tax rate string to number
 */
export function parseTaxRate(rateString: string): number {
  return parseFloat(rateString.replace("%", "")) || 0;
}

/**
 * Format tax rate number to string
 */
export function formatTaxRate(rate: number): string {
  return `${rate}%`;
}
/**
 * Calculate invoice item with all computed values
 */
export function calculateInvoiceItem(formData: InvoiceItemForm): InvoiceItemCalculated {
  const valueSalesExcludingST = formData.quantity * formData.unit_price;
  const salesTaxApplicable = valueSalesExcludingST * (formData.tax_rate / 100);
  const totalAmount = valueSalesExcludingST + salesTaxApplicable;

  const result: InvoiceItemCalculated = {
    id: formData.id || `item_${Date.now()}`,
    hs_code: formData.hs_code,
    item_name: formData.item_name,
    quantity: formData.quantity,
    unit_price: formData.unit_price,
    uom_code: formData.uom_code,
    tax_rate: formData.tax_rate,
    is_third_schedule: formData.is_third_schedule,
    total_amount: Math.round(totalAmount * 100) / 100,
    sales_tax: Math.round(salesTaxApplicable * 100) / 100,
    value_sales_excluding_st: Math.round(valueSalesExcludingST * 100) / 100,
    fixed_notified_value: formData.mrp_including_tax || 0,
    retail_price: formData.mrp_excluding_tax || 0,
  };

  // Add optional properties only if they have values
  if (formData.invoice_note !== undefined) {
    result.invoice_note = formData.invoice_note;
  }
  if (formData.mrp_including_tax !== undefined) {
    result.mrp_including_tax = formData.mrp_including_tax;
  }
  if (formData.mrp_excluding_tax !== undefined) {
    result.mrp_excluding_tax = formData.mrp_excluding_tax;
  }
  if (formData.sroScheduleNo !== undefined) {
    result.sroScheduleNo = formData.sroScheduleNo;
  }
  if (formData.sroItemSerialNo !== undefined) {
    result.sroItemSerialNo = formData.sroItemSerialNo;
  }

  return result;
}

/**
 * Calculate running totals for calculated invoice items
 */
export function calculateRunningTotalsForCalculatedItems(items: InvoiceItemCalculated[]): InvoiceRunningTotals {
  const totals = items.reduce(
    (acc, item) => {
      acc.total_value_excluding_tax += item.value_sales_excluding_st;
      acc.total_sales_tax += item.sales_tax;
      acc.total_amount += item.total_amount;
      acc.total_items += 1;
      return acc;
    },
    {
      total_value_excluding_tax: 0,
      total_sales_tax: 0,
      total_amount: 0,
      total_items: 0,
    }
  );

  return totals;
}

/**
 * Validate invoice item form
 */
export function validateInvoiceItem(
  formData: InvoiceItemForm,
  saleType?: string
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!formData.hs_code?.trim()) {
    errors.hs_code = "HS Code is required";
  }

  if (!formData.item_name?.trim()) {
    errors.item_name = "Product description is required";
  }

  if (formData.quantity <= 0) {
    errors.quantity = "Quantity must be greater than 0";
  }

  if (formData.unit_price <= 0) {
    errors.unit_price = "Unit price must be greater than 0";
  }

  if (!formData.uom_code?.trim()) {
    errors.uom_code = "Unit of measure is required";
  }

  if (formData.tax_rate < 0 || formData.tax_rate > 100) {
    errors.tax_rate = "Tax rate must be between 0% and 100%";
  }

  if (saleType === "3rd Schedule Goods") {
    if (!formData.sroScheduleNo?.trim()) {
      errors.sroScheduleNo = "SRO Schedule No is required for 3rd Schedule Goods";
    } else if (formData.sroScheduleNo.length > 10) {
      errors.sroScheduleNo = "SRO Schedule No must be 10 characters or less";
    }

    if (!formData.sroItemSerialNo?.trim()) {
      errors.sroItemSerialNo = "SRO Item Number is required for 3rd Schedule Goods";
    } else if (formData.sroItemSerialNo.length > 10) {
      errors.sroItemSerialNo = "SRO Item Number must be 10 characters or less";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format quantity for display
 */
export function formatQuantity(quantity: number): string {
  return quantity.toFixed(3);
}

/**
 * Format percentage for display
 */
export function formatPercentage(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

/**
 * Check if HS code is third schedule item
 */
export function isThirdScheduleItem(hsCode: string): boolean {
  // This is a simplified check - in real implementation, this would check against FBR's third schedule list
  const thirdSchedulePrefixes = ["2402", "2403", "2404", "2405", "2406", "2407", "2408", "2409", "2410"];
  return thirdSchedulePrefixes.some((prefix) => hsCode.startsWith(prefix));
}

/**
 * Get default tax rate for HS code
 */
export function getDefaultTaxRate(hsCode: string): number {
  // This is a simplified implementation - in real implementation, this would check against FBR's tax rate database
  if (isThirdScheduleItem(hsCode)) {
    return 16.0; // Third schedule items typically have 16% tax
  }
  return 18.0; // Default tax rate
}
