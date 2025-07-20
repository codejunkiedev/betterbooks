import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Users, Building, FileText, MoreVertical, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/DropdownMenu';
import React from 'react';

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
}

interface ClientsProps {
    filteredClients: Company[];
    clients: Company[];
    handleClientSelect: (client: Company) => void;
    handleDownloadAll: (statements: any[], clientName: string) => void;
    getStatusBadge: (isActive: boolean) => React.ReactNode;
}

const Clients: React.FC<ClientsProps> = ({ filteredClients, clients, handleClientSelect, getStatusBadge }) => {
    return (
        <>
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
                        <Card key={client.id} className="hover:shadow-md transition-shadow">
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleClientSelect(client)}>
                                                View Bank Statements
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Created {new Date(client.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4">
                                    {getStatusBadge(client.is_active)}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClientSelect(client)}
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        View Documents
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

export default Clients; 