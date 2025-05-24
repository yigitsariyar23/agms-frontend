"use client";

import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming you have an Alert component
import { XCircle, FileUp, Loader2 } from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPE = "application/pdf";

export default function FileUploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    setSelectedFile(null);
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;

    const file = event.target.files?.[0];

    if (file) {
      if (file.type !== ACCEPTED_FILE_TYPE) {
        setError("Invalid file format. Only .pdf files are accepted.");
        if (fileInput) fileInput.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        if (fileInput) fileInput.value = "";
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsUploading(true);

    try {
      console.log("Uploading file:", selectedFile.name);
      await new Promise(resolve => setTimeout(resolve, 2500));
      setSuccessMessage(`${selectedFile.name} selected and validated. Ready for upload.`);
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
    setSuccessMessage(null);
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file-upload-input" className="text-sm font-medium">
            Upload your PDF (Max {MAX_FILE_SIZE_MB}MB)
          </label>
          <Input
            id="file-upload-input"
            type="file"
            accept={ACCEPTED_FILE_TYPE}
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
            disabled={isUploading}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && !error && !isUploading && (
           <Alert variant="default" className="bg-green-50 border-green-300 text-green-700">
             <FileUp className="h-4 w-4 text-green-600" />
             <AlertTitle className="font-semibold">File Ready</AlertTitle>
             <AlertDescription>{successMessage}</AlertDescription>
           </Alert>
        )}

        {isUploading && (
          <div className="flex items-center justify-center p-4 space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Uploading document...</span>
          </div>
        )}

        {selectedFile && !error && !isUploading && (
          <div className="text-sm text-muted-foreground space-y-3 pt-2">
            <div>
              <p className="font-medium">Selected file:</p>
              <p>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={handleUpload} 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                disabled={isUploading || !selectedFile}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <Button 
                onClick={handleRemoveFile} 
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isUploading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        )}
         {!selectedFile && !error && !successMessage && !isUploading && (
          <div className="text-sm text-muted-foreground pt-2">
            Please select a PDF file to upload.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 