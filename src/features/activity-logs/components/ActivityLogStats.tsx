import { Activity, Calendar, Building } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/Card';
import { activityTypeLabels } from '../constants';
import { calculateMostCommonActivity } from '../utils';

interface ActivityLogStatsProps {
    stats: {
        totalActivities?: number;
        documentActivities?: number;
        journalActivities?: number;
        recentActivity?: number;
        uniqueCompanies?: number;
        breakdown?: Record<string, number>;
    } | null;
}

export default function ActivityLogStats({ stats }: ActivityLogStatsProps) {
    if (!stats) return null;

    // Calculate most common activity type
    const mostCommon = calculateMostCommonActivity(stats.breakdown);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Activities</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalActivities || 0}</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Most Common</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {activityTypeLabels[mostCommon as keyof typeof activityTypeLabels] || 'None'}
                            </p>
                        </div>
                        <Activity className="w-8 h-8 text-green-600" />
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">This Week</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.recentActivity || 0}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Companies</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.uniqueCompanies || 0}</p>
                        </div>
                        <Building className="w-8 h-8 text-orange-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 