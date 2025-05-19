import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchAccountingEntries } from "@/lib/supabase/accounting";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

interface AccountingEntriesFilter {
  entryType: 'debit' | 'credit' | 'all';
  dateRange: 'this_month' | 'last_month' | 'all';
}

export function AccountingEntriesTable() {
  const [entries, setEntries] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState<AccountingEntriesFilter>({
    entryType: 'all',
    dateRange: 'this_month',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, [currentPage, filter]);

  const loadEntries = async () => {
    try {
      const { data, error } = await fetchAccountingEntries(currentPage, ITEMS_PER_PAGE, filter);
      if (error) throw error;
      setEntries(data?.items || []);
      setTotalItems(data?.total || 0);
    } catch (error) {
      console.error("Error loading accounting entries:", error);
      toast({
        title: "Error",
        description: "Failed to load accounting entries. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handleFilterChange = (key: keyof AccountingEntriesFilter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value as AccountingEntriesFilter[keyof AccountingEntriesFilter] }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accounting Entries</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={filter.entryType}
              onValueChange={(value) => handleFilterChange('entryType', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="debit">Debit Entries</SelectItem>
                <SelectItem value="credit">Credit Entries</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select
            value={filter.dateRange}
            onValueChange={(value) => handleFilterChange('dateRange', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No accounting entries found for the selected filters.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Debit Account</TableHead>
                  <TableHead>Credit Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="max-w-md truncate" title={entry.deepseek_response.explanation}>
                      {entry.deepseek_response.explanation}
                    </TableCell>
                    <TableCell>{entry.deepseek_response.debitAccount}</TableCell>
                    <TableCell>{entry.deepseek_response.creditAccount}</TableCell>
                    <TableCell className="text-right">
                      ${entry.deepseek_response.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex items-center justify-between px-4 pb-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 