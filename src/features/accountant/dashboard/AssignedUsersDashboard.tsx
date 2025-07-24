import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import {
    Users,
    Building,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Search,
    Eye
} from 'lucide-react';
import { getMyClientCompanies } from '@/shared/services/supabase/company';
import { getPendingDocumentsCountForClients } from '@/shared/services/supabase/document';

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
}

interface ClientWithStatus extends Company {
    pendingDocumentsCount: number;
    status: 'active' | 'inactive' | 'pending_review';
}

export default function AssignedUsersDashboard() {
    const [clients, setClients] = useState<ClientWithStatus[]>([]);
    const [filteredClients, setFilteredClients] = useState<ClientWithStatus[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        loadClientsWithStatus();
    }, []);

    useEffect(() => {
        filterClients();
    }, [clients, searchTerm, statusFilter]);

    const loadClientsWithStatus = async () => {
        try {
            setIsLoading(true);

            // Load clients and pending documents count in parallel
            const [companies, pendingCounts] = await Promise.all([
                getMyClientCompanies(),
                getPendingDocumentsCountForClients()
            ]);

            const clientsWithStatus: ClientWithStatus[] = (companies || []).map(company => {
                const pendingCount = pendingCounts[company.id] || 0;
                let status: 'active' | 'inactive' | 'pending_review' = 'active';

                if (!company.is_active) {
                    status = 'inactive';
                } else if (pendingCount > 0) {
                    status = 'pending_review';
                }

                return {
                    ...company,
                    pendingDocumentsCount: pendingCount,
                    status
                };
            });

            setClients(clientsWithStatus);
        } catch (error) {
            console.error('Error loading clients with status:', error);
            toast({
                title: 'Error',
                description: 'Failed to load client information',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filterClients = () => {
        let filtered = clients;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(client => client.status === statusFilter);
        }

        setFilteredClients(filtered);
    };

    const handleClientClick = (client: ClientWithStatus) => {
        navigate(`/accountant/clients`, { state: { selectedClientId: client.id } });
    };

    const getStatusBadge = (client: ClientWithStatus) => {
        if (client.status === 'inactive') {
            return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
        }

        if (client.status === 'pending_review') {
            return (
                <Badge className="bg-yellow-100 text-yellow-800">
                    {client.pendingDocumentsCount} Documents Awaiting Review
                </Badge>
            );
        }

        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    };

    const getStatusIcon = (client: ClientWithStatus) => {
        if (client.status === 'inactive') {
            return <AlertTriangle className="w-4 h-4 text-gray-500" />;
        }

        if (client.status === 'pending_review') {
            return <Clock className="w-4 h-4 text-yellow-600" />;
        }

        return <CheckCircle className="w-4 h-4 text-green-600" />;
    };

    const getTotalStats = () => {
        const totalClients = clients.length;
        const activeClients = clients.filter(c => c.status === 'active').length;
        const pendingReviewClients = clients.filter(c => c.status === 'pending_review').length;
        const totalPendingDocuments = clients.reduce((sum, client) => sum + client.pendingDocumentsCount, 0);

        return { totalClients, activeClients, pendingReviewClients, totalPendingDocuments };
    };

    const stats = getTotalStats();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading client information...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Overview of all your assigned clients and their status</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingReviewClients}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pending Documents</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalPendingDocuments}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <FileText className="w-6 h-6 text-red-600" />
                            </div>
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
                                    placeholder="Search clients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('all')}
                                size="sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === 'active' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('active')}
                                size="sm"
                            >
                                Active
                            </Button>
                            <Button
                                variant={statusFilter === 'pending_review' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('pending_review')}
                                size="sm"
                            >
                                Pending Review
                            </Button>
                            <Button
                                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('inactive')}
                                size="sm"
                            >
                                Inactive
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Grid */}
            {filteredClients.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                        <p className="text-gray-600">
                            {clients.length === 0
                                ? "You don't have any assigned clients yet."
                                : "No clients match your search criteria."
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <Card
                            key={client.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleClientClick(client)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Building className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{client.name}</CardTitle>
                                            <p className="text-sm text-gray-600 capitalize">{client.type}</p>
                                        </div>
                                    </div>
                                    {getStatusIcon(client)}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        {getStatusBadge(client)}
                                    </div>

                                    {client.pendingDocumentsCount > 0 && (
                                        <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {client.pendingDocumentsCount} document{client.pendingDocumentsCount !== 1 ? 's' : ''} awaiting review
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-xs text-gray-500">
                                            Created {new Date(client.created_at).toLocaleDateString()}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClientClick(client);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 