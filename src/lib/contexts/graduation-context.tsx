"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useStudent } from './student-context';
import { getToken } from '../utils/jwt';
import { GraduationRequestStatus } from '../types/graduation-status';

interface GraduationStatusData {
  status: GraduationRequestStatus;
  message?: string;
}

interface GraduationContextType {
  graduationStatus: GraduationStatusData;
  loading: boolean;
  alert: { message: string; type: 'success' | 'error' | 'info' } | null;
  requestGraduation: () => Promise<void>;
  withdrawGraduationRequest: () => void;
  clearAlert: () => void;
  fetchGraduationStatus: () => Promise<void>; // Added to fetch initial status
}

const GraduationContext = createContext<GraduationContextType | undefined>(undefined);

export function GraduationProvider({ children }: { children: ReactNode }) {
  const { 
    studentProfile, 
    hasCompletedCurriculum, 
    initialGraduationStatusData, 
    loadingInitialGraduationStatus 
  } = useStudent();
  
  const [graduationStatus, setGraduationStatus] = useState<GraduationStatusData>({
    status: "NOT_SUBMITTED", // Default status
    message: "Awaiting student and graduation data..." // Initial message
  });
  const [loading, setLoading] = useState<boolean>(false); // This loading is for context actions like request/withdraw/fetch
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const showAlert = (message: string, type: 'success' | 'error' | 'info', duration: number = 5000) => {
    setAlert({ message, type });
    setTimeout(() => {
      clearAlert();
    }, duration);
  };
  
  // This function can remain for explicit refresh if needed, but won't be called on initial load by this context anymore.
  const fetchGraduationStatus = useCallback(async () => {
    if (!studentProfile?.studentNumber) {
      // This case should ideally be handled by StudentContext providing initial data
      // or indicating that studentNumber is missing.
      setGraduationStatus(prev => ({ ...prev, message: "Student number missing for status refresh." }));
      return;
    }
    setLoading(true); // Use the context's own loading for this action
    const token = getToken();
    if (!token) {
      setLoading(false);
      setGraduationStatus(prev => ({ ...prev, message: "Authentication required to fetch status." }));
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/student/${studentProfile.studentNumber}/latest`, {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.status) {
           setGraduationStatus({
            status: data.status as GraduationRequestStatus,
            message: data.message || 'Latest submission status loaded successfully.'
          });
        } else {
            setGraduationStatus({
                status: "NOT_SUBMITTED", // Default if no status in response
                message: "Could not retrieve current graduation status."
            });
        }
      } else if (response.status === 404) {
        // No submission found, treat as NOT_SUBMITTED
        setGraduationStatus({
            status: "NOT_SUBMITTED",
            message: "Not requested"
        });
      } else {
        // Non-OK response
        let detailedMessage = response.statusText || "Failed to load status";
        try {
          const errorBody = await response.json();
          if (errorBody && typeof errorBody.message === 'string' && errorBody.message.trim() !== '') {
            detailedMessage = errorBody.message;
          } else if (errorBody && typeof errorBody.error === 'string' && errorBody.error.trim() !== '') {
            detailedMessage = errorBody.error;
          }
        } catch (jsonError) {
          console.warn("API error response for fetchGraduationStatus was not valid JSON or lacked a message/error field.", jsonError);
        }
        setGraduationStatus({ status: "NOT_SUBMITTED", message: `Failed to load graduation status: ${detailedMessage}` });
        // No showAlert by default for fetch, to avoid spamming user if it happens on load.
        // Consider if specific errors here SHOULD alert the user.
      }
    } catch (error) {
      console.error('Error fetching graduation status:', error);
      let clientErrorMessage = "Could not connect to server to fetch status.";
      if (error instanceof Error && error.message) {
        clientErrorMessage = error.message;
      }
      setGraduationStatus({ status: "NOT_SUBMITTED", message: `Network/client error: ${clientErrorMessage}` });
    } finally {
      setLoading(false);
    }
  }, [studentProfile?.studentNumber]);

  // The main useEffect now relies on data from StudentContext for initialization.
  useEffect(() => {
    if (loadingInitialGraduationStatus) {
      setGraduationStatus(prev => ({
        status: prev.status, // Keep potentially existing status while student context loads initial one
        message: "Loading initial graduation status from student profile..."
      }));
    } else if (initialGraduationStatusData) {
      // StudentContext has provided the initial detailed status (status + message)
      setGraduationStatus({
        status: initialGraduationStatusData.status,
        message: initialGraduationStatusData.message || "Status initialized from student profile."
      });
    } else if (studentProfile && !initialGraduationStatusData) {
        // Student profile loaded, but no specific graduation data came from it (e.g. error in its fetch, or truly no submission)
        // Default to NOT_SUBMITTED or reflect error message if StudentContext set one.
        setGraduationStatus({
            status: "NOT_SUBMITTED",
            message: studentProfile.studentNumber ? "Could not retrieve initial graduation details." : "Student data loaded, but student number missing."
        });
    } else if (!studentProfile) {
        // Student profile itself is not yet loaded
        setGraduationStatus({
            status: "NOT_SUBMITTED",
            message: "Awaiting student data..."
        });
    }
  // React to changes in the data provided by StudentContext
  }, [initialGraduationStatusData, loadingInitialGraduationStatus, studentProfile]);

  const requestGraduation = async () => {
    if (hasCompletedCurriculum === false) {
      setGraduationStatus({
        status: "NOT_SUBMITTED",
        message: "You cannot request graduation until you have completed all curriculum requirements.",
      });
      showAlert("Complete curriculum requirements first.", 'info');
      return;
    }

    if (!studentProfile?.studentNumber) {
      setGraduationStatus({ status: "NOT_SUBMITTED", message: "Student information is not available." });
      showAlert("Student information not found.", 'error');
      return;
    }

    const token = getToken();
    if (!token) {
      setGraduationStatus({ status: "NOT_SUBMITTED", message: "Authentication error." });
      showAlert("Authentication error. Please log in.", 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/graduation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentNumber: studentProfile.studentNumber,
          content: "Graduation Request Submitted by student: " + studentProfile.studentNumber,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGraduationStatus({
          status: "PENDING",
          message: data.message || "Your graduation request has been submitted and is being reviewed.",
        });
        showAlert("Graduation request submitted successfully!", 'success');
      } else { // Non-OK response
        let detailedMessage = response.statusText || "Submission failed";
        try {
          const errorBody = await response.json();
          if (errorBody && typeof errorBody.message === 'string' && errorBody.message.trim() !== '') {
            detailedMessage = errorBody.message;
          } else if (errorBody && typeof errorBody.error === 'string' && errorBody.error.trim() !== '') {
            detailedMessage = errorBody.error;
          }
        } catch (jsonError) {
          console.warn("API error response for requestGraduation was not valid JSON or lacked a message/error field.", jsonError);
        }
        setGraduationStatus({
          status: "NOT_SUBMITTED",
          message: `Failed to submit graduation request: ${detailedMessage}`,
        });
        showAlert(`Submission failed: ${detailedMessage}`, 'error');
      }
    } catch (error) {
      console.error("Error submitting graduation request:", error);
      let clientErrorMessage = "A network error or client-side issue occurred during submission.";
      if (error instanceof Error && error.message) {
        clientErrorMessage = error.message;
      }
      setGraduationStatus({
        status: "NOT_SUBMITTED",
        message: `Error: ${clientErrorMessage}`,
      });
      showAlert(`Submission error: ${clientErrorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const withdrawGraduationRequest = async () => {
    // Added async and API call for withdrawal
    if (!studentProfile?.studentNumber) {
      showAlert("Student information not found.", 'error');
      return;
    }
    const token = getToken();
    if (!token) {
      showAlert("Authentication error. Please log in.", 'error');
      return;
    }

    setLoading(true);
    try {
      // Assuming a DELETE request to an endpoint like /api/submissions/graduation/{studentNumber}
      // Or it could be a PUT/POST to update status to WITHDRAWN if your API supports that.
      // For this example, let's assume a specific withdrawal endpoint.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/graduation/withdraw/${studentProfile.studentNumber}`, {
        method: 'POST', // Or DELETE, or PUT to change status, depends on API design
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
         body: JSON.stringify({ // Optional: if your backend needs a payload for withdrawal
           studentNumber: studentProfile.studentNumber,
           reason: "Withdrawn by student"
         }),
      });

      if (response.ok) {
        setGraduationStatus({
          status: "NOT_SUBMITTED", // Or a specific "WITHDRAWN" status if you add it
          message: "Your graduation request has been withdrawn.",
        });
        showAlert("Graduation request withdrawn successfully.", 'success');
      } else { // Non-OK response
        let detailedMessage = response.statusText || "Withdrawal failed";
        try {
          const errorBody = await response.json();
          if (errorBody && typeof errorBody.message === 'string' && errorBody.message.trim() !== '') {
            detailedMessage = errorBody.message;
          } else if (errorBody && typeof errorBody.error === 'string' && errorBody.error.trim() !== '') {
            detailedMessage = errorBody.error;
          }
        } catch (jsonError) {
          console.warn("API error response for withdrawGraduationRequest was not valid JSON or lacked a message/error field.", jsonError);
        }
        // On failed withdrawal, keep current status but show alert
        showAlert(`Failed to withdraw request: ${detailedMessage}`, 'error');
        // Optionally, update graduationStatus.message too, or leave it as is.
        // For now, only showing alert and not changing the underlying status/message for a failed withdrawal.
      }
    } catch (error) {
      console.error("Error withdrawing graduation request:", error);
      let clientErrorMessage = "A network error or client-side issue occurred during withdrawal.";
      if (error instanceof Error && error.message) {
        clientErrorMessage = error.message;
      }
      showAlert(`Withdrawal error: ${clientErrorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    graduationStatus,
    loading,
    alert,
    requestGraduation,
    withdrawGraduationRequest,
    clearAlert,
    fetchGraduationStatus,
  };

  return <GraduationContext.Provider value={value}>{children}</GraduationContext.Provider>;
}

export function useGraduation() {
  const context = useContext(GraduationContext);
  if (context === undefined) {
    throw new Error('useGraduation must be used within a GraduationProvider');
  }
  return context;
} 