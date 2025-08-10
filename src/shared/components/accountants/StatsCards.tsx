import { Card, CardContent } from '@/shared/components/Card';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/shared/components/Loading';

interface StatsCardsProps {
    total: number;
    active: number;
    inactive: number;
    isLoading?: boolean;
}

export function AccountantsStatsCards({ total, active, inactive, isLoading = false }: StatsCardsProps) {
    const Value = ({ value }: { value: number }) => (
        isLoading ? <Skeleton className="h-7 w-16" /> : <span className="text-2xl font-bold text-gray-900">{value}</span>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Accountants</p>
                            <Value value={total} />
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <Value value={active} />
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Inactive</p>
                            <Value value={inactive} />
                        </div>
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 