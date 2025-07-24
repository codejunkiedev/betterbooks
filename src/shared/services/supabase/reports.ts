import { supabase } from "./client";
import { PostgrestError } from "@supabase/supabase-js";
import { DateRange, PLAccount, ProfitLossData } from "@/shared/types/reports";

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

export interface TrialBalanceAccount {
    account_id: string;
    account_name: string;
    account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'COGS' | 'CONTRA_REVENUE';
    total_debits: number;
    total_credits: number;
    normal_balance: 'DEBIT' | 'CREDIT';
}

export interface TrialBalanceData {
    period: DateRange;
    accounts: TrialBalanceAccount[];
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
    difference: number;
}

export const generateBalanceSheet = async (asOfDate: string): Promise<{
    data: BalanceSheetData | null;
    error: PostgrestError | null;
}> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get user's company
        const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (companyError) throw companyError;
        if (!company) throw new Error('Company not found');

        // Get all journal entries up to the as of date
        const { data: journalEntries, error: entriesError } = await supabase
            .from("journal_entries")
            .select(`
        id,
        entry_date,
        journal_entry_lines (
          id,
          account_id,
          type,
          amount
        )
      `)
            .eq("company_id", company.id)
            .lte("entry_date", asOfDate);

        if (entriesError) throw entriesError;

        // Get account information for asset, liability, and equity accounts
        const { data: accounts, error: accountsError } = await supabase
            .from("company_coa")
            .select("id, account_name, account_type")
            .eq("company_id", company.id);

        if (accountsError) throw accountsError;

        // Filter for balance sheet accounts
        const balanceSheetAccounts = accounts?.filter(acc =>
            acc.account_type === 'ASSET' || acc.account_type === 'LIABILITY' || acc.account_type === 'EQUITY'
        ) || [];
        const accountMap = new Map(balanceSheetAccounts.map(acc => [acc.id, acc]));

        // Calculate account balances
        const accountBalances = new Map<string, { name: string; type: string; balance: number }>();

        // Initialize all accounts with zero balance
        balanceSheetAccounts.forEach(account => {
            accountBalances.set(account.id, {
                name: account.account_name,
                type: account.account_type,
                balance: 0
            });
        });

        // Calculate balances from journal entries
        journalEntries?.forEach(entry => {
            entry.journal_entry_lines?.forEach(line => {
                const account = accountMap.get(line.account_id);
                if (account) {
                    const current = accountBalances.get(line.account_id);
                    if (current) {
                        const amount = parseFloat(line.amount.toString());

                        // Assets: Debits increase, Credits decrease
                        // Liabilities & Equity: Credits increase, Debits decrease
                        if (account.account_type === 'ASSET') {
                            if (line.type === 'DEBIT') {
                                current.balance += amount;
                            } else {
                                current.balance -= amount;
                            }
                        } else {
                            // LIABILITY and EQUITY
                            if (line.type === 'CREDIT') {
                                current.balance += amount;
                            } else {
                                current.balance -= amount;
                            }
                        }

                        accountBalances.set(line.account_id, current);
                    }
                }
            });
        });

        // Separate accounts by type
        const assets: BalanceSheetAccount[] = [];
        const liabilities: BalanceSheetAccount[] = [];
        const equity: BalanceSheetAccount[] = [];
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;

        accountBalances.forEach((account, accountId) => {
            const balanceSheetAccount: BalanceSheetAccount = {
                account_id: accountId,
                account_name: account.name,
                account_type: account.type as 'ASSET' | 'LIABILITY' | 'EQUITY',
                balance: Math.abs(account.balance),
                normal_balance: account.type === 'ASSET' ? 'DEBIT' : 'CREDIT'
            };

            if (account.type === 'ASSET') {
                assets.push(balanceSheetAccount);
                totalAssets += account.balance;
            } else if (account.type === 'LIABILITY') {
                liabilities.push(balanceSheetAccount);
                totalLiabilities += account.balance;
            } else if (account.type === 'EQUITY') {
                equity.push(balanceSheetAccount);
                totalEquity += account.balance;
            }
        });

        // Sort accounts by balance (highest first)
        assets.sort((a, b) => b.balance - a.balance);
        liabilities.sort((a, b) => b.balance - a.balance);
        equity.sort((a, b) => b.balance - a.balance);

        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
        const difference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
        const isBalanced = difference < 0.01; // Allow for small rounding differences

        return {
            data: {
                asOfDate,
                assets,
                liabilities,
                equity,
                totalAssets,
                totalLiabilities,
                totalEquity,
                totalLiabilitiesAndEquity,
                isBalanced,
                difference
            },
            error: null
        };
    } catch (error) {
        console.error("Error generating balance sheet:", error);
        return { data: null, error: error as PostgrestError };
    }
};

