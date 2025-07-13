import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/loading";
import { Users, FileText, Eye, MessageSquare, Download, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Client {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    pending_documents: number;
    total_documents: number;
    last_activity: string;
    assigned_accountant_id: string;
}

interface DocumentSummary {
    id: string;
    status: string;
    uploaded_at: string;
}

const AccountantClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const { user } = useAuth();
    const { toast } = useToast();

    const loadClients = useCallback(async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // Fetch assigned clients with document counts
            const { data: clientsData, error: clientsError } = await supabase
                .from('companies')
                .select(`
          id,
          name,
          type,
          is_active,
          created_at,
          assigned_accountant_id,
          documents(id, status, uploaded_at)
        `)
                .eq('assigned_accountant_id', user.id);

            if (clientsError) throw clientsError;

            // Process clients data
            const processedClients = clientsData?.map(client => {
                const documents = client.documents || [];
                const pendingDocs = documents.filter((doc: DocumentSummary) =>
                    doc.status === 'PENDING_REVIEW' || doc.status === 'IN_PROGRESS'
                ).length;

                const totalDocs = documents.length;
                const lastActivity = documents.length > 0
                    ? Math.max(...documents.map((doc: DocumentSummary) => new Date(doc.uploaded_at).getTime()))
                    : new Date(client.created_at).getTime();

                return {
                    id: client.id,
                    name: client.name,
                    type: client.type,
                    is_active: client.is_active,
                    created_at: client.created_at,
                    pending_documents: pendingDocs,
                    total_documents: totalDocs,
                    last_activity: new Date(lastActivity).toISOString(),
                    assigned_accountant_id: client.assigned_accountant_id
                };
            }) || [];

            setClients(processedClients);
            setFilteredClients(processedClients);

        } catch (error) {
            console.error("Error loading clients:", error);
            toast({
                title: "Error",
                description: "Failed to load clients. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    // Filter clients based on search and status
    useEffect(() => {
        let filtered = clients;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            switch (statusFilter) {
                case "active":
                    filtered = filtered.filter(client => client.is_active);
                    break;
                case "inactive":
                    filtered = filtered.filter(client => !client.is_active);
                    break;
                case "pending":
                    filtered = filtered.filter(client => client.pending_documents > 0);
                    break;
                case "no-pending":
                    filtered = filtered.filter(client => client.pending_documents === 0);
                    break;
            }
        }

        setFilteredClients(filtered);
    }, [clients, searchTerm, statusFilter]);

    const handleViewClient = (clientId: string) => {
        window.location.href = `/accountant/clients/${clientId}`;
    };

    const handleViewDocuments = (clientId: string) => {
        window.location.href = `/accountant/documents?client=${clientId}`;
    };

    const handleMessageClient = (clientId: string) => {
        window.location.href = `/accountant/messages?client=${clientId}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return `${Math.floor(diffInDays / 30)} months ago`;
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
                        <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
                        <p className="text-gray-600 mt-2">Manage your assigned clients and their documents</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export List
                        </Button>
                        <Button>
                            <Users className="w-4 h-4 mr-2" />
                            Add New Client
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
                                        placeholder="Search clients by name or type..."
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
                                    <SelectItem value="all">All Clients</SelectItem>
                                    <SelectItem value="active">Active Only</SelectItem>
                                    <SelectItem value="inactive">Inactive Only</SelectItem>
                                    <SelectItem value="pending">With Pending Documents</SelectItem>
                                    <SelectItem value="no-pending">No Pending Documents</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Clients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{client.name}</CardTitle>
                                        <CardDescription className="capitalize">
                                            {client.type.replace('_', ' ')}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={client.is_active ? "default" : "secondary"}>
                                        {client.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Document Status */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Documents</span>
                                        <div className="flex gap-2">
                                            <Badge variant={client.pending_documents > 0 ? "destructive" : "secondary"}>
                                                {client.pending_documents} pending
                                            </Badge>
                                            <Badge variant="outline">
                                                {client.total_documents} total
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Last Activity */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Last Activity</span>
                                        <span className="text-sm text-gray-900">
                                            {getTimeAgo(client.last_activity)}
                                        </span>
                                    </div>

                                    {/* Client Since */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Client Since</span>
                                        <span className="text-sm text-gray-900">
                                            {formatDate(client.created_at)}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleViewClient(client.id)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleViewDocuments(client.id)}
                                        >
                                            <FileText className="w-4 h-4 mr-1" />
                                            Documents
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMessageClient(client.id)}
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredClients.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm || statusFilter !== "all" ? "No clients found" : "No clients assigned"}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || statusFilter !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "Contact your administrator to get assigned to clients"
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
                {filteredClients.length > 0 && (
                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {filteredClients.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Clients</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {filteredClients.filter(c => c.is_active).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Active Clients</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {filteredClients.reduce((sum, c) => sum + c.pending_documents, 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Pending Documents</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {filteredClients.reduce((sum, c) => sum + c.total_documents, 0)}
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

export default AccountantClients; 