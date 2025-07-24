import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { getUserJournalEntries } from "@/shared/services/supabase/journal";
import { useToast } from "@/shared/hooks/useToast";
import { Skeleton } from "@/shared/components/Loading";
import { FileText, Calendar, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/Table";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Card } from "@/shared/components/Card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/Tooltip";
import { JournalEntry } from "@/shared/types/journal";

const Journal = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const itemsPerPage = 10;
    const { toast } = useToast();

    const loadJournalEntries = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await getUserJournalEntries();
            if (error) throw error;
            setEntries(data || []);
            setFilteredEntries(data || []);
        } catch (error: unknown) {
            console.error("Error fetching journal entries:", error);
            toast({
                title: "Error",
                description: "Failed to load journal entries. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadJournalEntries();
    }, [loadJournalEntries]);

    // Filter entries based on search term and date
    useEffect(() => {
        let filtered = entries;

        if (searchTerm) {
            filtered = filtered.filter(entry =>
                entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.lines.some(line =>
                    line.account_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (dateFilter) {
            filtered = filtered.filter(entry =>
                entry.entry_date === dateFilter
            );
        }

        setFilteredEntries(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [entries, searchTerm, dateFilter]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "MMM dd, yyyy");
    };

    // Calculate totals for the filtered entries
    const calculateTotals = () => {
        let totalDebits = 0;
        let totalCredits = 0;

        filteredEntries.forEach(entry => {
            entry.lines.forEach(line => {
                if (line.type === 'DEBIT') {
                    totalDebits += line.amount;
                } else {
                    totalCredits += line.amount;
                }
            });
        });

        return { totalDebits, totalCredits };
    };

    // Pagination calculations
    const totalItems = filteredEntries.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEntries = filteredEntries.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleExport = () => {
        // Simple CSV export functionality
        const csvContent = [
            ['Date', 'Description', 'Account', 'Type', 'Amount'],
            ...filteredEntries.flatMap(entry =>
                entry.lines.map(line => [
                    formatDate(entry.entry_date),
                    entry.description,
                    line.account_name,
                    line.type,
                    formatCurrency(line.amount)
                ])
            )
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal_entries_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
            title: "Export Successful",
            description: "Journal entries have been exported to CSV.",
        });
    };

    const { totalDebits, totalCredits } = calculateTotals();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">General Journal</h1>
                    </div>

                    <div className="bg-white rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">General Journal</h1>
                        <p className="text-gray-500 mt-1">Double-entry bookkeeping journal entries</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredEntries.length}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Debits</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDebits)}</p>
                            </div>
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-bold">+</span>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCredits)}</p>
                            </div>
                            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-bold">-</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by description or account..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-auto"
                            />
                            {dateFilter && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDateFilter("")}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Journal Table */}
                <Card className="p-6">
                    {filteredEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <FileText className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">No Journal Entries Found</h3>
                            <p className="text-gray-500">
                                {entries.length === 0
                                    ? "Journal entries will appear here once transactions are processed."
                                    : "Try adjusting your search or date filter."
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Account</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentEntries.map((entry) => (
                                        <TableRow key={entry.id} className="group hover:bg-gray-50">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span>{formatDate(entry.entry_date)}</span>
                                                    {entry.is_adjusting_entry && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Adjusting
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="font-medium text-gray-900 truncate cursor-help">
                                                                {entry.description}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-md whitespace-normal">{entry.description}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>
                                                {entry.lines.map((line, index) => (
                                                    <div key={line.id} className={index > 0 ? "mt-2" : ""}>
                                                        <div className="font-medium text-gray-900">
                                                            {line.account_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {line.type}
                                                        </div>
                                                    </div>
                                                ))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {entry.lines.map((line, index) => (
                                                    <div key={line.id} className={index > 0 ? "mt-2" : ""}>
                                                        {line.type === 'DEBIT' ? formatCurrency(line.amount) : '-'}
                                                    </div>
                                                ))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {entry.lines.map((line, index) => (
                                                    <div key={line.id} className={index > 0 ? "mt-2" : ""}>
                                                        {line.type === 'CREDIT' ? formatCurrency(line.amount) : '-'}
                                                    </div>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination Controls */}
                            {filteredEntries.length > 0 && totalItems > 0 && (
                                <div className="mt-6 flex items-center justify-between px-2">
                                    <div className="text-sm text-gray-500">
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="text-sm text-gray-500">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Journal; 