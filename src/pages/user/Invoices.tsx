import { useCallback, useEffect, useMemo, useState } from "react";

import { useToast } from "@/shared/hooks/useToast";
import { supabase } from "@/shared/services/supabase/client";
import { getPaginatedInvoices, InvoiceFilters, InvoiceSortField } from "@/shared/services/supabase/invoice";

import JSZip from "jszip";

// Components
import { InvoiceStats } from "@/features/invoices/components/InvoiceStats";
import { InvoiceActions } from "@/features/invoices/components/InvoiceActions";
import { InvoiceTable } from "@/features/invoices/components/InvoiceTable";
import { InvoicePagination } from "@/features/invoices/components/InvoicePagination";
import { InvoiceSearchModal } from "@/features/invoices/components/InvoiceSearchModal";
import { InvoiceDetailsModal } from "@/features/invoices/components/InvoiceDetailsModal";

// Utils
function useLocalDebounce<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(t);
    }, [value, delayMs]);
    return debounced;
}

const PAGE_SIZE = 25;

interface InvoiceRow {
    id: string;
    invoice_ref_no: string | null;
    invoice_date: string | null;
    buyer_business_name: string | null;
    total_amount: number | null;
    status: string;
    created_at: string;
}

interface LocalInvoiceFilters {
    search: string;
    status: string;
    dateFrom?: string;
    dateTo?: string;
    buyer: string;
    amountMin: string;
    amountMax: string;
}

