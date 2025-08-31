import { FBRInvoiceData, FBRInvoiceItem, InvoiceFormData, InvoiceItemCalculated, CreateInvoiceDB, CreateInvoiceItemDB } from '@/shared/types/invoice';

// Transform form data to clean FBR payload
export function transformToFBRPayload(formData: InvoiceFormData): FBRInvoiceData {
    return {
        invoiceType: formData.invoiceType,
        invoiceDate: formData.invoiceDate,
        sellerNTNCNIC: formData.sellerNTNCNIC,
        sellerBusinessName: formData.sellerBusinessName,
        sellerProvince: formData.sellerProvince,
        sellerAddress: formData.sellerAddress,
        buyerNTNCNIC: formData.buyerNTNCNIC,
        buyerBusinessName: formData.buyerBusinessName,
        buyerProvince: formData.buyerProvince,
        buyerAddress: formData.buyerAddress,
        buyerRegistrationType: formData.buyerRegistrationType,
        invoiceRefNo: formData.invoiceRefNo,
        scenarioId: formData.scenarioId,
        items: formData.items
    };
}

// Convert FBR format to database format for invoice
export function convertToInvoiceDB(formData: InvoiceFormData, userId: string): CreateInvoiceDB {
    return {
        user_id: userId,
        invoice_ref_no: formData.invoiceRefNo,
        invoice_type: formData.invoiceType,
        invoice_date: formData.invoiceDate,
        seller_ntn_cnic: formData.sellerNTNCNIC,
        seller_business_name: formData.sellerBusinessName,
        seller_province: formData.sellerProvince,
        seller_address: formData.sellerAddress,
        buyer_ntn_cnic: formData.buyerNTNCNIC,
        buyer_business_name: formData.buyerBusinessName,
        buyer_province: formData.buyerProvince,
        buyer_address: formData.buyerAddress,
        buyer_registration_type: formData.buyerRegistrationType,
        scenario_id: formData.scenarioId,
        total_amount: formData.totalAmount,
        notes: formData.notes,
        status: 'draft'
    };
}

// Convert FBR format to database format for invoice items
export function convertToInvoiceItemsDB(items: FBRInvoiceItem[], invoiceId: number): CreateInvoiceItemDB[] {
    return items.map(item => ({
        invoice_id: invoiceId,
        hs_code: item.hsCode,
        item_name: item.productDescription,
        quantity: item.quantity,
        unit_price: item.totalValues / item.quantity, // Calculate unit price
        total_amount: item.totalValues,
        sales_tax: item.salesTaxApplicable,
        uom_code: item.uoM,
        tax_rate: parseFloat(item.rate.replace('%', '')),
        value_sales_excluding_st: item.valueSalesExcludingST,
        fixed_notified_value: item.fixedNotifiedValueOrRetailPrice,
        retail_price: item.fixedNotifiedValueOrRetailPrice,
        is_third_schedule: false
    }));
}

// Convert InvoiceItemCalculated to database format for invoice items
export function convertCalculatedItemsToDB(items: InvoiceItemCalculated[], invoiceId: number): CreateInvoiceItemDB[] {
    return items.map(item => {
        const dbItem: CreateInvoiceItemDB = {
            invoice_id: invoiceId,
            hs_code: item.hs_code,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_amount: item.total_amount,
            sales_tax: item.sales_tax,
            uom_code: item.uom_code,
            tax_rate: item.tax_rate,
            value_sales_excluding_st: item.value_sales_excluding_st,
            fixed_notified_value: item.fixed_notified_value,
            retail_price: item.retail_price,
            is_third_schedule: item.is_third_schedule
        };

        // Add optional properties only if they have values
        if (item.invoice_note !== undefined) {
            dbItem.invoice_note = item.invoice_note;
        }

        return dbItem;
    });
}

// Format rate as percentage string
export const formatRate = (taxRate: number | string): string => {
    if (!taxRate) return "0%";
    if (typeof taxRate === 'string' && taxRate.includes('%')) {
        return taxRate;
    }
    const rate = parseFloat(taxRate.toString());
    return `${rate}%`;
};

// Clean NTN/CNIC format
export const cleanNTNCNIC = (value: string): string => {
    if (!value) return "";
    const cleaned = value.toString().replace(/\D/g, '');
    return cleaned.length === 7 ? cleaned : cleaned.substring(0, 7);
};
