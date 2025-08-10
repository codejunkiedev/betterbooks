import type { Accountant } from '@/shared/types/accountant';

interface Props {
    accountants: Accountant[];
    loading?: boolean;
}

export function AccountantsTable({ accountants, loading }: Props) {
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
                        <th className="py-2">ID</th>
                        <th className="py-2">Phone</th>
                        <th className="py-2">Employment</th>
                        <th className="py-2">Capacity</th>
                        <th className="py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {accountants.map(a => (
                        <tr key={a.id} className="border-t">
                            <td className="py-2">{a.full_name}</td>
                            <td className="py-2">{a.accountant_code ?? '-'}</td>
                            <td className="py-2">{a.phone_number ?? '-'}</td>
                            <td className="py-2">{a.employment_type ?? '-'}</td>
                            <td className="py-2">{a.max_client_capacity ?? '-'}</td>
                            <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {a.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 