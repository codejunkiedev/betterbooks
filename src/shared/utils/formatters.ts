/**
 * Utility functions for formatting data display
 */

/**
 * Formats company type for display
 * @param type - The company type string
 * @returns Formatted company type or 'N/A' if undefined
 */
export const formatCompanyType = (type: string | undefined): string => {
    if (!type) return 'N/A';

    // Replace underscores with spaces and format each word
    return type
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid Date';
    }
};

/**
 * Formats currency values
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(amount);
    } catch {
        return `${amount} ${currency}`;
    }
}; 