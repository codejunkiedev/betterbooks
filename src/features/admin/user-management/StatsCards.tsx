import { Card, CardContent } from '@/shared/components/Card';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatsCardsProps {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    pendingUsers: number;
}

export const StatsCards = ({ totalUsers, activeUsers, suspendedUsers, pendingUsers }: StatsCardsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{suspendedUsers}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{pendingUsers}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 