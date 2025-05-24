"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, FileUp, Loader2, UploadCloud, FileText, Trash2 } from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPE = "application/pdf";

export default function FileUploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const processFile = (file: File | undefined) => {
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;

    if (!file) {
      // This case might occur if the input is cleared programmatically
      // or if no file is actually provided in a drop event.
      // We don't want to set an error here unless it's an explicit user action that failed.
      // setError(null); // Or keep existing error if any
      // setSelectedFile(null);
      return;
    }

    setError(null); // Clear previous errors

    if (file.type !== ACCEPTED_FILE_TYPE) {
      setError("Invalid file format. Only .pdf files are accepted.");
      setSelectedFile(null);
      if (fileInput) fileInput.value = ""; // Clear the input
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File ${file.name} size exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please upload a smaller file.`);
      setSelectedFile(null);
      if (fileInput) fileInput.value = ""; // Clear the input
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    // Do not clear fileInput.value here, allow re-selection of the same file if removed
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    event.currentTarget.classList.remove('border-purple-500');
    const file = event.dataTransfer.files?.[0];
    processFile(file);
    
    // Reset file input value to ensure onChange fires for subsequent drops of the same file
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    event.currentTarget.classList.add('border-purple-500');
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    event.currentTarget.classList.remove('border-purple-500');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file first.");
      return;
    }
    setError(null);
    setIsUploading(true);

    try {
      console.log("Uploading file:", selectedFile.name);
      await new Promise(resolve => setTimeout(resolve, 2500));
    } catch (uploadError) {
      setError("Upload failed. Please try again.");
      console.error("Upload error:", uploadError);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = ""; // Clear the input to allow re-selection
  };

  return (
    <Card className="col-span-1 w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="space-y-2">
          <label 
            htmlFor="file-upload-input"
            className={`flex flex-col items-center justify-center w-full h-48 px-4 transition bg-background border-2 ${
              isDragging ? 'border-purple-500' : 'border-purple-300 dark:border-purple-600'
            } border-dashed rounded-lg appearance-none cursor-pointer hover:border-purple-500 focus:outline-none`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="file-upload-input"
              type="file"
              accept={ACCEPTED_FILE_TYPE}
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
                <span className="font-medium text-foreground">
                  Uploading document...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 text-center">
                <UploadCloud className="w-10 h-10 text-purple-600" />
                <span className="font-medium text-foreground">
                  Click to upload or drag and drop PDF
                </span>
                <span className="text-sm text-muted-foreground">
                  PDF (Max {MAX_FILE_SIZE_MB}MB)
                </span>
              </div>
            )}
          </label>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {selectedFile && !error && !isUploading && (
          <div className="space-y-3 pt-2">
            <h4 className="text-md font-medium text-foreground">Selected File:</h4>
            <div className="flex items-center justify-between text-sm text-foreground bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 overflow-hidden">
                <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="truncate" title={selectedFile.name}>
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
                aria-label="Remove file"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {selectedFile && !error && !isUploading && (
          <Button 
            onClick={handleUpload} 
            className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
            disabled={isUploading}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        )}
        
        {!selectedFile && !error && !isUploading && (
          <div className="text-sm text-muted-foreground text-center pt-2">
            Please select a PDF file to upload.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 