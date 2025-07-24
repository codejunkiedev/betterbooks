import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { generateProfitLossStatement, generateBalanceSheet, getDateRangeOptions } from "@/shared/services/supabase/reports";
import { useToast } from "@/shared/hooks/useToast";
import { Skeleton } from "@/shared/components/Loading";
import {
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    DollarSign,
    Calculator,
    Scale,
    Building2
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Input } from "@/shared/components/Input";
import { ProfitLossData, BalanceSheetData } from "@/shared/types/reports";

type ReportType = 'profit-loss' | 'balance-sheet';

const Reports = () => {
    const [reportType, setReportType] = useState<ReportType>('profit-loss');
    const [plData, setPlData] = useState<ProfitLossData | null>(null);
    const [bsData, setBsData] = useState<BalanceSheetData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState<string>('lastMonth');
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [isCustomRange, setIsCustomRange] = useState(false);
    const [asOfDate, setAsOfDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const { toast } = useToast();

    const dateRangeOptions = getDateRangeOptions();

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
    }, [selectedDateRange, customDateRange, isCustomRange, toast]);

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

    useEffect(() => {
        if (reportType === 'profit-loss') {
            // Only load on initial mount and when dependencies change
            if (!isCustomRange || (customDateRange.start && customDateRange.end)) {
                loadProfitLossStatement();
            }
        } else {
            loadBalanceSheet();
        }
    }, [reportType, selectedDateRange, customDateRange, isCustomRange, asOfDate]);

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

    const handleCustomDateChange = () => {
        // This will be handled by the useEffect above
        // No need to manually call loadProfitLossStatement here
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
        }
    };

    const currentData = reportType === 'profit-loss' ? plData : bsData;

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    </div>

                    {/* Report Type Selection Skeleton */}
                    <Card className="p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-6 w-48" />
                        </div>

                        {/* Report Type Tabs Skeleton */}
                        <div className="flex space-x-1 mb-6">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>

                        {/* Configuration Skeleton */}
                        <div className="mb-6">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-10 w-48" />
                        </div>

                        {/* Generate Button Skeleton */}
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-40" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </Card>

                    {/* Report Content Skeleton */}
                    <div className="space-y-6">
                        {/* Summary Cards Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Card key={index} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Skeleton className="h-4 w-24 mb-2" />
                                            <Skeleton className="h-8 w-32" />
                                        </div>
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Section Skeleton */}
                        <Card className="p-6">
                            <div className="flex items-center mb-4">
                                <Skeleton className="h-5 w-5 mr-2" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="flex items-center justify-between py-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
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

                {/* Report Type Selection */}
                <Card className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
                    </div>

                    {/* Report Type Tabs */}
                    <div className="flex space-x-1 mb-6">
                        <Button
                            variant={reportType === 'profit-loss' ? 'default' : 'outline'}
                            onClick={() => setReportType('profit-loss')}
                            className="flex items-center space-x-2"
                        >
                            <Calculator className="h-4 w-4" />
                            <span>Profit & Loss</span>
                        </Button>
                        <Button
                            variant={reportType === 'balance-sheet' ? 'default' : 'outline'}
                            onClick={() => setReportType('balance-sheet')}
                            className="flex items-center space-x-2"
                        >
                            <Scale className="h-4 w-4" />
                            <span>Balance Sheet</span>
                        </Button>
                    </div>

                    {/* Report Configuration */}
                    {reportType === 'profit-loss' ? (
                        <>
                            {/* Date Range Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                    <Select value={isCustomRange ? 'custom' : selectedDateRange} onValueChange={handleDateRangeChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select date range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lastMonth">Last Month</SelectItem>
                                            <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                                            <SelectItem value="currentYear">Current Year</SelectItem>
                                            <SelectItem value="lastYear">Last Year</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {isCustomRange && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                            <Input
                                                type="date"
                                                value={customDateRange.start}
                                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                onBlur={handleCustomDateChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                            <Input
                                                type="date"
                                                value={customDateRange.end}
                                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                onBlur={handleCustomDateChange}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* As of Date Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">As of Date</label>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <Input
                                        type="date"
                                        value={asOfDate}
                                        onChange={(e) => setAsOfDate(e.target.value)}
                                        className="w-auto"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Generate Button */}
                    <div className="flex items-center space-x-3">
                        <Button onClick={reportType === 'profit-loss' ? loadProfitLossStatement : loadBalanceSheet} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Calculator className="h-4 w-4 mr-2" />
                                    Generate Report
                                </>
                            )}
                        </Button>
                        {currentData && (
                            <Button variant="outline" onClick={generatePDF}>
                                <Download className="h-4 w-4 mr-2" />
                                Export to PDF
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Profit & Loss Statement */}
                {reportType === 'profit-loss' && plData && !isLoading && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(plData.totalRevenue)}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                        <p className="text-2xl font-bold text-red-600">{formatCurrency(plData.totalExpenses)}</p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-red-600" />
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Net Profit</p>
                                        <p className={`text-2xl font-bold ${plData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(plData.netProfit)}
                                        </p>
                                    </div>
                                    <DollarSign className={`h-8 w-8 ${plData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                </div>
                            </Card>
                        </div>

                        {/* Period Info */}
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        Period: {formatDate(plData.period.start)} to {formatDate(plData.period.end)}
                                    </span>
                                </div>
                                <Badge variant="secondary">
                                    {plData.revenue.length + plData.expenses.length} Accounts
                                </Badge>
                            </div>
                        </Card>

                        {/* Revenue Section */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                                Revenue
                            </h3>
                            {plData.revenue.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No revenue accounts found for this period.</p>
                            ) : (
                                <div className="space-y-3">
                                    {plData.revenue.map((account) => (
                                        <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="font-medium text-gray-900">{account.account_name}</span>
                                            <span className="font-bold text-green-600">{formatCurrency(account.total_amount)}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between py-3 border-t-2 border-green-200 bg-green-50 px-4 rounded">
                                        <span className="font-bold text-gray-900">Total Revenue</span>
                                        <span className="font-bold text-green-600">{formatCurrency(plData.totalRevenue)}</span>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Expenses Section */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                                Expenses
                            </h3>
                            {plData.expenses.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No expense accounts found for this period.</p>
                            ) : (
                                <div className="space-y-3">
                                    {plData.expenses.map((account) => (
                                        <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="font-medium text-gray-900">{account.account_name}</span>
                                            <span className="font-bold text-red-600">{formatCurrency(account.total_amount)}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between py-3 border-t-2 border-red-200 bg-red-50 px-4 rounded">
                                        <span className="font-bold text-gray-900">Total Expenses</span>
                                        <span className="font-bold text-red-600">{formatCurrency(plData.totalExpenses)}</span>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Net Profit Summary */}
                        <Card className="p-6">
                            <div className={`text-center p-6 rounded-lg ${plData.netProfit >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Net Profit (Loss)</h3>
                                <p className={`text-3xl font-bold ${plData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(plData.netProfit)}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    {plData.netProfit >= 0 ? 'Profit' : 'Loss'} for the period
                                </p>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Balance Sheet */}
                {reportType === 'balance-sheet' && bsData && !isLoading && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Assets</p>
                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(bsData.totalAssets)}</p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-blue-600" />
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
                                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(bsData.totalLiabilities)}</p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-orange-600" />
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Equity</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(bsData.totalEquity)}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </Card>
                        </div>

                        {/* Balance Check */}
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        As of: {formatDate(bsData.asOfDate)}
                                    </span>
                                </div>
                                <Badge variant={bsData.isBalanced ? "default" : "destructive"}>
                                    {bsData.isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
                                </Badge>
                            </div>
                        </Card>

                        {/* Assets Section */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                                Assets
                            </h3>
                            {bsData.assets.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No asset accounts found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {bsData.assets.map((account) => (
                                        <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="font-medium text-gray-900">{account.account_name}</span>
                                            <span className="font-bold text-blue-600">{formatCurrency(account.balance)}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between py-3 border-t-2 border-blue-200 bg-blue-50 px-4 rounded">
                                        <span className="font-bold text-gray-900">Total Assets</span>
                                        <span className="font-bold text-blue-600">{formatCurrency(bsData.totalAssets)}</span>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Liabilities Section */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <TrendingDown className="h-5 w-5 text-orange-600 mr-2" />
                                Liabilities
                            </h3>
                            {bsData.liabilities.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No liability accounts found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {bsData.liabilities.map((account) => (
                                        <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="font-medium text-gray-900">{account.account_name}</span>
                                            <span className="font-bold text-orange-600">{formatCurrency(account.balance)}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between py-3 border-t-2 border-orange-200 bg-orange-50 px-4 rounded">
                                        <span className="font-bold text-gray-900">Total Liabilities</span>
                                        <span className="font-bold text-orange-600">{formatCurrency(bsData.totalLiabilities)}</span>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Equity Section */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                                Equity
                            </h3>
                            {bsData.equity.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No equity accounts found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {bsData.equity.map((account) => (
                                        <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="font-medium text-gray-900">{account.account_name}</span>
                                            <span className="font-bold text-green-600">{formatCurrency(account.balance)}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between py-3 border-t-2 border-green-200 bg-green-50 px-4 rounded">
                                        <span className="font-bold text-gray-900">Total Equity</span>
                                        <span className="font-bold text-green-600">{formatCurrency(bsData.totalEquity)}</span>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Balance Check Summary */}
                        <Card className="p-6">
                            <div className={`text-center p-6 rounded-lg ${bsData.isBalanced ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Balance Check</h3>
                                <div className="space-y-2">
                                    <p className="text-lg">
                                        <span className="font-medium">Assets:</span> {formatCurrency(bsData.totalAssets)}
                                    </p>
                                    <p className="text-lg">
                                        <span className="font-medium">Liabilities + Equity:</span> {formatCurrency(bsData.totalLiabilitiesAndEquity)}
                                    </p>
                                    <p className={`text-2xl font-bold ${bsData.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                        {bsData.isBalanced ? '✓ Balanced' : `✗ Difference: ${formatCurrency(bsData.difference)}`}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports; 