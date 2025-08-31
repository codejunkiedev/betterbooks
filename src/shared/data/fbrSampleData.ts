import { ScenarioInvoiceFormData, InvoiceItemCalculated } from '@/shared/types/invoice';

// Optimized business data with proper NTN/CNIC formats
export const SAMPLE_BUSINESSES = {
    TECH: {
        sellerNTNCNIC: '3540504912049', // Authorized seller NTN/CNIC
        sellerBusinessName: 'Farooq Traders',
        sellerProvince: 'Punjab',
        sellerAddress: '123 Main Street, Gulberg III, Lahore',
        buyerNTNCNIC: '3562101254686', // Authorized buyer NTN/CNIC
        buyerBusinessName: 'Al Ihsna',
        buyerProvince: 'Sindh',
        buyerAddress: '456 Business Avenue, Clifton Block 5, Karachi',
        buyerRegistrationType: 'NTN'
    },
    MANUFACTURING: {
        sellerNTNCNIC: '3540504912049', // Authorized seller NTN/CNIC
        sellerBusinessName: 'Farooq Traders',
        sellerProvince: 'Punjab',
        sellerAddress: '789 Industrial Zone, Faisalabad',
        buyerNTNCNIC: '3562101254686', // Authorized buyer NTN/CNIC
        buyerBusinessName: 'Al Ihsna',
        buyerProvince: 'Khyber Pakhtunkhwa',
        buyerAddress: '321 Business Park, Peshawar',
        buyerRegistrationType: 'CNIC'
    },
    RETAIL: {
        sellerNTNCNIC: '3540504912049', // Authorized seller NTN/CNIC
        sellerBusinessName: 'Farooq Traders',
        sellerProvince: 'Sindh',
        sellerAddress: '567 Mall Road, Karachi',
        buyerNTNCNIC: '3562101254686', // Authorized buyer NTN/CNIC
        buyerBusinessName: 'Al Ihsna',
        buyerProvince: 'Balochistan',
        buyerAddress: '654 Market Street, Quetta',
        buyerRegistrationType: 'Registered'
    }
};

