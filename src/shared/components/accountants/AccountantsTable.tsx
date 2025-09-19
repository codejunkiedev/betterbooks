import type { Accountant } from '@/shared/types/accountant';
import { Button } from '@/shared/components/Button';
import { Eye, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/DropdownMenu';

interface Props {
    accountants: Accountant[];
    loading?: boolean;
}

export function AccountantsTable({ accountants, loading }: Props) {
    const navigate = useNavigate();

    if (loading) {
        return <div className="py-8 text-center text-gray-500">Loading...</div>;
    }

    if (!loading && accountants.length === 0) {
        return <div className="py-12 text-center text-gray-500">No accountants yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="text-left text-gray-600">
                        <th className="py-2">Name</th>
                        <th className="py-2">Code</th>
                        <th className="py-2">Phone</th>
                        <th className="py-2">Employment</th>
                        <th className="py-2">Capacity</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 sticky right-0 bg-white">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {accountants.map(a => (
                        <tr key={a.id} className="border-t">
                            <td className="py-2">{a.full_name}</td>
                            <td className="py-2">{a.accountant_code ?? 'N/A'}</td>
                            <td className="py-2">{a.phone_number ?? 'N/A'}</td>
                            <td className="py-2">{a.employment_type ?? 'N/A'}</td>
                            <td className="py-2">{a.max_client_capacity ?? 'N/A'}</td>
                            <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {a.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="py-2 sticky right-0 bg-white">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate(`/admin/accountants/${a.id}`)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 