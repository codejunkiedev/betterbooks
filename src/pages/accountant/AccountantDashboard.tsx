import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/loading";
import {
    Users,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Eye,
    Download
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Client {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    pending_documents: number;
    total_documents: number;
    last_activity: string;
}

interface DashboardStats {
    total_clients: number;
    active_clients: number;
    pending_documents: number;
    completed_documents: number;
    total_revenue: number;
}

interface DocumentSummary {
    id: string;
    status: string;
}

const AccountantDashboard = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    const loadDashboardData = useCallback(async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // Fetch assigned clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('companies')
                .select(`
          id,
          name,
          type,
          is_active,
          created_at,
          documents!inner(id, status)
        `)
                .eq('assigned_accountant_id', user.id)
                .eq('is_active', true);

            if (clientsError) throw clientsError;

            // Process clients data
            const processedClients = clientsData?.map(client => {
                const pendingDocs = client.documents?.filter((doc: DocumentSummary) =>
                    doc.status === 'PENDING_REVIEW' || doc.status === 'IN_PROGRESS'
                ).length || 0;

                const totalDocs = client.documents?.length || 0;

                return {
                    id: client.id,
                    name: client.name,
                    type: client.type,
                    is_active: client.is_active,
                    pending_documents: pendingDocs,
                    total_documents: totalDocs,
                    last_activity: client.created_at
                };
            }) || [];

            setClients(processedClients);

            // Calculate dashboard stats
            const totalClients = processedClients.length;
            const activeClients = processedClients.filter(c => c.is_active).length;
            const pendingDocuments = processedClients.reduce((sum, client) => sum + client.pending_documents, 0);
            const completedDocuments = processedClients.reduce((sum, client) =>
                sum + (client.total_documents - client.pending_documents), 0);

            setStats({
                total_clients: totalClients,
                active_clients: activeClients,
                pending_documents: pendingDocuments,
                completed_documents: completedDocuments,
                total_revenue: 0 // TODO: Calculate from billing
            });

        } catch (error) {
            console.error("Error loading accountant dashboard:", error);
            toast({
                title: "Error",
                description: "Failed to load dashboard data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleViewClient = (clientId: string) => {
        // Navigate to client detail view
        window.location.href = `/accountant/clients/${clientId}`;
    };

    const handleProcessDocuments = (clientId: string) => {
        // Navigate to document processing view
        window.location.href = `/accountant/documents?client=${clientId}`;
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
                        <h1 className="text-3xl font-bold text-gray-900">Accountant Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage your clients and their documents</p>
                    </div>
                    <Button onClick={() => window.location.href = '/accountant/clients'}>
                        <Users className="w-4 h-4 mr-2" />
                        View All Clients
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_clients || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.active_clients || 0} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats?.pending_documents || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Require attention
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Documents</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats?.completed_documents || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Processed this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats?.total_revenue || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Clients Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Assigned Clients
                            </CardTitle>
                            <CardDescription>
                                Your active clients and their document status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {clients.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No clients assigned yet</p>
                                    <p className="text-sm text-gray-400">Contact admin to get assigned to clients</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {clients.slice(0, 5).map((client) => (
                                        <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{client.name}</h3>
                                                <p className="text-sm text-gray-500 capitalize">{client.type.replace('_', ' ')}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <Badge variant={client.pending_documents > 0 ? "destructive" : "secondary"}>
                                                        {client.pending_documents} pending
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        {client.total_documents} total docs
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewClient(client.id)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {client.pending_documents > 0 && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleProcessDocuments(client.id)}
                                                    >
                                                        <FileText className="w-4 h-4 mr-1" />
                                                        Process
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {clients.length > 5 && (
                                        <Button variant="outline" className="w-full" onClick={() => window.location.href = '/accountant/clients'}>
                                            View All {clients.length} Clients
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks and shortcuts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button className="w-full justify-start" variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Journal Entry
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Review Pending Documents
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Reports
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Users className="w-4 h-4 mr-2" />
                                    Manage Client Accounts
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AccountantDashboard; 