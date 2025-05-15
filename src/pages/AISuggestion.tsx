import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, FileText, Check, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { InvoiceSuggestionType } from "@/interfaces/suggestion";
import { 
  fetchInvoiceSuggestions,  
  updateInvoiceSuggestion 
} from "@/lib/supabase/suggestion";
import { getInvoiceLineItems } from '../lib/supabase/line-item';
import { LineItem } from '../interfaces/line-item';

const ITEMS_PER_PAGE = 3;

const InvoiceSuggestion = () => {
  const [suggestions, setSuggestions] = useState<InvoiceSuggestionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ debit: string; credit: string }>({ debit: "", credit: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);
  const [showLineItems, setShowLineItems] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [currentPage]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchInvoiceSuggestions(currentPage, ITEMS_PER_PAGE);
      if (error) throw error;
      setSuggestions(data?.items || []);
      setTotalItems(data?.total || 0);
    } catch (error: unknown) {
      console.error("Error fetching invoice suggestions:", error);
      toast({
        title: "Error Fetching Suggestions",
        description: error instanceof Error ? error.message : "Could not retrieve invoice suggestions from the database.",
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

  const handleApprove = async (id: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === id);
      if (!suggestion) throw new Error("Suggestion not found");

      const { error } = await updateInvoiceSuggestion(id, suggestion.deepseek_response);
      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== id));

      toast({
        title: "Entry Approved",
        description: "The accounting entry has been approved successfully.",
      });
    } catch (error: unknown) {
      console.error("Error approving entry:", error);
      toast({
        title: "Error",
        description: "Failed to approve the entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (suggestion: InvoiceSuggestionType) => {
    setEditingId(suggestion.id);
    setEditValues({
      debit: suggestion.deepseek_response.debitAccount,
      credit: suggestion.deepseek_response.creditAccount,
    });
    setIsModalOpen(true);
    fetchLineItems(suggestion.id);
  };

  const fetchLineItems = async (invoiceId: string) => {
    const { data, error } = await getInvoiceLineItems(invoiceId);
    if (error) {
      console.error("Error fetching line items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch line items. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedLineItems(data || []);
    setShowLineItems(data && data.length > 0);
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      const suggestion = suggestions.find(s => s.id === id);
      if (!suggestion) throw new Error("Suggestion not found");

      const updatedDeepseekResponse = {
        ...suggestion.deepseek_response,
        debitAccount: editValues.debit,
        creditAccount: editValues.credit,
      };

      const { error } = await updateInvoiceSuggestion(id, updatedDeepseekResponse);
      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== id));
      setEditingId(null);
      setIsModalOpen(false);

      toast({
        title: "Changes Saved",
        description: "The accounting entry has been updated and approved successfully.",
      });
    } catch (error: unknown) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsModalOpen(false);
  };

  const LineItemsView = ({ lineItems }: { lineItems: LineItem[] }) => {
    if (lineItems.length === 0) return null;
    
    return (
      <div className="mt-4 border p-4 rounded-lg">
        <h3 className="font-medium text-lg mb-2">Asset Line Items</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead>Useful Life (months)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit_price ? `$${item.unit_price.toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell>${item.amount.toFixed(2)}</TableCell>
                  <TableCell>{item.asset_type || 'N/A'}</TableCell>
                  <TableCell>{item.asset_life_months || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Invoice Suggestions</h1>
            <p className="text-gray-500 mt-2">
              Review and approve AI-generated suggestions for your uploaded invoices.
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={loadSuggestions} className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Refresh Suggestions 
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh the list of invoice suggestions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />
            <p className="ml-2 text-gray-500">Loading suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border">
             <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Invoice Suggestions Yet</h3>
            <p className="text-gray-500">Upload an invoice, and AI suggestions will appear here.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">File Name</TableHead>
                    <TableHead>Debit Account</TableHead>
                    <TableHead>Credit Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="w-[300px]">Explanation</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suggestions.map((suggestion) => (
                    <TableRow key={suggestion.id}>
                      <TableCell className="font-medium truncate" title={suggestion.file.name}>
                        {suggestion.file.name}
                      </TableCell>
                      <TableCell>{suggestion.deepseek_response.debitAccount}</TableCell>
                      <TableCell>{suggestion.deepseek_response.creditAccount}</TableCell>
                      <TableCell>${suggestion.deepseek_response.amount?.toFixed(2)}</TableCell>
                      <TableCell>
                        {(suggestion.deepseek_response.confidence * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {suggestion.deepseek_response.explanation}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRowClick(suggestion)}
                                  className="h-8"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit accounting entry</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {suggestion.status !== "approved" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(suggestion.id)}
                                    className="h-8"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Approve this entry</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
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
          </>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Accounting Entry</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="debit">Debit Account</Label>
                <Input
                  id="debit"
                  value={editValues.debit}
                  onChange={(e) => setEditValues(prev => ({ ...prev, debit: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="credit">Credit Account</Label>
                <Input
                  id="credit"
                  value={editValues.credit}
                  onChange={(e) => setEditValues(prev => ({ ...prev, credit: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={() => handleSave(editingId!)} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
          {showLineItems && <LineItemsView lineItems={selectedLineItems} />}
        </Dialog>

        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg">
                1
              </div>
              <h3 className="font-medium text-gray-700">Upload Invoice</h3>
              <p className="text-sm text-gray-600">
                Upload your invoice files (e.g., PDF, PNG).
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg">
                2
              </div>
              <h3 className="font-medium text-gray-700">AI Processing</h3>
              <p className="text-sm text-gray-600">
                Our AI analyzes the invoice to extract key information.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg">
                3
              </div>
              <h3 className="font-medium text-gray-700">Review & Approve</h3>
              <p className="text-sm text-gray-600">
                Review the suggestions and approve or make adjustments as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSuggestion; 