import { format } from "date-fns";
import { TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { TrialBalanceData } from "@/shared/types/reports";

interface TrialBalanceReportProps {
    data: TrialBalanceData;
}

export function TrialBalanceReport({ data }: TrialBalanceReportProps) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Debits</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.totalDebits)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Credits</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalCredits)}</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-green-600" />
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
                    <Badge variant={data.isBalanced ? "default" : "destructive"}>
                        {data.isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
                    </Badge>
                </div>
            </Card>

            {/* Trial Balance Table */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calculator className="h-5 w-5 text-purple-600 mr-2" />
                    Trial Balance
                </h3>
                {data.accounts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No accounts with activity found for this period.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Account</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Debits</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Credits</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.accounts.map((account) => (
                                    <tr key={account.account_id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{account.account_name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            <Badge variant="outline" className="text-xs">
                                                {account.account_type}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-blue-600">
                                            {account.total_debits > 0 ? formatCurrency(account.total_debits) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-green-600">
                                            {account.total_credits > 0 ? formatCurrency(account.total_credits) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                                    <td className="py-3 px-4 text-gray-900">TOTALS</td>
                                    <td className="py-3 px-4"></td>
                                    <td className={`py-3 px-4 text-right ${data.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(data.totalDebits)}
                                    </td>
                                    <td className={`py-3 px-4 text-right ${data.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(data.totalCredits)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Balance Check Summary */}
            <Card className="p-6">
                <div className={`text-center p-6 rounded-lg ${data.isBalanced ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Balance Check</h3>
                    <div className="space-y-2">
                        <p className="text-lg">
                            <span className="font-medium">Total Debits:</span> {formatCurrency(data.totalDebits)}
                        </p>
                        <p className="text-lg">
                            <span className="font-medium">Total Credits:</span> {formatCurrency(data.totalCredits)}
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