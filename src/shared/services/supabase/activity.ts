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

        const name = profile?.full_name || 'Unknown User';
        return { name, email: '' };
    } catch (error) {
        console.error('Error fetching user details:', error);
        return { name: 'Unknown User', email: '' };
    }
}

// Helper function to get company details
async function getCompanyDetails(companyId: string | null): Promise<{ name: string }> {
    if (!companyId) return { name: 'Unknown Company' };

    try {
        const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', companyId)
            .single();

        if (company?.name) {
            return { name: company.name };
        }

        return { name: 'Unknown Company' };
    } catch (error) {
        console.error('Error fetching company details:', error);
        return { name: 'Unknown Company' };
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
            const companyDetails = await getCompanyDetails(item.company_id);

            // Extract email from details if available
            let email = '';
            if (item.details) {
                try {
                    // Handle both object and string cases
                    const details = typeof item.details === 'string' ? JSON.parse(item.details) : item.details;
                    if (details && typeof details === 'object' && details.email) {
                        email = String(details.email);
                    }
                } catch (error) {
                    console.error('Error parsing activity log details:', error);
                }
            }

            // If no email found in details, use empty string (don't fall back to userDetails.email which is always empty)
            if (!email) {
                email = '';
            }

            transformedData.push({
                id: item.id,
                company_id: item.company_id,
                actor_id: item.actor_id,
                activity: item.activity as ActivityType,
                details: item.details,
                created_at: item.created_at,
                actor_name: userDetails.name,
                actor_email: email,
                company_name: companyDetails.name,
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

// Get activity logs for a specific user
export async function getUserActivityLogs(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
    filters: Omit<ActivityLogFilters, 'actor_id'> = {}
): Promise<{ data: ActivityLogResponse | null; error: Error | null }> {
    return getActivityLogs(page, pageSize, { ...filters, actor_id: userId });
}

// Get recent activity logs (last N days)
export async function getRecentActivityLogs(
    days: number = 7,
    companyId?: string,
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: ActivityLogResponse | null; error: Error | null }> {
    try {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        return getActivityLogs(page, pageSize, {
            date_from: dateFrom.toISOString(),
            company_id: companyId || null,
        });
    } catch (error) {
        console.error('Error fetching recent activity logs:', error);
        return {
            data: null,
            error: error as Error,
        };
    }
}

// Delete activity log (admin only)
export async function deleteActivityLog(
    logId: number
): Promise<{ data: boolean | null; error: Error | null }> {
    try {
        const { error } = await supabase
            .from('activity_logs')
            .delete()
            .eq('id', logId);

        if (error) {
            throw error;
        }

        return { data: true, error: null };
    } catch (error) {
        console.error('Error deleting activity log:', error);
        return {
            data: null,
            error: error as Error,
        };
    }
}

// Bulk delete activity logs (admin only)
export async function bulkDeleteActivityLogs(
    logIds: number[]
): Promise<{ data: boolean | null; error: Error | null }> {
    try {
        const { error } = await supabase
            .from('activity_logs')
            .delete()
            .in('id', logIds);

        if (error) {
            throw error;
        }

        return { data: true, error: null };
    } catch (error) {
        console.error('Error bulk deleting activity logs:', error);
        return {
            data: null,
            error: error as Error,
        };
    }
}

// Export activity logs to CSV
export async function exportActivityLogs(
    filters: ActivityLogFilters = {},
    format: 'csv' | 'json' = 'csv'
): Promise<{ data: string | null; error: Error | null }> {
    try {
        // Get all logs without pagination for export
        const { data, error } = await getActivityLogs(1, 10000, filters);

        if (error || !data) {
            throw error || new Error('Failed to fetch activity logs');
        }

        if (format === 'json') {
            return { data: JSON.stringify(data.items, null, 2), error: null };
        }

        // Convert to CSV
        const headers = ['ID', 'Company', 'Actor', 'Activity', 'Details', 'Created At'];
        const csvRows = [headers.join(',')];

        for (const log of data.items) {
            const row = [
                log.id,
                log.company_name || 'Unknown',
                log.actor_name || 'Unknown',
                log.activity,
                JSON.stringify(log.details || {}),
                log.created_at || '',
            ].map(field => `"${field}"`).join(',');
            csvRows.push(row);
        }

        return { data: csvRows.join('\n'), error: null };
    } catch (error) {
        console.error('Error exporting activity logs:', error);
        return {
            data: null,
            error: error as Error,
        };
    }
} 