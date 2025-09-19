

import { RegistrationType } from '@/shared/constants/buyer';

export interface Buyer {
    id: number;
    user_id: string;
    ntn_cnic: string;
    business_name: string;
    province_code: string;
    address: string;
    registration_type: RegistrationType;
    is_walk_in: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateBuyerData {
    ntn_cnic: string;
    business_name: string;
    province_code: string;
    address: string;
    registration_type: RegistrationType;
    is_walk_in?: boolean;
}

export interface UpdateBuyerData extends Partial<CreateBuyerData> {
    id: number;
}

export interface BuyerSearchParams {
    query: string;
    limit?: number;
}

export interface BuyerSearchResult {
    id: number;
    ntn_cnic: string;
    business_name: string;
    province_code: string;
    address: string;
    registration_type: RegistrationType;
    relevance_score?: number;
}

export interface WalkInCustomerData {
    ntn_cnic: string;
    business_name: string;
    province_code: string;
    address: string;
    registration_type: RegistrationType;
    is_walk_in: true;
}
