export interface LineItem {
    id: string;
    invoice_id: string;
    description: string;
    amount: number;
    quantity: number;
    unit_price?: number;
    is_asset: boolean;
    asset_type?: string;
    asset_life_months?: number;
    created_at: string;
    updated_at: string;
}

export interface CreateLineItemData {
    invoice_id: string;
    description: string;
    amount: number;
    quantity: number;
    unit_price?: number;
    is_asset: boolean;
    asset_type?: string;
    asset_life_months?: number;
} 