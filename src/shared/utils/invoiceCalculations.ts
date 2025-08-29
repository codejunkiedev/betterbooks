import type {
    InvoiceItemForm,
    InvoiceItemCalculated,
    InvoiceItemValidation,
    InvoiceRunningTotals
} from '@/shared/types/invoice';
import { SYSTEM_DEFAULTS, COMMON_UOM_PRIORITIES } from '@/shared/constants/invoiceDefaults';

/**
 * Calculate tax and totals for an invoice item
 */
export function calculateInvoiceItem(item: InvoiceItemForm): InvoiceItemCalculated {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const taxRate = Number(item.tax_rate) || 0;

    // Calculate basic totals - unit_price is the price excluding tax
    const valueSalesExcludingST = quantity * unitPrice;
    const salesTax = (valueSalesExcludingST * taxRate) / 100;
    const totalAmount = valueSalesExcludingST + salesTax;
    const unitPriceExcludingTax = unitPrice; // Already excluding tax

    // Handle 3rd schedule items (MRP fields)
    let fixedNotifiedValue = undefined;
    let retailPrice = undefined;

    if (item.is_third_schedule) {
        fixedNotifiedValue = item.mrp_including_tax || totalAmount;
        retailPrice = item.mrp_excluding_tax || valueSalesExcludingST;
    }

    return {
        id: item.id,
        hs_code: item.hs_code,
        item_name: item.item_name,
        quantity,
        unit_price: unitPrice,
        uom_code: item.uom_code,
        tax_rate: taxRate,
        value_sales_excluding_st: valueSalesExcludingST,
        sales_tax: salesTax,
        total_amount: totalAmount,
        unit_price_excluding_tax: unitPriceExcludingTax,
        fixed_notified_value: fixedNotifiedValue,
        retail_price: retailPrice,
        invoice_note: item.invoice_note,
        is_third_schedule: item.is_third_schedule
    };
}

/**
 * Calculate running totals for multiple invoice items
 */
export function calculateRunningTotals(items: InvoiceItemCalculated[]): InvoiceRunningTotals {
    return items.reduce((totals, item) => ({
        total_quantity: totals.total_quantity + (item.quantity || 0),
        total_value_excluding_tax: totals.total_value_excluding_tax + (item.value_sales_excluding_st || 0),
        total_sales_tax: totals.total_sales_tax + (item.sales_tax || 0),
        total_amount: totals.total_amount + (item.total_amount || 0),
        total_items: totals.total_items + 1
    }), {
        total_quantity: 0,
        total_value_excluding_tax: 0,
        total_sales_tax: 0,
        total_amount: 0,
        total_items: 0
    });
}

/**
 * Validate an invoice item form
 */
