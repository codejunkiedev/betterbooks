import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Switch } from '@/shared/components/Switch';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/shared/components/AlertDialog';
import { Users, Building, FileText, MoreVertical, Calendar, Activity } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/DropdownMenu';
import React, { useState } from 'react';

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
    handleDownloadAll: (statements: unknown[], clientName: string) => void;
    getStatusBadge: (isActive: boolean) => React.ReactNode;
    onStatusToggle: (clientId: string, isActive: boolean) => void;
    onViewActivityLog?: (client: Company) => void;
}

const StatusToggle: React.FC<{
    clientId: string;
    isActive: boolean;
    clientName: string;
    onToggle: (clientId: string, isActive: boolean) => void;
}> = ({ clientId, isActive, clientName, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            await onToggle(clientId, !isActive);
            setIsOpen(false);
        } catch {
            // Error is handled by the parent component
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                    <Switch
                        checked={isActive}
                        className={`data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-500 ${isLoading ? 'opacity-50' : ''}`}
                        disabled={isLoading}
                    />
                    <span className={`text-sm ${isActive ? 'text-gray-600' : 'text-red-600'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isActive ? 'Deactivate' : 'Activate'} Client Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} the account for <strong>{clientName}</strong>?
                        {isActive
                            ? ' This will prevent the client from logging in but preserve all their data.'
                            : ' This will restore the client\'s login access.'
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleToggle}
                        disabled={isLoading}
                        className={isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                    >
                        {isLoading ? 'Updating...' : (isActive ? 'Deactivate' : 'Activate')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const Clients: React.FC<ClientsProps> = ({ filteredClients, clients, handleClientSelect, getStatusBadge, onStatusToggle, onViewActivityLog }) => {
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
                                            {onViewActivityLog && (
                                                <DropdownMenuItem onClick={() => onViewActivityLog(client)}>
                                                    <Activity className="w-4 h-4 mr-2" />
                                                    View Activity Log
                                                </DropdownMenuItem>
                                            )}
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
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
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
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="text-sm font-medium text-gray-700">Account Status:</span>
                                        <StatusToggle
                                            clientId={client.id}
                                            isActive={client.is_active}
                                            clientName={client.name}
                                            onToggle={onStatusToggle}
                                        />
                                    </div>
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