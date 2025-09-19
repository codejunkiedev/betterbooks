import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Badge } from '@/shared/components/Badge';
import { Skeleton } from '@/shared/components/Loading';
import { formatCurrency } from '@/shared/utils/invoiceCalculations';
import { format } from 'date-fns';


interface InvoiceRow {
    id: string;
    invoice_ref_no: string | null;
    invoice_date: string | null;
    buyer_business_name: string | null;
    total_amount: number | null;
    status: string;
    created_at: string;
}

interface InvoiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: InvoiceRow | null;
    isLoading?: boolean;
}

const getStatusBadge = (status: string) => {
    const statusConfig = {
        draft: { variant: 'secondary' as const, label: 'Draft' },
        submitted: { variant: 'default' as const, label: 'Submitted' },
        failed: { variant: 'destructive' as const, label: 'Failed' },
        cancelled: { variant: 'outline' as const, label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
        return '-';
    }
};

export function InvoiceDetailsModal({ isOpen, onClose, invoice, isLoading = false }: InvoiceDetailsModalProps) {
    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            <Skeleton className="h-6 w-48" />
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-6 w-28" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                        <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!invoice) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Invoice Details</span>
                        {getStatusBadge(invoice.status)}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                            <p className="text-lg font-mono font-medium">
                                {invoice.invoice_ref_no || `INV-${invoice.id.slice(0, 8)}`}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <div className="mt-1">
                                {getStatusBadge(invoice.status)}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Invoice Date</label>
                            <p className="text-lg">
                                {formatDate(invoice.invoice_date)}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Created</label>
                            <p className="text-lg">
                                {formatDate(invoice.created_at)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Buyer</label>
                        <p className="text-lg">
                            {invoice.buyer_business_name || 'Not specified'}
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Total Amount</label>
                        <p className="text-2xl font-bold text-gray-900">
                            {invoice.total_amount ? formatCurrency(invoice.total_amount) : 'Not specified'}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
