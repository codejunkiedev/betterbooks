import { ScenarioInvoiceFormData } from '@/shared/types/invoice';

// Optimized business data with proper NTN/CNIC formats
export const SAMPLE_BUSINESSES = {
    TECH: {
        sellerNTNCNIC: '1234567890123', // 13-digit CNIC format
        sellerBusinessName: 'Tech Solutions Pakistan Ltd.',
        sellerProvince: 'Punjab',
        sellerAddress: '123 Main Street, Gulberg III, Lahore',
        buyerNTNCNIC: '9876543210987', // 13-digit CNIC format
        buyerBusinessName: 'Digital Innovations Pvt Ltd.',
        buyerProvince: 'Sindh',
        buyerAddress: '456 Business Avenue, Clifton Block 5, Karachi',
        buyerRegistrationType: 'NTN'
    },
    MANUFACTURING: {
        sellerNTNCNIC: '2345678901234', // 13-digit CNIC format
        sellerBusinessName: 'Pak Steel Industries Ltd.',
        sellerProvince: 'Punjab',
        sellerAddress: '789 Industrial Zone, Faisalabad',
        buyerNTNCNIC: '8765432109876', // 13-digit CNIC format
        buyerBusinessName: 'Construction Solutions Ltd.',
        buyerProvince: 'Khyber Pakhtunkhwa',
        buyerAddress: '321 Business Park, Peshawar',
        buyerRegistrationType: 'CNIC'
    },
    RETAIL: {
        sellerNTNCNIC: '3456789012345',
        sellerBusinessName: 'Modern Retail Chain Ltd.',
        sellerProvince: 'Sindh',
        sellerAddress: '567 Mall Road, Karachi',
        buyerNTNCNIC: '7654321098765',
        buyerBusinessName: 'Local Store Network',
        buyerProvince: 'Balochistan',
        buyerAddress: '654 Market Street, Quetta',
        buyerRegistrationType: 'Registered'
    }
};

// Sample product items with realistic HS codes and descriptions
export const SAMPLE_PRODUCTS = {
    ELECTRONICS: [
        {
            hsCode: '8471.30.00',
            productDescription: 'Laptop Computer - Dell Latitude 5520 (Intel i7, 16GB RAM, 512GB SSD)',
            rate: 150000,
            uoM: 'PCS',
            quantity: 2,
            salesTaxApplicable: 45000, // 15% of 300000
            sroScheduleNo: 'SRO.1234(I)/2021',
            saleType: 'Local',
            sroItemSerialNo: '001'
        },
        {
            hsCode: '8517.13.00',
            productDescription: 'Smartphone - Samsung Galaxy S24 Ultra (256GB, Phantom Black)',
            rate: 250000,
            uoM: 'PCS',
            quantity: 1,
            salesTaxApplicable: 37500, // 15% of 250000
            sroScheduleNo: 'SRO.1234(I)/2021',
            saleType: 'Local',
            sroItemSerialNo: '002'
        },
        {
            hsCode: '8528.72.00',
            productDescription: 'LED Monitor - Dell 27" 4K Ultra HD (P2723QE)',
            rate: 85000,
            uoM: 'PCS',
            quantity: 3,
            salesTaxApplicable: 38250, // 15% of 255000
            sroScheduleNo: 'SRO.1234(I)/2021',
            saleType: 'Local',
            sroItemSerialNo: '003'
        }
    ],
    MANUFACTURING: [
        {
            hsCode: '7210.41.00',
            productDescription: 'Steel Sheets - Hot Rolled (3mm thickness, 1000x2000mm)',
            rate: 85000,
            uoM: 'TON',
            quantity: 5,
            salesTaxApplicable: 63750, // 15% of 425000
            sroScheduleNo: 'SRO.1234(I)/2021',
            saleType: 'Local',
            sroItemSerialNo: '001'
        },
        {
            hsCode: '7308.90.00',
            productDescription: 'Steel Structures - Prefabricated Building Components',
            rate: 120000,
            uoM: 'TON',
            quantity: 2,
            salesTaxApplicable: 36000, // 15% of 240000
            sroScheduleNo: 'SRO.1234(I)/2021',
            saleType: 'Local',
            sroItemSerialNo: '002'
        }
    ],
    RETAIL: [
        {
            hsCode: '6104.43.00',
            productDescription: 'Women\'s Dresses - Cotton Blend (Various Sizes)',
            rate: 2500,
            uoM: 'PCS',
            quantity: 50,
            salesTaxApplicable: 18750, // 15% of 125000
            sroScheduleNo: 'SRO.1234(I)/2021',
            saleType: 'Local',
            sroItemSerialNo: '001'
        },
        {
            hsCode: '6204.43.00',
            productDescription: 'Men\'s Shirts - Cotton (Various Sizes)',
            rate: 1800,
            uoM: 'PCS',
            quantity: 75,
            salesTaxApplicable: 20250, // 15% of 135000
            sroScheduleNo: 'SRO.1234(I)/2021',
            saleType: 'Local',
            sroItemSerialNo: '002'
        },
        {
            hsCode: '6403.91.00',
            productDescription: 'Leather Shoes - Men\'s Formal (Various Sizes)',
            rate: 3500,
            uoM: 'PCS',
            quantity: 30,
            salesTaxApplicable: 15750, // 15% of 105000
            sroScheduleNo: 'SRO.1234(I)/2021',
            saleType: 'Local',
            sroItemSerialNo: '003'
        }
    ]
};

