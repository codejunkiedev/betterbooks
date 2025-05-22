export interface FileInfo {
    name: string;
    path: string;
    size: number;
    type: string;
  }
  
 export interface LineItemSuggestion {
    description: string;
    amount: number;
    quantity: number;
    unit_price?: number;
    is_asset: boolean;
    asset_type?: string;
    asset_life_months?: number;
  }
  
  export interface DeepSeekResponse {
    amount: number;
    confidence: number;
    explanation: string;
    debitAccount: string;
    creditAccount: string;
    line_items?: LineItemSuggestion[];
  }
  
  export interface InvoiceSuggestionType {
    id: string;
    user_id: string;
    file: FileInfo;
    status: "pending" | "processing" | "completed" | "failed" | "approved" | "rejected";
    created_at: string;
    updated_at: string;
    deepseek_response: DeepSeekResponse;
    type?: 'debit' | 'credit';
  }

  export interface PaginatedResponse {
    items: InvoiceSuggestionType[];
    total: number;
  }