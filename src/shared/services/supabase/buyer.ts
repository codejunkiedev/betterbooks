import { supabase } from './client';
import { ApiResponse } from '@/shared/types/api';
import {
    Buyer,
    CreateBuyerData,
    UpdateBuyerData,
    BuyerSearchParams,
    BuyerSearchResult,
    WalkInCustomerData
} from '@/shared/types/buyer';
import { getCurrentUser } from './auth';
import { WALK_IN_CUSTOMER_DATA } from '@/shared/constants/buyer';

// Helper function to validate NTN/CNIC format
const validateNTNCNIC = (ntnCnic: string): boolean => {
    const regex = /^[0-9]{7}$|^[0-9]{13}$/;
    return regex.test(ntnCnic);
};

// Helper function to validate business name
const validateBusinessName = (businessName: string): boolean => {
    return businessName.trim().length > 0 && businessName.trim().length <= 100;
};

// Create a new buyer
export const createBuyer = async (data: CreateBuyerData): Promise<ApiResponse<Buyer>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // Validate required fields
        if (!validateNTNCNIC(data.ntn_cnic)) {
            throw new Error('Invalid NTN/CNIC format. Must be 7 or 13 digits.');
        }

        if (!validateBusinessName(data.business_name)) {
            throw new Error('Business name is required and must be 100 characters or less.');
        }

        if (!data.province_code || !data.address) {
            throw new Error('Province and address are required.');
        }

        // Check for duplicate NTN/CNIC within user's buyers
        const { data: existingBuyer, error: checkError } = await supabase
            .from('buyers')
            .select('id')
            .eq('user_id', user.id)
            .eq('ntn_cnic', data.ntn_cnic)
            .maybeSingle();

        if (checkError) {
            throw checkError;
        }

        if (existingBuyer) {
            throw new Error('A buyer with this NTN/CNIC already exists.');
        }

        const { data: buyer, error } = await supabase
            .from('buyers')
            .insert({
                user_id: user.id,
                ntn_cnic: data.ntn_cnic,
                business_name: data.business_name.trim(),
                province_code: data.province_code,
                address: data.address.trim(),
                registration_type: data.registration_type,
                is_walk_in: data.is_walk_in || false
            })
            .select()
            .single();

        if (error) throw error;

        return {
            data: buyer,
            error: null
        };
    } catch (error) {
        console.error('Error creating buyer:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Get all buyers for the current user
export const getBuyers = async (): Promise<ApiResponse<Buyer[]>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: buyers, error } = await supabase
            .from('buyers')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_walk_in', false) // Exclude walk-in customers
            .order('business_name', { ascending: true });

        if (error) throw error;

        return {
            data: buyers,
            error: null
        };
    } catch (error) {
        console.error('Error fetching buyers:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Get a single buyer by ID
export const getBuyer = async (id: number): Promise<ApiResponse<Buyer>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: buyer, error } = await supabase
            .from('buyers')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        return {
            data: buyer,
            error: null
        };
    } catch (error) {
        console.error('Error fetching buyer:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Update a buyer
export const updateBuyer = async (data: UpdateBuyerData): Promise<ApiResponse<Buyer>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // Validate fields if provided
        if (data.ntn_cnic && !validateNTNCNIC(data.ntn_cnic)) {
            throw new Error('Invalid NTN/CNIC format. Must be 7 or 13 digits.');
        }

        if (data.business_name && !validateBusinessName(data.business_name)) {
            throw new Error('Business name must be 100 characters or less.');
        }

        // Check for duplicate NTN/CNIC if updating
        if (data.ntn_cnic) {
            const { data: existingBuyer, error: checkError } = await supabase
                .from('buyers')
                .select('id')
                .eq('user_id', user.id)
                .eq('ntn_cnic', data.ntn_cnic)
                .neq('id', data.id)
                .maybeSingle();

            if (checkError) {
                throw checkError;
            }

            if (existingBuyer) {
                throw new Error('A buyer with this NTN/CNIC already exists.');
            }
        }

        const updateData: Partial<CreateBuyerData> = {};
        if (data.ntn_cnic) updateData.ntn_cnic = data.ntn_cnic;
        if (data.business_name) updateData.business_name = data.business_name.trim();
        if (data.province_code) updateData.province_code = data.province_code;
        if (data.address) updateData.address = data.address.trim();
        if (data.registration_type) updateData.registration_type = data.registration_type;

        const { data: buyer, error } = await supabase
            .from('buyers')
            .update(updateData)
            .eq('id', data.id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return {
            data: buyer,
            error: null
        };
    } catch (error) {
        console.error('Error updating buyer:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Delete a buyer
export const deleteBuyer = async (id: number): Promise<ApiResponse<void>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('buyers')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        return {
            data: undefined,
            error: null
        };
    } catch (error) {
        console.error('Error deleting buyer:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Search buyers
export const searchBuyers = async (params: BuyerSearchParams): Promise<ApiResponse<BuyerSearchResult[]>> => {
    try {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { query, limit = 10 } = params;
        const searchQuery = query.trim();

        if (!searchQuery) {
            return {
                data: [],
                error: null
            };
        }

        // Full-text search across multiple fields
        const { data: buyers, error } = await supabase
            .from('buyers')
            .select('id, ntn_cnic, business_name, province_code, address, registration_type')
            .eq('user_id', user.id)
            .eq('is_walk_in', false)
            .or(`ntn_cnic.ilike.%${searchQuery}%,business_name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`)
            .order('business_name', { ascending: true })
            .limit(limit);

        if (error) throw error;

        // Add relevance scoring (simple implementation)
        const results: BuyerSearchResult[] = (buyers || []).map(buyer => ({
            ...buyer,
            relevance_score: calculateRelevanceScore(buyer, searchQuery)
        }));

        // Sort by relevance score
        results.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

        return {
            data: results,
            error: null
        };
    } catch (error) {
        console.error('Error searching buyers:', error);
        return {
            data: null,
            error: error as Error
        };
    }
};

// Helper function to calculate relevance score
const calculateRelevanceScore = (buyer: BuyerSearchResult, query: string): number => {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Exact matches get higher scores
    if (buyer.ntn_cnic === query) score += 100;
    if (buyer.business_name.toLowerCase() === queryLower) score += 80;
    if (buyer.address.toLowerCase() === queryLower) score += 60;

    // Partial matches
    if (buyer.ntn_cnic.includes(query)) score += 50;
    if (buyer.business_name.toLowerCase().includes(queryLower)) score += 40;
    if (buyer.address.toLowerCase().includes(queryLower)) score += 20;

    // Starts with matches
    if (buyer.business_name.toLowerCase().startsWith(queryLower)) score += 30;
    if (buyer.address.toLowerCase().startsWith(queryLower)) score += 15;

    return score;
};

// Generate walk-in customer data
export const generateWalkInCustomerData = (): WalkInCustomerData => {
    return {
        ntn_cnic: WALK_IN_CUSTOMER_DATA.NTN_CNIC,
        business_name: WALK_IN_CUSTOMER_DATA.BUSINESS_NAME,
        province_code: WALK_IN_CUSTOMER_DATA.PROVINCE,
        address: WALK_IN_CUSTOMER_DATA.ADDRESS,
        registration_type: WALK_IN_CUSTOMER_DATA.REGISTRATION_TYPE,
        is_walk_in: true
    };
};
