import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Skeleton } from '@/shared/components/Loading';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface InvoiceStatsProps {
    summary: {
        total: number;
        submitted: number;
        failed: number;
        draft: number;
    };
    isLoading?: boolean;
}

const StatCard = ({ title, value, icon: Icon, isLoading, iconColor }: {
    title: string;
    value: number;
    icon: React.ElementType;
    isLoading?: boolean;
    iconColor: string;
}) => (
    <Card className="border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
                {isLoading ? <Skeleton className="h-4 w-20" /> : title}
            </CardTitle>
            {!isLoading && <Icon className={`h-4 w-4 ${iconColor}`} />}
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-16" />
            ) : (
                <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
            )}
        </CardContent>
    </Card>
);

export function InvoiceStats({ summary, isLoading = false }: InvoiceStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Invoices"
                value={summary.total}
                icon={FileText}
                isLoading={isLoading}
                iconColor="text-blue-600"
            />
            <StatCard
                title="Submitted"
                value={summary.submitted}
                icon={CheckCircle}
                isLoading={isLoading}
                iconColor="text-green-600"
            />
            <StatCard
                title="Failed"
                value={summary.failed}
                icon={XCircle}
                isLoading={isLoading}
                iconColor="text-red-600"
            />
            <StatCard
                title="Drafts"
                value={summary.draft}
                icon={Clock}
                isLoading={isLoading}
                iconColor="text-yellow-600"
            />
        </div>
    );
}