export const generateProfitLossStatement = async (dateRange: DateRange): Promise<{
    data: ProfitLossData | null;
    error: PostgrestError | null;
}> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get user's company
        const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (companyError) throw companyError;
        if (!company) throw new Error('Company not found');

        // Get journal entries for the period
        const { data: journalEntries, error: entriesError } = await supabase
            .from("journal_entries")
            .select(`
        id,
        entry_date,
        journal_entry_lines (
          id,
          account_id,
          type,
          amount
        )
      `)
            .eq("company_id", company.id)
            .gte("entry_date", dateRange.start)
            .lte("entry_date", dateRange.end);

        if (entriesError) throw entriesError;

        // Get account information for revenue and expense accounts
        const { data: accounts, error: accountsError } = await supabase
            .from("company_coa")
            .select("id, account_name, account_type")
            .eq("company_id", company.id);

        if (accountsError) throw accountsError;

        // Create account lookup and filter for revenue/expense accounts
        const revenueExpenseAccounts = accounts?.filter(acc =>
            acc.account_type === 'REVENUE' || acc.account_type === 'EXPENSE' || acc.account_type === 'COGS'
        ) || [];
        const accountMap = new Map(revenueExpenseAccounts.map(acc => [acc.id, acc]));

        // Calculate totals by account
        const accountTotals = new Map<string, { name: string; type: string; amount: number }>();

        journalEntries?.forEach(entry => {
            entry.journal_entry_lines?.forEach(line => {
                const account = accountMap.get(line.account_id);
                if (account) {
                    const current = accountTotals.get(line.account_id) || {
                        name: account.account_name,
                        type: account.account_type,
                        amount: 0
                    };

                    // For revenue accounts, credits increase revenue
                    // For expense and COGS accounts, debits increase expenses
                    if (account.account_type === 'REVENUE') {
                        if (line.type === 'CREDIT') {
                            current.amount += parseFloat(line.amount.toString());
                        } else {
                            current.amount -= parseFloat(line.amount.toString());
                        }
                    } else if (account.account_type === 'EXPENSE' || account.account_type === 'COGS') {
                        if (line.type === 'DEBIT') {
                            current.amount += parseFloat(line.amount.toString());
                        } else {
                            current.amount -= parseFloat(line.amount.toString());
                        }
                    }

                    accountTotals.set(line.account_id, current);
                }
            });
        });

        // Separate revenue and expenses
        const revenue: PLAccount[] = [];
        const expenses: PLAccount[] = [];
        let totalRevenue = 0;
        let totalExpenses = 0;

        accountTotals.forEach((account, accountId) => {
            if (account.amount !== 0) {
                const plAccount: PLAccount = {
                    account_id: accountId,
                    account_name: account.name,
                    account_type: account.type as 'REVENUE' | 'EXPENSE' | 'COGS',
                    total_amount: Math.abs(account.amount)
                };

                if (account.type === 'REVENUE') {
                    revenue.push(plAccount);
                    totalRevenue += account.amount;
                } else if (account.type === 'EXPENSE' || account.type === 'COGS') {
                    expenses.push(plAccount);
                    totalExpenses += account.amount;
                }
            }
        });

        // Sort by amount (highest first)
        revenue.sort((a, b) => b.total_amount - a.total_amount);
        expenses.sort((a, b) => b.total_amount - a.total_amount);

        const netProfit = totalRevenue - totalExpenses;
        const grossProfit = totalRevenue; // For P&L, gross profit is typically revenue

        return {
            data: {
                period: dateRange,
                revenue,
                expenses,
                totalRevenue,
                totalExpenses,
                netProfit,
                grossProfit
            },
            error: null
        };
    } catch (error) {
        console.error("Error generating profit & loss statement:", error);
        return { data: null, error: error as PostgrestError };
    }
};