export function validateInvoiceItem(item: InvoiceItemForm): InvoiceItemValidation {
    const errors: Record<string, string> = {};

    // Required fields
    if (!item.hs_code?.trim()) {
        errors.hs_code = 'HS Code is required';
    }

    if (!item.item_name?.trim()) {
        errors.item_name = 'Product description is required';
    } else if (item.item_name.length > SYSTEM_DEFAULTS.MAX_DESCRIPTION_LENGTH) {
        errors.item_name = `Product description must be ${SYSTEM_DEFAULTS.MAX_DESCRIPTION_LENGTH} characters or less`;
    }

    if (!item.quantity || item.quantity <= 0) {
        errors.quantity = 'Quantity must be greater than 0';
    } else if (item.quantity < SYSTEM_DEFAULTS.MIN_QUANTITY) {
        errors.quantity = `Quantity must be at least ${SYSTEM_DEFAULTS.MIN_QUANTITY}`;
    }

    if (item.unit_price === undefined || item.unit_price === null || item.unit_price < SYSTEM_DEFAULTS.MIN_UNIT_PRICE) {
        errors.unit_price = `Unit price must be ${SYSTEM_DEFAULTS.MIN_UNIT_PRICE} or greater`;
    }

    if (!item.uom_code?.trim()) {
        errors.uom_code = 'Unit of measure is required';
    }

    if (item.tax_rate < SYSTEM_DEFAULTS.MIN_TAX_RATE || item.tax_rate > SYSTEM_DEFAULTS.MAX_TAX_RATE) {
        errors.tax_rate = `Tax rate must be between ${SYSTEM_DEFAULTS.MIN_TAX_RATE} and ${SYSTEM_DEFAULTS.MAX_TAX_RATE}`;
    }

    // 3rd schedule validation
    if (item.is_third_schedule) {
        if (item.mrp_including_tax !== undefined && item.mrp_including_tax < 0) {
            errors.mrp_including_tax = 'MRP including tax must be 0 or greater';
        }
        if (item.mrp_excluding_tax !== undefined && item.mrp_excluding_tax < 0) {
            errors.mrp_excluding_tax = 'MRP excluding tax must be 0 or greater';
        }
    }

    // Invoice note validation
    if (item.invoice_note && item.invoice_note.length > 200) {
        errors.invoice_note = 'Invoice note must be 200 characters or less';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate multiple invoice items
 */
export function validateInvoiceItems(items: InvoiceItemForm[]): InvoiceItemValidation {
    const errors: Record<string, string> = {};

    if (items.length === 0) {
        errors.items = 'At least one item is required';
        return { isValid: false, errors };
    }

    // Validate each item
    items.forEach((item, index) => {
        const itemValidation = validateInvoiceItem(item);
        if (!itemValidation.isValid) {
            Object.entries(itemValidation.errors).forEach(([field, error]) => {
                errors[`item_${index}_${field}`] = error;
            });
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Format currency values for display
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format percentage values for display
 */
export function formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
}

/**
 * Format quantity values for display
 */
export function formatQuantity(quantity: number): string {
    return new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(quantity);
}

/**
 * Check if an item is 3rd schedule based on HS code
 */
export function isThirdScheduleItem(hsCode: string): boolean {
    // This is a simplified check - in practice, this would be determined by FBR API
    // or a comprehensive list of 3rd schedule items
    const thirdSchedulePatterns = [
        /^8471/, // Automatic data processing machines
        /^8517/, // Telephone sets
        /^8528/, // Television receivers
        /^8527/, // Radio receivers
        /^8519/, // Sound recording apparatus
        /^8521/, // Video recording apparatus
        /^8523/, // Prepared unrecorded media
        /^8525/, // Transmission apparatus
        /^8526/, // Radar apparatus
        /^8529/, // Parts for TV/radio apparatus
        /^8531/, // Electric sound/visual signaling apparatus
        /^8532/, // Electric capacitors
        /^8533/, // Electrical resistors
        /^8534/, // Printed circuits
        /^8535/, // Electrical apparatus for switching
        /^8536/, // Electrical apparatus for protecting electrical circuits
        /^8537/, // Boards, panels, consoles for electric control
        /^8538/, // Parts for electrical apparatus
        /^8539/, // Electric filament lamps
        /^8540/, // Thermionic, cold cathode or photo-cathode tubes
        /^8541/, // Diodes, transistors and similar semiconductor devices
        /^8542/, // Electronic integrated circuits
        /^8543/, // Electrical machines and apparatus
        /^8544/, // Insulated wire, cable and other insulated electric conductors
        /^8545/, // Carbon electrodes, carbon brushes, lamp carbons
        /^8546/, // Electrical insulators
        /^8547/, // Insulating fittings for electrical machines
        /^8548/, // Waste and scrap of primary cells
        /^9001/, // Optical fibers and optical fiber bundles
        /^9002/, // Optical elements
        /^9003/, // Frames and mountings for spectacles
        /^9004/, // Spectacles, goggles and the like
        /^9005/, // Binoculars, monoculars, other optical telescopes
        /^9006/, // Photographic cameras
        /^9007/, // Cinematographic cameras and projectors
        /^9008/, // Image projectors
        /^9009/, // Photocopying apparatus
        /^9010/, // Apparatus and equipment for photographic laboratories
        /^9011/, // Compound optical microscopes
        /^9012/, // Microscopes other than optical microscopes
        /^9013/, // Other optical appliances and instruments
        /^9014/, // Direction finding compasses
        /^9015/, // Surveying instruments
        /^9016/, // Balances of a sensitivity of 5 cg or better
        /^9017/, // Drawing, marking-out or mathematical calculating instruments
        /^9018/, // Medical, surgical, dental or veterinary instruments
        /^9019/, // Mechano-therapy appliances
        /^9020/, // Other breathing appliances and gas masks
        /^9021/, // Orthopedic appliances
        /^9022/, // X-ray apparatus
        /^9023/, // Instruments, apparatus and models
        /^9024/, // Machines and appliances for testing
        /^9025/, // Hydrometers and similar floating instruments
        /^9026/, // Instruments and apparatus for measuring or checking
        /^9027/, // Instruments and apparatus for physical or chemical analysis
        /^9028/, // Gas, liquid or electricity supply or production meters
        /^9029/, // Revolution counters, production counters, taximeters
        /^9030/, // Speed indicators and tachometers
        /^9031/, // Measuring or checking instruments
        /^9032/, // Automatic regulating or controlling instruments
        /^9033/, // Parts and accessories for instruments
        /^9503/, // Other toys
        /^9504/, // Video game consoles and machines
        /^9505/, // Festive, carnival or other entertainment articles
        /^9506/, // Articles and equipment for general physical exercise
        /^9507/, // Fishing rods, fish-hooks and other line fishing tackle
        /^9508/, // Roundabouts, swings, shooting galleries and other fairground amusements
        /^9603/, // Brooms, brushes, mops and feather dusters
        /^9604/, // Hand sieves and hand riddles
        /^9605/, // Travel sets for personal toilet, sewing or shoe cleaning
        /^9606/, // Buttons, press-fasteners, snap-fasteners and press-studs
        /^9607/, // Slide fasteners
        /^9608/, // Ball point pens
        /^9609/, // Pencils, crayons, pencil leads
        /^9610/, // Slates and boards
        /^9611/, // Date, sealing or numbering stamps
        /^9612/, // Typewriter or similar ribbons
        /^9613/, // Cigarette lighters and other lighters
        /^9614/, // Smoking pipes and cigar or cigarette holders
        /^9615/, // Combs, hair-slides and the like
        /^9616/, // Scent sprays and similar toilet sprays
        /^9617/, // Vacuum flasks and other vacuum vessels
        /^9618/, // Tailors' dummies and other lay figures
        /^9619/, // Sanitary towels and tampons
        /^9620/, // Monopods, bipods, tripods and similar articles
    ];

    return thirdSchedulePatterns.some(pattern => pattern.test(hsCode));
}

/**
 * Get dynamic tax rate for HS code from cached data or FBR API
 * Falls back to system defaults only when no data is available
 */
export function getDefaultTaxRate(hsCode: string, cachedHSCodeData?: { default_tax_rate?: number }): number {
    // First priority: Use cached data if available
    if (cachedHSCodeData?.default_tax_rate !== undefined) {
        return cachedHSCodeData.default_tax_rate;
    }

    // Second priority: Dynamic lookup based on HS code patterns
    // This should ideally come from FBR API or database

    // For 3rd schedule items, use system default
    if (isThirdScheduleItem(hsCode)) {
        return SYSTEM_DEFAULTS.DEFAULT_TAX_RATE;
    }

    // TODO: Replace with actual FBR API call or database lookup
    // This is a simplified fallback implementation
    const code = hsCode.substring(0, 4);

    // Zero-rated items (should come from FBR data)
    const zeroRatedCodes = ['0101', '0102', '0103', '0104', '0105', '0106', '0201', '0202', '0203', '0204', '0205', '0206', '0207', '0208', '0209', '0210'];
    if (zeroRatedCodes.includes(code)) {
        return 0;
    }

    // Reduced rate items (should come from FBR data)
    const reducedRateCodes = ['1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008'];
    if (reducedRateCodes.includes(code)) {
        return 5;
    }

    // Last resort: System default
    return SYSTEM_DEFAULTS.DEFAULT_TAX_RATE;
}

/**
 * Get dynamic UOM for HS code from cached data or FBR API
 * Falls back to system defaults only when no data is available
 */
export function getDefaultUOM(hsCode: string, cachedHSCodeData?: { default_uom?: string }, availableUOMs?: string[]): string {
    // First priority: Use cached data if available
    if (cachedHSCodeData?.default_uom) {
        return cachedHSCodeData.default_uom;
    }

    // Second priority: Use most common UOM from available options

    if (availableUOMs && availableUOMs.length > 0) {
        // Find the first priority UOM that's available
        for (const priorityUOM of COMMON_UOM_PRIORITIES) {
            if (availableUOMs.includes(priorityUOM)) {
                return priorityUOM;
            }
        }
        // If no priority UOM found, use the first available
        return availableUOMs[0];
    }

    // Third priority: Dynamic lookup based on HS code patterns
    // TODO: Replace with actual FBR API call or database lookup
    const code = hsCode.substring(0, 4);

    // Weight-based items (should come from FBR data)
    const weightCodes = ['0101', '0102', '0103', '0104', '0105', '0106', '0201', '0202', '0203', '0204', '0205', '0206', '0207', '0208', '0209', '0210'];
    if (weightCodes.includes(code)) {
        return 'KG';
    }

    // Volume-based items (should come from FBR data)
    const volumeCodes = ['2201', '2202', '2203', '2204', '2205', '2206', '2207', '2208', '2209'];
    if (volumeCodes.includes(code)) {
        return 'LTR';
    }

    // Length-based items (should come from FBR data)
    const lengthCodes = ['5201', '5202', '5203', '5204', '5205', '5206', '5207', '5208', '5209'];
    if (lengthCodes.includes(code)) {
        return 'MTR';
    }

    // Last resort: System default
    return SYSTEM_DEFAULTS.DEFAULT_UOM;
}
