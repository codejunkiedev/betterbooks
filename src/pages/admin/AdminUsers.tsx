import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/loading";
import { Users, Edit, Trash2, Eye, Mail, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/core/domain/entities/User";

interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    last_sign_in_at?: string;
    avatar_url?: string;
    company_count: number;
    document_count: number;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const { user: currentUser } = useAuth();
    const { toast } = useToast();

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);

            // Fetch all users with their profiles and related data
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select(`
          id,
          full_name,
          avatar_url,
          role,
          created_at,
          companies(id),
          documents(id)
        `);

            if (usersError) throw usersError;

            // Fetch auth users for additional data
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
            if (authError) throw authError;

            // Combine profile and auth data
            const combinedUsers = usersData?.map(profile => {
                const authUser = authUsers.users.find(u => u.id === profile.id);
                const companyCount = profile.companies?.length || 0;
                const documentCount = profile.documents?.length || 0;

                return {
                    id: profile.id,
                    email: authUser?.email || 'N/A',
                    full_name: profile.full_name || 'Unknown',
                    role: profile.role || UserRole.USER,
                    is_active: authUser?.user_metadata?.is_active !== false,
                    created_at: profile.created_at,
                    last_sign_in_at: authUser?.last_sign_in_at,
                    avatar_url: profile.avatar_url,
                    company_count: companyCount,
                    document_count: documentCount
                };
            }) || [];

            setUsers(combinedUsers);
            setFilteredUsers(combinedUsers);

        } catch (error) {
            console.error("Error loading users:", error);
            toast({
                title: "Error",
                description: "Failed to load users. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Filter users based on search and filters
    useEffect(() => {
        let filtered = users;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply role filter
        if (roleFilter !== "all") {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(user =>
                statusFilter === "active" ? user.is_active : !user.is_active
            );
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, roleFilter, statusFilter]);

    const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            // Update user metadata
            const { error } = await supabase.auth.admin.updateUserById(userId, {
                user_metadata: { is_active: !currentStatus }
            });

            if (error) throw error;

            // Update local state
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, is_active: !currentStatus } : user
            ));

            toast({
                title: "Success",
                description: `User ${currentStatus ? 'deactivated' : 'activated'} successfully.`,
            });

        } catch (error) {
            console.error("Error updating user status:", error);
            toast({
                title: "Error",
                description: "Failed to update user status. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        try {
            const { error } = await supabase.auth.admin.deleteUser(userId);
            if (error) throw error;

            setUsers(prev => prev.filter(user => user.id !== userId));

            toast({
                title: "Success",
                description: "User deleted successfully.",
            });

        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                title: "Error",
                description: "Failed to delete user. Please try again.",
                variant: "destructive",
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return "destructive";
            case UserRole.ACCOUNTANT:
                return "default";
            case UserRole.USER:
                return "secondary";
            default:
                return "outline";
        }
    };

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-2">Manage all platform users and their permissions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Bulk Email
                        </Button>
                        <Button>
                            <Users className="w-4 h-4 mr-2" />
                            Add New User
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search users by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value={UserRole.USER}>Users</SelectItem>
                                    <SelectItem value={UserRole.ACCOUNTANT}>Accountants</SelectItem>
                                    <SelectItem value={UserRole.ADMIN}>Admins</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users ({filteredUsers.length})</CardTitle>
                        <CardDescription>
                            Manage user accounts, roles, and permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">User</th>
                                        <th className="text-left py-3 px-4 font-medium">Role</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 font-medium">Companies</th>
                                        <th className="text-left py-3 px-4 font-medium">Documents</th>
                                        <th className="text-left py-3 px-4 font-medium">Joined</th>
                                        <th className="text-left py-3 px-4 font-medium">Last Sign In</th>
                                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                                                        ) : (
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {user.full_name.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.full_name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={user.is_active}
                                                        onCheckedChange={() => handleToggleUserStatus(user.id, user.is_active)}
                                                        disabled={user.id === currentUser?.id}
                                                    />
                                                    <Badge variant={user.is_active ? "default" : "secondary"}>
                                                        {user.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-900">{user.company_count}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-900">{user.document_count}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-500">
                                                    {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    {user.id !== currentUser?.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm || roleFilter !== "all" || statusFilter !== "all" ? "No users found" : "No users yet"}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                                        ? "Try adjusting your search or filter criteria"
                                        : "Get started by adding your first user"
                                    }
                                </p>
                                {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
                                    <Button variant="outline" onClick={() => {
                                        setSearchTerm("");
                                        setRoleFilter("all");
                                        setStatusFilter("all");
                                    }}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                {filteredUsers.length > 0 && (
                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {filteredUsers.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Users</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {filteredUsers.filter(u => u.is_active).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Active Users</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {filteredUsers.filter(u => u.role === UserRole.ACCOUNTANT).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Accountants</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-600">
                                        {filteredUsers.filter(u => u.role === UserRole.ADMIN).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Admins</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminUsers; 