export const generateTrialBalance = async (dateRange: DateRange): Promise<{
    data: TrialBalanceData | null;
    error: PostgrestError | null;
}> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get user's company
        const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (companyError) throw companyError;
        if (!company) throw new Error('Company not found');

        // Get all journal entries within the date range
        const { data: journalEntries, error: entriesError } = await supabase
            .from("journal_entries")
            .select(`
        id,
        entry_date,
        journal_entry_lines (
          id,
          account_id,
          type,
          amount
        )
      `)
            .eq("company_id", company.id)
            .gte("entry_date", dateRange.start)
            .lte("entry_date", dateRange.end);

        if (entriesError) throw entriesError;

        // Get all accounts from COA
        const { data: accounts, error: accountsError } = await supabase
            .from("company_coa")
            .select("id, account_name, account_type")
            .eq("company_id", company.id);

        if (accountsError) throw accountsError;

        // Initialize trial balance accounts
        const trialBalanceAccounts: TrialBalanceAccount[] = accounts?.map(account => ({
            account_id: account.id,
            account_name: account.account_name,
            account_type: account.account_type as 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'COGS' | 'CONTRA_REVENUE',
            total_debits: 0,
            total_credits: 0,
            normal_balance: account.account_type === 'ASSET' || account.account_type === 'EXPENSE' || account.account_type === 'COGS' ? 'DEBIT' : 'CREDIT'
        })) || [];

        // Calculate totals from journal entries
        journalEntries?.forEach(entry => {
            entry.journal_entry_lines?.forEach(line => {
                const account = trialBalanceAccounts.find(acc => acc.account_id === line.account_id);
                if (account) {
                    const amount = parseFloat(line.amount.toString());
                    if (line.type === 'DEBIT') {
                        account.total_debits += amount;
                    } else {
                        account.total_credits += amount;
                    }
                }
            });
        });

        // Filter out accounts with zero activity (optional - you can remove this if you want to show all accounts)
        const activeAccounts = trialBalanceAccounts.filter(account =>
            account.total_debits > 0 || account.total_credits > 0
        );

        // Sort accounts by account type and then by name
        activeAccounts.sort((a, b) => {
            const typeOrder = { 'ASSET': 1, 'LIABILITY': 2, 'EQUITY': 3, 'REVENUE': 4, 'EXPENSE': 5, 'COGS': 6, 'CONTRA_REVENUE': 7 };
            const aOrder = typeOrder[a.account_type] || 999;
            const bOrder = typeOrder[b.account_type] || 999;

            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            return a.account_name.localeCompare(b.account_name);
        });

        // Calculate totals
        const totalDebits = activeAccounts.reduce((sum, account) => sum + account.total_debits, 0);
        const totalCredits = activeAccounts.reduce((sum, account) => sum + account.total_credits, 0);
        const difference = Math.abs(totalDebits - totalCredits);
        const isBalanced = difference < 0.01; // Allow for small rounding differences

        return {
            data: {
                period: dateRange,
                accounts: activeAccounts,
                totalDebits,
                totalCredits,
                isBalanced,
                difference
            },
            error: null
        };
    } catch (error) {
        console.error("Error generating trial balance:", error);
        return { data: null, error: error as PostgrestError };
    }
};

export const getDateRangeOptions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return {
        lastMonth: {
            label: 'Last Month',
            start: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
            end: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
        },
        lastQuarter: {
            label: 'Last Quarter',
            start: new Date(currentYear, Math.floor((currentMonth - 3) / 3) * 3, 1).toISOString().split('T')[0],
            end: new Date(currentYear, Math.floor((currentMonth - 3) / 3) * 3 + 3, 0).toISOString().split('T')[0]
        },
        currentYear: {
            label: 'Current Year',
            start: new Date(currentYear, 0, 1).toISOString().split('T')[0],
            end: new Date(currentYear, 11, 31).toISOString().split('T')[0]
        },
        lastYear: {
            label: 'Last Year',
            start: new Date(currentYear - 1, 0, 1).toISOString().split('T')[0],
            end: new Date(currentYear - 1, 11, 31).toISOString().split('T')[0]
        }
    };
}; 