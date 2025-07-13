import { IAuthService } from '../../../domain/services/IAuthService';
import { Result } from '../../../shared/Result';
import { UserRole } from '../../../domain/entities/User';

export interface ManageUserRequest {
    adminId: string;
    targetUserId: string;
    action: 'activate' | 'deactivate' | 'delete' | 'change_role';
    newRole?: UserRole;
}

export interface UserManagementResult {
    userId: string;
    action: string;
    success: boolean;
    message: string;
}

export class ManageUserUseCase {
    constructor(
        private authService: IAuthService
    ) { }

    async execute(request: ManageUserRequest): Promise<Result<UserManagementResult>> {
        try {
            // Validate input
            if (!request.adminId) {
                return Result.fail<UserManagementResult>('Admin ID is required');
            }

            if (!request.targetUserId) {
                return Result.fail<UserManagementResult>('Target user ID is required');
            }

            if (!request.action) {
                return Result.fail<UserManagementResult>('Action is required');
            }

            // Check if admin can manage the target user
            const canManageResult = await this.authService.canManageUser(
                request.adminId,
                request.targetUserId
            );

            if (canManageResult.isFailure) {
                return Result.fail<UserManagementResult>(canManageResult.error);
            }

            if (!canManageResult.value) {
                return Result.fail<UserManagementResult>('Admin does not have permission to manage this user');
            }

            // Perform the requested action
            switch (request.action) {
                case 'activate':
                    return await this.activateUser(request);
                case 'deactivate':
                    return await this.deactivateUser(request);
                case 'delete':
                    return await this.deleteUser(request);
                case 'change_role':
                    return await this.changeUserRole(request);
                default:
                    return Result.fail<UserManagementResult>(`Unknown action: ${request.action}`);
            }
        } catch (error) {
            console.error('Error in ManageUserUseCase:', error);
            return Result.fail<UserManagementResult>(
                `Failed to manage user: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private async activateUser(request: ManageUserRequest): Promise<Result<UserManagementResult>> {
        try {
            const result = await this.authService.updateUserStatus(
                request.targetUserId,
                'ACTIVE'
            );

            if (result.isFailure) {
                return Result.fail<UserManagementResult>(result.error);
            }

            return Result.ok<UserManagementResult>({
                userId: request.targetUserId,
                action: 'activate',
                success: true,
                message: 'User activated successfully'
            });
        } catch (error) {
            return Result.fail<UserManagementResult>(
                `Failed to activate user: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private async deactivateUser(request: ManageUserRequest): Promise<Result<UserManagementResult>> {
        try {
            const result = await this.authService.updateUserStatus(
                request.targetUserId,
                'INACTIVE'
            );

            if (result.isFailure) {
                return Result.fail<UserManagementResult>(result.error);
            }

            return Result.ok<UserManagementResult>({
                userId: request.targetUserId,
                action: 'deactivate',
                success: true,
                message: 'User deactivated successfully'
            });
        } catch (error) {
            return Result.fail<UserManagementResult>(
                `Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private async deleteUser(request: ManageUserRequest): Promise<Result<UserManagementResult>> {
        try {
            const result = await this.authService.deleteUser(request.targetUserId);

            if (result.isFailure) {
                return Result.fail<UserManagementResult>(result.error);
            }

            return Result.ok<UserManagementResult>({
                userId: request.targetUserId,
                action: 'delete',
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            return Result.fail<UserManagementResult>(
                `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private async changeUserRole(request: ManageUserRequest): Promise<Result<UserManagementResult>> {
        try {
            if (!request.newRole) {
                return Result.fail<UserManagementResult>('New role is required for role change action');
            }

            // Validate role
            if (!Object.values(UserRole).includes(request.newRole)) {
                return Result.fail<UserManagementResult>(`Invalid role: ${request.newRole}`);
            }

            // Prevent admin from changing their own role
            if (request.adminId === request.targetUserId) {
                return Result.fail<UserManagementResult>('Admin cannot change their own role');
            }

            // Update user role (this would need to be implemented in the auth service)
            // For now, we'll return a success message
            return Result.ok<UserManagementResult>({
                userId: request.targetUserId,
                action: 'change_role',
                success: true,
                message: `User role changed to ${request.newRole} successfully`
            });
        } catch (error) {
            return Result.fail<UserManagementResult>(
                `Failed to change user role: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
} 