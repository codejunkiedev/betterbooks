import { Card, CardContent } from '@/shared/components/Card';
import { Users, CheckCircle, XCircle } from 'lucide-react';

interface StatsCardsProps {
    total: number;
    active: number;
    inactive: number;
}

export function AccountantsStatsCards({ total, active, inactive }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Accountants</p>
                            <p className="text-2xl font-bold text-gray-900">{total}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{active}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{inactive}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 