// Sample product items with realistic HS codes and descriptions
export const SAMPLE_PRODUCTS: Record<string, InvoiceItemCalculated[]> = {
    ELECTRONICS: [
        {
            hs_code: '8529.9030',
            item_name: 'ELECTRICAL MACHINERY AND EQUIPMENT AND PARTS THEREOF; . - T.V. CONVERTER BOX',
            quantity: 3,
            unit_price: 5000, // Price excluding tax
            uom_code: '69',
            tax_rate: 16,
            value_sales_excluding_st: 15000, // 5000 * 3
            sales_tax: 3000, // 15000 * 0.16
            total_amount: 18000, // 15000 + 3000
            unit_price_excluding_tax: 5000, // Already excluding tax
            fixed_notified_value: 10000,
            retail_price: 15000,
            invoice_note: 'Sample T.V. converter box',
            is_third_schedule: true
        },
        {
            hs_code: '8471.3000',
            item_name: 'Laptop Computer - Dell Latitude 5520 (Intel i7, 16GB RAM, 512GB SSD)',
            quantity: 2,
            unit_price: 150000, // Price excluding tax
            uom_code: 'PCS',
            tax_rate: 16,
            value_sales_excluding_st: 300000, // 150000 * 2
            sales_tax: 48000, // 300000 * 0.16
            total_amount: 348000, // 300000 + 48000
            unit_price_excluding_tax: 150000, // Already excluding tax
            fixed_notified_value: 348000,
            retail_price: 300000,
            invoice_note: 'Sample laptop computers',
            is_third_schedule: true
        },
        {
            hs_code: '8517.1300',
            item_name: 'Smartphone - Samsung Galaxy S24 Ultra (256GB, Phantom Black)',
            quantity: 1,
            unit_price: 250000, // Price excluding tax
            uom_code: 'PCS',
            tax_rate: 16,
            value_sales_excluding_st: 250000, // 250000 * 1
            sales_tax: 40000, // 250000 * 0.16
            total_amount: 290000, // 250000 + 40000
            unit_price_excluding_tax: 250000, // Already excluding tax
            fixed_notified_value: 290000,
            retail_price: 250000,
            invoice_note: 'Sample smartphone',
            is_third_schedule: true
        }
    ],
    MANUFACTURING: [
        {
            hs_code: '7210.4100',
            item_name: 'Steel Sheets - Hot Rolled (3mm thickness, 1000x2000mm)',
            quantity: 5,
            unit_price: 85000, // Price excluding tax
            uom_code: 'TON',
            tax_rate: 16,
            value_sales_excluding_st: 425000, // 85000 * 5
            sales_tax: 68000, // 425000 * 0.16
            total_amount: 493000, // 425000 + 68000
            unit_price_excluding_tax: 85000, // Already excluding tax
            fixed_notified_value: 493000,
            retail_price: 425000,
            invoice_note: 'Sample steel sheets',
            is_third_schedule: false
        },
        {
            hs_code: '7308.9000',
            item_name: 'Steel Structures - Prefabricated Building Components',
            quantity: 2,
            unit_price: 120000, // Price excluding tax
            uom_code: 'TON',
            tax_rate: 16,
            value_sales_excluding_st: 240000, // 120000 * 2
            sales_tax: 38400, // 240000 * 0.16
            total_amount: 278400, // 240000 + 38400
            unit_price_excluding_tax: 120000, // Already excluding tax
            fixed_notified_value: 278400,
            retail_price: 240000,
            invoice_note: 'Sample steel structures',
            is_third_schedule: false
        }
    ],
    RETAIL: [
        {
            hs_code: '6104.4300',
            item_name: 'Women\'s Dresses - Cotton Blend (Various Sizes)',
            quantity: 50,
            unit_price: 2500, // Price excluding tax
            uom_code: 'PCS',
            tax_rate: 16,
            value_sales_excluding_st: 125000, // 2500 * 50
            sales_tax: 20000, // 125000 * 0.16
            total_amount: 145000, // 125000 + 20000
            unit_price_excluding_tax: 2500, // Already excluding tax
            fixed_notified_value: 145000,
            retail_price: 125000,
            invoice_note: 'Sample women\'s dresses',
            is_third_schedule: true
        },
        {
            hs_code: '6204.4300',
            item_name: 'Men\'s Shirts - Cotton (Various Sizes)',
            quantity: 75,
            unit_price: 1800, // Price excluding tax
            uom_code: 'PCS',
            tax_rate: 16,
            value_sales_excluding_st: 135000, // 1800 * 75
            sales_tax: 21600, // 135000 * 0.16
            total_amount: 156600, // 135000 + 21600
            unit_price_excluding_tax: 1800, // Already excluding tax
            fixed_notified_value: 156600,
            retail_price: 135000,
            invoice_note: 'Sample men\'s shirts',
            is_third_schedule: true
        },
        {
            hs_code: '6403.9100',
            item_name: 'Leather Shoes - Men\'s Formal (Various Sizes)',
            quantity: 30,
            unit_price: 3500, // Price excluding tax
            uom_code: 'PCS',
            tax_rate: 16,
            value_sales_excluding_st: 105000, // 3500 * 30
            sales_tax: 16800, // 105000 * 0.16
            total_amount: 121800, // 105000 + 16800
            unit_price_excluding_tax: 3500, // Already excluding tax
            fixed_notified_value: 121800,
            retail_price: 105000,
            invoice_note: 'Sample leather shoes',
            is_third_schedule: true
        }
    ]
};

