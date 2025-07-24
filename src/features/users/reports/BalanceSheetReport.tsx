import { format } from "date-fns";
import { TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { BalanceSheetData } from "@/shared/types/reports";

interface BalanceSheetReportProps {
    data: BalanceSheetData;
}

export function BalanceSheetReport({ data }: BalanceSheetReportProps) {
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
                            <p className="text-sm font-medium text-gray-600">Total Assets</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.totalAssets)}</p>
                        </div>
                        <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
                            <p className="text-2xl font-bold text-orange-600">{formatCurrency(data.totalLiabilities)}</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-orange-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Equity</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalEquity)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                </Card>
            </div>

            {/* Balance Check */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            As of: {formatDate(data.asOfDate)}
                        </span>
                    </div>
                    <Badge variant={data.isBalanced ? "default" : "destructive"}>
                        {data.isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
                    </Badge>
                </div>
            </Card>

            {/* Assets Section */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                    Assets
                </h3>
                {data.assets.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No asset accounts found.</p>
                ) : (
                    <div className="space-y-3">
                        {data.assets.map((account) => (
                            <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <span className="font-medium text-gray-900">{account.account_name}</span>
                                <span className="font-bold text-blue-600">{formatCurrency(account.balance)}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-3 border-t-2 border-blue-200 bg-blue-50 px-4 rounded">
                            <span className="font-bold text-gray-900">Total Assets</span>
                            <span className="font-bold text-blue-600">{formatCurrency(data.totalAssets)}</span>
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
                {data.liabilities.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No liability accounts found.</p>
                ) : (
                    <div className="space-y-3">
                        {data.liabilities.map((account) => (
                            <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <span className="font-medium text-gray-900">{account.account_name}</span>
                                <span className="font-bold text-orange-600">{formatCurrency(account.balance)}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-3 border-t-2 border-orange-200 bg-orange-50 px-4 rounded">
                            <span className="font-bold text-gray-900">Total Liabilities</span>
                            <span className="font-bold text-orange-600">{formatCurrency(data.totalLiabilities)}</span>
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
                {data.equity.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No equity accounts found.</p>
                ) : (
                    <div className="space-y-3">
                        {data.equity.map((account) => (
                            <div key={account.account_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <span className="font-medium text-gray-900">{account.account_name}</span>
                                <span className="font-bold text-green-600">{formatCurrency(account.balance)}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-3 border-t-2 border-green-200 bg-green-50 px-4 rounded">
                            <span className="font-bold text-gray-900">Total Equity</span>
                            <span className="font-bold text-green-600">{formatCurrency(data.totalEquity)}</span>
                        </div>
                    </div>
                )}
            </Card>

            {/* Balance Check Summary */}
            <Card className="p-6">
                <div className={`text-center p-6 rounded-lg ${data.isBalanced ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Balance Check</h3>
                    <div className="space-y-2">
                        <p className="text-lg">
                            <span className="font-medium">Assets:</span> {formatCurrency(data.totalAssets)}
                        </p>
                        <p className="text-lg">
                            <span className="font-medium">Liabilities + Equity:</span> {formatCurrency(data.totalLiabilitiesAndEquity)}
                        </p>
                        <p className={`text-2xl font-bold ${data.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                            {data.isBalanced ? '✓ Balanced' : `✗ Difference: ${formatCurrency(data.difference)}`}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
} 