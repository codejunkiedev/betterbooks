import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
    Activity,
    Download,
    RefreshCw,
    Search,
    Calendar,
    Building,
    ArrowLeft,
    X
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Badge } from '@/shared/components/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/Dialog';
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

export default function AllActivityLogs() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState<any>(null);

    // Filter states
    const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
    const [dateFromFilter, setDateFromFilter] = useState<string>('');
    const [dateToFilter, setDateToFilter] = useState<string>('');
    const [searchFilter, setSearchFilter] = useState<string>('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const loadActivityLogs = useCallback(async () => {
        try {
            setIsLoading(true);

            const filters: any = {};
            if (activityTypeFilter !== 'all') {
                filters.activity_type = activityTypeFilter;
            }
            if (dateFromFilter) {
                filters.date_from = dateFromFilter;
            }
            if (dateToFilter) {
                filters.date_to = dateToFilter;
            }
            if (searchFilter) {
                filters.search = searchFilter;
            }

            const { data, error } = await getActivityLogs(
                currentPage,
                ITEMS_PER_PAGE,
                filters
            );

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
    }, [currentPage, activityTypeFilter, dateFromFilter, dateToFilter, searchFilter, toast]);

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

    const handleFilterChange = () => {
        setCurrentPage(1);
        loadActivityLogs();
    };

    const handleClearFilters = () => {
        setActivityTypeFilter('all');
        setDateFromFilter('');
        setDateToFilter('');
        setSearchFilter('');
        setCurrentPage(1);
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

    // Calculate most common activity type
    const mostCommon = useMemo(() => {
        if (!stats?.breakdown) return 'None';
        const breakdown = stats.breakdown;
        if (Object.keys(breakdown).length === 0) return 'None';

        return Object.entries(breakdown).reduce((a, b) =>
            breakdown[a[0]] > breakdown[b[0]] ? a : b
        )[0];
    }, [stats]);

    if (!isLoading && activityLogs.length === 0 && !stats) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/accountant/clients')}
                                className="h-10 w-10"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Activity Logs</h1>
                                <p className="text-sm text-gray-600">Monitor activities across all your assigned companies</p>
                            </div>
                        </div>
                    </div>

                    {/* Empty State */}
                    <Card className="shadow-sm">
                        <CardContent className="text-center py-12">
                            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Logs Found</h3>
                            <p className="text-gray-500 mb-6">Unable to load activity data or no logs exist yet.</p>
                            <Button
                                onClick={() => {
                                    loadActivityLogs();
                                    loadStats();
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/accountant/clients')}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Activity Logs</h1>
                            <p className="text-sm text-gray-600">Monitor activities across all your assigned companies</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            disabled={activityLogs.length === 0}
                            className="hidden sm:flex"
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
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
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
                                            {activityTypeLabels[mostCommon as ActivityType] || 'None'}
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
                )}

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Modal */}
                    <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Search className="w-4 h-4 mr-2" />
                                Search & Filters
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Search & Filter Activities</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search</label>
                                    <Input
                                        placeholder="Search activities..."
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Activity Type</label>
                                    <Select value={activityTypeFilter} onValueChange={(value) => setActivityTypeFilter(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select activity type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Activities</SelectItem>
                                            {Object.entries(activityTypeLabels).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date From</label>
                                        <Input
                                            type="date"
                                            value={dateFromFilter}
                                            onChange={(e) => setDateFromFilter(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date To</label>
                                        <Input
                                            type="date"
                                            value={dateToFilter}
                                            onChange={(e) => setDateToFilter(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={() => {
                                            handleFilterChange();
                                            setIsSearchModalOpen(false);
                                        }}
                                        className="flex-1"
                                    >
                                        Apply Filters
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            handleClearFilters();
                                            setIsSearchModalOpen(false);
                                        }}
                                        className="flex-1"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Active Filters Display */}
                    {(activityTypeFilter !== 'all' || dateFromFilter || dateToFilter || searchFilter) && (
                        <div className="flex flex-wrap gap-2">
                            {activityTypeFilter !== 'all' && (
                                <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                    {activityTypeLabels[activityTypeFilter as ActivityType]}
                                    <X
                                        className="w-3 h-3 ml-1 cursor-pointer"
                                        onClick={() => setActivityTypeFilter('all')}
                                    />
                                </Badge>
                            )}
                            {dateFromFilter && (
                                <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                    From: {dateFromFilter}
                                    <X
                                        className="w-3 h-3 ml-1 cursor-pointer"
                                        onClick={() => setDateFromFilter('')}
                                    />
                                </Badge>
                            )}
                            {dateToFilter && (
                                <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                    To: {dateToFilter}
                                    <X
                                        className="w-3 h-3 ml-1 cursor-pointer"
                                        onClick={() => setDateToFilter('')}
                                    />
                                </Badge>
                            )}
                            {searchFilter && (
                                <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                    Search: {searchFilter}
                                    <X
                                        className="w-3 h-3 ml-1 cursor-pointer"
                                        onClick={() => setSearchFilter('')}
                                    />
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Activity Log Table */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Activity History</CardTitle>
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
                                                {activity.company_name && (
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-700 text-center sm:text-left">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                            {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} results
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-700 px-2">
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
        </div>
    );
} 