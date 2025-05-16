import { Button } from "@/components/ui/button";
import { Sparkles, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchInvoiceSuggestions } from "@/lib/supabase/suggestion";
import { Loader2 } from "lucide-react";
import { AccountingSummary } from "@/components/accounting/AccountingSummary";

const mockStats = [
  {
    icon: <FileText className="h-6 w-6 text-black" />,
    label: "Documents Uploaded",
    value: 128,
  },
  {
    icon: <Sparkles className="h-6 w-6 text-black" />,
    label: "AI Suggestions",
    value: 42,
  },

];


function InvoiceSuggestionsTablePreview() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 5;
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await fetchInvoiceSuggestions(currentPage, ITEMS_PER_PAGE);
        if (error) throw error;
        setSuggestions(data?.items || []);
        setTotalItems(data?.total || 0);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Could not load invoices.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentPage]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto mt-8">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="text-lg font-semibold text-black flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" /> Invoices
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
        <div className="text-center py-6 text-gray-500">No invoice yet.</div>
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
                  <TableCell>{s.deepseek_response?.amount}</TableCell>
                  <TableCell>{s.deepseek_response?.confidence ? `${(s.deepseek_response.confidence * 100).toFixed(0)}%` : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination Controls (matching Invoice Suggestions page) */}
          <div className="mt-4 flex items-center justify-between px-2">
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
}

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      {/* Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
      </div>

      {/* Accounting Summary */}
      <AccountingSummary />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mockStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center rounded-full bg-gray-100 h-12 w-12">
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Invoice Suggestions Table Preview */}
      <InvoiceSuggestionsTablePreview />
    </div>
  );
} 