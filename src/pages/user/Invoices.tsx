import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/Table";
import { Card } from "@/shared/components/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Checkbox } from "@/shared/components/Checkbox";
import { useToast } from "@/shared/hooks/useToast";
// local debounce implemented below
import { supabase } from "@/shared/services/supabase/client";
import { getPaginatedInvoices, InvoiceFilters, InvoiceSortField } from "@/shared/services/supabase/invoice";
import { Loader2, Download, RefreshCw, Trash2, Copy, FileSpreadsheet, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import JSZip from "jszip";

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
    invoice_ref_no: string;
    invoice_date: string;
    buyer_business_name: string;
    total_amount: number;
    status: "draft" | "submitted" | "failed" | "cancelled";
    fbr_reference: string | null;
    created_at: string;
}

export default function Invoices() {
    const { toast } = useToast();

    const [items, setItems] = useState<InvoiceRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [filters, setFilters] = useState<InvoiceFilters>({ status: 'all', sort_by: 'created_at', sort_dir: 'desc' });
    const [search, setSearch] = useState("");
    const debouncedSearch = useLocalDebounce(search, 300);

    const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
    const [dateTo, setDateTo] = useState<string | undefined>(undefined);
    const [buyer, setBuyer] = useState("");
    const [amountMin, setAmountMin] = useState<string>("");
    const [amountMax, setAmountMax] = useState<string>("");

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [activeInvoice, setActiveInvoice] = useState<InvoiceRow | null>(null);

    const pages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

    const loadInvoices = useCallback(async () => {
        setIsLoading(true);
        try {
            const composedFilters: InvoiceFilters = {
                ...filters,
                search: debouncedSearch || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                buyer: buyer || undefined,
                amount_min: amountMin ? Number(amountMin) : undefined,
                amount_max: amountMax ? Number(amountMax) : undefined,
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
    }, [filters, debouncedSearch, dateFrom, dateTo, buyer, amountMin, amountMax, page, toast]);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    // Realtime status updates via Supabase
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

    // Summary cards
    const summary = useMemo(() => {
        const totalInvoices = total;
        const counts = items.reduce(
            (acc, it) => {
                acc[it.status] = (acc[it.status] || 0) + 1;
                return acc;
            },
            { draft: 0, submitted: 0, failed: 0, cancelled: 0 } as Record<InvoiceRow['status'], number>
        );
        return { total: totalInvoices, draft: counts.draft, submitted: counts.submitted, failed: counts.failed };
    }, [items, total]);

    // Selection helpers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? new Set(items.map(i => i.id)) : new Set());
    };

    // Sorting
    const onSort = (field: InvoiceSortField) => {
        setFilters(prev => ({ ...prev, sort_by: field, sort_dir: prev.sort_by === field && prev.sort_dir === 'desc' ? 'asc' : 'desc' }));
    };

    // Filter actions
    const applyFilters = () => {
        setFilters(prev => ({
            ...prev,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            buyer: buyer || undefined,
            amount_min: amountMin ? Number(amountMin) : undefined,
            amount_max: amountMax ? Number(amountMax) : undefined,
        }));
        setPage(1);
    };
    const clearFilters = () => {
        setDateFrom(undefined);
        setDateTo(undefined);
        setBuyer("");
        setAmountMin("");
        setAmountMax("");
        setFilters({ status: 'all', sort_by: 'created_at', sort_dir: 'desc' });
        setSearch("");
        setPage(1);
    };

    // Bulk actions
    const anySelected = selectedIds.size > 0;

    const downloadSelectedZip = async () => {
        if (!anySelected) return;
        const zip = new JSZip();
        // Placeholder: In a real app, fetch invoice PDFs/JSON and add to zip
        Array.from(selectedIds).forEach((id) => {
            zip.file(`invoice-${id}.txt`, `Selected invoice ${id}`);
        });
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoices.zip';
        a.click();
        URL.revokeObjectURL(url);
    };

    const retryFailed = async () => {
        // Placeholder: invoke edge function or API to retry by ids
        toast({ title: `Retrying ${selectedIds.size} failed invoice(s)` });
    };

    const exportCSV = () => {
        const headers = ['Invoice #', 'Date', 'Buyer', 'Amount', 'Status'];
        const rows = items
            .filter(i => selectedIds.size === 0 || selectedIds.has(i.id))
            .map(i => [i.invoice_ref_no, i.invoice_date, i.buyer_business_name, i.total_amount, i.status]);
        const csv = [headers, ...rows]
            .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoices.csv';
        a.click();
        URL.revokeObjectURL(url);
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

    const openDetails = (row: InvoiceRow) => {
        setActiveInvoice(row);
        setDetailsOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4"><div className="text-sm text-gray-500">Total Invoices</div><div className="text-2xl font-semibold">{summary.total}</div></Card>
                <Card className="p-4"><div className="text-sm text-gray-500">Successful</div><div className="text-2xl font-semibold text-green-600">{summary.submitted}</div></Card>
                <Card className="p-4"><div className="text-sm text-gray-500">Failed</div><div className="text-2xl font-semibold text-red-600">{summary.failed}</div></Card>
                <Card className="p-4"><div className="text-sm text-gray-500">Draft</div><div className="text-2xl font-semibold">{summary.draft}</div></Card>
            </div>

            <Card className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <Input placeholder="Search invoice # or buyer" value={search} onChange={e => setSearch(e.target.value)} className="w-60" />
                    <Select value={filters.status || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v as any }))}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="date" value={dateFrom || ''} onChange={e => setDateFrom(e.target.value || undefined)} />
                    <Input type="date" value={dateTo || ''} onChange={e => setDateTo(e.target.value || undefined)} />
                    <Input placeholder="Buyer" value={buyer} onChange={e => setBuyer(e.target.value)} className="w-48" />
                    <Input placeholder="Min Amount" type="number" value={amountMin} onChange={e => setAmountMin(e.target.value)} className="w-36" />
                    <Input placeholder="Max Amount" type="number" value={amountMax} onChange={e => setAmountMax(e.target.value)} className="w-36" />
                    <Button onClick={applyFilters} variant="default">Apply</Button>
                    <Button onClick={clearFilters} variant="secondary">Clear</Button>
                    <div className="ml-auto text-sm text-gray-500">{total} result(s)</div>
                </div>

                <div className="flex items-center gap-2">
                    <Button disabled={!anySelected} onClick={downloadSelectedZip}><Download className="w-4 h-4 mr-2" />Download ZIP</Button>
                    <Button disabled={!anySelected} onClick={retryFailed} variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Retry Failed</Button>
                    <Button onClick={exportCSV} variant="outline"><FileSpreadsheet className="w-4 h-4 mr-2" />Export CSV</Button>
                    <Button disabled={!anySelected} onClick={deleteDrafts} variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Delete Drafts</Button>
                </div>
            </Card>

            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox checked={selectedIds.size === items.length && items.length > 0} onCheckedChange={v => toggleSelectAll(Boolean(v))} />
                                </TableHead>
                                <TableHead onClick={() => onSort('invoice_ref_no')} className="cursor-pointer">Invoice #</TableHead>
                                <TableHead onClick={() => onSort('invoice_date')} className="cursor-pointer">Date</TableHead>
                                <TableHead onClick={() => onSort('buyer_business_name')} className="cursor-pointer">Buyer</TableHead>
                                <TableHead onClick={() => onSort('total_amount')} className="cursor-pointer">Amount</TableHead>
                                <TableHead onClick={() => onSort('status')} className="cursor-pointer">Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading...
                                    </TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">No invoices found</TableCell>
                                </TableRow>
                            ) : (
                                items.map((row) => (
                                    <TableRow key={row.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => toggleSelect(row.id)} />
                                        </TableCell>
                                        <TableCell className="font-medium cursor-pointer" onClick={() => openDetails(row)}>{row.invoice_ref_no}</TableCell>
                                        <TableCell>{new Date(row.invoice_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{row.buyer_business_name}</TableCell>
                                        <TableCell>{row.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell className={row.status === 'failed' ? 'text-red-600' : row.status === 'submitted' ? 'text-green-600' : ''}>{row.status}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost" onClick={() => openDetails(row)}><Eye className="w-4 h-4 mr-1" />View</Button>
                                            <Button size="sm" variant="ghost" onClick={() => toast({ title: 'Duplicated' })}><Copy className="w-4 h-4 mr-1" />Duplicate</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between p-3 border-t bg-gray-50">
                    <div className="text-sm text-gray-500">Page {page} of {pages}</div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft className="w-4 h-4" /></Button>
                        <Button variant="outline" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
            </Card>

            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Invoice Details</DialogTitle>
                    </DialogHeader>
                    {activeInvoice && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Card className="p-3"><div className="text-xs text-gray-500">Invoice #</div><div>{activeInvoice.invoice_ref_no}</div></Card>
                                <Card className="p-3"><div className="text-xs text-gray-500">Date</div><div>{new Date(activeInvoice.invoice_date).toLocaleString()}</div></Card>
                                <Card className="p-3"><div className="text-xs text-gray-500">Buyer</div><div>{activeInvoice.buyer_business_name}</div></Card>
                                <Card className="p-3"><div className="text-xs text-gray-500">Amount</div><div>{activeInvoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></Card>
                                <Card className="p-3"><div className="text-xs text-gray-500">Status</div><div>{activeInvoice.status}</div></Card>
                                <Card className="p-3"><div className="text-xs text-gray-500">FBR Ref</div><div>{activeInvoice.fbr_reference || '-'}</div></Card>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={() => toast({ title: 'PDF opened' })}><Download className="w-4 h-4 mr-2" />View PDF</Button>
                                {activeInvoice.status === 'failed' && (
                                    <Button variant="outline" onClick={() => toast({ title: 'Retry triggered' })}><RefreshCw className="w-4 h-4 mr-2" />Retry</Button>
                                )}
                                <Button variant="outline" onClick={() => toast({ title: 'Duplicated' })}><Copy className="w-4 h-4 mr-2" />Duplicate</Button>
                            </div>
                            <Card className="p-3">
                                <div className="text-sm font-medium mb-2">Submission History</div>
                                <div className="text-sm text-gray-500">Coming soon</div>
                            </Card>
                            <Card className="p-3">
                                <div className="text-sm font-medium mb-2">Errors</div>
                                {activeInvoice.status === 'failed' ? (
                                    <div className="text-sm text-red-600">Submission failed. Please retry.</div>
                                ) : (
                                    <div className="text-sm text-gray-500">No errors</div>
                                )}
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 