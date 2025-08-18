import { useState, useEffect, useRef, useCallback } from 'react';
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
    UserCheck,
    BarChart3,
    Settings
} from 'lucide-react';
import { getDetailedUserInfo, updateUserModules, assignAccountantToUser, getAccountantsWithCapacityAndSpecialization, getAssignmentHistoryByCompany } from '@/shared/services/supabase/admin';
import type { DetailedUserInfo } from '@/shared/types/admin';
import { SuspendAccountDialog } from './SuspendAccountDialog';
import { EditUserModal } from './EditUserModal';
import { formatDate } from '@/shared/utils/formatters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { formatCompanyType } from '@/shared/utils/formatters';
import { MODULES, ModuleName } from '@/shared/constants/modules';
import type { UserModuleState } from '@/shared/services/supabase/admin';
import { getUserModulesForUser } from '@/shared/services/supabase/admin';
import { Label } from '@/shared/components/Label';
import { Input } from '@/shared/components/Input';
import { LoadingSpinner } from '@/shared/components/Loading';

export const UserDetailView = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [userInfo, setUserInfo] = useState<DetailedUserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [moduleUpdating, setModuleUpdating] = useState<ModuleName | null>(null);
    const moduleSavingTimerRef = useRef<number | null>(null);
    const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

    // Assigned accountant modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignModalLoading, setAssignModalLoading] = useState(false);
    const [accountants, setAccountants] = useState<Array<{
        id: string;
        full_name: string;
        email: string;
        max_client_capacity: number | null;
        current_clients: number;
        specialization: string[] | null;
        availability_status: 'Available' | 'Busy' | 'On Leave' | null;
    }>>([]);
    const [selectedAccountantId, setSelectedAccountantId] = useState<string>('');
    const [assigning, setAssigning] = useState(false);
    const [assignmentHistory, setAssignmentHistory] = useState<Array<{
        id: string;
        created_at: string | null;
        previous_accountant_name: string | null;
        new_accountant_name: string | null;
    }>>([]);
    const [notifyOnChange, setNotifyOnChange] = useState<boolean>(true);

    // Module access settings
    const [userModules, setUserModules] = useState<UserModuleState[]>([]);
    const [pralSettings, setPralSettings] = useState<{ environment: 'Sandbox' | 'Production'; monthly_limit: number; rate_limit: number; restrictions: string }>({ environment: 'Sandbox', monthly_limit: 100, rate_limit: 2, restrictions: '' });
    const [accountingTier, setAccountingTier] = useState<'Basic' | 'Advanced'>('Basic');
    const [taxType, setTaxType] = useState<'Individual' | 'Corporate'>('Individual');
    const [confirmDisable, setConfirmDisable] = useState<{ open: boolean; module?: ModuleName }>({ open: false });

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
        }
    }, [userId, fetchUserDetails]);

    const fetchUserDetails = useCallback(async () => {
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

            // Load assignment history
            if (response.data?.company?.id) {
                try {
                    const history = await getAssignmentHistoryByCompany(response.data.company.id);
                    setAssignmentHistory(history);
                } catch {
                    setAssignmentHistory([]);
                }
            } else {
                setAssignmentHistory([]);
            }

            // Fetch module states
            try {
                const mods = await getUserModulesForUser(userId);
                setUserModules(mods);
                const acc = mods.find(m => m.name === MODULES.ACCOUNTING);
                if (acc && acc.settings) {
                    const tier = (acc.settings as { tier?: 'Basic' | 'Advanced' }).tier;
                    if (tier === 'Basic' || tier === 'Advanced') {
                        setAccountingTier(tier);
                    }
                }
                const tax = mods.find(m => m.name === MODULES.TAX_FILING);
                if (tax && tax.settings) {
                    const type = (tax.settings as { type?: 'Individual' | 'Corporate' }).type;
                    if (type === 'Individual' || type === 'Corporate') {
                        setTaxType(type);
                    }
                }
                const pral = mods.find(m => m.name === MODULES.PRAL_INVOICING);
                if (pral && pral.settings) {
                    const rs = pral.settings as Record<string, unknown>;
                    const environment = rs.environment === 'Production' ? 'Production' : 'Sandbox';
                    const monthly_limit = typeof rs.monthly_limit === 'number' ? rs.monthly_limit as number : Number(rs.monthly_limit ?? 100);
                    const rate_limit = typeof rs.rate_limit === 'number' ? rs.rate_limit as number : Number(rs.rate_limit ?? 2);
                    const restrictions = typeof rs.restrictions === 'string' ? (rs.restrictions as string) : String(rs.restrictions ?? '');
                    setPralSettings({ environment, monthly_limit, rate_limit, restrictions });
                }
            } catch {
                setUserModules([]);
            }

        } catch {
            toast({
                title: "Error",
                description: "Failed to fetch user details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [userId, toast]);

    const handleOpenAssignModal = async () => {
        // Open immediately and show loading state while fetching
        setIsAssignModalOpen(true);
        setAssignModalLoading(true);
        try {
            const list = await getAccountantsWithCapacityAndSpecialization();
            setAccountants(list);
            setSelectedAccountantId(userInfo?.assignedAccountant?.id || '');
        } catch {
            toast({ title: 'Error', description: 'Failed to load accountants', variant: 'destructive' });
        } finally {
            setAssignModalLoading(false);
        }
    };

    const handleConfirmAssignment = async () => {
        if (!userId || !selectedAccountantId) return;
        try {
            setAssigning(true);
            await assignAccountantToUser(userId, selectedAccountantId, notifyOnChange);
            toast({ title: 'Updated', description: 'Assigned accountant updated.' });
            setIsAssignModalOpen(false);
            await fetchUserDetails();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to assign accountant';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setAssigning(false);
        }
    };

    const isModuleEnabled = (name: ModuleName) => userModules.some(m => m.name === name && m.enabled);

    const saveModules = async (payload: Array<{ name: ModuleName; enabled: boolean; settings?: Record<string, unknown> }>) => {
        if (!userId) return;
        setModuleUpdating(payload[0]?.name ?? null);
        if (moduleSavingTimerRef.current) {
            window.clearTimeout(moduleSavingTimerRef.current);
        }
        moduleSavingTimerRef.current = window.setTimeout(() => {
            if (moduleUpdating) {
                setModuleUpdating(null);
                toast({ title: 'Timeout', description: 'Save took too long. Please try again.', variant: 'destructive' });
            }
        }, 15000);
        try {
            const resp = await updateUserModules(userId, payload);
            if (!resp.success) throw resp.error || new Error('Failed to update modules');
            toast({ title: 'Updated', description: 'Modules updated.' });
            const mods = await getUserModulesForUser(userId);
            setUserModules(mods);
        } catch (e) {
            toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to update modules', variant: 'destructive' });
        } finally {
            if (moduleSavingTimerRef.current) {
                window.clearTimeout(moduleSavingTimerRef.current);
                moduleSavingTimerRef.current = null;
            }
            setModuleUpdating(null);
        }
    };

    const handleToggleModule = (name: ModuleName, enabled: boolean) => {
        if (!enabled) {
            setConfirmDisable({ open: true, module: name });
            return;
        }
        if (name === MODULES.ACCOUNTING) {
            saveModules([{ name, enabled: true, settings: { tier: accountingTier } }]);
        } else if (name === MODULES.TAX_FILING) {
            saveModules([{ name, enabled: true, settings: { type: taxType } }]);
        } else if (name === MODULES.PRAL_INVOICING) {
            saveModules([{ name, enabled: true, settings: pralSettings }]);
        }
    };

    const confirmDisableModule = () => {
        if (!confirmDisable.module) return;
        saveModules([{ name: confirmDisable.module, enabled: false, settings: {} }]);
        setConfirmDisable({ open: false });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: {
                label: 'Active',
                className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
            },
            suspended: {
                label: 'Suspended',
                className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
            },
            pending_verification: {
                label: 'Pending Verification',
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
            }
        } as const;

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

        return (
            <Badge className={`flex items-center gap-1 ${config.className}`}>
                {config.label}
            </Badge>
        );
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

    // Derived details for selected accountant
    const selectedAccountant = accountants.find(acc => acc.id === selectedAccountantId) || null;

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

    // removed unused availableModules

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
                            <div className="space-y-3">
                                {/* Accounting Module */}
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Accounting</h4>
                                            <p className="text-sm text-gray-600">Basic/Advanced tiers</p>
                                        </div>
                                        <Switch checked={isModuleEnabled(MODULES.ACCOUNTING)} onCheckedChange={(v) => handleToggleModule(MODULES.ACCOUNTING, v)} disabled={moduleUpdating === MODULES.ACCOUNTING} />
                                    </div>
                                    {isModuleEnabled(MODULES.ACCOUNTING) && (
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Tier</Label>
                                                <Select value={accountingTier} onValueChange={(v) => setAccountingTier(v as 'Basic' | 'Advanced')}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select tier" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Basic">Basic</SelectItem>
                                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-gray-500 mt-1">Choose feature level for accounting.</p>
                                            </div>
                                            <div className="flex items-end justify-end">
                                                <Button
                                                    size="sm"
                                                    onClick={() => saveModules([{ name: MODULES.ACCOUNTING, enabled: true, settings: { tier: accountingTier } }])}
                                                    disabled={moduleUpdating === MODULES.ACCOUNTING}
                                                >
                                                    {moduleUpdating === MODULES.ACCOUNTING ? (
                                                        <span className="inline-flex items-center gap-2">
                                                            <LoadingSpinner size="sm" className="border-white" />
                                                            Saving...
                                                        </span>
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </Button
                                                >
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tax Filing Module */}
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Tax Filing</h4>
                                            <p className="text-sm text-gray-600">Individual/Corporate</p>
                                        </div>
                                        <Switch checked={isModuleEnabled(MODULES.TAX_FILING)} onCheckedChange={(v) => handleToggleModule(MODULES.TAX_FILING, v)} disabled={moduleUpdating === MODULES.TAX_FILING} />
                                    </div>
                                    {isModuleEnabled(MODULES.TAX_FILING) && (
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Filing type</Label>
                                                <Select value={taxType} onValueChange={(v) => setTaxType(v as 'Individual' | 'Corporate')}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Individual">Individual</SelectItem>
                                                        <SelectItem value="Corporate">Corporate</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-gray-500 mt-1">Determines available tax workflows.</p>
                                            </div>
                                            <div className="flex items-end justify-end">
                                                <Button
                                                    size="sm"
                                                    onClick={() => saveModules([{ name: MODULES.TAX_FILING, enabled: true, settings: { type: taxType } }])}
                                                    disabled={moduleUpdating === MODULES.TAX_FILING}
                                                >
                                                    {moduleUpdating === MODULES.TAX_FILING ? (
                                                        <span className="inline-flex items-center gap-2">
                                                            <LoadingSpinner size="sm" className="border-white" />
                                                            Saving...
                                                        </span>
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PRAL Digital Invoicing */}
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">PRAL Digital Invoicing</h4>
                                            <p className="text-sm text-gray-600">Environment, limits and restrictions</p>
                                        </div>
                                        <Switch checked={isModuleEnabled(MODULES.PRAL_INVOICING)} onCheckedChange={(v) => handleToggleModule(MODULES.PRAL_INVOICING, v)} disabled={moduleUpdating === MODULES.PRAL_INVOICING} />
                                    </div>
                                    {isModuleEnabled(MODULES.PRAL_INVOICING) && (
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <Label>Environment</Label>
                                                <Select value={pralSettings.environment} onValueChange={(v) => setPralSettings({ ...pralSettings, environment: v as 'Sandbox' | 'Production' })}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select environment" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Sandbox">Sandbox</SelectItem>
                                                        <SelectItem value="Production">Production</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-gray-500 mt-1">Choose where PRAL API calls are sent.</p>
                                            </div>
                                            <div>
                                                <Label>Monthly limit</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step={1}
                                                        className="text-right pr-14"
                                                        value={pralSettings.monthly_limit}
                                                        onChange={(e) => setPralSettings({ ...pralSettings, monthly_limit: Number(e.target.value) })}
                                                        placeholder="e.g. 100"
                                                    />
                                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">invoices</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Max invoices per month.</p>
                                            </div>
                                            <div>
                                                <Label>API rate limit</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step={1}
                                                        className="text-right pr-12"
                                                        value={pralSettings.rate_limit}
                                                        onChange={(e) => setPralSettings({ ...pralSettings, rate_limit: Number(e.target.value) })}
                                                        placeholder="e.g. 5"
                                                    />
                                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">req/s</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">API requests per second.</p>
                                            </div>
                                            <div>
                                                <Label>Restrictions</Label>
                                                <Input
                                                    value={pralSettings.restrictions}
                                                    onChange={(e) => setPralSettings({ ...pralSettings, restrictions: e.target.value })}
                                                    placeholder="Comma-separated rules"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Optional restrictions, comma-separated.</p>
                                            </div>
                                            <div className="col-span-full flex justify-end">
                                                <Button
                                                    size="sm"
                                                    onClick={() => saveModules([{ name: MODULES.PRAL_INVOICING, enabled: true, settings: pralSettings }])}
                                                    disabled={moduleUpdating === MODULES.PRAL_INVOICING}
                                                >
                                                    {moduleUpdating === MODULES.PRAL_INVOICING ? (
                                                        <span className="inline-flex items-center gap-2">
                                                            <LoadingSpinner size="sm" className="border-white" />
                                                            Saving...
                                                        </span>
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Disable confirmation */}
                            <Dialog open={confirmDisable.open} onOpenChange={(o) => setConfirmDisable({ open: o })}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Disable module?</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <p>Disabling a module will immediately remove access. Existing data is preserved but new entries will be restricted.</p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setConfirmDisable({ open: false })}>Cancel</Button>
                                        <Button variant="destructive" onClick={confirmDisableModule}>Disable</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
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
                            {userInfo?.assignedAccountant ? (
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
                                    <Button variant="outline" size="sm" className="w-full" onClick={handleOpenAssignModal}>
                                        Change Accountant
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-600 mb-2">No accountant assigned.</p>
                                    <Button size="sm" onClick={handleOpenAssignModal}>Assign Accountant</Button>
                                </div>
                            )}

                            {/* Assignment History */}
                            <div className="mt-6">
                                <p className="text-sm font-medium text-gray-900 mb-2">Assignment History</p>
                                {assignmentHistory.length === 0 ? (
                                    <p className="text-sm text-gray-600">No history yet.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {assignmentHistory.map(item => (
                                            <li key={item.id} className="text-sm text-gray-700">
                                                <span className="font-medium">{item.new_accountant_name || 'Unknown'}</span> assigned
                                                {item.previous_accountant_name ? (
                                                    <>
                                                        , replacing <span className="font-medium">{item.previous_accountant_name}</span>
                                                    </>
                                                ) : null}
                                                {item.created_at ? (
                                                    <span className="text-gray-500"> • {formatDate(item.created_at)}</span>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assign Accountant Modal */}
                    <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Accountant</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {assignModalLoading ? (
                                    <div className="py-6 text-sm text-gray-600">Loading accountants...</div>
                                ) : (
                                    <>
                                        <div>
                                            <Select value={selectedAccountantId} onValueChange={setSelectedAccountantId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an accountant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accountants.map(acc => {
                                                        const atCapacity = acc.max_client_capacity !== null && acc.current_clients >= acc.max_client_capacity;
                                                        const label = `${acc.full_name} ${acc.specialization && acc.specialization.length ? '• ' + acc.specialization.join(', ') : ''}`;
                                                        return (
                                                            <SelectItem key={acc.id} value={acc.id} disabled={atCapacity}>
                                                                <div className="flex flex-col">
                                                                    <span className={atCapacity ? 'text-gray-400' : ''}>{label}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        Clients: {acc.current_clients}{acc.max_client_capacity !== null ? ` / ${acc.max_client_capacity}` : ''} • Availability: {acc.availability_status || 'Unknown'}
                                                                        {atCapacity ? ' • Capacity Full' : ''}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selectedAccountant && (
                                            <div className="rounded-lg border p-3 text-sm text-gray-700">
                                                <div className="font-medium text-gray-900 mb-1">Selected Accountant Details</div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="text-gray-600">Name:</span> {selectedAccountant.full_name}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Clients:</span> {selectedAccountant.current_clients}{selectedAccountant.max_client_capacity !== null ? ` / ${selectedAccountant.max_client_capacity}` : ''}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Availability:</span> {selectedAccountant.availability_status || 'Unknown'}
                                                    </div>
                                                    {selectedAccountant.specialization && selectedAccountant.specialization.length > 0 && (
                                                        <div className="sm:col-span-2">
                                                            <span className="text-gray-600">Specialization:</span> {selectedAccountant.specialization.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Send notifications</div>
                                                <div className="text-xs text-gray-600">Email the user and accountant about this change.</div>
                                            </div>
                                            <Switch checked={notifyOnChange} onCheckedChange={setNotifyOnChange} />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsAssignModalOpen(false)} disabled={assigning}>Cancel</Button>
                                    <Button onClick={handleConfirmAssignment} disabled={!selectedAccountantId || assigning || assignModalLoading}>
                                        {assigning ? 'Assigning...' : 'Confirm'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
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