import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X } from "lucide-react";

const UploadDocument = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type === "application/msword" || droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setFile(droppedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement file upload logic here
    toast({
      title: "Upload started",
      description: "Your document is being processed...",
    });
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Document</h1>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Drag and drop your document here</p>
                <p className="text-sm text-gray-500">or</p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  Browse Files
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                />
              </div>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-8 w-8 text-blue-500" />
                <span className="font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleUpload} className="w-full">
                Upload Document
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Upload Guidelines</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Maximum file size: 10MB</li>
            <li>Supported formats: PDF, DOC, DOCX</li>
            <li>Ensure your document is clear and readable</li>
            <li>Remove any sensitive information before uploading</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument; 