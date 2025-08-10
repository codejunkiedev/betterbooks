import { Card, CardContent } from '@/shared/components/Card';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/shared/components/Loading';

interface StatsCardsProps {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    pendingUsers: number;
    isLoading?: boolean;
}

export const StatsCards = ({ totalUsers, activeUsers, suspendedUsers, pendingUsers, isLoading = false }: StatsCardsProps) => {
    const Value = ({ value }: { value: number }) => (
        isLoading ? <Skeleton className="h-7 w-16" /> : <span className="text-2xl font-bold text-gray-900">{value}</span>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <Value value={totalUsers} />
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <Value value={activeUsers} />
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Suspended Users</p>
                            <Value value={suspendedUsers} />
                        </div>
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                            <Value value={pendingUsers} />
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 