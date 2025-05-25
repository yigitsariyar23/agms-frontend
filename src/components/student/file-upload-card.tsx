"use client";

import { useState, ChangeEvent, DragEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, FileUp, Loader2, UploadCloud, FileText, Trash2, Download } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPE = "application/pdf";

interface FileResponse {
  fileId: number;
  fileName: string;
  fileType: string;
  uploadDate: string;
  uploaderName: string;
  downloadUrl: string;
}

interface FileUploadResponse {
  filename: string;
  message: string;
  downloadUrl: string;
}

export default function FileUploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileResponse[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();

  const fetchUploadedFiles = async () => {
    if (!isAuthenticated || !token) return;
    
    setIsLoadingFiles(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/my-files`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch uploaded files');
      }

      const data = await response.json();
      console.log('Received file list:', JSON.stringify(data, null, 2));
      setUploadedFiles(data);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      setError('Failed to load uploaded files');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, [isAuthenticated, token]);

  const handleDownload = async (file: FileResponse) => {
    try {
      console.log('File object:', file);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      // Use the downloadUrl from the file object
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}${file.downloadUrl}`;
      console.log('Download URL:', downloadUrl);

      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Download response status:', response.status);
      console.log('Download response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed with response:', errorText);
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('Received blob:', blob.type, blob.size);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(error instanceof Error ? error.message : 'Failed to download file');
    }
  };

  const handleDelete = async (file: FileResponse) => {
    try {
      // Extract the filename from the downloadUrl
      const filename = file.downloadUrl.split('/').pop();
      console.log('Attempting to delete file:', filename);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete failed with response:', errorText);
        throw new Error(errorText || `Failed to delete file: ${response.status} ${response.statusText}`);
      }

      // Check for 204 No Content response
      if (response.status === 204) {
        console.log('File deleted successfully, refreshing file list...');
        // Refresh the file list after successful deletion
        await fetchUploadedFiles();
        console.log('File list refreshed');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete file');
    }
  };

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
      setError("Please select a file first.");
      return;
    }
    setError(null);
    setIsUploading(true);

    try {
      if (!isAuthenticated || !token) {
        router.push('/auth');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data: FileUploadResponse = await response.json();
      console.log("File uploaded successfully:", data);
      
      // Clear the selected file after successful upload
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Refresh the file list
      fetchUploadedFiles();
      
    } catch (uploadError) {
      console.error("Full upload error:", uploadError);
      if (uploadError instanceof Error && uploadError.message.includes('token')) {
        router.push('/auth');
        return;
      }
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
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
              accept=".pdf,.png"
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
                  Click to upload or drag and drop
                </span>
                <span className="text-sm text-muted-foreground">
                  PDF or PNG (Max {MAX_FILE_SIZE_MB}MB)
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
        
        {/* Uploaded Files Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Files</h3>
          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : uploadedFiles.length > 0 ? (
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.fileId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded by {file.uploaderName} on {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No files uploaded yet
            </p>
          )}
        </div>

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
            Please select a file to upload.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 