export default function Invoices() {
    const { toast } = useToast();

    // Data state
    const [items, setItems] = useState<InvoiceRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Filter state
    const [apiFilters, setApiFilters] = useState<InvoiceFilters>({
        status: 'all',
        sort_by: 'created_at',
        sort_dir: 'desc'
    });

    const [localFilters, setLocalFilters] = useState<LocalInvoiceFilters>({
        search: "",
        status: "all",
        buyer: "",
        amountMin: "",
        amountMax: ""
    });

    const debouncedSearch = useLocalDebounce(localFilters.search, 300);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Modal state
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [activeInvoice, setActiveInvoice] = useState<InvoiceRow | null>(null);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

    // Load invoices
    const loadInvoices = useCallback(async () => {
        setIsLoading(true);
        try {
            const composedFilters: InvoiceFilters = {
                ...apiFilters,
                search: debouncedSearch || undefined,
                date_from: localFilters.dateFrom || undefined,
                date_to: localFilters.dateTo || undefined,
                buyer: localFilters.buyer || undefined,
                amount_min: localFilters.amountMin ? Number(localFilters.amountMin) : undefined,
                amount_max: localFilters.amountMax ? Number(localFilters.amountMax) : undefined,
            };

            const { data, error } = await getPaginatedInvoices(page, PAGE_SIZE, composedFilters);
            if (error) throw error;

            setItems(((data?.items || []) as unknown) as InvoiceRow[]);
            setTotal(data?.total || 0);
        } catch (err) {
            console.error(err);
            toast({ title: "Failed to load invoices", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [page, apiFilters, debouncedSearch, localFilters, toast]);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    // Realtime updates
    useEffect(() => {
        const channel = supabase
            .channel('invoices-status')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, (payload) => {
                const updated = payload.new as Partial<InvoiceRow>;
                if (!updated?.id) return;
                setItems(prev => prev.map(row => row.id === updated.id ? { ...row, ...updated } as InvoiceRow : row));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Summary stats
    const summary = useMemo(() => {
        const statusCounts = items.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: total,
            submitted: statusCounts.submitted || 0,
            failed: statusCounts.failed || 0,
            draft: statusCounts.draft || 0,
        };
    }, [items, total]);

    // Selection handlers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? new Set(items.map(i => i.id)) : new Set());
    };

    // Sorting
    const onSort = (field: string) => {
        setApiFilters(prev => ({
            ...prev,
            sort_by: field as InvoiceSortField,
            sort_dir: prev.sort_by === field && prev.sort_dir === 'desc' ? 'asc' : 'desc'
        }));
    };

    // Filter handlers
    const handleApplyFilters = () => {
        setApiFilters(prev => ({
            ...prev,
            status: localFilters.status as 'all' | 'draft' | 'submitted' | 'failed' | 'cancelled'
        }));
        setPage(1);
    };

    const handleClearFilters = () => {
        setLocalFilters({
            search: "",
            status: "all",
            buyer: "",
            amountMin: "",
            amountMax: ""
        });
        setApiFilters({ status: 'all', sort_by: 'created_at', sort_dir: 'desc' });
        setPage(1);
    };

    // Action handlers
    const downloadSelectedZip = async () => {
        if (selectedIds.size === 0) return;

        const zip = new JSZip();
        Array.from(selectedIds).forEach((id) => {
            zip.file(`invoice-${id}.txt`, `Invoice data for ${id}`);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoices.zip';
        a.click();
        URL.revokeObjectURL(url);

        toast({ title: `Downloaded ${selectedIds.size} invoices` });
    };

    const retryFailed = async () => {
        const failedIds = items.filter(i => selectedIds.has(i.id) && i.status === 'failed').map(i => i.id);
        if (failedIds.length === 0) {
            toast({ title: 'No failed invoices selected', variant: 'destructive' });
            return;
        }

        toast({ title: `Retrying ${failedIds.length} failed invoices...` });
        // Implementation would go here
    };

    const exportCSV = () => {
        const headers = ['Invoice #', 'Date', 'Buyer', 'Amount', 'Status', 'Created'];
        const csv = [
            headers.join(','),
            ...items.map(item => [
                item.invoice_ref_no || `INV-${item.id.slice(0, 8)}`,
                item.invoice_date || '',
                item.buyer_business_name || '',
                item.total_amount || 0,
                item.status,
                item.created_at
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoices.csv';
        a.click();
        URL.revokeObjectURL(url);

        toast({ title: 'CSV exported successfully' });
    };

    const deleteDrafts = async () => {
        const ids = items.filter(i => selectedIds.has(i.id) && i.status === 'draft').map(i => i.id);
        if (ids.length === 0) {
            toast({ title: 'No drafts selected', variant: 'destructive' });
            return;
        }

        const confirmed = window.confirm(`Delete ${ids.length} draft(s)?`);
        if (!confirmed) return;

        try {
            const { error } = await supabase.from('invoices').delete().in('id', ids);
            if (error) throw error;

            toast({ title: 'Drafts deleted' });
            setSelectedIds(new Set());
            loadInvoices();
        } catch (e) {
            console.error(e);
            toast({ title: 'Failed to delete drafts', variant: 'destructive' });
        }
    };

    const openDetails = (invoice: InvoiceRow) => {
        setActiveInvoice(invoice);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and track your invoice submissions</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <InvoiceStats summary={summary} isLoading={isLoading} />

                {/* Actions Bar */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <InvoiceActions
                        selectedCount={selectedIds.size}
                        totalCount={total}
                        filters={localFilters}
                        onDownloadZip={downloadSelectedZip}
                        onRetryFailed={retryFailed}
                        onExportCSV={exportCSV}
                        onDeleteDrafts={deleteDrafts}
                        onOpenSearch={() => setIsSearchModalOpen(true)}
                        isLoading={isLoading}
                    />
                </div>

                {/* Invoices Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Invoice List</h2>
                    </div>
                    <div className="p-0">
                        <InvoiceTable
                            items={items}
                            isLoading={isLoading}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
                            onToggleSelectAll={toggleSelectAll}
                            onSort={onSort}
                            onViewDetails={openDetails}
                        />
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-gray-200">
                        <InvoicePagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalCount={total}
                            pageSize={PAGE_SIZE}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <InvoiceSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                filters={localFilters}
                onFiltersChange={setLocalFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />

            <InvoiceDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                invoice={activeInvoice}
                isLoading={isLoading}
            />
        </div>
    );
}