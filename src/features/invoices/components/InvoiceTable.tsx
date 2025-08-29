import { Checkbox } from '@/shared/components/Checkbox';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { Skeleton } from '@/shared/components/Loading';
import { formatCurrency } from '@/shared/utils/invoiceCalculations';
import { Eye, Copy, Download, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu';

interface InvoiceRow {
    id: string;
    invoice_ref_no: string | null;
    invoice_date: string | null;
    buyer_business_name: string | null;
    total_amount: number | null;
    status: string;
    created_at: string;
}

interface InvoiceTableProps {
    items: InvoiceRow[];
    isLoading: boolean;
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: (checked: boolean) => void;
    onSort: (field: string) => void;
    onViewDetails: (invoice: InvoiceRow) => void;
}

const getStatusBadge = (status: string) => {
    const statusConfig = {
        draft: {
            label: 'Draft',
            className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
        },
        submitted: {
            label: 'Submitted',
            className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
        },
        failed: {
            label: 'Failed',
            className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
        },
        cancelled: {
            label: 'Cancelled',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
        <Badge className={`flex items-center gap-1 ${config.className}`}>
            {config.label}
        </Badge>
    );
};

const InvoiceTableSkeleton = () => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-4"><Skeleton className="h-4 w-8" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-32" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-24" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-28" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-24" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-20" /></th>
                        <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                            <td className="p-4"><Skeleton className="h-8 w-16" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export function InvoiceTable({
    items,
    isLoading,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onSort,
    onViewDetails
}: InvoiceTableProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return '-';
        }
    };

    const copyInvoiceNumber = (invoiceRef: string) => {
        navigator.clipboard.writeText(invoiceRef);
    };

    if (isLoading) {
        return <InvoiceTableSkeleton />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-4 font-medium text-gray-900">
                            <Checkbox
                                checked={selectedIds.size === items.length && items.length > 0}
                                onCheckedChange={(checked) => onToggleSelectAll(Boolean(checked))}
                            />
                        </th>
                        <th
                            className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => onSort('invoice_ref_no')}
                        >
                            Invoice Number
                        </th>
                        <th
                            className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => onSort('invoice_date')}
                        >
                            Date
                        </th>
                        <th
                            className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => onSort('buyer_business_name')}
                        >
                            Buyer
                        </th>
                        <th
                            className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => onSort('total_amount')}
                        >
                            Amount
                        </th>
                        <th
                            className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => onSort('status')}
                        >
                            Status
                        </th>
                        <th className="text-left p-4 font-medium text-gray-900 sticky right-0 bg-white">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-12 text-gray-500">
                                <div className="flex flex-col items-center">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
                                    <p className="text-sm">Try adjusting your search filters or create a new invoice.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <Checkbox
                                        checked={selectedIds.has(item.id)}
                                        onCheckedChange={() => onToggleSelect(item.id)}
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">
                                            {item.invoice_ref_no || `INV-${item.id.slice(0, 8)}`}
                                        </span>
                                        {item.invoice_ref_no && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyInvoiceNumber(item.invoice_ref_no!)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-gray-900">
                                        {formatDate(item.invoice_date)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-gray-900">
                                        {item.buyer_business_name || '-'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm font-medium text-gray-900">
                                        {item.total_amount ? formatCurrency(item.total_amount) : '-'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(item.status)}
                                </td>
                                <td className="p-4 sticky right-0 bg-white">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewDetails(item)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
