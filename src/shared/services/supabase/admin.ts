import { supabase } from '@/shared/services/supabase/client';
import { AdminUsersFilters, AdminUsersResponse, Status, DetailedUserResponse, DetailedUserInfo } from '@/shared/types/admin';

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
                role: 'USER' as const,
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
                active_modules: ['Accounting'],
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

export async function assignAccountantToUser(userId: string, accountantId: string) {
    try {
        const { error } = await supabase
            .from('companies')
            .update({ assigned_accountant_id: accountantId })
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
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
        let assignedAccountant = null;
        if (company.assigned_accountant_id) {
            const { data: accountant } = await supabase
                .from('accountants')
                .select('id, full_name, user_id, created_at')
                .eq('id', company.assigned_accountant_id)
                .maybeSingle();

            if (accountant) {
                assignedAccountant = {
                    id: accountant.id,
                    fullName: accountant.full_name,
                    email: `${accountant.full_name.toLowerCase().replace(' ', '.')}@betterbooks.com`,
                    assignedDate: accountant.created_at
                };
            }
        }

        // Get documents count
        const { data: documents } = await supabase
            .from('documents')
            .select('id')
            .eq('company_id', company.id);

        // Get activity logs for usage stats
        const { data: activityLogs } = await supabase
            .from('activity_logs')
            .select('activity, created_at')
            .eq('company_id', company.id)
            .order('created_at', { ascending: false })
            .limit(100);

        // Calculate usage statistics
        const loginCount = activityLogs?.filter(log => log.activity === 'user_login').length || 0;
        const documentsProcessed = documents?.length || 0;
        const reportsGenerated = activityLogs?.filter(log => log.activity === 'report_generated').length || 0;

        // Get last activity
        const lastActivity = activityLogs && activityLogs.length > 0 ? activityLogs[0].created_at : undefined;

        // Handle profile data (can be array or object)
        const profile = Array.isArray(company.profiles) ? company.profiles[0] : company.profiles;

        // Determine status
        let status: Status = 'active';
        if (!company.is_active) {
            status = 'suspended';
        }

        const detailedUserInfo: DetailedUserInfo = {
            id: userId,
            email: authUserData?.email || 'N/A',
            phone: profile?.phone_number || undefined,
            createdAt: company.created_at,
            lastSignInAt: authUserData?.last_sign_in_at,
            role: 'USER',
            status,
            company: {
                id: company.id,
                name: company.name,
                type: company.type,
                isActive: company.is_active,
                createdAt: company.created_at,
                primaryContactName: profile?.full_name,
                phoneNumber: profile?.phone_number || undefined
            },
            assignedAccountant,
            activeModules: ['Accounting'], // Default modules - this should be enhanced
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

export async function updateUserModules(userId: string, modules: string[]): Promise<{ success: boolean; error?: Error }> {
    try {
        // For now, we'll just return success since we don't have a modules table
        // In a real implementation, you would update a user_modules table
        console.log(`Updating modules for user ${userId}:`, modules);

        return { success: true };
    } catch (error) {
        console.error("Error updating user modules:", error);
        return {
            success: false,
            error: error instanceof Error ? error : new Error('Unknown error')
        };
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