import { supabase } from '@/shared/services/supabase/client';
import { AdminUsersFilters, AdminUsersResponse, Status, DetailedUserResponse, DetailedUserInfo } from '@/shared/types/admin';
import { UserRoleEnum } from '@/shared/types/auth';
import { logActivity } from '@/shared/utils/activity';
import { ActivityType } from '@/shared/types/activity';
import { MODULES, ModuleName, isModuleName } from '@/shared/constants/modules';

export type AccountingModuleTier = 'Basic' | 'Advanced';
export type TaxModuleType = 'Individual' | 'Corporate';
export type PralEnvironment = 'Sandbox' | 'Production';

export type UserModuleState = {
    name: ModuleName;
    enabled: boolean;
    settings: Record<string, unknown>;
};

export async function getUserModulesForUser(userId: string): Promise<UserModuleState[]> {
    const { data, error } = await supabase
        .from('user_modules')
        .select('module, enabled, settings')
        .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((row: { module: ModuleName; enabled: boolean; settings: Record<string, unknown> | null }) => ({
        name: row.module,
        enabled: !!row.enabled,
        settings: row.settings ?? {},
    }));
}

export async function getAdminUsers(
    page: number = 1,
    itemsPerPage: number = 25,
    filters?: AdminUsersFilters
): Promise<AdminUsersResponse> {
    try {
        // Get all users with their basic info
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        // Get companies with their associated profiles and auth data
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select(`
                id,
                user_id,
                name,
                type,
                is_active,
                created_at,
                assigned_accountant_id,
                profiles!inner(
                    id,
                    full_name,
                    avatar_url,
                    is_active,
                    phone_number
                )
            `);

        if (companiesError) throw companiesError;

        if (!companies || companies.length === 0) {
            return {
                data: {
                    items: [],
                    total: 0,
                    page,
                    itemsPerPage,
                    totalPages: 0
                },
                error: null
            };
        }

        // Get auth details for each company user using Promise.all
        const authDetailsPromises = companies.map(async (company) => {
            try {
                // Call edge function to get auth user details by user_id
                const { data: authUserData, error: authError } = await supabase.functions.invoke('get-admin-users', {
                    body: {
                        action: 'get_user_auth_details',
                        user_id: company.user_id
                    }
                });

                if (authError) {
                    console.warn(`Failed to get auth details for user ${company.user_id}:`, authError);
                    return {
                        user_id: company.user_id,
                        email: `user-${company.user_id.slice(0, 8)}@example.com`,
                        last_sign_in_at: null
                    };
                }

                return {
                    user_id: company.user_id,
                    email: authUserData?.email || `user-${company.user_id.slice(0, 8)}@example.com`,
                    last_sign_in_at: authUserData?.last_sign_in_at || null
                };
            } catch (error) {
                console.warn(`Failed to get auth details for user ${company.user_id}:`, error);
                return {
                    user_id: company.user_id,
                    email: `user-${company.user_id.slice(0, 8)}@example.com`,
                    last_sign_in_at: null
                };
            }
        });

        // Wait for all auth details to resolve
        const authDetailsResults = await Promise.all(authDetailsPromises);

        // Create a map for quick lookup
        const authDetailsMap = new Map();
        authDetailsResults.forEach(authDetail => {
            authDetailsMap.set(authDetail.user_id, authDetail);
        });

        // Get all accountants
        const { data: accountants, error: accountantsError } = await supabase
            .from('accountants')
            .select(`
                id,
                user_id,
                full_name
            `);

        if (accountantsError) throw accountantsError;

        // Get all documents count per company
        const { data: documents, error: documentsError } = await supabase
            .from('documents')
            .select('company_id');

        if (documentsError) throw documentsError;

        // Create documents count map
        const documentsCountMap = new Map<string, number>();
        documents?.forEach(doc => {
            const count = documentsCountMap.get(doc.company_id) || 0;
            documentsCountMap.set(doc.company_id, count + 1);
        });

        // Create accountants map
        const accountantsMap = new Map<string, typeof accountants[0]>();
        accountants?.forEach(accountant => {
            accountantsMap.set(accountant.id, accountant);
        });

        // Fetch active modules for all users in one query
        const userIds = companies.map((c: { user_id: string }) => c.user_id);
        const { data: modulesRows } = await supabase
            .from('user_modules')
            .select('user_id,module,enabled,settings')
            .in('user_id', userIds);

        const modulesMap = new Map<string, string[]>();
        (modulesRows || []).forEach((row: { user_id: string; module: ModuleName; enabled: boolean; settings: Record<string, unknown> | null }) => {
            if (!row.enabled) return;
            let label = row.module === MODULES.ACCOUNTING ? 'Accounting'
                : row.module === MODULES.TAX_FILING ? 'Tax Filing'
                    : row.module === MODULES.PRAL_INVOICING ? 'PRAL Invoicing'
                        : String(row.module);
            if (row.module === MODULES.ACCOUNTING) {
                const tier = (row.settings as { tier?: string } | null)?.tier;
                if (tier === 'Basic' || tier === 'Advanced') {
                    label = `${label} (${tier})`;
                }
            }
            const list = modulesMap.get(row.user_id) || [];
            list.push(label);
            modulesMap.set(row.user_id, list);
        });

        let processedUsers = companies.map((company) => {
            const assignedAccountant = company.assigned_accountant_id
                ? accountantsMap.get(company.assigned_accountant_id)
                : null;

            // Get auth user data from our map
            const authUser = authDetailsMap.get(company.user_id);
            // Handle both array and object cases for profiles
            const profile = Array.isArray(company.profiles) ? company.profiles[0] : company.profiles;
            // Determine status based on company data
            let status: Status = 'active';
            if (!company.is_active) {
                status = 'suspended';
            }

            return {
                id: company.user_id,
                email: authUser?.email || 'N/A',
                phone: 'N/A',
                created_at: company.created_at,
                last_sign_in_at: authUser?.last_sign_in_at || 'N/A',
                role: UserRoleEnum.USER,
                status,
                company: {
                    id: company.id,
                    name: company.name,
                    type: company.type,
                    is_active: company.is_active,
                    created_at: company.created_at,
                    assigned_accountant_id: company.assigned_accountant_id,
                    primary_contact_name: profile?.full_name || 'N/A',
                    phone_number: profile?.phone_number || 'N/A'
                },
                assigned_accountant: assignedAccountant ? {
                    id: assignedAccountant.id,
                    full_name: assignedAccountant.full_name,
                } : null,
                active_modules: modulesMap.get(company.user_id) || [],
                documents_count: documentsCountMap.get(company.id) || 0,
                last_activity: undefined
            };
        });

        // Apply filters
        if (filters?.search) {
            const searchTerm = filters.search.toLowerCase();
            processedUsers = processedUsers.filter(user =>
                user.email.toLowerCase().includes(searchTerm) ||
                user.company?.name.toLowerCase().includes(searchTerm) ||
                user.assigned_accountant?.full_name.toLowerCase().includes(searchTerm)
            );
        }

        if (filters?.status && filters.status !== 'all') {
            processedUsers = processedUsers.filter(user => user.status === filters.status);
        }

        if (filters?.role && filters.role !== 'all') {
            processedUsers = processedUsers.filter(user => user.role === filters.role);
        }

        if (filters?.assigned_accountant) {
            processedUsers = processedUsers.filter(user =>
                user.assigned_accountant?.id === filters.assigned_accountant
            );
        }

        if (filters?.registration_date_from) {
            processedUsers = processedUsers.filter(user =>
                new Date(user.created_at) >= new Date(filters.registration_date_from!)
            );
        }

        if (filters?.registration_date_to) {
            processedUsers = processedUsers.filter(user =>
                new Date(user.created_at) <= new Date(filters.registration_date_to!)
            );
        }

        if (filters?.active_modules && filters.active_modules.length > 0) {
            processedUsers = processedUsers.filter(user =>
                filters.active_modules!.some(module => user.active_modules.includes(module))
            );
        }

        const total = processedUsers.length;
        const totalPages = Math.ceil(total / itemsPerPage);

        // Apply pagination
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        const paginatedUsers = processedUsers.slice(from, to);

        return {
            data: {
                items: paginatedUsers,
                total,
                page,
                itemsPerPage,
                totalPages
            },
            error: null
        };
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error')
        };
    }
}

