import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountingEntry } from "@/interfaces/accounting";
import { fetchAccountingEntries } from "@/lib/supabase/accounting";
import { Skeleton } from "@/components/ui/loading";
import { InvoicePreview } from "@/components/shared/InvoicePreview";
import { getFileUrl } from "@/lib/supabase/storage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ITEMS_PER_PAGE = 5;

const AccountingEntriesTable = () => {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, [currentPage]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchAccountingEntries(currentPage, ITEMS_PER_PAGE);
      if (error) throw error;
      // Explicitly type the array to match the expected type
      setEntries(data?.items as AccountingEntry[] || []);
      setTotalItems(data?.total || 0);
    } catch (error: unknown) {
      console.error("Error fetching accounting entries:", error);
      toast({
        title: "Error Fetching Entries",
        description: error instanceof Error ? error.message : "Could not retrieve accounting entries from the database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePreview = async (entry: AccountingEntry) => {
    const url = await getFileUrl(entry.file.path);
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableBody>
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell className="w-[200px] min-w-[200px] max-w-[200px]"><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (entries.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              <div className="flex flex-col items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Accounting Entries</h3>
                <p className="text-gray-500">There are no accounting entries to display.</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="w-[200px] min-w-[200px] max-w-[200px]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="truncate cursor-help">
                      {entry.file.name}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{entry.file.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(entry)}
                      className="h-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Preview invoice</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="max-w-md truncate cursor-help">
                      {entry.deepseek_response.explanation}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-md whitespace-normal">{entry.deepseek_response.explanation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>{entry.deepseek_response.debitAccount}</TableCell>
            <TableCell>{entry.deepseek_response.creditAccount}</TableCell>
            <TableCell className="text-right">
              PKR {entry.deepseek_response.amount?.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accounting Entries</h2>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="w-[200px] min-w-[200px] max-w-[200px]">File Name</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Debit Account</TableHead>
              <TableHead>Credit Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          {renderTableContent()}
        </Table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && entries.length > 0 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
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

      {/* Preview Modal */}
      <InvoicePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        previewUrl={previewUrl}
      />
    </div>
  );
};

export { AccountingEntriesTable }; 