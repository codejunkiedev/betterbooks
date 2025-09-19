import { format } from "date-fns";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { ProfitLossData } from "@/shared/types/reports";

interface ProfitLossReportProps {
    data: ProfitLossData;
}

export function ProfitLossReport({ data }: ProfitLossReportProps) {
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

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalRevenue)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(data.totalExpenses)}</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Net Profit</p>
                            <p className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(data.netProfit)}
                            </p>
                        </div>
                        <DollarSign className={`h-8 w-8 ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                </Card>
            </div>

            {/* Period Info */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            Period: {formatDate(data.period.start)} to {formatDate(data.period.end)}
                        </span>
                    </div>
                    <Badge variant="secondary">
                        {data.revenue.length + data.expenses.length} Accounts
                    </Badge>
                </div>
            </Card>

            {/* Revenue Section */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    Revenue
                </h3>
                {data.revenue.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No revenue accounts found for this period.</p>
                ) : (
                    <div className="space-y-3">
                        {data.revenue.map((account) => (
                            <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <span className="font-medium text-gray-900">{account.account_name}</span>
                                <span className="font-bold text-green-600">{formatCurrency(account.total_amount)}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-3 border-t-2 border-green-200 bg-green-50 px-4 rounded">
                            <span className="font-bold text-gray-900">Total Revenue</span>
                            <span className="font-bold text-green-600">{formatCurrency(data.totalRevenue)}</span>
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
                {data.expenses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No expense accounts found for this period.</p>
                ) : (
                    <div className="space-y-3">
                        {data.expenses.map((account) => (
                            <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <span className="font-medium text-gray-900">{account.account_name}</span>
                                <span className="font-bold text-red-600">{formatCurrency(account.total_amount)}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-3 border-t-2 border-red-200 bg-red-50 px-4 rounded">
                            <span className="font-bold text-gray-900">Total Expenses</span>
                            <span className="font-bold text-red-600">{formatCurrency(data.totalExpenses)}</span>
                        </div>
                    </div>
                )}
            </Card>

            {/* Net Profit Summary */}
            <Card className="p-6">
                <div className={`text-center p-6 rounded-lg ${data.netProfit >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Net Profit (Loss)</h3>
                    <p className={`text-3xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(data.netProfit)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        {data.netProfit >= 0 ? 'Profit' : 'Loss'} for the period
                    </p>
                </div>
            </Card>
        </div>
    );
} 