// Deprecated: prefer manage-user-status edge function for audit+emails
export async function updateUserStatus(userId: string, status: Status) {
    try {
        // Update company status instead since we don't have admin access to auth.users
        const { error: companyError } = await supabase
            .from('companies')
            .update({ is_active: status === 'active' })
            .eq('user_id', userId);

        if (companyError) throw companyError;

        // If suspending, also deactivate company
        if (status === 'suspended') {
            const { data: company } = await supabase
                .from('companies')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

            if (company) {
                await supabase
                    .from('companies')
                    .update({ is_active: false })
                    .eq('id', company.id);
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating user status:", error);
        throw error;
    }
}

export async function assignAccountantToUser(userId: string, accountantId: string, notify: boolean = true) {
    try {
        // Get company and current assignment
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id, assigned_accountant_id')
            .eq('user_id', userId)
            .maybeSingle();
        if (companyError) throw companyError;
        if (!company) throw new Error('Company not found for user');

        const previousAccountantId: string | null = (company as { id: string; assigned_accountant_id: string | null }).assigned_accountant_id;

        // Update assignment
        const { error } = await supabase
            .from('companies')
            .update({ assigned_accountant_id: accountantId })
            .eq('user_id', userId);
        if (error) throw error;

        // Fetch actor and emails for notifications
        const { data: { user: actor } } = await supabase.auth.getUser();

        // Fetch new accountant details
        const { data: newAcc } = await supabase
            .from('accountants')
            .select('id, full_name, user_id')
            .eq('id', accountantId)
            .maybeSingle();

        // Fetch previous accountant details if any
        let prevAcc: { id: string; full_name: string; user_id: string } | null = null;
        if (previousAccountantId) {
            const { data: prev } = await supabase
                .from('accountants')
                .select('id, full_name, user_id')
                .eq('id', previousAccountantId)
                .maybeSingle();
            if (prev) {
                prevAcc = prev as { id: string; full_name: string; user_id: string };
            }
        }

        // Log activity
        try {
            await logActivity(
                (company as { id: string }).id,
                actor?.id || null,
                ActivityType.ACCOUNTANT_ASSIGNED,
                actor?.email || 'unknown',
                'assign_accountant',
                {
                    previous_accountant_id: previousAccountantId || null,
                    previous_accountant_name: prevAcc?.full_name || null,
                    new_accountant_id: newAcc?.id || accountantId,
                    new_accountant_name: newAcc?.full_name || 'Unknown',
                    notifications_sent: notify,
                }
            );
        } catch (e) {
            console.error('Failed to log assignment activity', e);
        }

        // Fire-and-forget email notifications via Edge Function
        if (notify) {
            try {
                await supabase.functions.invoke('send-accountant-assignment-notification', {
                    body: {
                        companyId: (company as { id: string }).id,
                        userId,
                        newAccountantUserId: (newAcc as { user_id: string } | null)?.user_id || null,
                        previousAccountantUserId: (prevAcc as { user_id: string } | null)?.user_id || null,
                    }
                });
            } catch (notifyErr) {
                console.warn('Assignment notification failed (non-blocking):', notifyErr);
            }
        }

        return { success: true, companyId: (company as { id: string }).id, previousAccountantId };
    } catch (error) {
        console.error("Error assigning accountant:", error);
        throw error;
    }
}

export async function getAccountantsList() {
    try {
        const { data: accountants, error } = await supabase
            .from('accountants')
            .select(`
        id,
        full_name,
        user_id
      `)
            .eq('is_active', true);

        if (error) throw error;

        // Since we don't have access to auth.users, return accountants without emails
        return accountants?.map(accountant => ({
            id: accountant.id,
            full_name: accountant.full_name,
            email: `accountant-${accountant.id}@example.com` // Placeholder email
        })) || [];
    } catch (error) {
        console.error("Error fetching accountants list:", error);
        throw error;
    }
}

export async function getAccountantsWithCapacityAndSpecialization(): Promise<Array<{
    id: string;
    full_name: string;
    email: string;
    max_client_capacity: number | null;
    current_clients: number;
    specialization: string[] | null;
    availability_status: 'Available' | 'Busy' | 'On Leave' | null;
}>> {
    // Fetch active accountants and their current client counts
    const { data: accountants, error } = await supabase
        .from('accountants')
        .select('id, full_name, user_id, specialization, max_client_capacity, availability_status')
        .eq('is_active', true);
    if (error) throw error;

    const accountantIds: string[] = (accountants || []).map(a => a.id as string);
    const clientCounts = new Map<string, number>();

    if (accountantIds.length > 0) {
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('assigned_accountant_id')
            .in('assigned_accountant_id', accountantIds);
        if (companiesError) throw companiesError;
        for (const c of (companies || []) as Array<{ assigned_accountant_id: string | null }>) {
            if (!c.assigned_accountant_id) continue;
            const key = c.assigned_accountant_id;
            clientCounts.set(key, (clientCounts.get(key) || 0) + 1);
        }
    }

    return (accountants || []).map(a => ({
        id: a.id as string,
        full_name: a.full_name as string,
        email: `accountant-${a.id}@example.com`,
        max_client_capacity: (a as { max_client_capacity: number | null }).max_client_capacity ?? null,
        current_clients: clientCounts.get(a.id as string) || 0,
        specialization: (a as { specialization: string[] | null }).specialization ?? null,
        availability_status: (a as { availability_status: 'Available' | 'Busy' | 'On Leave' | null }).availability_status ?? null,
    }));
}

export async function getAssignmentHistoryByCompany(companyId: string): Promise<Array<{
    id: string;
    created_at: string | null;
    previous_accountant_name: string | null;
    new_accountant_name: string | null;
}>> {
    // Pull from activity logs of type ACCOUNTANT_ASSIGNED
    const { data, error } = await supabase
        .from('activity_logs')
        .select('id, activity, details, created_at')
        .eq('company_id', companyId)
        .eq('activity', ActivityType.ACCOUNTANT_ASSIGNED)
        .order('created_at', { ascending: false });
    if (error) throw error;

    return ((data || []) as Array<{ id: string | number; details: Record<string, unknown> | null; created_at: string | null }>).map((row) => {
        const details = (row.details || {}) as { previous_accountant_name?: string | null; new_accountant_name?: string | null };
        return {
            id: String(row.id),
            created_at: row.created_at,
            previous_accountant_name: details.previous_accountant_name ?? null,
            new_accountant_name: details.new_accountant_name ?? null,
        };
    });
}

export async function getDetailedUserInfo(userId: string): Promise<DetailedUserResponse> {
    try {
        // Get company with basic info
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select(`
                id,
                user_id,
                name,
                type,
                is_active,
                created_at,
                assigned_accountant_id,
                                 profiles!inner(
                    id,
                    full_name,
                    phone_number
                )
            `)
            .eq('user_id', userId)
            .maybeSingle();

        if (companyError) throw companyError;

        if (!company) {
            return {
                data: null,
                error: new Error('User not found')
            };
        }

        // Get auth details
        const { data: authUserData, error: authError } = await supabase.functions.invoke('get-admin-users', {
            body: {
                action: 'get_user_auth_details',
                user_id: userId
            }
        });

        if (authError) {
            console.warn(`Failed to get auth details for user ${userId}:`, authError);
        }

        // Get assigned accountant details
        let assignedAccountant: DetailedUserInfo['assignedAccountant'] = null;
        if ((company as { assigned_accountant_id: string | null }).assigned_accountant_id) {
            const { data: accountant } = await supabase
                .from('accountants')
                .select('id, full_name, user_id')
                .eq('id', (company as { assigned_accountant_id: string }).assigned_accountant_id)
                .maybeSingle();

            if (accountant) {
                assignedAccountant = {
                    id: String(accountant.id),
                    fullName: String(accountant.full_name),
                    email: `${String(accountant.full_name).toLowerCase().replace(' ', '.')}@betterbooks.com`,
                };
                // Fetch last assignment date for this company
                const { data: lastAssign } = await supabase
                    .from('activity_logs')
                    .select('created_at')
                    .eq('company_id', (company as { id: string }).id)
                    .eq('activity', ActivityType.ACCOUNTANT_ASSIGNED)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (lastAssign?.created_at) {
                    assignedAccountant.assignedDate = lastAssign.created_at as string;
                }
            }
        }

        // Get documents count
        const { data: documents } = await supabase
            .from('documents')
            .select('id')
            .eq('company_id', (company as { id: string }).id);

        // Get activity logs for usage stats
        const { data: activityLogs } = await supabase
            .from('activity_logs')
            .select('activity, created_at')
            .eq('company_id', (company as { id: string }).id)
            .order('created_at', { ascending: false })
            .limit(100);

        // Calculate usage statistics
        const loginCount = activityLogs?.filter(log => log.activity === 'user_login').length || 0;
        const documentsProcessed = documents?.length || 0;
        const reportsGenerated = activityLogs?.filter(log => log.activity === 'report_generated').length || 0;

        // Get last activity
        const lastActivity = activityLogs && activityLogs.length > 0 ? activityLogs[0].created_at : undefined;

        // Handle profile data (can be array or object)
        type ProfileRow = { id: string; full_name?: string; phone_number?: string | null };
        const rawProfiles = (company as { profiles: ProfileRow[] | ProfileRow }).profiles;
        const profile: ProfileRow | null = Array.isArray(rawProfiles) ? (rawProfiles[0] || null) : (rawProfiles || null);

        // Determine status
        let status: Status = 'active';
        if (!(company as { is_active: boolean }).is_active) {
            status = 'suspended';
        }

        // Fetch active modules for this user
        const { data: myModules } = await supabase
            .from('user_modules')
            .select('module,enabled,settings')
            .eq('user_id', userId);

        const activeModules: string[] = (myModules || [])
            .filter((m: { enabled: boolean }) => !!m.enabled)
            .map((m: { module: ModuleName; settings: Record<string, unknown> | null }) => {
                let label = m.module === MODULES.ACCOUNTING ? 'Accounting'
                    : m.module === MODULES.TAX_FILING ? 'Tax Filing'
                        : m.module === MODULES.PRAL_INVOICING ? 'PRAL Invoicing'
                            : String(m.module);
                if (m.module === MODULES.ACCOUNTING) {
                    const tier = (m.settings as { tier?: string } | null)?.tier;
                    if (tier === 'Basic' || tier === 'Advanced') {
                        label = `${label} (${tier})`;
                    }
                }
                return label;
            });

        const detailedUserInfo: DetailedUserInfo = {
            id: userId,
            email: (authUserData as { email?: string } | undefined)?.email || 'N/A',
            phone: profile?.phone_number || undefined,
            createdAt: (company as { created_at: string }).created_at,
            lastSignInAt: (authUserData as { last_sign_in_at?: string } | undefined)?.last_sign_in_at || '',
            role: UserRoleEnum.USER,
            status,
            company: {
                id: (company as { id: string }).id,
                name: (company as { name: string }).name,
                type: (company as { type: string }).type,
                isActive: (company as { is_active: boolean }).is_active,
                createdAt: (company as { created_at: string }).created_at,
                primaryContactName: profile?.full_name || 'N/A',
                phoneNumber: profile?.phone_number || undefined
            },
            assignedAccountant,
            activeModules,
            documentsCount: documents?.length || 0,
            lastActivity,
            usageStats: {
                loginCount,
                documentsProcessed,
                reportsGenerated
            },
            billing: {
                plan: 'Free',
                status: 'active',
                documentsUsed: documentsProcessed,
                documentsLimit: null,
                storageUsed: '0 MB',
                storageLimit: null
            },
            supportHistory: {
                totalTickets: 0,
                openTickets: 0,
                resolvedTickets: 0,
                avgResolutionTime: 'N/A'
            }
        };

        return {
            data: detailedUserInfo,
            error: null
        };

    } catch (error) {
        console.error("Error fetching detailed user info:", error);
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error')
        };
    }
}

export async function updateUserModules(
    userId: string,
    modules: Array<string | { name: string; enabled: boolean; settings?: Record<string, unknown> }>
): Promise<{ success: boolean; error?: Error }> {
    try {
        const toModuleName = (name: string): ModuleName => {
            const up = name.toUpperCase();
            return isModuleName(up) ? (up as ModuleName) : MODULES.ACCOUNTING;
        };

        const desired: Array<{ name: ModuleName; enabled: boolean; settings: Record<string, unknown> }> = modules.map((m) => {
            if (typeof m === 'string') {
                return { name: toModuleName(m), enabled: true, settings: {} };
            }
            return { name: toModuleName(m.name || ''), enabled: !!m.enabled, settings: m.settings ?? {} };
        });

        const { data: current, error: fetchErr } = await supabase
            .from('user_modules')
            .select('id,module,enabled,settings')
            .eq('user_id', userId);
        if (fetchErr) throw fetchErr;

        type UserModuleRow = { id: string; module: ModuleName; enabled: boolean; settings: Record<string, unknown> | null };
        const currentMap = new Map<string, { enabled: boolean; settings: Record<string, unknown> | null }>();
        (current as UserModuleRow[] | null | undefined)?.forEach((row) => currentMap.set(row.module, { enabled: !!row.enabled, settings: row.settings || null }));

        for (const d of desired) {
            const prev = currentMap.get(d.name);
            const changed = !prev || prev.enabled !== d.enabled || JSON.stringify(prev.settings || null) !== JSON.stringify(d.settings || null);
            if (!changed) continue;

            const { error: upsertErr } = await supabase
                .from('user_modules')
                .upsert({ user_id: userId, module: d.name, enabled: d.enabled, settings: d.settings ?? {} }, { onConflict: 'user_id,module' });
            if (upsertErr) throw upsertErr;

            await supabase.from('billing_events').insert({
                user_id: userId,
                module: d.name,
                action: d.enabled ? 'MODULE_ENABLED' : 'MODULE_DISABLED',
                details: { settings: d.settings ?? null }
            });

            // Fire-and-forget notification; do not block UI on edge function latency
            supabase.functions.invoke('notify-module-change', {
                body: {
                    user_id: userId,
                    module: d.name,
                    enabled: d.enabled,
                    settings: d.settings ?? null,
                }
            }).catch((e) => {
                console.warn('notify-module-change failed (non-blocking):', e);
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating user modules:', error);
        return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
    }
}

export async function updateUserInfo(userId: string, userInfo: Partial<DetailedUserInfo>): Promise<{ success: boolean; error?: Error }> {
    try {
        // Update company information if provided
        if (userInfo.company) {
            const { error: companyError } = await supabase
                .from('companies')
                .update({
                    name: userInfo.company.name,
                    type: userInfo.company.type,
                    is_active: userInfo.company.isActive
                })
                .eq('user_id', userId);

            if (companyError) throw companyError;
        }

        // Update profile information if provided
        if (userInfo.company) {
            const profileUpdate = {
                ...(userInfo.company.primaryContactName !== undefined && { full_name: userInfo.company.primaryContactName }),
                ...(userInfo.company.phoneNumber !== undefined && { phone_number: userInfo.company.phoneNumber }),
            };

            if (Object.keys(profileUpdate).length > 0) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update(profileUpdate)
                    .eq('id', userId);
                if (profileError) throw profileError;
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating user info:", error);
        return {
            success: false,
            error: error instanceof Error ? error : new Error('Unknown error')
        };
    }
} 