import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { Switch } from '@/shared/components/Switch';
import { useToast } from '@/shared/hooks/useToast';
import {
    ArrowLeft,
    Edit,
    Building,
    User,
    CreditCard,
    HelpCircle,
    CheckCircle,
    XCircle,
    Clock,
    UserCheck,
    BarChart3,
    Settings
} from 'lucide-react';
import { getDetailedUserInfo, updateUserModules } from '@/shared/services/supabase/admin';
import type { DetailedUserInfo } from '@/shared/types/admin';
import { SuspendAccountDialog } from './SuspendAccountDialog';
import { EditUserModal } from './EditUserModal';
import { formatCompanyType } from '@/shared/utils';

export const UserDetailView = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [userInfo, setUserInfo] = useState<DetailedUserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [moduleUpdating, setModuleUpdating] = useState<string | null>(null);
    const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    const fetchUserDetails = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const response = await getDetailedUserInfo(userId);

            if (response.error) {
                toast({
                    title: "Error",
                    description: response.error.message,
                    variant: "destructive",
                });
                return;
            }

            setUserInfo(response.data);
        } catch {
            toast({
                title: "Error",
                description: "Failed to fetch user details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleModuleToggle = async (moduleName: string, enabled: boolean) => {
        if (!userId || !userInfo) return;

        setModuleUpdating(moduleName);

        try {
            const updatedModules = enabled
                ? [...userInfo.activeModules, moduleName]
                : userInfo.activeModules.filter(m => m !== moduleName);

            const response = await updateUserModules(userId, updatedModules);

            if (response.error) {
                toast({
                    title: "Error",
                    description: response.error.message,
                    variant: "destructive",
                });
                return;
            }

            setUserInfo(prev => prev ? { ...prev, activeModules: updatedModules } : null);

            toast({
                title: "Success",
                description: `Module ${moduleName} ${enabled ? 'enabled' : 'disabled'} successfully`,
            });

        } catch {
            toast({
                title: "Error",
                description: "Failed to update module access",
                variant: "destructive",
            });
        } finally {
            setModuleUpdating(null);
        }
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
                label: 'Pending Verification',
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatLastActivity = (dateString?: string) => {
        if (!dateString) return 'Never';

        const now = new Date();
        const lastActivity = new Date(dateString);
        const diffInHours = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
        return formatDate(dateString);
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto p-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-64 bg-gray-200 rounded" />
                    <div className="h-10 w-28 bg-gray-200 rounded" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-56 bg-gray-200 rounded" />
                        <div className="h-56 bg-gray-200 rounded" />
                        <div className="h-56 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-40 bg-gray-200 rounded" />
                        <div className="h-40 bg-gray-200 rounded" />
                        <div className="h-40 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
                <p className="text-gray-600 mb-4">The requested user could not be found.</p>
                <Button onClick={() => navigate('/admin/users')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Users
                </Button>
            </div>
        );
    }

    const availableModules = [
        { name: 'Accounting', description: 'Accounting and bookkeeping features' }
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {userInfo.company?.name || 'User Details'}
                        </h1>
                        <p className="text-gray-600">Complete user profile and settings</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white" onClick={() => setShowEditModal(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                    </Button>
                    {userInfo && (
                        <Button
                            variant={userInfo.status === 'suspended' ? 'default' : 'destructive'}
                            onClick={() => setIsSuspendDialogOpen(true)}
                        >
                            {userInfo.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Company Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                                    <p className="text-gray-900">{userInfo.company?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Business Type</label>
                                    <p className="text-gray-900">{userInfo.company?.type ? formatCompanyType(userInfo.company.type) : 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Primary Contact</label>
                                    <p className="text-gray-900">{userInfo.company?.primaryContactName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <p className="text-gray-900">{userInfo.company?.phoneNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <p className="text-gray-900">{userInfo.email}</p>
                                </div>
                                {/* Custom fields like NTN, Industry, Address are not available in current schema */}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Registration Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck className="w-5 h-5" />
                                Registration Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Registration Date</label>
                                    <p className="text-gray-900">{formatDate(userInfo.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Verification Status</label>
                                    <div className="mt-1">
                                        {getStatusBadge(userInfo.status)}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Documents Uploaded</label>
                                    <p className="text-gray-900">{userInfo.documentsCount} files</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Account Type</label>
                                    <Badge variant="outline">{userInfo.role}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Module Access */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Module Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableModules.map((module) => {
                                    const isEnabled = userInfo.activeModules.includes(module.name);
                                    const isUpdating = moduleUpdating === module.name;

                                    return (
                                        <div key={module.name} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{module.name}</h4>
                                                <p className="text-sm text-gray-600">{module.description}</p>
                                            </div>
                                            <Switch
                                                checked={isEnabled}
                                                onCheckedChange={(checked) => handleModuleToggle(module.name, checked)}
                                                disabled={isUpdating}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Usage Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{userInfo.usageStats?.loginCount || 0}</p>
                                    <p className="text-sm text-gray-600">Total Logins</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{userInfo.usageStats?.documentsProcessed || 0}</p>
                                    <p className="text-sm text-gray-600">Documents Processed</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{userInfo.usageStats?.reportsGenerated || 0}</p>
                                    <p className="text-sm text-gray-600">Reports Generated</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Last Activity:</span>
                                    <span className="font-medium">{formatLastActivity(userInfo.lastActivity)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-600">Last Sign In:</span>
                                    <span className="font-medium">{formatLastActivity(userInfo.lastSignInAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Secondary Info */}
                <div className="space-y-6">
                    {/* Assigned Accountant */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Assigned Accountant
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userInfo.assignedAccountant ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {userInfo.assignedAccountant.fullName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {userInfo.assignedAccountant.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Assigned Date</p>
                                        <p className="font-medium">
                                            {userInfo.assignedAccountant.assignedDate ? formatDate(userInfo.assignedAccountant.assignedDate) : 'N/A'}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Change Accountant
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-600 mb-3">No accountant assigned</p>
                                    <Button variant="outline" size="sm">
                                        Assign Accountant
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Billing Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Billing Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Subscription Plan</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                        {userInfo.billing?.plan || 'Free'}
                                    </Badge>
                                    {userInfo.billing?.status === 'active' && (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Payment Status</label>
                                <p className="text-gray-900 capitalize">{userInfo.billing?.status || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Usage Limits</label>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Documents: {userInfo.billing?.documentsUsed || 0}/{userInfo.billing?.documentsLimit || 'Unlimited'}</p>
                                    <p>Storage: {userInfo.billing?.storageUsed || '0 MB'}/{userInfo.billing?.storageLimit || 'Unlimited'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5" />
                                Support History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center space-y-2">
                                <p className="text-2xl font-bold text-gray-900">
                                    {userInfo.supportHistory?.totalTickets || 0}
                                </p>
                                <p className="text-sm text-gray-600">Total Tickets</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Open:</span>
                                    <span className="font-medium text-orange-600">
                                        {userInfo.supportHistory?.openTickets || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Resolved:</span>
                                    <span className="font-medium text-green-600">
                                        {userInfo.supportHistory?.resolvedTickets || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Avg. Resolution:</span>
                                    <span className="font-medium">
                                        {userInfo.supportHistory?.avgResolutionTime || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                                View Support History
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit User Modal */}
            {userInfo && (
                <EditUserModal
                    user={userInfo}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onUserUpdated={(updatedUser) => {
                        setUserInfo(updatedUser);
                        toast({
                            title: "Success",
                            description: "User information updated successfully",
                        });
                    }}
                />
            )}
            {/* Suspend/Reactivate Dialog */}
            {userInfo && userInfo.company && (
                <SuspendAccountDialog
                    open={isSuspendDialogOpen}
                    onOpenChange={setIsSuspendDialogOpen}
                    userId={userInfo.id}
                    companyId={userInfo.company.id}
                    currentStatus={userInfo.status}
                    onCompleted={fetchUserDetails}
                />
            )}
        </div>
    );
}; 