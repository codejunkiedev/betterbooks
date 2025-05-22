import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, AlertCircle, FileText, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadFiles } from "@/lib/supabase/storage";
import { uploadInvoice } from "@/lib/supabase/invoice";
import { UploadedFile } from "@/interfaces/storage";
import { processInvoice } from "@/api/processInvoice";
import { InvoiceType } from "@/interfaces/invoice";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const UploadInvoice = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('debit');
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

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const validFiles = validateFiles(droppedFiles);
      if (validFiles.length) {
        setFiles(prev => [...prev, ...validFiles]);
        toast({
          title: "Files added",
          description: `Added ${validFiles.length} file(s) to upload.`,
        });
      }
    }
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length) {
        setFiles(prev => [...prev, ...validFiles]);
        toast({
          title: "Files added",
          description: `Added ${validFiles.length} file(s) to upload.`,
        });
      }
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  }, [toast]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

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
    setUploadProgress(0);

    try {
      const { data, error } = await uploadFiles(files);
      if (error) {
        throw error;
      }
      setUploadProgress(50);

      const { error: invoiceError } = await uploadInvoice({
        files: data as UploadedFile[],
        type: invoiceType,
      });

      if (invoiceError) {
        throw invoiceError;
      }
      setUploadProgress(75);

      await processInvoice();
      setUploadProgress(100);

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
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Upload Invoice</h1>
          <p className="text-gray-500 text-lg">Upload your invoice images for processing</p>
        </div>

        {showAlert && (
          <Alert className="bg-blue-50/50 border-blue-200 relative">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <AlertDescription className="text-sm text-blue-800">
                <span className="font-semibold text-blue-900">Tip:</span> For best results, ensure your invoice images are clear, well-lit, and contain all necessary information.
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full p-1"
              onClick={() => setShowAlert(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        <Card className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
              <Label className="text-sm font-bold mb-2 block text-gray-900">Select Invoice Type</Label>
              <RadioGroup
                value={invoiceType}
                onValueChange={(value) => setInvoiceType(value as InvoiceType)}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex-1">
                  <RadioGroupItem
                    value="debit"
                    id="debit"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="debit"
                    className="flex items-center justify-between rounded-md border-2 border-muted bg-white px-3 py-2 hover:bg-gray-50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                        <ArrowUpRight className="h-2 w-2 text-white rotate-180" />
                      </div>
                      <span className="font-bold text-gray-900 text-sm">Debit</span>
                    </div>
                    <p className="text-xs font-medium text-gray-500">Money coming in</p>
                  </Label>
                </div>
                <div className="flex-1">
                  <RadioGroupItem
                    value="credit"
                    id="credit"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="credit"
                    className="flex items-center justify-between rounded-md border-2 border-muted bg-white px-3 py-2 hover:bg-gray-50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                        <ArrowUpRight className="h-2 w-2 text-white" />
                      </div>
                      <span className="font-bold text-gray-900 text-sm">Credit</span>
                    </div>
                    <p className="text-xs font-medium text-gray-500">Money going out</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div
            className={`p-10 border-2 border-dashed transition-all duration-200 bg-white rounded-xl ${isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 group hover:border-gray-800 hover:bg-gray-50'
              }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className={`rounded-full p-5 transition-colors duration-200 ${isDragging ? 'bg-primary/10' : 'bg-gray-50'
                  }`}>
                  <Upload className={`h-10 w-10 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-500'
                    }`} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-gray-900">Drag and drop your invoice images here</h3>
                  <div className="space-y-2">
                    <p className="text-base text-gray-600">
                      or click to browse your files
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: PNG, JPEG (max 10MB per file)
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 h-12 px-8 shadow-sm hover:shadow-md"
                >
                  <Upload className="h-4 w-4 mr-2 text-gray-600" />
                  Browse Files
                </label>
              </div>
            </div>
          </div>
        </Card>

        {files.length > 0 && (
          <Card className="p-8 relative bg-white">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Selected Images</h2>
                  <span className="text-sm text-gray-600 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
                    {files.length} {files.length === 1 ? 'image' : 'images'} selected
                  </span>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="gap-2 bg-black hover:bg-gray-800 text-white shadow-sm hover:shadow-md transition-all px-5"
                  size="sm"
                >
                  {isUploading ? (
                    <>
                      <span className="font-medium">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">Upload {files.length} {files.length === 1 ? 'Image' : 'Images'}</span>
                    </>
                  )}
                </Button>
              </div>

              {isUploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Uploading files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="space-y-4">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="border border-gray-200 rounded-xl p-5 space-y-2 bg-white hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-gray-50">
                          <FileText className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{file.name}</span>
                          <span className="text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="h-9 w-9 hover:bg-red-50 hover:text-red-500 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadInvoice; 