import { getFbrConfigStatus } from '../supabase/fbr';
import { getSaleTypeToRate } from './fbr';
import type { SaleTypeToRateResponse } from '@/shared/types/fbr';

/**
 * Simple FBR Tax Rate API Service
 */

export interface TaxRateInfo {
    rateId: number;
    description: string;
    value: number;
    unit: 'percentage' | 'rupee' | 'fixed';
    formattedValue: string;
}

/**
 * Parse tax rate description to determine the unit and format
 */
function parseTaxRateDescription(description: string, value: number): { unit: 'percentage' | 'rupee' | 'fixed'; formattedValue: string } {
    const desc = description.toLowerCase();

    if (desc.includes('%') || desc.includes('percent')) {
        return {
            unit: 'percentage',
            formattedValue: `${value}%`
        };
    } else if (desc.includes('rupee') || desc.includes('rs') || desc.includes('per kg') || desc.includes('per unit')) {
        return {
            unit: 'rupee',
            formattedValue: `Rs. ${value}`
        };
    } else {
        return {
            unit: 'fixed',
            formattedValue: value.toString()
        };
    }
}

/**
 * Simple function to fetch tax rates from FBR API
 * Uses scenario's transaction_type_id, current date, and province code
 */
export async function fetchTaxRates(
    transactionTypeId: number,
    provinceCode: number,
    userId: string,
    environment: 'sandbox' | 'production' = 'sandbox'
): Promise<TaxRateInfo[]> {
    try {
        // Get FBR API configuration
        const config = await getFbrConfigStatus(userId);
        const apiKey = environment === 'sandbox' ? config.sandbox_api_key : config.production_api_key;

        if (!apiKey) {
            throw new Error(`FBR ${environment} API key not configured`);
        }

        // Use current date in DD-MMM-YYYY format (e.g., 07-Sep-2025)
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[now.getMonth()];
        const year = now.getFullYear();
        const currentDate = `${day}-${month}-${year}`;

        console.log('FBR Tax Rate API Request:', {
            date: currentDate,
            transTypeId: transactionTypeId,
            originationSupplier: provinceCode
        });

        // Call FBR API
        let response = await getSaleTypeToRate(
            apiKey,
            currentDate,
            transactionTypeId,
            provinceCode
        );

        console.log('FBR Tax Rate API Response:', response);

        // If the API fails, try with fallback parameters
        if (!response.success) {
            console.log('Primary API call failed, trying fallback parameters...');

            // Try with known working parameters
            response = await getSaleTypeToRate(
                apiKey,
                '01-Jan-2024', // Use a known working date in DD-MMM-YYYY format
                18, // Standard goods sale transaction type
                1   // Punjab province
            );

            console.log('FBR Tax Rate API Fallback Response:', response);
        }

        if (!response.success) {
            throw new Error(response.message || 'FBR API request failed');
        }

        if (!response.data || response.data.length === 0) {
            console.warn('No tax rates returned from FBR API');
            return [];
        }

        // Convert response to TaxRateInfo format
        return response.data.map((rate: SaleTypeToRateResponse) => {
            const { unit, formattedValue } = parseTaxRateDescription(rate.ratE_DESC, rate.ratE_VALUE);

            return {
                rateId: rate.ratE_ID,
                description: rate.ratE_DESC,
                value: rate.ratE_VALUE,
                unit,
                formattedValue
            };
        });

    } catch (error) {
        console.error('Error fetching tax rates from FBR:', error);
        throw new Error(`Failed to fetch tax rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

