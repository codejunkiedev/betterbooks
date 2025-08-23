import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { generateProfitLossStatement, generateBalanceSheet, generateTrialBalance, getDateRangeOptions } from "@/shared/services/supabase/reports";
import { useToast } from "@/shared/hooks/useToast";
import { ProfitLossData, BalanceSheetData, TrialBalanceData } from "@/shared/types/reports";
import {
  ProfitLossReport,
  BalanceSheetReport,
  TrialBalanceReport,
  ReportControls,
  ReportsLoadingSkeleton
} from "@/features/user/reports";

type ReportType = 'profit-loss' | 'balance-sheet' | 'trial-balance';

const Reports = () => {
  const [reportType, setReportType] = useState<ReportType>('profit-loss');
  const [plData, setPlData] = useState<ProfitLossData | null>(null);
  const [bsData, setBsData] = useState<BalanceSheetData | null>(null);
  const [tbData, setTbData] = useState<TrialBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('lastMonth');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [asOfDate, setAsOfDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  const dateRangeOptions = useMemo(() => getDateRangeOptions(), []);

  const loadProfitLossStatement = useCallback(async () => {
    try {
      setIsLoading(true);

      let dateRange;
      if (isCustomRange) {
        dateRange = customDateRange;
      } else {
        const option = dateRangeOptions[selectedDateRange as keyof typeof dateRangeOptions];
        dateRange = { start: option.start, end: option.end };
      }

      const { data, error } = await generateProfitLossStatement(dateRange);
      if (error) throw error;
      setPlData(data);
    } catch (error: unknown) {
      console.error("Error generating profit & loss statement:", error);
      toast({
        title: "Error",
        description: "Failed to generate profit & loss statement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDateRange, customDateRange, isCustomRange, dateRangeOptions, toast]);

  const loadBalanceSheet = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await generateBalanceSheet(asOfDate);
      if (error) throw error;
      setBsData(data);
    } catch (error: unknown) {
      console.error("Error generating balance sheet:", error);
      toast({
        title: "Error",
        description: "Failed to generate balance sheet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [asOfDate, toast]);

  const loadTrialBalance = useCallback(async () => {
    try {
      setIsLoading(true);

      let dateRange;
      if (isCustomRange) {
        dateRange = customDateRange;
      } else {
        const option = dateRangeOptions[selectedDateRange as keyof typeof dateRangeOptions];
        dateRange = { start: option.start, end: option.end };
      }

      const { data, error } = await generateTrialBalance(dateRange);
      if (error) throw error;
      setTbData(data);
    } catch (error: unknown) {
      console.error("Error generating trial balance:", error);
      toast({
        title: "Error",
        description: "Failed to generate trial balance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDateRange, customDateRange, isCustomRange, dateRangeOptions, toast]);

  useEffect(() => {
    if (reportType === 'profit-loss') {
      // Only load on initial mount and when dependencies change
      if (!isCustomRange || (customDateRange.start && customDateRange.end)) {
        loadProfitLossStatement();
      }
    } else if (reportType === 'balance-sheet') {
      loadBalanceSheet();
    } else if (reportType === 'trial-balance') {
      // Only load on initial mount and when dependencies change
      if (!isCustomRange || (customDateRange.start && customDateRange.end)) {
        loadTrialBalance();
      }
    }
  }, [reportType, selectedDateRange, customDateRange, isCustomRange, asOfDate, loadProfitLossStatement, loadBalanceSheet, loadTrialBalance]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomRange(true);
    } else {
      setIsCustomRange(false);
      setSelectedDateRange(value);
    }
  };

  const handleCustomDateRangeChange = (field: 'start' | 'end', value: string) => {
    setCustomDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    if (reportType === 'profit-loss') {
      loadProfitLossStatement();
    } else if (reportType === 'balance-sheet') {
      loadBalanceSheet();
    } else if (reportType === 'trial-balance') {
      loadTrialBalance();
    }
  };

  const generatePDF = () => {
    if (reportType === 'profit-loss' && plData) {
      // Create a simple HTML representation for PDF generation
      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>Profit & Loss Statement</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; }
      .header { text-align: center; margin-bottom: 30px; }
      .period { text-align: center; margin-bottom: 20px; color: #666; }
      .section { margin-bottom: 30px; }
      .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; }
      .account-row { display: flex; justify-content: space-between; margin: 5px 0; }
      .account-name { flex: 1; }
      .account-amount { font-weight: bold; }
      .total-row { border-top: 1px solid #333; margin-top: 10px; padding-top: 10px; font-weight: bold; }
      .net-profit { font-size: 20px; font-weight: bold; margin-top: 20px; padding: 10px; background-color: #f0f0f0; }
      .positive { color: #059669; }
      .negative { color: #dc2626; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Profit & Loss Statement</h1>
      <div class="period">
        For the period: ${formatDate(plData.period.start)} to ${formatDate(plData.period.end)}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Revenue</div>
      ${plData.revenue.map(account => `
        <div class="account-row">
          <span class="account-name">${account.account_name}</span>
          <span class="account-amount">${formatCurrency(account.total_amount)}</span>
        </div>
      `).join('')}
      <div class="account-row total-row">
        <span class="account-name">Total Revenue</span>
        <span class="account-amount">${formatCurrency(plData.totalRevenue)}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Expenses</div>
      ${plData.expenses.map(account => `
        <div class="account-row">
          <span class="account-name">${account.account_name}</span>
          <span class="account-amount">${formatCurrency(account.total_amount)}</span>
        </div>
      `).join('')}
      <div class="account-row total-row">
        <span class="account-name">Total Expenses</span>
        <span class="account-amount">${formatCurrency(plData.totalExpenses)}</span>
      </div>
    </div>

    <div class="net-profit ${plData.netProfit >= 0 ? 'positive' : 'negative'}">
      <div class="account-row">
        <span class="account-name">Net Profit (Loss)</span>
        <span class="account-amount">${formatCurrency(plData.netProfit)}</span>
      </div>
    </div>
  </body>
</html>
`;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profit_loss_statement_${format(new Date(), 'yyyy-MM-dd')}.html`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Profit & Loss statement has been exported.",
      });
    } else if (reportType === 'balance-sheet' && bsData) {
      // Create HTML for balance sheet
      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>Balance Sheet</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; }
      .header { text-align: center; margin-bottom: 30px; }
      .as-of-date { text-align: center; margin-bottom: 20px; color: #666; }
      .section { margin-bottom: 30px; }
      .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; }
      .account-row { display: flex; justify-content: space-between; margin: 5px 0; }
      .account-name { flex: 1; }
      .account-amount { font-weight: bold; }
      .total-row { border-top: 1px solid #333; margin-top: 10px; padding-top: 10px; font-weight: bold; }
      .balance-check { font-size: 16px; margin-top: 20px; padding: 10px; background-color: #f0f0f0; }
      .balanced { color: #059669; }
      .unbalanced { color: #dc2626; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Balance Sheet</h1>
      <div class="as-of-date">
        As of: ${formatDate(bsData.asOfDate)}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Assets</div>
      ${bsData.assets.map(account => `
        <div class="account-row">
          <span class="account-name">${account.account_name}</span>
          <span class="account-amount">${formatCurrency(account.balance)}</span>
        </div>
      `).join('')}
      <div class="account-row total-row">
        <span class="account-name">Total Assets</span>
        <span class="account-amount">${formatCurrency(bsData.totalAssets)}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Liabilities</div>
      ${bsData.liabilities.map(account => `
        <div class="account-row">
          <span class="account-name">${account.account_name}</span>
          <span class="account-amount">${formatCurrency(account.balance)}</span>
        </div>
      `).join('')}
      <div class="account-row total-row">
        <span class="account-name">Total Liabilities</span>
        <span class="account-amount">${formatCurrency(bsData.totalLiabilities)}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Equity</div>
      ${bsData.equity.map(account => `
        <div class="account-row">
          <span class="account-name">${account.account_name}</span>
          <span class="account-amount">${formatCurrency(account.balance)}</span>
        </div>
      `).join('')}
      <div class="account-row total-row">
        <span class="account-name">Total Equity</span>
        <span class="account-amount">${formatCurrency(bsData.totalEquity)}</span>
      </div>
    </div>

    <div class="balance-check ${bsData.isBalanced ? 'balanced' : 'unbalanced'}">
      <div class="account-row">
        <span class="account-name">Total Liabilities & Equity</span>
        <span class="account-amount">${formatCurrency(bsData.totalLiabilitiesAndEquity)}</span>
      </div>
      <div class="account-row">
        <span class="account-name">Balance Check</span>
        <span class="account-amount">${bsData.isBalanced ? '✓ Balanced' : `✗ Difference: ${formatCurrency(bsData.difference)}`}</span>
      </div>
    </div>
  </body>
</html>
`;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balance_sheet_${format(new Date(), 'yyyy-MM-dd')}.html`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Balance Sheet has been exported.",
      });
    } else if (reportType === 'trial-balance' && tbData) {
      // Create HTML for trial balance
      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>Trial Balance</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; }
      .header { text-align: center; margin-bottom: 30px; }
      .period { text-align: center; margin-bottom: 20px; color: #666; }
      .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      .table th { background-color: #f2f2f2; font-weight: bold; }
      .table .totals { background-color: #f9f9f9; font-weight: bold; }
      .debit { text-align: right; color: #2563eb; }
      .credit { text-align: right; color: #059669; }
      .balanced { color: #059669; }
      .unbalanced { color: #dc2626; }
      .balance-check { font-size: 16px; margin-top: 20px; padding: 10px; background-color: #f0f0f0; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Trial Balance</h1>
      <div class="period">
        For the period: ${formatDate(tbData.period.start)} to ${formatDate(tbData.period.end)}
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Account</th>
          <th>Type</th>
          <th>Debits</th>
          <th>Credits</th>
        </tr>
      </thead>
      <tbody>
        ${tbData.accounts.map(account => `
          <tr>
            <td>${account.account_name}</td>
            <td>${account.account_type}</td>
            <td class="debit">${account.total_debits > 0 ? formatCurrency(account.total_debits) : '-'}</td>
            <td class="credit">${account.total_credits > 0 ? formatCurrency(account.total_credits) : '-'}</td>
          </tr>
        `).join('')}
        <tr class="totals">
          <td>TOTALS</td>
          <td></td>
          <td class="debit ${tbData.isBalanced ? 'balanced' : 'unbalanced'}">${formatCurrency(tbData.totalDebits)}</td>
          <td class="credit ${tbData.isBalanced ? 'balanced' : 'unbalanced'}">${formatCurrency(tbData.totalCredits)}</td>
        </tr>
      </tbody>
    </table>

    <div class="balance-check ${tbData.isBalanced ? 'balanced' : 'unbalanced'}">
      <h3>Balance Check</h3>
      <p><strong>Total Debits:</strong> ${formatCurrency(tbData.totalDebits)}</p>
      <p><strong>Total Credits:</strong> ${formatCurrency(tbData.totalCredits)}</p>
      <p><strong>Status:</strong> ${tbData.isBalanced ? '✓ Balanced' : `✗ Unbalanced - Difference: ${formatCurrency(tbData.difference)}`}</p>
    </div>
  </body>
</html>
`;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trial_balance_${format(new Date(), 'yyyy-MM-dd')}.html`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Trial Balance has been exported.",
      });
    }
  };

  const currentData = reportType === 'profit-loss' ? plData : reportType === 'balance-sheet' ? bsData : tbData;

  if (isLoading) {
    return <ReportsLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 mt-1">Generate financial reports and statements</p>
          </div>
        </div>

        {/* Report Controls */}
        <ReportControls
          reportType={reportType}
          onReportTypeChange={setReportType}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={handleDateRangeChange}
          customDateRange={customDateRange}
          onCustomDateRangeChange={handleCustomDateRangeChange}
          isCustomRange={isCustomRange}
          asOfDate={asOfDate}
          onAsOfDateChange={setAsOfDate}
          onGenerate={handleGenerate}
          onExport={generatePDF}
          isLoading={isLoading}
          hasData={!!currentData}
        />

        {/* Report Content */}
        {reportType === 'profit-loss' && plData && !isLoading && (
          <ProfitLossReport data={plData} />
        )}

        {reportType === 'balance-sheet' && bsData && !isLoading && (
          <BalanceSheetReport data={bsData} />
        )}

        {reportType === 'trial-balance' && tbData && !isLoading && (
          <TrialBalanceReport data={tbData} />
        )}
      </div>
    </div>
  );
};

export default Reports; 