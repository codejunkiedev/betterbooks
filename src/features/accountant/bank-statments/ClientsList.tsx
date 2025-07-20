import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Users, Building, FileText, Download, Clock } from 'lucide-react';
import React from 'react';

interface Company {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    created_at: string;
    user_id: string;
    bankStatements: any[];
    statementsCount: number;
    lastUpload?: string;
}

interface ClientsListProps {
    filteredClients: Company[];
    clients: Company[];
    handleClientSelect: (client: Company) => void;
    handleDownloadAll: (statements: any[], clientName: string) => void;
}

const ClientsList: React.FC<ClientsListProps> = ({ filteredClients, clients, handleClientSelect, handleDownloadAll }) => {
    if (filteredClients.length === 0) {
        return (
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
        );
    }

    return (
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
                            <Badge
                                className={client.statementsCount > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                            >
                                {client.statementsCount} statements
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                {client.lastUpload
                                    ? `Last upload: ${new Date(client.lastUpload).toLocaleDateString()}`
                                    : 'No uploads yet'
                                }
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClientSelect(client)}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                View Statements
                            </Button>
                            {client.statementsCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadAll(client.bankStatements, client.name)}
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ClientsList; 