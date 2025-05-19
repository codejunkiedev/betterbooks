import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, Image as ImageIcon, Upload, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadFiles } from "@/lib/supabase/storage";
import { uploadInvoice } from "@/lib/supabase/invoice";
import { UploadedFile } from "@/interfaces/storage";
import { processInvoice } from "@/api/processInvoice";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const UploadInvoice = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateFiles = (fileList: FileList): File[] => {
    return Array.from(fileList).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit.`,
          variant: "destructive",
        });
        return false;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format. Please use PNG or JPEG files only.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const validFiles = validateFiles(e.dataTransfer.files);
    if (validFiles.length) setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length) setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data, error } = await uploadFiles(files);
      if (error) {
        throw error;
      }

      const {error: invoiceError } = await uploadInvoice({ files: data as UploadedFile[] });
      if (invoiceError) {
        throw invoiceError;
      }

     await processInvoice();

      toast({
        title: "Upload completed",
        description: "Images uploaded successfully for processing.",
      });

      setFiles([]);
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Upload Invoice</h1>
          <p className="text-gray-500">Upload your invoice images for processing</p>
        </div>
        
        <Card className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
              isDragging 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-blue-50">
                  <Upload className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Drag and drop your invoice images here</p>
                <p className="text-sm text-gray-500">or</p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("fileInput")?.click()}
                  className="gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Browse Files
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>
              <p className="text-sm text-gray-500">
                Supported formats: PNG, JPEG (max 10MB per file)
              </p>
            </div>
          </div>
        </Card>

        {showAlert && (
          <Alert className="bg-blue-50 border-blue-200 relative mb-4">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700 pr-8">
              Make sure your invoice images are clear and readable. Remove any sensitive information before uploading.
            </AlertDescription>
            <button
              onClick={() => setShowAlert(false)}
              className="absolute right-4 top-4 text-blue-500 hover:text-blue-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        )}

        {files.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Selected Images</h2>
                <span className="text-sm text-gray-500">{files.length} {files.length === 1 ? 'image' : 'images'} selected</span>
              </div>
              
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-md bg-blue-50">
                          <ImageIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleUpload} 
                className="w-full gap-2"
                size="lg"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Processing...' : `Upload ${files.length} ${files.length === 1 ? 'Image' : 'Images'}`}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadInvoice; 