import { BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/shared/components/Card";

interface JournalSummaryCardsProps {
    totalEntries: number;
    totalDebits: number;
    totalCredits: number;
}

export function JournalSummaryCards({ totalEntries, totalDebits, totalCredits }: JournalSummaryCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Entries</p>
                        <p className="text-2xl font-bold text-blue-600">{totalEntries}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
            </Card>
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Debits</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDebits)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
            </Card>
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Credits</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCredits)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
            </Card>
        </div>
    );
} 