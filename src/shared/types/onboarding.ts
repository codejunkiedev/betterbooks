export interface CompanySetupData {
    company_name: string;
    company_type: string;
    cash_balance: string;
    balance_date: string;
    skip_balance: boolean;
    tax_id_number: string;
    filing_status: string;
    tax_year_end: string;
    skip_tax_info: boolean;
    fbr_cnic_ntn: string;
    fbr_business_name: string;
    fbr_province_code: string;
    fbr_address: string;
    fbr_mobile_number: string;
    fbr_activity_name: string;
    fbr_sector: string;
}

export interface OnboardingPayload {
    user_id: string;
    company_data: {
        name: string;
        type: string;
        tax_id_number?: string;
        filing_status?: string;
        tax_year_end?: string;
    };
    fbr_data: {
        cnic_ntn: string;
        business_name: string;
        province_code: number;
        address: string;
        mobile_number: string;
        business_activity_id: number;
    };
    opening_balance?: {
        amount: number;
        date: string;
    } | null;
    skip_balance: boolean;
    skip_tax_info: boolean;
}

export interface OnboardingResponse {
    success: boolean;
    data: {
        company_id: string;
        company_name: string;
        fbr_profile_id: string | null;
        journal_entry_id: string | null;
        activity_id: string | null;
        has_opening_balance: boolean;
        opening_balance_amount: number;
        opening_balance_date: string | null;
        has_fbr_profile: boolean;
    };
    message: string;
}
