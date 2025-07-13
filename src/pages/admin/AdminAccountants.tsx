import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/loading";
import { UserCheck, Search, Edit, Trash2, Eye, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Accountant {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    last_sign_in_at?: string;
    avatar_url?: string;
    assigned_companies_count: number;
    total_documents_processed: number;
    total_journal_entries_created: number;
}

interface ProfileData {
    avatar_url?: string;
}

interface AccountantData {
    id: string;
    user_id: string;
    full_name: string;
    is_active: boolean;
    created_at: string;
    profiles: ProfileData | ProfileData[] | null;
}

const AdminAccountants = () => {
    const [accountants, setAccountants] = useState<Accountant[]>([]);
    const [filteredAccountants, setFilteredAccountants] = useState<Accountant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const { user: currentUser } = useAuth();
    const { toast } = useToast();

    const loadAccountants = useCallback(async () => {
        try {
            setIsLoading(true);

            // Fetch all accountants with their profiles and related data
            const { data: accountantsData, error: accountantsError } = await supabase
                .from('accountants')
                .select(`
          id,
          user_id,
          full_name,
          is_active,
          created_at,
          profiles!accountants_user_id_fkey(email, avatar_url, last_sign_in_at)
        `);

            if (accountantsError) throw accountantsError;

            // Fetch auth users for additional data
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
            if (authError) throw authError;

            // Get statistics for each accountant
            const accountantsWithStats = await Promise.all(
                (accountantsData as AccountantData[])?.map(async (accountant) => {
                    // Get assigned companies count
                    const { count: companiesCount } = await supabase
                        .from('companies')
                        .select('*', { count: 'exact', head: true })
                        .eq('assigned_accountant_id', accountant.id);

                    // Get documents processed count
                    const { count: documentsCount } = await supabase
                        .from('documents')
                        .select('*', { count: 'exact', head: true })
                        .eq('company_id', supabase.from('companies').select('id').eq('assigned_accountant_id', accountant.id))
                        .in('status', ['COMPLETED']);

                    // Get journal entries created count
                    const { count: journalEntriesCount } = await supabase
                        .from('journal_entries')
                        .select('*', { count: 'exact', head: true })
                        .eq('created_by_accountant_id', accountant.id);

                    const authUser = authUsers.users.find(u => u.id === accountant.user_id);

                    let avatar_url = undefined;
                    if (accountant.profiles) {
                        if (Array.isArray(accountant.profiles) && accountant.profiles.length > 0) {
                            avatar_url = accountant.profiles[0].avatar_url;
                        } else if ((accountant.profiles as ProfileData)?.avatar_url) {
                            avatar_url = (accountant.profiles as ProfileData).avatar_url;
                        }
                    }

                    return {
                        id: accountant.id,
                        user_id: accountant.user_id,
                        full_name: accountant.full_name,
                        email: authUser?.email || 'N/A',
                        is_active: accountant.is_active,
                        created_at: accountant.created_at,
                        last_sign_in_at: authUser?.last_sign_in_at,
                        avatar_url: avatar_url,
                        assigned_companies_count: companiesCount || 0,
                        total_documents_processed: documentsCount || 0,
                        total_journal_entries_created: journalEntriesCount || 0
                    };
                }) || []
            );

            setAccountants(accountantsWithStats);
            setFilteredAccountants(accountantsWithStats);

        } catch (error) {
            console.error("Error loading accountants:", error);
            toast({
                title: "Error",
                description: "Failed to load accountants. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadAccountants();
    }, [loadAccountants]);

    // Filter accountants based on search and filters
    useEffect(() => {
        let filtered = accountants;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(accountant =>
                accountant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                accountant.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(accountant =>
                statusFilter === "active" ? accountant.is_active : !accountant.is_active
            );
        }

        setFilteredAccountants(filtered);
    }, [accountants, searchTerm, statusFilter]);

    const handleToggleAccountantStatus = async (accountantId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('accountants')
                .update({ is_active: !currentStatus })
                .eq('id', accountantId);

            if (error) throw error;

            // Update local state
            setAccountants(prev => prev.map(accountant =>
                accountant.id === accountantId ? { ...accountant, is_active: !currentStatus } : accountant
            ));

            toast({
                title: "Success",
                description: `Accountant ${currentStatus ? 'deactivated' : 'activated'} successfully.`,
            });

        } catch (error) {
            console.error("Error updating accountant status:", error);
            toast({
                title: "Error",
                description: "Failed to update accountant status. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteAccountant = async (accountantId: string) => {
        if (!confirm("Are you sure you want to delete this accountant? This action cannot be undone.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('accountants')
                .delete()
                .eq('id', accountantId);

            if (error) throw error;

            setAccountants(prev => prev.filter(accountant => accountant.id !== accountantId));

            toast({
                title: "Success",
                description: "Accountant deleted successfully.",
            });

        } catch (error) {
            console.error("Error deleting accountant:", error);
            toast({
                title: "Error",
                description: "Failed to delete accountant. Please try again.",
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

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Accountant Management</h1>
                        <p className="text-gray-600 mt-2">Manage accountant accounts and assignments</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Bulk Email
                        </Button>
                        <Button>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Add New Accountant
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
                                        placeholder="Search accountants by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active Only</SelectItem>
                                    <SelectItem value="inactive">Inactive Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Accountants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccountants.map((accountant) => (
                        <Card key={accountant.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            {accountant.avatar_url ? (
                                                <img src={accountant.avatar_url} alt="" className="w-12 h-12 rounded-full" />
                                            ) : (
                                                <span className="text-lg font-medium text-gray-600">
                                                    {accountant.full_name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{accountant.full_name}</CardTitle>
                                            <CardDescription>{accountant.email}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={accountant.is_active ? "default" : "secondary"}>
                                        {accountant.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Statistics */}
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-lg font-bold text-blue-600">
                                                {accountant.assigned_companies_count}
                                            </div>
                                            <div className="text-xs text-gray-600">Clients</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-green-600">
                                                {accountant.total_documents_processed}
                                            </div>
                                            <div className="text-xs text-gray-600">Documents</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-purple-600">
                                                {accountant.total_journal_entries_created}
                                            </div>
                                            <div className="text-xs text-gray-600">Entries</div>
                                        </div>
                                    </div>

                                    {/* Account Info */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Member since</span>
                                            <span className="text-sm text-gray-900">{formatDate(accountant.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Last sign in</span>
                                            <span className="text-sm text-gray-900">
                                                {accountant.last_sign_in_at ? formatDate(accountant.last_sign_in_at) : 'Never'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => window.location.href = `/admin/accountants/${accountant.id}`}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => window.location.href = `/admin/accountants/${accountant.id}/edit`}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleAccountantStatus(accountant.id, accountant.is_active)}
                                        >
                                            <Switch className="w-4 h-4" />
                                        </Button>
                                        {accountant.id !== currentUser?.id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteAccountant(accountant.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredAccountants.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm || statusFilter !== "all" ? "No accountants found" : "No accountants yet"}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || statusFilter !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "Get started by adding your first accountant"
                                }
                            </p>
                            {(searchTerm || statusFilter !== "all") && (
                                <Button variant="outline" onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                }}>
                                    Clear Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Summary Stats */}
                {filteredAccountants.length > 0 && (
                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {filteredAccountants.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Accountants</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {filteredAccountants.filter(a => a.is_active).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Active Accountants</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {filteredAccountants.reduce((sum, a) => sum + a.assigned_companies_count, 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Clients Assigned</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {filteredAccountants.reduce((sum, a) => sum + a.total_documents_processed, 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Documents Processed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminAccountants; 