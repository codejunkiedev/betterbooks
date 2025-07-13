import React, { ReactNode } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { UserRole } from '@/shared/types';
import { RoleBasedNavigation } from '@/shared/components/RoleBasedNavigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/shared/components/dropdown-menu';
import { LogOut, User, Settings, Bell } from 'lucide-react';

interface RoleBasedLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({
    children,
    title,
    subtitle
}) => {
    const { user, userPermissions, signOut } = useAuth();

    if (!userPermissions) return null;

    const getRoleDisplayName = (role: UserRole): string => {
        switch (role) {
            case UserRole.ADMIN:
                return 'Administrator';
            case UserRole.ACCOUNTANT:
                return 'Accountant';
            case UserRole.USER:
                return 'User';
            default:
                return 'User';
        }
    };

    const getRoleColor = (role: UserRole): string => {
        switch (role) {
            case UserRole.ADMIN:
                return 'bg-red-100 text-red-800';
            case UserRole.ACCOUNTANT:
                return 'bg-blue-100 text-blue-800';
            case UserRole.USER:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Title */}
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold text-gray-900">BetterBooks</h1>
                            </div>
                            {title && (
                                <div className="ml-8">
                                    <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                                    {subtitle && (
                                        <p className="text-sm text-gray-500">{subtitle}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right side - Notifications and User Menu */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <Button variant="ghost" size="sm" className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                            </Button>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || ''} />
                                            <AvatarFallback>
                                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user?.user_metadata?.full_name || user?.email}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userPermissions.role)}`}>
                                                {getRoleDisplayName(userPermissions.role)}
                                            </span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
                    <div className="p-4">
                        <RoleBasedNavigation />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

// Role-specific layout components
export const UserLayout: React.FC<RoleBasedLayoutProps> = (props) => {
    const { isRole } = useAuth();
    return isRole(UserRole.USER) ? <RoleBasedLayout {...props} /> : null;
};

export const AccountantLayout: React.FC<RoleBasedLayoutProps> = (props) => {
    const { isRole } = useAuth();
    return isRole(UserRole.ACCOUNTANT) ? <RoleBasedLayout {...props} /> : null;
};

export const AdminLayout: React.FC<RoleBasedLayoutProps> = (props) => {
    const { isRole } = useAuth();
    return isRole(UserRole.ADMIN) ? <RoleBasedLayout {...props} /> : null;
};

// Simple layout without sidebar for auth pages
export const AuthLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        BetterBooks
                    </h2>
                </div>
                {children}
            </div>
        </div>
    );
}; 