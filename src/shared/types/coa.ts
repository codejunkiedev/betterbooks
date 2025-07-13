export interface COATemplate {
    id: number;
    account_id: string;
    account_name: string;
    account_type: string;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface CompanyCOA {
  id: number;
  template_id: number;
  account_id: string;
  account_name: string;
  account_type: string;
  parent_id: number | null;
  company_id: number;
  credit_balance: number;
  debit_balance: number;
  created_at: string;
  updated_at: string;
}