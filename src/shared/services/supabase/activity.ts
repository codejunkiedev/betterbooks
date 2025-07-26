import { supabase } from './client';
import { ActivityLog, ActivityLogFilters, ActivityLogResponse, ActivityType } from '@/shared/types/activity';

// Helper function to get user details from profiles table
async function getUserDetails(userId: string | null): Promise<{ name: string; email: string }> {
    if (!userId) return { name: 'Unknown User', email: '' };

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

        if (profile?.full_name) {
            return { name: profile.full_name, email: '' };
        }

        return { name: 'Unknown User', email: '' };
    } catch (error) {
        console.error('Error fetching user details:', error);
        return { name: 'Unknown User', email: '' };
    }
}



export async function getActivityLogs(
    page: number = 1,
    pageSize: number = 20,
    filters: ActivityLogFilters = {}
): Promise<{ data: ActivityLogResponse | null; error: Error | null }> {
    try {
        let query = supabase
            .from('activity_logs')
            .select(`
        *,
        companies(name)
      `, { count: 'exact' });

        // Apply filters
        if (filters.company_id !== undefined && filters.company_id !== null) {
            query = query.eq('company_id', filters.company_id);
        }

        if (filters.activity_type) {
            query = query.eq('activity', filters.activity_type);
        }

        if (filters.actor_id !== undefined && filters.actor_id !== null) {
            query = query.eq('actor_id', filters.actor_id);
        }

        if (filters.date_from) {
            query = query.gte('created_at', filters.date_from);
        }

        if (filters.date_to) {
            query = query.lte('created_at', filters.date_to);
        }

        if (filters.search) {
            query = query.or(`companies.name.ilike.%${filters.search}%`);
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        // Transform the data to match our interface
        const transformedData: ActivityLog[] = [];

        for (const item of data || []) {
            const userDetails = await getUserDetails(item.actor_id);
            transformedData.push({
                id: item.id,
                company_id: item.company_id,
                actor_id: item.actor_id,
                activity: item.activity as ActivityType,
                details: item.details,
                created_at: item.created_at,
                actor_name: userDetails.name,
                actor_email: userDetails.email,
                company_name: item.companies?.name || 'Unknown Company',
            });
        }

        const total = count || 0;
        const total_pages = Math.ceil(total / pageSize);

        return {
            data: {
                items: transformedData,
                total,
                page,
                total_pages,
            },
            error: null,
        };
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return {
            data: null,
            error: error as Error,
        };
    }
}

export async function getActivityLogsByCompany(
    companyId: string,
    page: number = 1,
    pageSize: number = 20,
    filters: Omit<ActivityLogFilters, 'company_id'> = {}
): Promise<{ data: ActivityLogResponse | null; error: Error | null }> {
    return getActivityLogs(page, pageSize, { ...filters, company_id: companyId });
}

export async function createActivityLog(
    companyId: string | null,
    actorId: string | null,
    activity: ActivityType,
    details: Record<string, unknown> | null = null
): Promise<{ data: ActivityLog | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .insert({
                company_id: companyId,
                actor_id: actorId,
                activity,
                details,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error creating activity log:', error);
        return {
            data: null,
            error: error as Error,
        };
    }
}



export async function getActivityLogStats(companyId?: string): Promise<{ data: Record<string, unknown> | null; error: Error | null }> {
    try {
        let query = supabase
            .from('activity_logs')
            .select('activity, created_at');

        if (companyId) {
            query = query.eq('company_id', companyId);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        // Group by activity type and count
        const stats = (data || []).reduce((acc: Record<string, number>, item: { activity: string }) => {
            acc[item.activity] = (acc[item.activity] || 0) + 1;
            return acc;
        }, {});

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivity = (data || []).filter((item: { created_at: string }) =>
            new Date(item.created_at) >= sevenDaysAgo
        ).length;

        return {
            data: {
                activityBreakdown: stats,
                recentActivity,
                totalActivities: data?.length || 0,
            },
            error: null,
        };
    } catch (error) {
        console.error('Error fetching activity stats:', error);
        return {
            data: null,
            error: error as Error,
        };
    }
} 