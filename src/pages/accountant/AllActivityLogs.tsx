import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/hooks/useToast';
import { getActivityLogs, getActivityLogStats } from '@/shared/services/supabase/activity';
import {
    ActivityLogFilters,
    ActivityLogStats,
    ActivityLogTable,
    ITEMS_PER_PAGE
} from '@/features/activity-logs';
import type { ActivityLog } from '@/shared/types/activity';

export default function AllActivityLogs() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState<Record<string, unknown> | null>(null);

    // Filter states
    const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
    const [dateFromFilter, setDateFromFilter] = useState<string>('');
    const [dateToFilter, setDateToFilter] = useState<string>('');
    const [searchFilter, setSearchFilter] = useState<string>('');

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const loadActivityLogs = useCallback(async () => {
        try {
            setIsLoading(true);

            const filters: Record<string, unknown> = {};
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
                    <div className="text-center py-12">
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
                    </div>
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
                <ActivityLogStats stats={stats} />

                {/* Search and Filters */}
                <ActivityLogFilters
                    activityTypeFilter={activityTypeFilter}
                    setActivityTypeFilter={setActivityTypeFilter}
                    dateFromFilter={dateFromFilter}
                    setDateFromFilter={setDateFromFilter}
                    dateToFilter={dateToFilter}
                    setDateToFilter={setDateToFilter}
                    searchFilter={searchFilter}
                    setSearchFilter={setSearchFilter}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />

                {/* Activity Log Table */}
                <ActivityLogTable
                    activityLogs={activityLogs}
                    isLoading={isLoading}
                    title="Activity History"
                    showCompanyName={true}
                />

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