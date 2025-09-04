import { InvoiceFormData, FBRInvoiceItem, InvoiceItemCalculated } from '@/shared/types/invoice';

// Convert FBRInvoiceItem to InvoiceItemCalculated
const convertToInvoiceItemCalculated = (item: FBRInvoiceItem): InvoiceItemCalculated => {
    return {
        id: `item_${Date.now()}_${Math.random()}`,
        hs_code: item.hsCode,
        item_name: item.productDescription,
        quantity: item.quantity,
        unit_price: item.totalValues / item.quantity,
        uom_code: item.uoM,
        tax_rate: parseFloat(item.rate.replace('%', '')),
        total_amount: item.totalValues,
        sales_tax: item.salesTaxApplicable,
        value_sales_excluding_st: item.valueSalesExcludingST,
        fixed_notified_value: item.fixedNotifiedValueOrRetailPrice,
        retail_price: item.fixedNotifiedValueOrRetailPrice,
        is_third_schedule: false
    };
};

// Sample products in FBR format
export const SAMPLE_PRODUCTS: Record<string, FBRInvoiceItem[]> = {
    'SN001': [
        {
            hsCode: "0101.2100",
            productDescription: "Live horses, asses, mules and hinnies - Horses",
            rate: "18%",
            uoM: "Numbers, pieces, units",
            quantity: 1.0000,
            totalValues: 1180.00,
            valueSalesExcludingST: 1000.00,
            fixedNotifiedValueOrRetailPrice: 0.00,
            salesTaxApplicable: 180.00,
            salesTaxWithheldAtSource: 0.00,
            extraTax: 0.00,
            furtherTax: 120.00,
            sroScheduleNo: "",
            fedPayable: 0.00,
            discount: 0.00,
            saleType: "Goods at standard rate (default)",
            sroItemSerialNo: ""
        }
    ],
    'SN002': [
        {
            hsCode: "0201.1000",
            productDescription: "Meat of bovine animals, fresh or chilled - Carcasses and half-carcasses",
            rate: "18%",
            uoM: "Kilograms",
            quantity: 50.0000,
            totalValues: 5900.00,
            valueSalesExcludingST: 5000.00,
            fixedNotifiedValueOrRetailPrice: 0.00,
            salesTaxApplicable: 900.00,
            salesTaxWithheldAtSource: 0.00,
            extraTax: 0.00,
            furtherTax: 600.00,
            sroScheduleNo: "",
            fedPayable: 0.00,
            discount: 0.00,
            saleType: "Goods at standard rate (default)",
            sroItemSerialNo: ""
        }
    ]
};

// Generate sample data
export const generateSampleData = (scenarioId: string = 'SN001'): InvoiceFormData => {
    const products = SAMPLE_PRODUCTS[scenarioId] || SAMPLE_PRODUCTS['SN001'];

    return {
        invoiceType: "Sale Invoice",
        invoiceDate: "2025-04-21",
        sellerNTNCNIC: "1234567",
        sellerBusinessName: "Company 8",
        sellerProvince: "Sindh",
        sellerAddress: "Karachi",
        buyerNTNCNIC: "1234567890123",
        buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
        buyerProvince: "Sindh",
        buyerAddress: "Karachi",
        buyerRegistrationType: "Registered",
        invoiceRefNo: "",
        scenarioId: scenarioId,
        items: products.map(convertToInvoiceItemCalculated),
        totalAmount: products.reduce((sum, item) => sum + item.totalValues, 0),
        notes: "Sample invoice for testing"
    };
};

// Generate scenario-specific sample data
export const generateScenarioSpecificSampleData = (scenarioId: string): InvoiceFormData => {
    return generateSampleData(scenarioId);
};

// Generate random sample data
export const generateRandomSampleData = (): InvoiceFormData => {
    const scenarios = Object.keys(SAMPLE_PRODUCTS);
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return generateSampleData(randomScenario);
};

