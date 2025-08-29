import { Button } from '@/shared/components/Button';
import { Skeleton } from '@/shared/components/Loading';
import { Download, RefreshCw, FileText, Trash2, Filter } from 'lucide-react';

interface LocalInvoiceFilters {
    search: string;
    status: string;
    dateFrom?: string;
    dateTo?: string;
    buyer: string;
    amountMin: string;
    amountMax: string;
}

interface InvoiceActionsProps {
    selectedCount: number;
    totalCount: number;
    filters: LocalInvoiceFilters;
    onDownloadZip: () => void;
    onRetryFailed: () => void;
    onExportCSV: () => void;
    onDeleteDrafts: () => void;
    onOpenSearch: () => void;
    isLoading?: boolean;
}

const getActiveFilterCount = (filters: LocalInvoiceFilters): number => {
    let count = 0;
    
    if (filters.search.trim()) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.buyer.trim()) count++;
    if (filters.amountMin.trim()) count++;
    if (filters.amountMax.trim()) count++;
    
    return count;
};

export function InvoiceActions({
    selectedCount,
    totalCount,
    filters,
    onDownloadZip,
    onRetryFailed,
    onExportCSV,
    onDeleteDrafts,
    onOpenSearch,
    isLoading = false
}: InvoiceActionsProps) {
    const activeFilterCount = getActiveFilterCount(filters);

    if (isLoading) {
        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-28" />
                </div>
                <Skeleton className="h-10 w-20" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownloadZip}
                    disabled={selectedCount === 0}
                    className="border border-gray-200"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download ({selectedCount})
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetryFailed}
                    disabled={selectedCount === 0}
                    className="border border-gray-200"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Failed
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExportCSV}
                    disabled={totalCount === 0}
                    className="border border-gray-200"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDeleteDrafts}
                    disabled={selectedCount === 0}
                    className="border border-gray-200 text-red-600 hover:text-red-700"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Drafts
                </Button>
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={onOpenSearch}
                className={`border border-gray-200 ${activeFilterCount > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
            >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {activeFilterCount}
                    </span>
                )}
            </Button>
        </div>
    );
}
