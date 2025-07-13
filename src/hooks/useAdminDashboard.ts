import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from './use-toast';

interface SystemStats {
    total_users: number;
    total_accountants: number;
    total_companies: number;
    total_documents: number;
    pending_documents: number;
    active_companies: number;
    inactive_companies: number;
    total_revenue: number;
    monthly_growth: number;
}

interface RecentActivity {
    id: string;
    activity: string;
    actor_name: string;
    company_name?: string;
    created_at: string;
    details: Record<string, unknown>;
}

interface ProfileData {
    full_name: string;
}

interface CompanyData {
    name: string;
}

interface ActivityLogItem {
    id: string;
    activity: string;
    details: Record<string, unknown>;
    created_at: string;
    profiles: ProfileData | ProfileData[] | null;
    companies: CompanyData | CompanyData[] | null;
}

// Memoized data processing functions
const processActivityData = (activityData: ActivityLogItem[]): RecentActivity[] => {
    return activityData?.map(item => {
        let actor_name = 'Unknown';
        if (item.profiles) {
            if (Array.isArray(item.profiles) && item.profiles.length > 0) {
                actor_name = item.profiles[0]?.full_name || 'Unknown';
            } else if ((item.profiles as ProfileData)?.full_name) {
                actor_name = (item.profiles as ProfileData).full_name;
            }
        }
        let company_name = undefined;
        if (item.companies) {
            if (Array.isArray(item.companies) && item.companies.length > 0) {
                company_name = item.companies[0]?.name;
            } else if ((item.companies as CompanyData)?.name) {
                company_name = (item.companies as CompanyData).name;
            }
        }
        return {
            id: item.id,
            activity: item.activity,
            actor_name,
            company_name,
            created_at: item.created_at,
            details: item.details || {}
        };
    }) || [];
};

const processStatsData = (
    totalUsers: number,
    totalAccountants: number,
    totalCompanies: number,
    totalDocuments: number,
    pendingDocuments: number,
    activeCompanies: number,
    inactiveCompanies: number
): SystemStats => ({
    total_users: totalUsers || 0,
    total_accountants: totalAccountants || 0,
    total_companies: totalCompanies || 0,
    total_documents: totalDocuments || 0,
    pending_documents: pendingDocuments || 0,
    active_companies: activeCompanies || 0,
    inactive_companies: inactiveCompanies || 0,
    total_revenue: 0, // TODO: Calculate from billing
    monthly_growth: 12.5 // TODO: Calculate actual growth
});

export const useAdminDashboard = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Memoized dashboard data loader
    const loadDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);

            // Fetch system statistics in parallel
            const [
                { count: totalUsers },
                { count: totalAccountants },
                { count: totalCompanies },
                { count: totalDocuments },
                { count: pendingDocuments },
                { count: activeCompanies },
                { count: inactiveCompanies }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('accountants').select('*', { count: 'exact', head: true }),
                supabase.from('companies').select('*', { count: 'exact', head: true }),
                supabase.from('documents').select('*', { count: 'exact', head: true }),
                supabase.from('documents').select('*', { count: 'exact', head: true }).in('status', ['PENDING_REVIEW', 'IN_PROGRESS']),
                supabase.from('companies').select('*', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('companies').select('*', { count: 'exact', head: true }).eq('is_active', false)
            ]);

            // Fetch recent activity
            const { data: activityData } = await supabase
                .from('activity_logs')
                .select(`
                    id,
                    activity,
                    details,
                    created_at,
                    profiles!activity_logs_actor_id_fkey(full_name),
                    companies!activity_logs_company_id_fkey(name)
                `)
                .order('created_at', { ascending: false })
                .limit(10);

            // Process data
            const processedActivity = processActivityData(activityData as ActivityLogItem[]);
            const processedStats = processStatsData(
                totalUsers || 0,
                totalAccountants || 0,
                totalCompanies || 0,
                totalDocuments || 0,
                pendingDocuments || 0,
                activeCompanies || 0,
                inactiveCompanies || 0
            );

            setStats(processedStats);
            setRecentActivity(processedActivity);

        } catch (error) {
            console.error("Error loading admin dashboard:", error);
            toast({
                title: "Error",
                description: "Failed to load dashboard data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Memoized refresh function
    const refreshData = useCallback(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Memoized return value
    const returnValue = useMemo(() => ({
        stats,
        recentActivity,
        isLoading,
        refreshData
    }), [stats, recentActivity, isLoading, refreshData]);

    return returnValue;
}; 