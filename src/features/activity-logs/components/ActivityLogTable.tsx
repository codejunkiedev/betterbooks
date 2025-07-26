import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { activityTypeLabels, activityTypeColors } from '../constants';
import { formatActivityDescription } from '../utils';
import type { ActivityLog } from '@/shared/types/activity';

interface ActivityLogTableProps {
    activityLogs: ActivityLog[];
    isLoading: boolean;
    title?: string;
    showCompanyName?: boolean;
}

export default function ActivityLogTable({
    activityLogs,
    isLoading,
    title = "Activity History",
    showCompanyName = true
}: ActivityLogTableProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : activityLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Logs Found</h3>
                        <p className="text-gray-500">No activities match your current filters.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activityLogs.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    <Activity className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                        <Badge className={`${activityTypeColors[activity.activity]} text-xs`}>
                                            {activityTypeLabels[activity.activity]}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                            {activity.created_at ? format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm') : 'Unknown time'}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-2">
                                        {formatActivityDescription(activity)}
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-600">
                                        <span>by {activity.actor_name}</span>
                                        {showCompanyName && activity.company_name && (
                                            <>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{activity.company_name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 