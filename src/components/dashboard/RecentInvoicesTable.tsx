import { useState, useEffect } from "react";
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

const RecentInvoicesTable = () => {
  const [suggestions, setSuggestions] = useState<InvoiceSuggestionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadSuggestions();
  }, [currentPage]);

  const loadSuggestions = async () => {
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
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto mt-8">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <ChartBar className="h-5 w-5 text-blue-500" />
          <div className="text-lg font-semibold text-black">Invoices</div>
        </div>
        {isLoading && (
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-6 text-gray-500">No invoices yet.</div>
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
              {suggestions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.file?.name}</TableCell>
                  <TableCell>{s.deepseek_response?.debitAccount}</TableCell>
                  <TableCell>{s.deepseek_response?.creditAccount}</TableCell>
                  <TableCell>${s.deepseek_response?.amount?.toFixed(2)}</TableCell>
                  <TableCell>
                    {s.deepseek_response?.confidence 
                      ? `${(s.deepseek_response.confidence * 100).toFixed(0)}%` 
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between px-4 pb-4">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
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
  );
};

export default RecentInvoicesTable; 