import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Activity, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useToast } from '@/shared/hooks/useToast';
import { getActivityLogs, getActivityLogStats } from '@/shared/services/supabase/activity';
import type { ActivityLog, ActivityType } from '@/shared/types/activity';

const ITEMS_PER_PAGE = 10;

const activityTypeLabels: Record<ActivityType, string> = {
    USER_LOGIN: 'User Login',
    DOCUMENT_UPLOADED: 'Document Uploaded',
    DOCUMENT_DELETED: 'Document Deleted',
    JOURNAL_ENTRY_CREATED: 'Journal Entry Created',
    JOURNAL_ENTRY_UPDATED: 'Journal Entry Updated',
    COMPANY_ACTIVATED: 'Company Activated',
    COMPANY_DEACTIVATED: 'Company Deactivated',
    REPORT_GENERATED: 'Report Generated'
};

const activityTypeColors: Record<ActivityType, string> = {
    USER_LOGIN: 'bg-blue-100 text-blue-800',
    DOCUMENT_UPLOADED: 'bg-green-100 text-green-800',
    DOCUMENT_DELETED: 'bg-red-100 text-red-800',
    JOURNAL_ENTRY_CREATED: 'bg-purple-100 text-purple-800',
    JOURNAL_ENTRY_UPDATED: 'bg-orange-100 text-orange-800',
    COMPANY_ACTIVATED: 'bg-emerald-100 text-emerald-800',
    COMPANY_DEACTIVATED: 'bg-red-100 text-red-800',
    REPORT_GENERATED: 'bg-indigo-100 text-indigo-800'
};

export default function AdminActivityLogs() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState<any>(null);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const loadActivityLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await getActivityLogs(currentPage, ITEMS_PER_PAGE);

            if (error) throw error;

            if (data) {
                setActivityLogs(data.items);
                setTotalItems(data.total);
            }
        } catch (error) {
            console.error('Error loading activity logs:', error);
            toast({
                title: 'Error',
                description: 'Failed to load activity logs',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, toast]);

    const loadStats = useCallback(async () => {
        try {
            const { data, error } = await getActivityLogStats();
            if (error) throw error;
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }, []);

    useEffect(() => {
        loadActivityLogs();
        loadStats();
    }, [loadActivityLogs, loadStats]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleExport = () => {
        toast({
            title: 'Export',
            description: 'Export functionality coming soon',
        });
    };

    const formatActivityDescription = (activity: ActivityLog): string => {
        const baseDescription = activityTypeLabels[activity.activity];

        switch (activity.activity) {
            case 'DOCUMENT_UPLOADED':
            case 'DOCUMENT_DELETED':
                return `${baseDescription}: ${activity.details?.filename || 'Unknown file'}`;
            case 'JOURNAL_ENTRY_CREATED':
            case 'JOURNAL_ENTRY_UPDATED':
                return `${baseDescription}: ${activity.details?.description || 'No description'}`;
            case 'REPORT_GENERATED':
                return `${baseDescription}: ${activity.details?.report_type || 'Unknown report'}`;
            default:
                return baseDescription;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin')}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Activity Logs</h1>
                        <p className="text-gray-600">Monitor activities across all your assigned companies</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={activityLogs.length === 0}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            loadActivityLogs();
                            loadStats();
                        }}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
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
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Documents</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.documentActivities || 0}</p>
                                </div>
                                <Activity className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Journal Entries</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.journalActivities || 0}</p>
                                </div>
                                <Activity className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.recentActivity || 0}</p>
                                </div>
                                <Activity className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Activity Log Table */}
            <Card>
                <CardHeader>
                    <CardTitle>System Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : activityLogs.length === 0 ? (
                        <div className="text-center py-8">
                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No activity logs found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activityLogs.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-shrink-0">
                                        <Activity className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge className={activityTypeColors[activity.activity]}>
                                                {activityTypeLabels[activity.activity]}
                                            </Badge>
                                            <span className="text-sm text-gray-500">
                                                {activity.created_at ? format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm') : 'Unknown time'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                            {formatActivityDescription(activity)}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>by {activity.actor_name}</span>
                                            {activity.company_name && (
                                                <>
                                                    <span>•</span>
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                        {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} results
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 