import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/hooks/useToast';
import { getActivityLogs, getActivityLogStats } from '@/shared/services/supabase/activity';
import { ActivityLogStats, ActivityLogTable, ITEMS_PER_PAGE } from '@/features/activity-logs';
import type { ActivityLog } from '@/shared/types/activity';

export default function AdminActivityLogs() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState<Record<string, unknown> | null>(null);

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
            <ActivityLogStats stats={stats} />

            {/* Activity Log Table */}
            <ActivityLogTable
                activityLogs={activityLogs}
                isLoading={isLoading}
                title="System Activity History"
                showCompanyName={true}
            />

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