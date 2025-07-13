import { useState, useCallback } from "react";
import { Button } from "@/shared/components/button";
import { useToast } from "@/shared/hooks/use-toast";
import { X, Upload, FileText, Building2 } from "lucide-react";
import { uploadDocuments } from "@/services/supabase/document";
import { Progress } from "@/shared/components/progress";
import { Label } from "@/shared/components/label";

const UploadBankStatements = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();

    const validateFiles = useCallback((fileList: FileList): File[] => {
        const validFiles: File[] = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.size > maxSize) {
                toast({
                    title: "File too large",
                    description: `${file.name} is larger than 10MB. Please select a smaller file.`,
                    variant: "destructive",
                });
                continue;
            }

            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Unsupported file type",
                    description: `${file.name} is not a supported file type. Please select PNG, JPEG, or PDF files.`,
                    variant: "destructive",
                });
                continue;
            }

            validFiles.push(file);
        }

        return validFiles;
    }, [toast]);

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
    }, [validateFiles, toast]);

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
    }, [validateFiles, toast]);

    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpload = async () => {
        if (!files.length) {
            toast({
                title: "No files selected",
                description: "Please select at least one file to upload.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            setUploadProgress(25);

            const { error } = await uploadDocuments({
                files,
                type: 'BANK_STATEMENT',
            });

            if (error) {
                throw error;
            }

            setUploadProgress(100);

            toast({
                title: "Upload completed",
                description: `${files.length} ${files.length === 1 ? 'file' : 'files'} uploaded successfully for processing.`,
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
        <div className="space-y-6">
            <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold tracking-tight">Upload Bank Statements</h2>
                <p className="text-gray-500">Upload your bank statements for processing</p>
            </div>

            <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
                    <Label className="text-sm font-bold mb-2 block text-gray-900">Document Type</Label>
                    <div className="flex items-center justify-between rounded-md border-2 border-primary bg-white px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                                <Building2 className="h-2 w-2 text-white" />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">Bank Statement</span>
                        </div>
                        <p className="text-xs font-medium text-gray-500">Monthly or quarterly statements</p>
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
                            <div className={`rounded-full p-5 transition-colors duration-200 ${isDragging ? 'bg-primary/10' : 'bg-gray-50'}`}>
                                <Upload className={`h-10 w-10 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-500'}`} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-medium text-gray-900">Drag and drop your bank statements here</h3>
                                <div className="space-y-2">
                                    <p className="text-base text-gray-600">
                                        or click to browse your files
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supported formats: PNG, JPEG, PDF (max 10MB per file)
                                    </p>
                                </div>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept=".png,.jpg,.jpeg,.pdf"
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

                {files.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-900">Selected Files</h3>
                                <span className="text-sm text-gray-600 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
                                    {files.length} {files.length === 1 ? 'file' : 'files'} selected
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
                                        <span className="font-medium">Upload {files.length} {files.length === 1 ? 'File' : 'Files'}</span>
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
                )}
            </div>
        </div>
    );
};

export default UploadBankStatements;
