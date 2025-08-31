/**
 * Dynamic system defaults for invoice items
 * These are fallback values only - the system should prioritize:
 * 1. FBR API data
 * 2. Database cache
 * 3. User preferences
 * 4. These fallbacks (last resort)
 */

export const SYSTEM_DEFAULTS = {
    // Default UoM when no specific UoM is found
    DEFAULT_UOM: 'PCS',

    // Default tax rate when no specific rate is found (Pakistan current standard rate)
    DEFAULT_TAX_RATE: 18,

    // Default quantity for new items
    DEFAULT_QUANTITY: 1,

    // Minimum values
    MIN_QUANTITY: 0.01,
    MIN_UNIT_PRICE: 0,
    MIN_TAX_RATE: 0,
    MAX_TAX_RATE: 100,

    // Maximum description length
    MAX_DESCRIPTION_LENGTH: 500,
} as const;

export const COMMON_UOM_PRIORITIES = [
    'PCS', // Pieces (most common)
    'KG',  // Kilograms
    'LTR', // Liters
    'MTR', // Meters
    'PKG', // Package
    'BOX', // Box
    'SET', // Set
    'DOZ', // Dozen
] as const;

export const COMMON_TAX_RATES = [
    0,   // Zero-rated
    5,   // Reduced rate
    16,  // Standard rate (old)
    17,  // Standard rate (intermediate)
    18,  // Standard rate (current)
] as const;

/**
 * Get the first available UoM from priority list or fallback to default
 */
export function getBestAvailableUOM(availableUOMs: string[]): string {
    if (!availableUOMs || availableUOMs.length === 0) {
        return SYSTEM_DEFAULTS.DEFAULT_UOM;
    }

    // Find the first priority UOM that's available
    for (const priorityUOM of COMMON_UOM_PRIORITIES) {
        if (availableUOMs.includes(priorityUOM)) {
            return priorityUOM;
        }
    }

    // If no priority UOM found, use the first available
    return availableUOMs[0] || SYSTEM_DEFAULTS.DEFAULT_UOM;
}

/**
 * Get the most appropriate tax rate from available options
 */
export function getBestAvailableTaxRate(availableTaxRates: number[]): number {
    if (!availableTaxRates || availableTaxRates.length === 0) {
        return SYSTEM_DEFAULTS.DEFAULT_TAX_RATE;
    }

    // Find the most common current tax rate if available
    for (const commonRate of COMMON_TAX_RATES.slice().reverse()) {
        if (availableTaxRates.includes(commonRate)) {
            return commonRate;
        }
    }

    // If no common rate found, use the highest rate (usually most current)
    return Math.max(...availableTaxRates);
}
