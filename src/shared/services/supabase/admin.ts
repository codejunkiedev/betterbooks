import { supabase } from '@/shared/services/supabase/client';
import { AdminUsersFilters, AdminUsersResponse, Status } from '@/shared/types/admin';

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
                    is_active
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
                    phone_number: 'N/A'
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