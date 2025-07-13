import { createClient } from '@supabase/supabase-js';
import { IAuthService, AuthUser, LoginRequest, SignUpRequest, PasswordResetRequest, UpdatePasswordRequest } from '../../core/domain/services/IAuthService';
import { UserRole } from '../../core/domain/entities/User';
import { Result } from '../../core/shared/Result';

export class SupabaseAuthService implements IAuthService {
    private supabase;

    constructor() {
        this.supabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
        );
    }

    async login(request: LoginRequest): Promise<Result<AuthUser>> {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: request.email,
                password: request.password
            });

            if (error) {
                return Result.fail<AuthUser>(`Login failed: ${error.message}`);
            }

            if (!data.user) {
                return Result.fail<AuthUser>('No user data returned');
            }

            // Get user profile from profiles table
            const { data: profile, error: profileError } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError || !profile) {
                return Result.fail<AuthUser>('User profile not found');
            }

            const authUser: AuthUser = {
                id: data.user.id,
                email: data.user.email!,
                fullName: profile.full_name || '',
                role: profile.role || UserRole.USER,
                status: profile.status || 'ACTIVE',
                avatarUrl: profile.avatar_url
            };

            return Result.ok<AuthUser>(authUser);
        } catch (error) {
            return Result.fail<AuthUser>(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async signUp(request: SignUpRequest): Promise<Result<AuthUser>> {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: request.email,
                password: request.password
            });

            if (error) {
                return Result.fail<AuthUser>(`Sign up failed: ${error.message}`);
            }

            if (!data.user) {
                return Result.fail<AuthUser>('No user data returned');
            }

            // Create user profile
            const { error: profileError } = await this.supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    full_name: request.fullName,
                    role: request.role,
                    status: 'ACTIVE'
                });

            if (profileError) {
                return Result.fail<AuthUser>(`Profile creation failed: ${profileError.message}`);
            }

            const authUser: AuthUser = {
                id: data.user.id,
                email: data.user.email!,
                fullName: request.fullName,
                role: request.role,
                status: 'ACTIVE'
            };

            return Result.ok<AuthUser>(authUser);
        } catch (error) {
            return Result.fail<AuthUser>(`Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async logout(): Promise<Result<void>> {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) {
                return Result.fail<void>(`Logout failed: ${error.message}`);
            }
            return Result.ok<void>();
        } catch (error) {
            return Result.fail<void>(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getCurrentUser(): Promise<Result<AuthUser | null>> {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();

            if (error) {
                return Result.fail<AuthUser | null>(`Failed to get current user: ${error.message}`);
            }

            if (!user) {
                return Result.ok<AuthUser | null>(null);
            }

            // Get user profile
            const { data: profile, error: profileError } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                return Result.fail<AuthUser | null>('User profile not found');
            }

            const authUser: AuthUser = {
                id: user.id,
                email: user.email || '',
                fullName: profile.full_name || '',
                role: profile.role || '',
                status: profile.status || '',
                avatarUrl: profile.avatar_url || ''
            };

            console.log(authUser);
            return Result.ok<AuthUser | null>(authUser);
        } catch (error) {
            return Result.fail<AuthUser | null>(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async requestPasswordReset(request: PasswordResetRequest): Promise<Result<void>> {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(request.email);
            if (error) {
                return Result.fail<void>(`Password reset request failed: ${error.message}`);
            }
            return Result.ok<void>();
        } catch (error) {
            return Result.fail<void>(`Password reset request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async resetPassword(_token: string, newPassword: string): Promise<Result<void>> {
        try {
            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });
            if (error) {
                return Result.fail<void>(`Password reset failed: ${error.message}`);
            }
            return Result.ok<void>();
        } catch (error) {
            return Result.fail<void>(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updatePassword(request: UpdatePasswordRequest): Promise<Result<void>> {
        try {
            const { error } = await this.supabase.auth.updateUser({
                password: request.newPassword
            });
            if (error) {
                return Result.fail<void>(`Password update failed: ${error.message}`);
            }
            return Result.ok<void>();
        } catch (error) {
            return Result.fail<void>(`Password update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateProfile(userId: string, fullName: string, avatarUrl?: string): Promise<Result<AuthUser>> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                return Result.fail<AuthUser>(`Profile update failed: ${error.message}`);
            }

            const authUser: AuthUser = {
                id: data.id,
                email: '', // Will be filled by caller
                fullName: data.full_name,
                role: data.role,
                status: data.status,
                avatarUrl: data.avatar_url
            };

            return Result.ok<AuthUser>(authUser);
        } catch (error) {
            return Result.fail<AuthUser>(`Profile update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateUserStatus(userId: string, status: string): Promise<Result<AuthUser>> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .update({
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                return Result.fail<AuthUser>(`Status update failed: ${error.message}`);
            }

            const authUser: AuthUser = {
                id: data.id,
                email: '', // Will be filled by caller
                fullName: data.full_name,
                role: data.role,
                status: data.status,
                avatarUrl: data.avatar_url
            };

            return Result.ok<AuthUser>(authUser);
        } catch (error) {
            return Result.fail<AuthUser>(`Status update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteUser(userId: string): Promise<Result<void>> {
        try {
            const { error } = await this.supabase.auth.admin.deleteUser(userId);
            if (error) {
                return Result.fail<void>(`User deletion failed: ${error.message}`);
            }
            return Result.ok<void>();
        } catch (error) {
            return Result.fail<void>(`User deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async hasPermission(userId: string, permission: string): Promise<Result<boolean>> {
        try {
            // Get user role
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error || !profile) {
                return Result.fail<boolean>('User not found');
            }

            // Define permissions based on roles
            const permissions: Record<string, string[]> = {
                [UserRole.ADMIN]: ['manage_users', 'manage_accountants', 'view_all_companies', 'system_settings'],
                [UserRole.ACCOUNTANT]: ['manage_assigned_companies', 'create_journal_entries', 'view_assigned_documents'],
                [UserRole.USER]: ['manage_own_company', 'upload_documents', 'view_own_reports']
            };

            const userPermissions = permissions[profile.role] || [];
            const hasPermission = userPermissions.includes(permission);

            return Result.ok<boolean>(hasPermission);
        } catch (error) {
            return Result.fail<boolean>(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async canAccessCompany(userId: string, companyId: string): Promise<Result<boolean>> {
        try {
            // Get user role
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error || !profile) {
                return Result.fail<boolean>('User not found');
            }

            // Admins can access all companies
            if (profile.role === UserRole.ADMIN) {
                return Result.ok<boolean>(true);
            }

            // Check if user owns the company
            const { data: company, error: companyError } = await this.supabase
                .from('companies')
                .select('user_id, assigned_accountant_id')
                .eq('id', companyId)
                .single();

            if (companyError || !company) {
                return Result.fail<boolean>('Company not found');
            }

            // Users can access their own companies
            if (profile.role === UserRole.USER && company.user_id === userId) {
                return Result.ok<boolean>(true);
            }

            // Accountants can access assigned companies
            if (profile.role === UserRole.ACCOUNTANT && company.assigned_accountant_id === userId) {
                return Result.ok<boolean>(true);
            }

            return Result.ok<boolean>(false);
        } catch (error) {
            return Result.fail<boolean>(`Company access check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async canManageUser(adminId: string, targetUserId: string): Promise<Result<boolean>> {
        try {
            // Check if adminId is actually an admin
            const { data: adminProfile, error } = await this.supabase
                .from('profiles')
                .select('role')
                .eq('id', adminId)
                .single();

            if (error || !adminProfile || adminProfile.role !== UserRole.ADMIN) {
                return Result.ok<boolean>(false);
            }

            // Admins can manage all users except themselves
            return Result.ok<boolean>(adminId !== targetUserId);
        } catch (error) {
            return Result.fail<boolean>(`User management check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 