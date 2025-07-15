import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import {
    Search,
    Filter,
    Users,
    Mail,
    Shield,
    Edit,
    Trash2,
    UserPlus,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu';

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const users = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@company.com',
            role: 'USER',
            status: 'active',
            lastLogin: '2 hours ago',
            joinDate: '2023-01-15',
            companyName: 'TechCorp Inc.',
            documentsProcessed: 45
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@accounting.com',
            role: 'ACCOUNTANT',
            status: 'active',
            lastLogin: '30 minutes ago',
            joinDate: '2022-11-20',
            companyName: 'Smith & Associates',
            documentsProcessed: 234
        },
        {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.johnson@startup.com',
            role: 'USER',
            status: 'inactive',
            lastLogin: '2 weeks ago',
            joinDate: '2023-03-10',
            companyName: 'StartupXYZ',
            documentsProcessed: 12
        },
        {
            id: 4,
            name: 'Sarah Wilson',
            email: 'sarah.wilson@admin.com',
            role: 'ADMIN',
            status: 'active',
            lastLogin: '1 hour ago',
            joinDate: '2022-06-01',
            companyName: 'System Admin',
            documentsProcessed: 0
        },
        {
            id: 5,
            name: 'Robert Brown',
            email: 'robert.brown@manufacturing.com',
            role: 'USER',
            status: 'pending',
            lastLogin: 'Never',
            joinDate: '2023-12-01',
            companyName: 'Manufacturing Co.',
            documentsProcessed: 0
        },
    ];

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
            case 'ACCOUNTANT':
                return <Badge className="bg-blue-100 text-blue-800">Accountant</Badge>;
            case 'USER':
                return <Badge className="bg-green-100 text-green-800">User</Badge>;
            default:
                return <Badge>{role}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className="bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
                </div>
                <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New User
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Accountants</p>
                                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'ACCOUNTANT').length}</p>
                            </div>
                            <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'pending').length}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="user">User</option>
                                <option value="accountant">Accountant</option>
                                <option value="admin">Admin</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                            </select>
                            <Button variant="outline">
                                <Filter className="w-4 h-4 mr-2" />
                                More Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User List */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-medium text-gray-900">User</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Role</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Company</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Last Login</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Documents</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(user.status)}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-900">{user.companyName}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-900">{user.lastLogin}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-900">{user.documentsProcessed}</p>
                                        </td>
                                        <td className="p-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        Change Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        Send Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm ? 'Try adjusting your search terms' : 'No users match the selected filters'}
                        </p>
                        <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add New User
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 