export interface FileInfo {
    name: string;
    path: string;
    size: number;
    type: string;
  }
  
 export interface DeepSeekResponse {
    amount: number;
    confidence: number;
    explanation: string;
    debitAccount: string;
    creditAccount: string;
  }
  
  export interface InvoiceSuggestionType {
    id: string;
    user_id: string;
    file: FileInfo;
    status: "pending" | "processing" | "completed" | "failed" | "approved";
    created_at: string;
    updated_at: string;
    deepseek_response: DeepSeekResponse;
  }

  export interface PaginatedResponse {
    items: InvoiceSuggestionType[];
    total: number;
  }