import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import {
    Search,
    Filter,
    Building,
    Mail,
    Phone,
    Calendar,
    FileText,
    MoreVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu';

export default function AccountantClients() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const clients = [
        {
            id: 1,
            name: 'TechCorp Inc.',
            email: 'admin@techcorp.com',
            phone: '+1 (555) 123-4567',
            status: 'active',
            industry: 'Technology',
            joinDate: '2023-01-15',
            pendingDocuments: 3,
            lastActivity: '2 hours ago',
            totalRevenue: '$12,500'
        },
        {
            id: 2,
            name: 'Green Solutions',
            email: 'contact@greensolutions.com',
            phone: '+1 (555) 987-6543',
            status: 'review',
            industry: 'Environmental',
            joinDate: '2023-03-22',
            pendingDocuments: 1,
            lastActivity: '1 day ago',
            totalRevenue: '$8,750'
        },
        {
            id: 3,
            name: 'StartupXYZ',
            email: 'hello@startupxyz.com',
            phone: '+1 (555) 456-7890',
            status: 'inactive',
            industry: 'Startup',
            joinDate: '2023-02-10',
            pendingDocuments: 0,
            lastActivity: '1 week ago',
            totalRevenue: '$3,200'
        },
        {
            id: 4,
            name: 'Manufacturing Co.',
            email: 'info@manufacturing.com',
            phone: '+1 (555) 321-0987',
            status: 'active',
            industry: 'Manufacturing',
            joinDate: '2022-11-05',
            pendingDocuments: 5,
            lastActivity: '3 hours ago',
            totalRevenue: '$25,400'
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case 'review':
                return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.industry.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
                    <p className="text-gray-600">Manage your client accounts and track their progress</p>
                </div>
                <Button>
                    <Building className="w-4 h-4 mr-2" />
                    Add New Client
                </Button>
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
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="review">Under Review</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <Button variant="outline">
                                <Filter className="w-4 h-4 mr-2" />
                                More Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Client List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                    <Card key={client.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Building className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{client.name}</CardTitle>
                                        <p className="text-sm text-gray-600">{client.industry}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Edit Client</DropdownMenuItem>
                                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Remove Client</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Status</span>
                                {getStatusBadge(client.status)}
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{client.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{client.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {client.joinDate}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-900">{client.pendingDocuments}</p>
                                    <p className="text-xs text-gray-600">Pending Docs</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-900">{client.totalRevenue}</p>
                                    <p className="text-xs text-gray-600">Total Revenue</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-3">
                                <Button size="sm" className="flex-1">
                                    <FileText className="w-4 h-4 mr-1" />
                                    View Docs
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1">
                                    <Mail className="w-4 h-4 mr-1" />
                                    Contact
                                </Button>
                            </div>

                            {/* Last Activity */}
                            <div className="text-xs text-gray-500 text-center pt-2 border-t">
                                Last activity: {client.lastActivity}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredClients.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
                        </p>
                        <Button>
                            <Building className="w-4 h-4 mr-2" />
                            Add New Client
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 