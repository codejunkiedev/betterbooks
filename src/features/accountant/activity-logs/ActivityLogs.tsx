import { ActivityLogsTable } from './ActivityLogsTable';
import { ActivityLogsFilterModal } from './ActivityLogsFilterModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/shared/hooks/useToast';
import { getActivityLogs } from '@/shared/services/supabase/activity';
import { getMyClientCompanies } from '@/shared/services/supabase/company';
import { ActivityLog, ActivityLogFilters } from '@/shared/types/activity';
import {
    activityTypeLabels,
    activityTypeColors,
    defaultActivityLogFilters,
    DEFAULT_PAGE_SIZE
} from '@/shared/constants';
import {
    getActivityDescription,
    getActiveFiltersCount
} from '@/shared/utils';

interface Company {
    id: string;
    name: string;
}

const ActivityLogs = () => {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filters, setFilters] = useState(defaultActivityLogFilters);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState(defaultActivityLogFilters);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const { toast } = useToast();

    const pageSize = DEFAULT_PAGE_SIZE;

    const fetchCompanies = async () => {
        try {
            setLoadingCompanies(true);
            const companiesData = await getMyClientCompanies();
            setCompanies(companiesData || []);
        } catch (error) {
            console.error("Error fetching companies:", error);
            toast({
                title: "Error",
                description: "Failed to fetch companies. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoadingCompanies(false);
        }
    };

    const fetchActivityLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await getActivityLogs(currentPage, pageSize, {
                activity_type: filters.activity_type === "all" ? undefined : filters.activity_type,
                company_id: filters.company_id === "all" ? undefined : filters.company_id,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
            } as ActivityLogFilters);

            if (error) {
                throw error;
            }

            if (data) {
                setActivityLogs(data.items);
                setTotalPages(data.total_pages);
                setTotalItems(data.total);
            }
        } catch (error) {
            console.error("Error fetching activity logs:", error);
            toast({
                title: "Error",
                description: "Failed to fetch activity logs. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        fetchActivityLogs();
    }, [currentPage, filters]);

    // Initialize temp filters when modal opens
    useEffect(() => {
        if (isFilterModalOpen) {
            setTempFilters(filters);
        }
    }, [isFilterModalOpen, filters]);

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setCurrentPage(1); // Reset to first page when filters are applied
        setIsFilterModalOpen(false);
    };

    const handleClearFilters = () => {
        setTempFilters(defaultActivityLogFilters);
        setFilters(defaultActivityLogFilters);
        setCurrentPage(1);
        setIsFilterModalOpen(false);
    };

    if (loading && activityLogs.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading activity logs...</div>
                </div>
            </div>
        );
    }

    if (loadingCompanies) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading companies...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-600 mt-1">
                        View all activities for your assigned companies
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {getActiveFiltersCount(filters) > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {getActiveFiltersCount(filters)}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            {/* Activity Logs Table and Pagination */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Activity Logs</span>
                        <span className="text-sm font-normal text-gray-500">
                            {totalItems} total activities
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ActivityLogsTable
                        activityLogs={activityLogs}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        setCurrentPage={setCurrentPage}
                        activityTypeLabels={activityTypeLabels}
                        activityTypeColors={activityTypeColors}
                        getActivityDescription={getActivityDescription}
                    />
                </CardContent>
            </Card>

            {/* Filter Modal */}
            <ActivityLogsFilterModal
                isOpen={isFilterModalOpen}
                onOpenChange={setIsFilterModalOpen}
                tempFilters={tempFilters}
                setTempFilters={setTempFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                companies={companies}
            />
        </div>
    );
};

export default ActivityLogs; 