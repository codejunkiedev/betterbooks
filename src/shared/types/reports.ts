export interface DateRange {
    start: string;
    end: string;
}

export interface PLAccount {
    account_id: string;
    account_name: string;
    account_type: 'REVENUE' | 'EXPENSE' | 'COGS';
    total_amount: number;
}

export interface ProfitLossData {
    period: DateRange;
    revenue: PLAccount[];
    expenses: PLAccount[];
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    grossProfit: number;
}

export interface DateRangeOption {
    label: string;
    start: string;
    end: string;
}

export interface BalanceSheetAccount {
    account_id: string;
    account_name: string;
    account_type: 'ASSET' | 'LIABILITY' | 'EQUITY';
    balance: number;
    normal_balance: 'DEBIT' | 'CREDIT';
}

export interface BalanceSheetData {
    asOfDate: string;
    assets: BalanceSheetAccount[];
    liabilities: BalanceSheetAccount[];
    equity: BalanceSheetAccount[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
    difference: number;
} 