// Generate invoice number with current year and random number
export const generateInvoiceNumber = (): string => {
    return `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
};

// Calculate item totals and tax amounts
export const calculateItemTotals = (items: Array<{
    hsCode: string;
    productDescription: string;
    rate: number;
    uoM: string;
    quantity: number;
    salesTaxApplicable: number;
    sroScheduleNo: string;
    saleType: string;
    sroItemSerialNo: string;
}>) => {
    return items.map(item => {
        const totalValues = item.rate * item.quantity;
        const valueSalesExcludingST = totalValues;
        const salesTaxApplicable = Math.round((totalValues * 0.15) * 100) / 100; // 15% tax
        const furtherTax = Math.round((totalValues * 0.12) * 100) / 100; // 12% further tax

        return {
            ...item,
            totalValues: Math.round(totalValues * 100) / 100,
            valueSalesExcludingST: Math.round(valueSalesExcludingST * 100) / 100,
            fixedNotifiedValueOrRetailPrice: 0,
            salesTaxApplicable: Math.round(salesTaxApplicable * 100) / 100,
            salesTaxWithheldAtSource: 0,
            extraTax: 0,
            furtherTax: Math.round(furtherTax * 100) / 100,
            fedPayable: 0,
            discount: 0
        };
    });
};

// Generate sample data for different scenarios
export const generateSampleData = (scenarioType: 'TECH' | 'MANUFACTURING' | 'RETAIL', scenarioId?: string): ScenarioInvoiceFormData => {
    const business = SAMPLE_BUSINESSES[scenarioType];
    const products = SAMPLE_PRODUCTS[scenarioType === 'TECH' ? 'ELECTRONICS' : scenarioType];

    // Calculate items with totals
    const calculatedItems = calculateItemTotals(products);

    // Calculate total amount
    const totalAmount = calculatedItems.reduce((sum, item) => sum + item.totalValues, 0);

    return {
        invoiceType: 'Sale Invoice',
        invoiceDate: new Date().toISOString().split('T')[0],
        sellerNTNCNIC: business.sellerNTNCNIC,
        sellerBusinessName: business.sellerBusinessName,
        sellerProvince: business.sellerProvince,
        sellerAddress: business.sellerAddress,
        buyerNTNCNIC: business.buyerNTNCNIC,
        buyerBusinessName: business.buyerBusinessName,
        buyerProvince: business.buyerProvince,
        buyerAddress: business.buyerAddress,
        buyerRegistrationType: business.buyerRegistrationType,
        invoiceRefNo: generateInvoiceNumber(),
        scenarioId: scenarioId || '',
        items: calculatedItems,
        totalAmount: totalAmount,
        notes: `Sample ${scenarioType.toLowerCase()} invoice for FBR testing purposes. This invoice demonstrates the complete functionality of the FBR invoice creation system with realistic business data.`
    };
};

// Generate random sample data (randomly selects one of the scenarios)
export const generateRandomSampleData = (scenarioId?: string): ScenarioInvoiceFormData => {
    const scenarios: ('TECH' | 'MANUFACTURING' | 'RETAIL')[] = ['TECH', 'MANUFACTURING', 'RETAIL'];
    return generateSampleData(scenarios[Math.floor(Math.random() * scenarios.length)], scenarioId);
};

// Generate minimal sample data for quick testing
export const generateMinimalSampleData = (scenarioId?: string): ScenarioInvoiceFormData => {
    const minimalItem = calculateItemTotals([{
        hsCode: '8471.30.00',
        productDescription: 'Test Product - Sample Item',
        rate: 10000,
        uoM: 'PCS',
        quantity: 1,
        salesTaxApplicable: 1500,
        sroScheduleNo: 'SRO.1234(I)/2021',
        saleType: 'Local',
        sroItemSerialNo: '001'
    }])[0];

    return {
        invoiceType: 'Sale Invoice',
        invoiceDate: new Date().toISOString().split('T')[0],
        sellerNTNCNIC: '1234567890123', // 13-digit CNIC format
        sellerBusinessName: 'Test Company Ltd.',
        sellerProvince: 'Punjab',
        sellerAddress: '123 Test Street, Lahore',
        buyerNTNCNIC: '9876543210987', // 13-digit CNIC format
        buyerBusinessName: 'Test Buyer Ltd.',
        buyerProvince: 'Sindh',
        buyerAddress: '456 Test Avenue, Karachi',
        buyerRegistrationType: 'NTN',
        invoiceRefNo: generateInvoiceNumber(),
        scenarioId: scenarioId || '',
        items: [minimalItem],
        totalAmount: minimalItem.totalValues,
        notes: 'Minimal sample data for quick testing.'
    };
};

// Generate random NTN (7 digits) or CNIC (13 digits)
export const generateNTNCNIC = (type: 'NTN' | 'CNIC'): string => {
    const min = type === 'NTN' ? 1000000 : 1000000000000;
    const max = type === 'NTN' ? 9999999 : 9999999999999;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
};
