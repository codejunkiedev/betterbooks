import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { getPaginatedJournalEntries } from "@/shared/services/supabase/journal";
import { useToast } from "@/shared/hooks/useToast";
import {
    JournalTable,
    JournalSummaryCards,
    JournalFilters,
    JournalHeader,
    JournalLoadingSkeleton
} from "@/features/users/journal";

interface JournalEntry {
    id: string;
    entry_date: string;
    description: string;
    is_adjusting_entry: boolean;
    created_at: string;
    lines: Array<{
        id: string;
        account_id: string;
        account_name: string;
        type: 'DEBIT' | 'CREDIT';
        amount: number;
    }>;
}

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_DELAY = 500; // 500ms delay

const Journal = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const { toast } = useToast();
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search effect
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, SEARCH_DEBOUNCE_DELAY);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    const loadJournalEntries = useCallback(async () => {
        try {
            setIsLoading(true);

            const filters: {
                search?: string;
                date_from?: string;
                date_to?: string;
            } = {};

            if (debouncedSearchTerm) {
                filters.search = debouncedSearchTerm;
            }

            if (dateFilter) {
                filters.date_from = dateFilter;
                filters.date_to = dateFilter;
            }

            const { data, error } = await getPaginatedJournalEntries(currentPage, ITEMS_PER_PAGE, filters);

            if (error) throw error;

            if (data) {
                setEntries(data.items);
                setTotalItems(data.total);
            }
        } catch (error) {
            console.error("Error loading journal entries:", error);
            toast({
                title: "Error",
                description: "Failed to load journal entries. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, dateFilter, toast]);

    useEffect(() => {
        loadJournalEntries();
    }, [loadJournalEntries]);

    const calculateTotals = () => {
        let totalDebits = 0;
        let totalCredits = 0;

        entries.forEach(entry => {
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when search changes
    };

    const handleDateFilterChange = (value: string) => {
        setDateFilter(value);
        setCurrentPage(1); // Reset to first page when date filter changes
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setDateFilter("");
        setCurrentPage(1);
    };

    const handleExport = () => {
        try {
            const { totalDebits, totalCredits } = calculateTotals();

            // Create CSV content
            const csvContent = [
                ['Date', 'Description', 'Account', 'Debit', 'Credit'],
                ...entries.flatMap(entry =>
                    entry.lines.map(line => [
                        format(new Date(entry.entry_date), 'MMM dd, yyyy'),
                        entry.description,
                        line.account_name,
                        line.type === 'DEBIT' ? line.amount.toFixed(2) : '',
                        line.type === 'CREDIT' ? line.amount.toFixed(2) : ''
                    ])
                ),
                ['', '', 'Total', totalDebits.toFixed(2), totalCredits.toFixed(2)]
            ].map(row => row.join(',')).join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `journal-entries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: "Journal entries have been exported to CSV.",
            });
        } catch (error) {
            console.error("Error exporting journal entries:", error);
            toast({
                title: "Export Failed",
                description: "Failed to export journal entries. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return <JournalLoadingSkeleton />;
    }

    const { totalDebits, totalCredits } = calculateTotals();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <JournalHeader onExport={handleExport} />

                {/* Summary Cards */}
                <JournalSummaryCards
                    totalEntries={totalItems}
                    totalDebits={totalDebits}
                    totalCredits={totalCredits}
                />

                {/* Filters */}
                <JournalFilters
                    searchTerm={searchTerm}
                    dateFilter={dateFilter}
                    onSearchChange={handleSearchChange}
                    onDateFilterChange={handleDateFilterChange}
                    onClearFilters={handleClearFilters}
                    totalResults={totalItems}
                />

                {/* Journal Table */}
                <JournalTable
                    entries={entries}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default Journal; 