// Generate minimal sample data
export const generateMinimalSampleData = (): InvoiceFormData => {
    const minimalItem: FBRInvoiceItem = {
        hsCode: "0101.2100",
        productDescription: "product Description",
        rate: "18%",
        uoM: "Numbers, pieces, units",
        quantity: 1.0000,
        totalValues: 0.00,
        valueSalesExcludingST: 1000.00,
        fixedNotifiedValueOrRetailPrice: 0.00,
        salesTaxApplicable: 180.00,
        salesTaxWithheldAtSource: 0.00,
        extraTax: 0.00,
        furtherTax: 120.00,
        sroScheduleNo: "",
        fedPayable: 0.00,
        discount: 0.00,
        saleType: "Goods at standard rate (default)",
        sroItemSerialNo: ""
    };

    return {
        invoiceType: "Sale Invoice",
        invoiceDate: "2025-04-21",
        sellerNTNCNIC: "1234567",
        sellerBusinessName: "Company 8",
        sellerProvince: "Sindh",
        sellerAddress: "Karachi",
        buyerNTNCNIC: "1234567890123",
        buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
        buyerProvince: "Sindh",
        buyerAddress: "Karachi",
        buyerRegistrationType: "Registered",
        invoiceRefNo: "",
        scenarioId: "SN001",
        items: [convertToInvoiceItemCalculated(minimalItem)],
        totalAmount: minimalItem.totalValues,
        notes: "Minimal sample data"
    };
};

// Generate scenario-specific minimal data
export const generateScenarioSpecificMinimalData = (scenarioId: string): InvoiceFormData => {
    const scenarioMinimalItems: Record<string, FBRInvoiceItem> = {
        'SN001': {
            hsCode: "0101.2100",
            productDescription: "Live horses, asses, mules and hinnies - Horses",
            rate: "18%",
            uoM: "Numbers, pieces, units",
            quantity: 1.0000,
            totalValues: 1180.00,
            valueSalesExcludingST: 1000.00,
            fixedNotifiedValueOrRetailPrice: 0.00,
            salesTaxApplicable: 180.00,
            salesTaxWithheldAtSource: 0.00,
            extraTax: 0.00,
            furtherTax: 120.00,
            sroScheduleNo: "",
            fedPayable: 0.00,
            discount: 0.00,
            saleType: "Goods at standard rate (default)",
            sroItemSerialNo: ""
        },
        'SN002': {
            hsCode: "0201.1000",
            productDescription: "Meat of bovine animals, fresh or chilled",
            rate: "18%",
            uoM: "Kilograms",
            quantity: 50.0000,
            totalValues: 5900.00,
            valueSalesExcludingST: 5000.00,
            fixedNotifiedValueOrRetailPrice: 0.00,
            salesTaxApplicable: 900.00,
            salesTaxWithheldAtSource: 0.00,
            extraTax: 0.00,
            furtherTax: 600.00,
            sroScheduleNo: "",
            fedPayable: 0.00,
            discount: 0.00,
            saleType: "Goods at standard rate (default)",
            sroItemSerialNo: ""
        }
    };

    const item = scenarioMinimalItems[scenarioId] || scenarioMinimalItems['SN001'];

    return {
        invoiceType: "Sale Invoice",
        invoiceDate: "2025-04-21",
        sellerNTNCNIC: "1234567",
        sellerBusinessName: "Company 8",
        sellerProvince: "Sindh",
        sellerAddress: "Karachi",
        buyerNTNCNIC: "1234567890123",
        buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
        buyerProvince: "Sindh",
        buyerAddress: "Karachi",
        buyerRegistrationType: "Registered",
        invoiceRefNo: "",
        scenarioId: scenarioId,
        items: [convertToInvoiceItemCalculated(item)],
        totalAmount: item.totalValues,
        notes: `Minimal sample data for scenario ${scenarioId}`
    };
};

// Generate random NTN (7 digits) or CNIC (13 digits)
export const generateNTNCNIC = (type: 'NTN' | 'CNIC'): string => {
    const min = type === 'NTN' ? 1000000 : 1000000000000;
    const max = type === 'NTN' ? 9999999 : 9999999999999;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
};