// Generate invoice number with current year and random number
export const generateInvoiceNumber = (): string => {
    return `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
};

// Generate sample data for different scenarios
export const generateSampleData = (scenarioType: 'TECH' | 'MANUFACTURING' | 'RETAIL', scenarioId?: string): ScenarioInvoiceFormData => {
    const business = SAMPLE_BUSINESSES[scenarioType];
    const products = SAMPLE_PRODUCTS[scenarioType === 'TECH' ? 'ELECTRONICS' : scenarioType];

    // Calculate total amount
    const totalAmount = products.reduce((sum, item) => sum + item.total_amount, 0);

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
        items: products,
        totalAmount: totalAmount,
        notes: `Sample ${scenarioType.toLowerCase()} invoice for FBR testing purposes. This invoice demonstrates the complete functionality of the FBR invoice creation system with realistic business data.`
    };
};

// Generate scenario-specific sample data based on scenario code
export const generateScenarioSpecificSampleData = (scenarioCode: string, scenarioId?: string): ScenarioInvoiceFormData => {
    // Map scenario codes to business types
    const scenarioBusinessMap: Record<string, 'TECH' | 'MANUFACTURING' | 'RETAIL'> = {
        'SN001': 'TECH',      // Standard rate to registered buyers
        'SN002': 'TECH',      // Standard rate to unregistered buyers
        'SN003': 'MANUFACTURING', // Steel sector
        'SN004': 'MANUFACTURING', // Ship breaking
        'SN005': 'RETAIL',    // Reduced rate sale
        'SN006': 'RETAIL',    // Exempt goods sale
        'SN007': 'RETAIL',    // Zero rated sale
        'SN008': 'TECH',      // 3rd schedule goods
        'SN009': 'MANUFACTURING', // Textile sector
        'SN010': 'MANUFACTURING', // Textile sector
        'SN011': 'MANUFACTURING', // Steel sector
        'SN012': 'MANUFACTURING', // Steel sector
        'SN013': 'MANUFACTURING', // Steel sector
        'SN014': 'MANUFACTURING', // Steel sector
        'SN015': 'TECH',      // Standard rate sales
        'SN016': 'TECH',      // Standard rate sales
        'SN017': 'TECH',      // Standard rate sales
        'SN018': 'RETAIL',    // Reduced rate sales
        'SN019': 'RETAIL',    // Reduced rate sales
        'SN020': 'RETAIL',    // Reduced rate sales
        'SN021': 'RETAIL',    // Exempt goods
        'SN022': 'RETAIL',    // Exempt goods
        'SN023': 'RETAIL',    // Zero rate sales
        'SN024': 'RETAIL',    // Zero rate sales
        'SN025': 'TECH',      // 3rd schedule goods
        'SN026': 'MANUFACTURING', // Textile sector
        'SN027': 'MANUFACTURING', // Textile sector
        'SN028': 'MANUFACTURING'  // Textile sector
    };

    const businessType = scenarioBusinessMap[scenarioCode] || 'TECH';
    const business = SAMPLE_BUSINESSES[businessType];
    const products = SAMPLE_PRODUCTS[businessType === 'TECH' ? 'ELECTRONICS' : businessType];

    // Adjust tax rates based on scenario type
    const adjustedProducts = products.map(item => {
        let adjustedTaxRate = item.tax_rate;

        switch (scenarioCode) {
            case 'SN005': // Reduced rate sale
                adjustedTaxRate = 8; // Reduced rate
                break;
            case 'SN006': // Exempt goods sale
            case 'SN007': // Zero rated sale
                adjustedTaxRate = 0; // Zero rate
                break;
            case 'SN008': // 3rd schedule goods
            case 'SN025': // 3rd schedule goods
                adjustedTaxRate = 16; // Standard rate for 3rd schedule
                break;
            default:
                adjustedTaxRate = 16; // Standard rate
        }

        // Recalculate values based on adjusted tax rate - unit_price is excluding tax
        const valueSalesExcludingST = item.quantity * item.unit_price;
        const salesTax = (valueSalesExcludingST * adjustedTaxRate) / 100;
        const totalAmount = valueSalesExcludingST + salesTax;
        const unitPriceExcludingTax = item.unit_price; // Already excluding tax

        return {
            ...item,
            tax_rate: adjustedTaxRate,
            value_sales_excluding_st: valueSalesExcludingST,
            sales_tax: salesTax,
            total_amount: totalAmount,
            unit_price_excluding_tax: unitPriceExcludingTax,
            retail_price: valueSalesExcludingST,
            is_third_schedule: scenarioCode === 'SN008' || scenarioCode === 'SN025'
        };
    });

    // Calculate total amount
    const totalAmount = adjustedProducts.reduce((sum, item) => sum + item.total_amount, 0);

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
        items: adjustedProducts,
        totalAmount: totalAmount,
        notes: `Sample invoice for scenario ${scenarioCode} - ${scenarioBusinessMap[scenarioCode] || 'TECH'} sector with appropriate tax rates and business data.`
    };
};

// Generate random sample data (randomly selects one of the scenarios)
export const generateRandomSampleData = (scenarioId?: string): ScenarioInvoiceFormData => {
    const scenarios: ('TECH' | 'MANUFACTURING' | 'RETAIL')[] = ['TECH', 'MANUFACTURING', 'RETAIL'];
    return generateSampleData(scenarios[Math.floor(Math.random() * scenarios.length)], scenarioId);
};

// Generate minimal sample data for quick testing
export const generateMinimalSampleData = (scenarioId?: string): ScenarioInvoiceFormData => {
    const minimalItem: InvoiceItemCalculated = {
        hs_code: '8471.3000',
        item_name: 'Test Product - Sample Item',
        quantity: 1,
        unit_price: 10000, // Price excluding tax
        uom_code: 'PCS',
        tax_rate: 16,
        value_sales_excluding_st: 10000, // 10000 * 1
        sales_tax: 1600, // 10000 * 0.16
        total_amount: 11600, // 10000 + 1600
        unit_price_excluding_tax: 10000, // Already excluding tax
        fixed_notified_value: 11600,
        retail_price: 10000,
        invoice_note: 'Minimal test item',
        is_third_schedule: true
    };

    return {
        invoiceType: 'Sale Invoice',
        invoiceDate: new Date().toISOString().split('T')[0],
        sellerNTNCNIC: '3540504912049', // Authorized seller NTN/CNIC
        sellerBusinessName: 'Farooq Traders',
        sellerProvince: 'Punjab',
        sellerAddress: '123 Test Street, Lahore',
        buyerNTNCNIC: '3562101254686', // Authorized buyer NTN/CNIC
        buyerBusinessName: 'Al Ihsna',
        buyerProvince: 'Sindh',
        buyerAddress: '456 Test Avenue, Karachi',
        buyerRegistrationType: 'NTN',
        invoiceRefNo: generateInvoiceNumber(),
        scenarioId: scenarioId || '',
        items: [minimalItem],
        totalAmount: minimalItem.total_amount,
        notes: 'Minimal sample data for quick testing.'
    };
};

// Generate scenario-specific minimal sample data
export const generateScenarioSpecificMinimalData = (scenarioCode: string, scenarioId?: string): ScenarioInvoiceFormData => {
    // Map scenario codes to appropriate minimal items
    const scenarioMinimalItems: Record<string, InvoiceItemCalculated> = {
        'SN001': { // Standard rate to registered buyers
            hs_code: '8471.3000',
            item_name: 'Laptop Computer - Standard Rate Sale',
            quantity: 1,
            unit_price: 150000, // Price excluding tax
            uom_code: 'PCS',
            tax_rate: 16,
            value_sales_excluding_st: 150000, // 150000 * 1
            sales_tax: 24000, // 150000 * 0.16
            total_amount: 174000, // 150000 + 24000
            unit_price_excluding_tax: 150000, // Already excluding tax
            fixed_notified_value: 174000,
            retail_price: 150000,
            invoice_note: 'Standard rate sale to registered buyer',
            is_third_schedule: false
        },
        'SN002': { // Standard rate to unregistered buyers
            hs_code: '8517.1300',
            item_name: 'Smartphone - Standard Rate Sale',
            quantity: 1,
            unit_price: 100000, // Price excluding tax
            uom_code: 'PCS',
            tax_rate: 16,
            value_sales_excluding_st: 100000, // 100000 * 1
            sales_tax: 16000, // 100000 * 0.16
            total_amount: 116000, // 100000 + 16000
            unit_price_excluding_tax: 100000, // Already excluding tax
            fixed_notified_value: 116000,
            retail_price: 100000,
            invoice_note: 'Standard rate sale to unregistered buyer',
            is_third_schedule: false
        },
        'SN003': { // Steel sector
            hs_code: '7210.4100',
            item_name: 'Steel Sheets - Hot Rolled',
            quantity: 1,
            unit_price: 85000, // Price excluding tax
            uom_code: 'TON',
            tax_rate: 16,
            value_sales_excluding_st: 85000, // 85000 * 1
            sales_tax: 13600, // 85000 * 0.16
            total_amount: 98600, // 85000 + 13600
            unit_price_excluding_tax: 85000, // Already excluding tax
            fixed_notified_value: 98600,
            retail_price: 85000,
            invoice_note: 'Steel sector sale',
            is_third_schedule: false
        },
        'SN005': { // Reduced rate sale
            hs_code: '6104.4300',
            item_name: 'Women\'s Dresses - Reduced Rate',
            quantity: 10,
            unit_price: 2500, // Price excluding tax
            uom_code: 'PCS',
            tax_rate: 8,
            value_sales_excluding_st: 25000, // 2500 * 10
            sales_tax: 2000, // 25000 * 0.08
            total_amount: 27000, // 25000 + 2000
            unit_price_excluding_tax: 2500, // Already excluding tax
            fixed_notified_value: 27000,
            retail_price: 25000,
            invoice_note: 'Reduced rate sale (8%)',
            is_third_schedule: false
        },
        'SN006': { // Exempt goods sale
            hs_code: '1001.9900',
            item_name: 'Wheat - Exempt Goods',
            quantity: 100,
            unit_price: 100, // Price excluding tax
            uom_code: 'KG',
            tax_rate: 0,
            value_sales_excluding_st: 10000, // 100 * 100
            sales_tax: 0, // 10000 * 0
            total_amount: 10000, // 10000 + 0
            unit_price_excluding_tax: 100, // Already excluding tax
            fixed_notified_value: 10000,
            retail_price: 10000,
            invoice_note: 'Exempt goods sale (0% tax)',
            is_third_schedule: false
        },
        'SN007': { // Zero rated sale
            hs_code: '5208.5200',
            item_name: 'Cotton Fabric - Zero Rated',
            quantity: 50,
            unit_price: 200, // Price excluding tax
            uom_code: 'MTR',
            tax_rate: 0,
            value_sales_excluding_st: 10000, // 200 * 50
            sales_tax: 0, // 10000 * 0
            total_amount: 10000, // 10000 + 0
            unit_price_excluding_tax: 200, // Already excluding tax
            fixed_notified_value: 10000,
            retail_price: 10000,
            invoice_note: 'Zero rated sale (0% tax)',
            is_third_schedule: false
        },
        'SN008': { // 3rd schedule goods
            hs_code: '8471.3000',
            item_name: 'Laptop Computer - 3rd Schedule',
            quantity: 1,
            unit_price: 150000,
            uom_code: 'PCS',
            tax_rate: 16,
            value_sales_excluding_st: 126000,
            sales_tax: 24000,
            total_amount: 150000,
            unit_price_excluding_tax: 126000,
            fixed_notified_value: 150000,
            retail_price: 126000,
            invoice_note: '3rd schedule goods with MRP',
            is_third_schedule: true
        }
    };

    const minimalItem = scenarioMinimalItems[scenarioCode] || scenarioMinimalItems['SN001'];

    return {
        invoiceType: 'Sale Invoice',
        invoiceDate: new Date().toISOString().split('T')[0],
        sellerNTNCNIC: '3540504912049', // Authorized seller NTN/CNIC
        sellerBusinessName: 'Farooq Traders',
        sellerProvince: 'Punjab',
        sellerAddress: '123 Test Street, Lahore',
        buyerNTNCNIC: '3562101254686', // Authorized buyer NTN/CNIC
        buyerBusinessName: 'Al Ihsna',
        buyerProvince: 'Sindh',
        buyerAddress: '456 Test Avenue, Karachi',
        buyerRegistrationType: 'NTN',
        invoiceRefNo: generateInvoiceNumber(),
        scenarioId: scenarioId || '',
        items: [minimalItem],
        totalAmount: minimalItem.total_amount,
        notes: `Minimal sample data for scenario ${scenarioCode} - ${scenarioCode === 'SN005' ? 'Reduced Rate' : scenarioCode === 'SN006' || scenarioCode === 'SN007' ? 'Zero Rate' : scenarioCode === 'SN008' ? '3rd Schedule' : 'Standard Rate'}`
    };
};

// Generate random NTN (7 digits) or CNIC (13 digits)
export const generateNTNCNIC = (type: 'NTN' | 'CNIC'): string => {
    const min = type === 'NTN' ? 1000000 : 1000000000000;
    const max = type === 'NTN' ? 9999999 : 9999999999999;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
};
