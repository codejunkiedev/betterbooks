import { UserRole } from '../entities/User';
import { Result } from '../../shared/Result';

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    status: string;
    avatarUrl?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignUpRequest {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
}

export interface PasswordResetRequest {
    email: string;
}

export interface UpdatePasswordRequest {
    userId: string;
    currentPassword: string;
    newPassword: string;
}

export interface IAuthService {
    // Authentication
    login(request: LoginRequest): Promise<Result<AuthUser>>;
    signUp(request: SignUpRequest): Promise<Result<AuthUser>>;
    logout(): Promise<Result<void>>;
    getCurrentUser(): Promise<Result<AuthUser | null>>;

    // Password management
    requestPasswordReset(request: PasswordResetRequest): Promise<Result<void>>;
    resetPassword(token: string, newPassword: string): Promise<Result<void>>;
    updatePassword(request: UpdatePasswordRequest): Promise<Result<void>>;

    // User management
    updateProfile(userId: string, fullName: string, avatarUrl?: string): Promise<Result<AuthUser>>;
    updateUserStatus(userId: string, status: string): Promise<Result<AuthUser>>;
    deleteUser(userId: string): Promise<Result<void>>;

    // Authorization
    hasPermission(userId: string, permission: string): Promise<Result<boolean>>;
    canAccessCompany(userId: string, companyId: string): Promise<Result<boolean>>;
    canManageUser(adminId: string, targetUserId: string): Promise<Result<boolean>>;
} 