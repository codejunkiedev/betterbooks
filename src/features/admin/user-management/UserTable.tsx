import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu';
import {
    Mail,
    Edit,
    Trash2,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
} from 'lucide-react';
import { AdminUser } from '@/shared/types/admin';
import { formatCompanyType } from '@/shared/utils';
import { useNavigate } from 'react-router-dom';

interface UserTableProps {
    users: AdminUser[];
}

export const UserTable = ({ users }: UserTableProps) => {
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatLastLogin = (lastSignIn?: string) => {
        if (!lastSignIn) return 'Never';
        const now = new Date();
        const lastLogin = new Date(lastSignIn);
        const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return formatDate(lastSignIn);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: {
                label: 'Active',
                className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
                icon: CheckCircle,
                iconColor: 'text-green-600'
            },
            suspended: {
                label: 'Suspended',
                className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
                icon: XCircle,
                iconColor: 'text-red-600'
            },
            pending_verification: {
                label: 'Pending',
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
                icon: Clock,
                iconColor: 'text-yellow-600'
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
        const Icon = config.icon;

        return (
            <Badge className={`flex items-center gap-1 ${config.className}`}>
                <Icon className={`w-3 h-3 ${config.iconColor}`} />
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-4 font-medium text-gray-900">Company Name</th>
                        <th className="text-left p-4 font-medium text-gray-900">Primary Contact Name</th>
                        <th className="text-left p-4 font-medium text-gray-900">Email Address</th>
                        <th className="text-left p-4 font-medium text-gray-900">Phone Number</th>
                        <th className="text-left p-4 font-medium text-gray-900">Registration Date</th>
                        <th className="text-left p-4 font-medium text-gray-900">Status</th>
                        <th className="text-left p-4 font-medium text-gray-900">Assigned Accountant</th>
                        <th className="text-left p-4 font-medium text-gray-900">Active Modules</th>
                        <th className="text-left p-4 font-medium text-gray-900">Last Login</th>
                        <th className="text-left p-4 font-medium text-gray-900 sticky right-0 bg-white">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {user.company?.name || 'No Company'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {formatCompanyType(user.company?.type)}
                                    </p>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="text-sm text-gray-900">
                                    {user.company?.primary_contact_name || 'N/A'}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className="text-sm text-gray-900">
                                    {user.email}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className="text-sm text-gray-900">
                                    {user.company?.phone_number || user.phone || 'N/A'}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className="text-sm text-gray-900">
                                    {formatDate(user.created_at)}
                                </span>
                            </td>
                            <td className="p-4">
                                {getStatusBadge(user.status)}
                            </td>
                            <td className="p-4">
                                {user.assigned_accountant ? (
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.assigned_accountant.full_name}
                                        </p>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-500">Not Assigned</span>
                                )}
                            </td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {user.active_modules.map((module) => (
                                        <Badge key={module} variant="outline" className="text-xs">
                                            {module}
                                        </Badge>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="text-sm text-gray-900">
                                    {formatLastLogin(user.last_sign_in_at)}
                                </span>
                            </td>
                            <td className="p-4 sticky right-0 bg-white">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit User
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Message
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Suspend User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 