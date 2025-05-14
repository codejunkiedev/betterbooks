import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; // Assuming supabase client is here
import { Sparkles, Loader2, FileText, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceFile {
  name: string;
  path: string;
}

interface AIResponse {
  debitAccount?: string;
  creditAccount?: string;
  amount?: string;
  confidence?: string;
  explanation?: string;
  error?: string; // To capture potential errors from AI processing
}

export interface InvoiceSuggestionType {
  invoice_id: string;
  user_id: string;
  file: InvoiceFile;
  ai_response: AIResponse;
  created_at?: string; // Optional: if you want to display creation time
  status?: "pending" | "processing" | "completed" | "failed"; // Optional: for processing status
}

const InvoiceSuggestion = () => {
  const [suggestions, setSuggestions] = useState<InvoiceSuggestionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoiceSuggestions();
  }, []);

  const fetchInvoiceSuggestions = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace 'invoice_suggestions' with your actual Supabase table name
      // TODO: Add RLS policies in Supabase for this table to allow users to fetch their own data.
      const { data, error } = await supabase
        .from("invoice_suggestions") // USER: Please confirm or provide your table name
        .select("*")
        .order("created_at", { ascending: false }); // Optional: order by creation date

      if (error) {
        throw error;
      }
      setSuggestions(data || []);
    } catch (error: any) {
      console.error("Error fetching invoice suggestions:", error);
      toast({
        title: "Error Fetching Suggestions",
        description: error.message || "Could not retrieve invoice suggestions from the database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto"> {/* Increased max-width for table */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Invoice Suggestions</h1>
            <p className="text-gray-500 mt-2">
              Review AI-generated suggestions for your uploaded invoices.
            </p>
          </div>
          {/* Optional: Button to manually trigger processing or refresh */}
          <Button onClick={fetchInvoiceSuggestions} className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Refresh Suggestions 
          </Button>
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
            {/* You might want to link to the upload page */}
            {/* <Button asChild className="mt-4"> */}
            {/*   <Link to="/upload">Upload Invoice</Link> */}
            {/* </Button> */}
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">File Name</TableHead>
                  <TableHead>Debit Acc.</TableHead>
                  <TableHead>Credit Acc.</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="w-[300px]">Explanation / Error</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => (
                  <TableRow key={suggestion.invoice_id}>
                    <TableCell className="font-medium truncate" title={suggestion.file.name}>
                      {suggestion.file.name}
                    </TableCell>
                    <TableCell>{suggestion.ai_response.debitAccount || "-"}</TableCell>
                    <TableCell>{suggestion.ai_response.creditAccount || "-"}</TableCell>
                    <TableCell>{suggestion.ai_response.amount || "-"}</TableCell>
                    <TableCell>
                      {suggestion.ai_response.confidence 
                        ? `${(parseFloat(suggestion.ai_response.confidence) * 100).toFixed(0)}%`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {suggestion.ai_response.error ? (
                        <span className="text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 shrink-0" />
                          {suggestion.ai_response.error}
                        </span>
                      ) : (
                        suggestion.ai_response.explanation || "-"
                      )}
                    </TableCell>
                    {/* Optional: Display status if you have it
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          suggestion.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : suggestion.status === "processing"
                            ? "bg-blue-100 text-blue-700"
                            : suggestion.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {suggestion.status ? suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1) : 'Unknown'}
                      </span>
                    </TableCell>
                    */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* "How it works" section can be kept or removed based on your preference */}
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
              <h3 className="font-medium text-gray-700">Review Suggestions</h3>
              <p className="text-sm text-gray-600">
                Check the extracted data and AI confidence scores here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSuggestion; 