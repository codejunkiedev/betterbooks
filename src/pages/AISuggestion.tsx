import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, FileText, CheckCircle2 } from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "completed";
}

const AISuggestion = () => {
  const [suggestions] = useState<Suggestion[]>([
    {
      id: "1",
      title: "Document Structure Analysis",
      description: "Analyzing the structure and organization of your document",
      status: "completed",
    },
    {
      id: "2",
      title: "Content Enhancement",
      description: "Suggesting improvements for clarity and impact",
      status: "processing",
    },
    {
      id: "3",
      title: "Grammar and Style Check",
      description: "Reviewing grammar, punctuation, and writing style",
      status: "pending",
    },
  ]);

  const { toast } = useToast();

  const handleGenerateSuggestions = async () => {
    toast({
      title: "Generating Suggestions",
      description: "Please wait while we analyze your document...",
    });

    // TODO: Implement AI suggestion generation logic here
  };

  const getStatusIcon = (status: Suggestion["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Suggestions</h1>
            <p className="text-gray-500 mt-2">
              Get AI-powered suggestions to improve your document
            </p>
          </div>
          <Button onClick={handleGenerateSuggestions} className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate New Suggestions
          </Button>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getStatusIcon(suggestion.status)}
                  <div>
                    <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                    <p className="text-gray-600 mt-1">{suggestion.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      suggestion.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : suggestion.status === "processing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <h3 className="font-medium">Upload Invoice</h3>
              <p className="text-sm text-gray-600">
                Upload your document in PDF or Word format
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <h3 className="font-medium">AI Analysis</h3>
              <p className="text-sm text-gray-600">
                Our AI analyzes your document for improvements
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <h3 className="font-medium">Get Suggestions</h3>
              <p className="text-sm text-gray-600">
                Receive detailed suggestions to enhance your document
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestion; 