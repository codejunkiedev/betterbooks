import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceSuggestionType } from "@/interfaces/suggestion";
import { fetchInvoices } from "@/lib/supabase/invoice";
import { ChartBar } from "lucide-react";

const ITEMS_PER_PAGE = 5;

// Memoized table row component
const InvoiceRow = memo(({ suggestion }: { suggestion: InvoiceSuggestionType }) => {
  const confidence = useMemo(() => {
    return suggestion.deepseek_response?.confidence
      ? `${(suggestion.deepseek_response.confidence * 100).toFixed(0)}%`
      : "-";
  }, [suggestion.deepseek_response?.confidence]);

  const amount = useMemo(() => {
    return suggestion.deepseek_response?.amount?.toFixed(2) || "0.00";
  }, [suggestion.deepseek_response?.amount]);

  return (
    <TableRow>
      <TableCell>{suggestion.file?.name}</TableCell>
      <TableCell>{suggestion.deepseek_response?.debitAccount}</TableCell>
      <TableCell>{suggestion.deepseek_response?.creditAccount}</TableCell>
      <TableCell>PKR {amount}</TableCell>
      <TableCell>{confidence}</TableCell>
    </TableRow>
  );
});

// Memoized pagination component
const Pagination = memo(({
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) => {
  const startItem = useMemo(() => (currentPage - 1) * ITEMS_PER_PAGE + 1, [currentPage]);
  const endItem = useMemo(() => Math.min(currentPage * ITEMS_PER_PAGE, totalItems), [currentPage, totalItems]);

  const handlePrevPage = useCallback(() => {
    onPageChange(Math.max(1, currentPage - 1));
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  }, [currentPage, totalPages, onPageChange]);

  return (
    <div className="mt-4 flex items-center justify-between px-4 pb-4">
      <div className="text-sm text-gray-500">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
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
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

// Memoized loading component
const LoadingState = memo(() => (
  <div className="flex items-center justify-center h-24">
    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
  </div>
));

// Memoized empty state component
const EmptyState = memo(() => (
  <div className="text-center py-6 text-gray-500">No invoices yet.</div>
));

const RecentInvoicesTable = memo(() => {
  const [suggestions, setSuggestions] = useState<InvoiceSuggestionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchInvoices(currentPage, ITEMS_PER_PAGE);
      if (error) throw error;
      setSuggestions(data?.items || []);
      setTotalItems(data?.total || 0);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const totalPages = useMemo(() => Math.ceil(totalItems / ITEMS_PER_PAGE), [totalItems]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto mt-8">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <ChartBar className="h-5 w-5 text-blue-500" />
          <div className="text-lg font-semibold text-black">Invoices</div>
        </div>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : suggestions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.map((suggestion) => (
                <InvoiceRow key={suggestion.id} suggestion={suggestion} />
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
});

export default RecentInvoicesTable; 