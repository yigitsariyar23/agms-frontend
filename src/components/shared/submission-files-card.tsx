"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, Loader2, FileText, Trash2, Download } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";

interface FileResponse {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  uploaderName: string;
  downloadUrl: string;
}

interface SubmissionFilesCardProps {
  submissionId: string;
  userRole: 'STUDENT' | 'ADVISOR' | 'DEPARTMENT_SECRETARY' | 'DEAN_OFFICER' | 'STUDENT_AFFAIRS';
  canDeleteFiles: boolean;
}

export default function SubmissionFilesCard({ submissionId, userRole, canDeleteFiles }: SubmissionFilesCardProps) {
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchSubmissionFiles = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/submission/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch submission files');
      }

      const data = await response.json();
      console.log('Received submission files:', JSON.stringify(data, null, 2));
      setFiles(data);
    } catch (error) {
      console.error('Error fetching submission files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load submission files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionFiles();
  }, [submissionId, token]);

  const handleDownload = async (file: FileResponse) => {
    try {
      console.log('Attempting to download file:', file.fileName);
      
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}${file.downloadUrl}`;
      console.log('Download URL:', downloadUrl);

      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed with response:', errorText);
        throw new Error(errorText || `Failed to download file: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
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
    if (!canDeleteFiles) {
      setError('You do not have permission to delete files');
      return;
    }

    try {
      const filename = file.downloadUrl.split('/').pop();
      console.log('Attempting to delete file:', filename);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/submission/${submissionId}/file/${filename}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete failed with response:', errorText);
        throw new Error(errorText || `Failed to delete file: ${response.status} ${response.statusText}`);
      }

      if (response.status === 204) {
        console.log('File deleted successfully, refreshing file list...');
        await fetchSubmissionFiles();
        console.log('File list refreshed');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete file');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Submission Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => (
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
                  {canDeleteFiles && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No files attached to this submission
          </p>
        )}
      </CardContent>
    </Card>
  );
} 