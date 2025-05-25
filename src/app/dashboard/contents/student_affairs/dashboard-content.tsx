"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useStudentAffairs } from "@/lib/contexts/student-affairs-context";
import { SubmissionDetails } from "@/lib/types/submission-details";
import { useUser } from "@/lib/contexts/user-context";
import { ViewStudentInfoDialog } from "@/components/student/view-student-info-dialog";
import { CheckCircle, XCircle } from "lucide-react";

interface ModalState {
  type: "accept" | "decline" | "info" | "finalize";
  student?: SubmissionDetails;
}

export default function StudentAffairsDashboard() {
  const { user } = useUser();
  const { 
    students, 
    deanLists,
    loading, 
    deanListsLoading,
    approveStudent, 
    declineStudent, 
    finalizeList, 
    canFinalize,
    isListFinalized 
  } = useStudentAffairs();
  
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [sortBy, setSortBy] = useState<keyof SubmissionDetails | null>("studentNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [gpaLoadingStates, setGpaLoadingStates] = useState<Record<string, boolean>>({});
  const [startingGraduation, setStartingGraduation] = useState(false);
  const [checkingExistingGraduation, setCheckingExistingGraduation] = useState(false);
  const [existingGraduationStatus, setExistingGraduationStatus] = useState<{
    exists: boolean;
    status?: string;
    term?: string;
  } | null>(null);

  // Check for existing graduation process on component mount
  useEffect(() => {
    checkExistingGraduation();
  }, []);

  const handleSort = (field: keyof SubmissionDetails) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(
    (student) =>
      (student.studentName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (student.studentNumber || "").includes(search)
  );

  // Filter dean lists based on search
  const filteredDeanLists = deanLists.filter(
    (dean) =>
      (dean.deanName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (dean.deanEmail?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (dean.office?.toLowerCase() || "").includes(search.toLowerCase())
  );

  // Sort students based on current sort field and direction
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    // Handle cases where one or both values might be undefined/null
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortDirection === "asc" ? -1 : 1;
    if (bVal == null) return sortDirection === "asc" ? 1 : -1;
    
    return 0;
  });

  const handleAccept = async () => {
    if (modal && modal.student) {
      await approveStudent(modal.student.submissionId);
      toast.success("Student approved successfully");
      setModal(null);
    }
  };

  const handleDecline = async () => {
    if (modal && modal.student && declineReason.trim()) {
      await declineStudent(modal.student.submissionId, declineReason);
      toast.success("Student declined");
      setDeclineReason("");
      setModal(null);
    }
  };

  const handleFinalize = () => {
    if (!canFinalize()) {
      const allDeanListsFinalized = deanLists.length > 0 && deanLists.every(dean => dean.isFinalized);
      const hasApprovedOrRejectedStudents = students.some(student => 
        student.status === 'FINAL_APPROVED' || 
        student.status === 'STUDENT_AFFAIRS_REJECTED' ||
        student.status === 'APPROVED_BY_DEAN' ||
        student.status === 'REJECTED_BY_DEAN'
      );
      
      if (!allDeanListsFinalized) {
        toast.error("All dean lists must be finalized before graduation process can be completed");
        return;
      }
      
      if (hasApprovedOrRejectedStudents) {
        toast.error("Cannot complete graduation process while there are students with approved or rejected status");
        return;
      }
    }
    setModal({ type: "finalize" });
  };

  const confirmFinalize = async () => {
    await finalizeList();
    toast.success("Graduation process has been completed");
    setModal(null);
  };

  const checkExistingGraduation = async () => {
    setCheckingExistingGraduation(true);
    
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt_token='))
        ?.split('=')[1];
        
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/regular-graduation/track?term=${new Date().getFullYear().toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if(result.started === true) {
          setExistingGraduationStatus({
            exists: true,
            status: result.status,
            term: result.term
          });
        } else {
          setExistingGraduationStatus({
            exists: false
          });
        }
      } else if (response.status === 404) {
        // No existing graduation process
        setExistingGraduationStatus({
          exists: false
        });
      } else {
        let errorMessage = 'Failed to check existing graduation process';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error checking existing graduation process:', error);
      toast.error('Failed to check existing graduation process');
    } finally {
      setCheckingExistingGraduation(false);
    }
  };

  const startGraduationProcess = async () => {
    // First check if there's already an existing graduation process
    setStartingGraduation(true);
    
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt_token='))
        ?.split('=')[1];
        
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Check for existing graduation process first
      const trackResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/regular-graduation/track?term=${new Date().getFullYear().toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (trackResponse.ok) {
        const existingData = await trackResponse.json();
        if(existingData.started === true) {
          setExistingGraduationStatus({
            exists: true,
            status: existingData.status,
            term: existingData.term
          });
          toast.error(`A graduation process for term ${existingData.term} is already ${existingData.status}. Cannot start a new process.`);
          return;
        } else {
          // No existing process started, can proceed
          setExistingGraduationStatus({
            exists: false
          });
        }
      } else if (trackResponse.status !== 404) {
        // Some other error occurred while checking
        let errorMessage = 'Failed to check existing graduation process';
        try {
          const errorData = await trackResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, try to get text
          try {
            const errorText = await trackResponse.text();
            errorMessage = errorText || `HTTP ${trackResponse.status}: ${trackResponse.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${trackResponse.status}: ${trackResponse.statusText}`;
          }
        }
        toast.error(errorMessage);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/regular-graduation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          term: new Date().getFullYear().toString(),
        }),
        credentials: 'include',
      });

      console.log(response);
      if (response.ok) {
        const result = await response.json();
        toast.success('Graduation process started successfully');
        // Refresh the page data or refetch students
        window.location.reload(); // Simple approach, you might want to refetch data instead
      } else {
        let errorMessage = 'Failed to start graduation process';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error starting graduation process:', error);
      toast.error('Failed to start graduation process');
    } finally {
      setStartingGraduation(false);
    }
  };

  const getStatusColor = (status: SubmissionDetails['status']) => {
    switch (status) {
      case "APPROVED_BY_ADVISOR":
      case "APPROVED_BY_DEPT":
      case "APPROVED_BY_DEAN":
      case "FINAL_APPROVED":
        return "text-green-600";
      case "REJECTED_BY_ADVISOR":
      case "REJECTED_BY_DEPT":
      case "REJECTED_BY_DEAN":
      case "STUDENT_AFFAIRS_REJECTED":
        return "text-red-600";
      case "PENDING":
        return "text-yellow-600";
      case "NOT_REQUESTED":
        return "text-gray-400";
      default:
        return "text-gray-600";
    }
  };

  const refreshGPA = async (student: SubmissionDetails) => {
    setGpaLoadingStates(prev => ({ ...prev, [student.submissionId]: true }));
    
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt_token='))
        ?.split('=')[1];
      if (!token) {
        console.error('No token available');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/${student.studentNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
      } else {
        console.error('Failed to refresh GPA data');
      }
    } catch (error) {
      console.error('Error refreshing GPA data:', error);
    } finally {
      setGpaLoadingStates(prev => ({ ...prev, [student.submissionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#F4F2F9] dark:bg-[#2E2E2E]">
        <div className="animate-pulse">
          <div className="h-8 bg-[#BEBBCF] dark:bg-[#5C5C5C] rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-[#BEBBCF] dark:bg-[#5C5C5C] rounded w-full mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#BEBBCF] dark:bg-[#5C5C5C] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2F9] dark:bg-[#2E2E2E]">
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold text-[#2E2E2E] dark:text-[#F4F2F9] mb-6">Student Affairs Dashboard</h2>
        
        {isListFinalized && (
          <div className="bg-[#E3F6F1] dark:bg-[#2C4A42] border border-[#3BAE8E] dark:border-[#3BAE8E] text-[#3BAE8E] dark:text-[#A5DBCB] px-4 py-3 rounded mb-6">
            Graduation process has been completed
          </div>
        )}

        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Search students and deans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 bg-[#FFFFFF] dark:bg-[#3E3E3E] text-[#2E2E2E] dark:text-[#F4F2F9] border-[#DCD9E4] dark:border-[#4A4A4A] focus:ring-2 focus:ring-[#5B3E96] dark:focus:ring-[#937DC7]"
        />

        {/* Existing Graduation Process Status */}
        {existingGraduationStatus?.exists && (
          <div className="bg-[#FFF3CD] dark:bg-[#4A3F2A] border border-[#F0AD4E] dark:border-[#F0AD4E] text-[#8A6D3B] dark:text-[#F0AD4E] px-4 py-3 rounded mb-6">
            <div className="flex items-center justify-between">
              <div>
                <strong>Existing Graduation Process Found</strong>
                <p className="text-sm mt-1">
                  Term: {existingGraduationStatus.term} | Status: {existingGraduationStatus.status}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={checkExistingGraduation}
                disabled={checkingExistingGraduation}
                className="border-[#F0AD4E] text-[#8A6D3B] hover:bg-[#F0AD4E] hover:text-white"
              >
                {checkingExistingGraduation ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Checking...
                  </div>
                ) : (
                  'Refresh Status'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Start Graduation Process Button */}
        {!isListFinalized && students.length === 0 && !existingGraduationStatus?.exists && (
          <div className="mb-6">
            <Button 
              onClick={startGraduationProcess}
              disabled={startingGraduation || checkingExistingGraduation}
              className="bg-[#5B3E96] hover:bg-[#4A3278] text-white"
            >
              {startingGraduation ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Starting Graduation Process...
                </div>
              ) : checkingExistingGraduation ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Checking for existing process...
                </div>
              ) : (
                'Start Graduation Process'
              )}
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This will automatically create submissions for all eligible students
            </p>
          </div>
        )}

        {/* Message when checking for existing graduation */}
        {checkingExistingGraduation && existingGraduationStatus === null && (
          <div className="bg-[#E3F6F1] dark:bg-[#2C4A42] border border-[#3BAE8E] dark:border-[#3BAE8E] text-[#3BAE8E] dark:text-[#A5DBCB] px-4 py-3 rounded mb-6">
            Checking for existing graduation processes...
          </div>
        )}

        {/* Students Table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-[#2E2E2E] dark:text-[#F4F2F9] mb-4">
            Students ({students.length})
          </h3>
        <div className="bg-[#FFFFFF] dark:bg-[#3E3E3E] rounded-lg shadow overflow-hidden mb-6 border border-[#DCD9E4] dark:border-[#4A4A4A]">
          <table className="min-w-full divide-y divide-[#DCD9E4] dark:divide-[#4A4A4A]">
            <thead className="bg-[#F4F2F9] dark:bg-[#2E2E2E]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider cursor-pointer" onClick={() => handleSort("studentNumber")}>
                  Student Number {sortBy === "studentNumber" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider cursor-pointer" onClick={() => handleSort("studentName")}>
                  Student Name {sortBy === "studentName" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider cursor-pointer" onClick={() => handleSort("gpa")}>
                  <div className="flex flex-col">
                    <span>GPA (Min: 2.0) {sortBy === "gpa" ? (sortDirection === "asc" ? "↑" : "↓") : ""}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider cursor-pointer" onClick={() => handleSort("status")}>
                  Status {sortBy === "status" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#FFFFFF] dark:bg-[#3E3E3E] divide-y divide-[#DCD9E4] dark:divide-[#4A4A4A]">
              {sortedStudents.map((student) => (
                <tr key={student.submissionId} className="hover:bg-[#F4F2F9] dark:hover:bg-[#4A4A4A]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E] dark:text-[#F4F2F9]">
                    {student.studentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E] dark:text-[#F4F2F9]">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E] dark:text-[#F4F2F9]">
                    {gpaLoadingStates[student.submissionId] ? (
                      <div className="flex items-center gap-2 text-[#6D6D6D] dark:text-[#A9A9A9]">
                        <div className="w-4 h-4 border-2 border-[#DCD9E4] dark:border-[#4A4A4A] border-t-[#6D6D6D] dark:border-t-[#A9A9A9] rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </div>
                    ) : student.gpa !== undefined && student.gpa !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.gpa.toFixed(2)}</span>
                        {student.gpa < 2.0 ? (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-semibold">
                              Not enough
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                              Sufficient
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 italic">N/A</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => refreshGPA(student)}
                          disabled={gpaLoadingStates[student.submissionId]}
                        >
                          Refresh
                        </Button>
                      </div>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(student.status)}`}>
                    {student.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className={
                          student.status !== "APPROVED_BY_DEAN"
                            ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                            : "bg-gray-800 hover:bg-gray-900"
                        }
                        disabled={student.status !== "APPROVED_BY_DEAN" || isListFinalized}
                        onClick={() =>
                          setModal({ type: "accept", student })
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className={
                          student.status !== "APPROVED_BY_DEAN"
                            ? "bg-red-300 cursor-not-allowed hover:bg-red-300"
                            : ""
                        }
                        disabled={student.status !== "APPROVED_BY_DEAN" || isListFinalized}
                        onClick={() =>
                          setModal({ type: "decline", student })
                        }
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-800 border-gray-800 hover:bg-gray-800 hover:text-white"
                        onClick={() =>
                          setModal({ type: "info", student })
                        }
                      >
                        View Info
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {search ? "No students found matching your search." : "No students found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        </div>

        {/* Dean Lists Table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-[#2E2E2E] dark:text-[#F4F2F9] mb-4">
            Dean Lists ({deanLists.length})
          </h3>
        <div className="bg-[#FFFFFF] dark:bg-[#3E3E3E] rounded-lg shadow overflow-hidden mb-6 border border-[#DCD9E4] dark:border-[#4A4A4A]">
          {deanListsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-[#BEBBCF] dark:bg-[#5C5C5C] rounded w-1/4 mx-auto mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-[#BEBBCF] dark:bg-[#5C5C5C] rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#DCD9E4] dark:divide-[#4A4A4A]">
              <thead className="bg-[#F4F2F9] dark:bg-[#2E2E2E]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider">
                    Dean Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#FFFFFF] dark:bg-[#3E3E3E] divide-y divide-[#DCD9E4] dark:divide-[#4A4A4A]">
                {filteredDeanLists.map((dean) => (
                  <tr key={dean.deanId} className="hover:bg-[#F4F2F9] dark:hover:bg-[#4A4A4A]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E] dark:text-[#F4F2F9]">
                      {dean.deanName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E] dark:text-[#F4F2F9]">
                      {dean.deanEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E] dark:text-[#F4F2F9]">
                      {dean.office}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {dean.isFinalized ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-green-600 font-medium">Finalized</span>
                          {dean.finalizedDate && (
                            <div className="text-xs text-gray-500 ml-2">
                              {new Date(dean.finalizedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="w-4 h-4 text-yellow-500 mr-2" />
                          <span className="text-yellow-600 font-medium">In Progress</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6D6D6D] dark:text-[#A9A9A9]">
                      {new Date(dean.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredDeanLists.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {search ? "No deans found matching your search." : "No dean lists found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        </div>

        {/* Finalize Button */}
        {!isListFinalized && (
          <div className="space-y-2 mt-8">
            <Button 
              onClick={handleFinalize}
              disabled={!canFinalize()}
              className={`w-full ${
                canFinalize() 
                  ? "bg-gray-800 hover:bg-gray-900" 
                  : "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
              }`}
            >
              Complete Graduation Process
            </Button>
            {!canFinalize() && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {deanLists.length === 0 || !deanLists.every(dean => dean.isFinalized) ? (
                  <p>• All dean lists must be finalized first</p>
                ) : null}
                {students.some(student => 
                  student.status === 'FINAL_APPROVED' || 
                  student.status === 'STUDENT_AFFAIRS_REJECTED' ||
                  student.status === 'APPROVED_BY_DEAN' ||
                  student.status === 'REJECTED_BY_DEAN'
                ) ? (
                  <p>• All students should be approved or rejected</p>
                ) : null}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {modal && modal.type === "accept" && modal.student && (
        <Dialog open onOpenChange={() => setModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Approval</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve {modal.student.studentName}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAccept}>Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {modal && modal.type === "decline" && modal.student && (
        <Dialog open onOpenChange={() => setModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Decline Student</DialogTitle>
              <DialogDescription>
                Please provide a reason for declining {modal.student.studentName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="declineReason">Reason for Decline</Label>
              <Textarea
                id="declineReason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Enter reason here..."
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleDecline} 
                disabled={!declineReason.trim()} 
                variant="destructive"
              >
                Decline Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {modal && modal.type === "info" && modal.student && (
        <ViewStudentInfoDialog 
          open={true}
          onOpenChange={() => setModal(null)}
          studentNumber={modal.student.studentNumber}
          initialStudentData={modal.student}
        />
      )}

      {modal && modal.type === "finalize" && (
        <Dialog open onOpenChange={() => setModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Completion</DialogTitle>
              <DialogDescription>
                Are you sure you want to complete the graduation process? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={confirmFinalize} className="bg-gray-800 hover:bg-gray-900">
                Complete Process
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
