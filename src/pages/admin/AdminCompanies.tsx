import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/loading";
import { Building, Search, Edit, Eye, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
    assigned_accountant_id?: string;
    owner_name: string;
    owner_email: string;
    accountant_name?: string;
    document_count: number;
    journal_entry_count: number;
    last_activity: string;
}

interface ProfileData {
    full_name: string;
    email: string;
}

interface AccountantData {
    full_name: string;
}

interface CompanyData {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
    assigned_accountant_id?: string;
    profiles: ProfileData | ProfileData[] | null;
    accountants: AccountantData | AccountantData[] | null;
}

const AdminCompanies = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const { toast } = useToast();

    const loadCompanies = useCallback(async () => {
        try {
            setIsLoading(true);

            // Fetch all companies with related data
            const { data: companiesData, error: companiesError } = await supabase
                .from('companies')
                .select(`
          id,
          name,
          type,
          is_active,
          created_at,
          user_id,
          assigned_accountant_id,
          profiles!companies_user_id_fkey(full_name, email),
          accountants!companies_assigned_accountant_id_fkey(full_name)
        `)
                .order('created_at', { ascending: false });

            if (companiesError) throw companiesError;

            // Get statistics for each company
            const companiesWithStats = await Promise.all(
                (companiesData as CompanyData[])?.map(async (company) => {
                    // Get document count
                    const { count: documentCount } = await supabase
                        .from('documents')
                        .select('*', { count: 'exact', head: true })
                        .eq('company_id', company.id);

                    // Get journal entry count
                    const { count: journalEntryCount } = await supabase
                        .from('journal_entries')
                        .select('*', { count: 'exact', head: true })
                        .eq('company_id', company.id);

                    // Get last activity (most recent document or journal entry)
                    const { data: lastActivity } = await supabase
                        .from('documents')
                        .select('uploaded_at')
                        .eq('company_id', company.id)
                        .order('uploaded_at', { ascending: false })
                        .limit(1)
                        .single();

                    let owner_name = 'Unknown';
                    let owner_email = 'N/A';
                    if (company.profiles) {
                        if (Array.isArray(company.profiles) && company.profiles.length > 0) {
                            owner_name = company.profiles[0].full_name || 'Unknown';
                            owner_email = company.profiles[0].email || 'N/A';
                        } else {
                            owner_name = (company.profiles as ProfileData).full_name || 'Unknown';
                            owner_email = (company.profiles as ProfileData).email || 'N/A';
                        }
                    }
                    let accountant_name = undefined;
                    if (company.accountants) {
                        if (Array.isArray(company.accountants) && company.accountants.length > 0) {
                            accountant_name = company.accountants[0].full_name;
                        } else if ((company.accountants as AccountantData)?.full_name) {
                            accountant_name = (company.accountants as AccountantData).full_name;
                        }
                    }

                    return {
                        id: company.id,
                        name: company.name,
                        type: company.type,
                        is_active: company.is_active,
                        created_at: company.created_at,
                        user_id: company.user_id,
                        assigned_accountant_id: company.assigned_accountant_id,
                        owner_name: owner_name,
                        owner_email: owner_email,
                        accountant_name: accountant_name,
                        document_count: documentCount || 0,
                        journal_entry_count: journalEntryCount || 0,
                        last_activity: lastActivity?.uploaded_at || company.created_at
                    };
                }) || []
            );

            setCompanies(companiesWithStats);
            setFilteredCompanies(companiesWithStats);

        } catch (error) {
            console.error("Error loading companies:", error);
            toast({
                title: "Error",
                description: "Failed to load companies. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    // Filter companies based on search and filters
    useEffect(() => {
        let filtered = companies;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(company =>
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(company =>
                statusFilter === "active" ? company.is_active : !company.is_active
            );
        }

        // Apply type filter
        if (typeFilter !== "all") {
            filtered = filtered.filter(company => company.type === typeFilter);
        }

        setFilteredCompanies(filtered);
    }, [companies, searchTerm, statusFilter, typeFilter]);

    const handleToggleCompanyStatus = async (companyId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_active: !currentStatus })
                .eq('id', companyId);

            if (error) throw error;

            // Update local state
            setCompanies(prev => prev.map(company =>
                company.id === companyId ? { ...company, is_active: !currentStatus } : company
            ));

            toast({
                title: "Success",
                description: `Company ${currentStatus ? 'deactivated' : 'activated'} successfully.`,
            });

        } catch (error) {
            console.error("Error updating company status:", error);
            toast({
                title: "Error",
                description: "Failed to update company status. Please try again.",
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

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'INDEPENDENT_WORKER':
                return "default";
            case 'PROFESSIONAL_SERVICES':
                return "secondary";
            case 'SMALL_BUSINESS':
                return "outline";
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
                        <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
                        <p className="text-gray-600 mt-2">Manage all companies and their assignments</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Bulk Email
                        </Button>
                        <Button>
                            <Building className="w-4 h-4 mr-2" />
                            Add New Company
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search companies..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active Only</SelectItem>
                                    <SelectItem value="inactive">Inactive Only</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="INDEPENDENT_WORKER">Independent Worker</SelectItem>
                                    <SelectItem value="PROFESSIONAL_SERVICES">Professional Services</SelectItem>
                                    <SelectItem value="SMALL_BUSINESS">Small Business</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Companies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company) => (
                        <Card key={company.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg truncate">{company.name}</CardTitle>
                                        <CardDescription className="truncate">{company.owner_name}</CardDescription>
                                    </div>
                                    <div className="flex gap-1">
                                        <Badge variant={company.is_active ? "default" : "secondary"}>
                                            {company.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        <Badge variant={getTypeBadgeVariant(company.type)}>
                                            {company.type.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Company Info */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Owner</span>
                                            <span className="text-sm text-gray-900">{company.owner_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Email</span>
                                            <span className="text-sm text-gray-900 truncate">{company.owner_email}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Accountant</span>
                                            <span className="text-sm text-gray-900">
                                                {company.accountant_name || 'Unassigned'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-lg font-bold text-blue-600">
                                                {company.document_count}
                                            </div>
                                            <div className="text-xs text-gray-600">Documents</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-green-600">
                                                {company.journal_entry_count}
                                            </div>
                                            <div className="text-xs text-gray-600">Journal Entries</div>
                                        </div>
                                    </div>

                                    {/* Company Details */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Created</span>
                                            <span className="text-sm text-gray-900">{formatDate(company.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Last Activity</span>
                                            <span className="text-sm text-gray-900">{formatDate(company.last_activity)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => window.location.href = `/admin/companies/${company.id}`}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => window.location.href = `/admin/companies/${company.id}/edit`}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleCompanyStatus(company.id, company.is_active)}
                                        >
                                            <Switch className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredCompanies.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                                    ? "No companies found"
                                    : "No companies yet"}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "Companies will appear here when users complete registration"
                                }
                            </p>
                            {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                                <Button variant="outline" onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                    setTypeFilter("all");
                                }}>
                                    Clear Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Summary Stats */}
                {filteredCompanies.length > 0 && (
                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {filteredCompanies.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Companies</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {filteredCompanies.filter(c => c.is_active).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Active Companies</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {filteredCompanies.filter(c => c.assigned_accountant_id).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Assigned to Accountants</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {filteredCompanies.reduce((sum, c) => sum + c.document_count, 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Documents</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminCompanies; 