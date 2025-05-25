"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SubmissionDetails } from '../types/submission-details';
import { useUser } from './user-context';
import { getToken } from '../utils/jwt';

interface SubmissionContextType {
  submission: SubmissionDetails | null;
  loading: boolean;
  error: string | null;
  fetchSubmissionByStudentNumber: (studentNumber: string) => Promise<void>;
  clearSubmission: () => void;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export function SubmissionProvider({ children }: { children: ReactNode }) {
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser(); // Assuming useUser provides user info and token

  const fetchSubmissionByStudentNumber = useCallback(async (studentNumber: string): Promise<void> => {
    if (!studentNumber) {
      setError("Student number cannot be empty.");
      setSubmission(null);
      setLoading(false);
      return;
    }

    if (!user) {
      setError("User not authenticated.");
      setSubmission(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSubmission(null);

    try {
      const token = getToken();
      if (!token) {
        setError("Authentication token not found.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/student/${studentNumber}/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data: SubmissionDetails = await response.json();
        setSubmission(data);
      } else {
        const errorText = await response.text();
        setSubmission(null);
      }
    } catch (e: any) {
      console.error('Error fetching submission:', e);
      setError(e.message || "An unexpected error occurred.");
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearSubmission = useCallback(() => {
    setSubmission(null);
    setError(null);
  }, []);

  const value = {
    submission,
    loading,
    error,
    fetchSubmissionByStudentNumber,
    clearSubmission,
  };

  return <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>;
}

export function useSubmission() {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useSubmission must be used within a SubmissionProvider');
  }
  return context;
} 