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
// Assuming the context import is incorrect and needs to be corrected or removed
import { useDepartmentSecretary } from "@/lib/contexts/department-secretary-context";
import { SubmissionDetails } from "@/lib/types/submission-details";
import { useUser } from "@/lib/contexts/user-context";
import { ViewStudentInfoDialog } from "@/components/student/view-student-info-dialog";
import { CheckCircle, XCircle } from "lucide-react";
import { getToken } from "@/lib/utils/jwt";

interface ModalState {
  type: "accept" | "decline" | "info" | "finalize" | "top-students";
  student?: SubmissionDetails;
}

interface TopStudent {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  faculty: string;
  gpa: number;
  totalCredits: number;
  semester: number;
  rank: number;
  advisorName: string;
  advisorEmpId: string;
}

export default function DepartmentSecretaryDashboard() {
  const { user } = useUser();
  const { 
    students, 
    advisorLists,
    loading, 
    advisorListsLoading,
    approveStudent, 
    declineStudent, 
    finalizeList, 
    canFinalize,
    isListFinalized,
    checkListFinalized 
  } = useDepartmentSecretary();
  
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [sortBy, setSortBy] = useState<keyof SubmissionDetails | null>("studentNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [gpaLoadingStates, setGpaLoadingStates] = useState<Record<string, boolean>>({});
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [topStudentsLoading, setTopStudentsLoading] = useState(false);

  // Check list finalized status on component mount
  useEffect(() => {
    checkListFinalized();
  }, [checkListFinalized]);

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

  // Filter advisor lists based on search
  const filteredAdvisorLists = advisorLists.filter(
    (advisor) =>
      (advisor.advisorName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (advisor.advisorEmail?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (advisor.department?.toLowerCase() || "").includes(search.toLowerCase())
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
    // Prevent action if list is already finalized
    if (isListFinalized) {
      toast.info("List is already finalized");
      return;
    }

    if (!canFinalize()) {
      const allAdvisorListsFinalized = advisorLists.length > 0 && advisorLists.every(advisor => advisor.isFinalized);
      const hasApprovedOrRejectedStudents = students.some(student => 
        student.status === 'APPROVED_BY_DEPT' || 
        student.status === 'REJECTED_BY_DEPT' ||
        student.status === 'APPROVED_BY_ADVISOR' ||
        student.status === 'REJECTED_BY_ADVISOR'
      );
      
      if (!allAdvisorListsFinalized) {
        toast.error("All advisor lists must be finalized before department list can be finalized");
        return;
      }
      
      if (hasApprovedOrRejectedStudents) {
        toast.error("Cannot finalize list while there are students with approved or rejected status");
        return;
      }
    }
    setModal({ type: "finalize" });
  };

  const confirmFinalize = async () => {
    await finalizeList();
    toast.success("List has been finalized and sent to dean's office");
    setModal(null);
  };

  const getStatusColor = (status: SubmissionDetails['status']) => {
    switch (status) {
      case "APPROVED_BY_ADVISOR":
      case "APPROVED_BY_DEPT":
      case "APPROVED_BY_DEAN":
        return "text-green-600";
      case "REJECTED_BY_ADVISOR":
      case "REJECTED_BY_DEPT":
      case "REJECTED_BY_DEAN":
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
      const token = getToken();
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
        const detailedData = await response.json();
        // Update the specific student's GPA in the context
        // Note: This would ideally be done through the context, but for simplicity we'll trigger a refetch
        window.location.reload(); // Temporary solution - ideally we'd update the context state
      } else {
        console.error('Failed to refresh GPA data');
      }
    } catch (error) {
      console.error('Error refreshing GPA data:', error);
    } finally {
      setGpaLoadingStates(prev => ({ ...prev, [student.submissionId]: false }));
    }
  };

  const fetchTopStudents = async () => {
    setTopStudentsLoading(true);
    
    try {
      const token = getToken();
      if (!token) {
        console.error('No token available');
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/top-students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setTopStudents(data.topStudents || []);
        setModal({ type: "top-students" });
      } else {
        console.error('Failed to fetch top students');
        toast.error('Failed to fetch top students');
      }
    } catch (error) {
      console.error('Error fetching top students:', error);
      toast.error('Error fetching top students');
    } finally {
      setTopStudentsLoading(false);
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
        <h2 className="text-2xl font-bold text-[#2E2E2E] dark:text-[#F4F2F9] mb-6">Department Secretary Dashboard</h2>
        
        {isListFinalized && (
          <div className="bg-[#E3F6F1] dark:bg-[#2C4A42] border border-[#3BAE8E] dark:border-[#3BAE8E] text-[#3BAE8E] dark:text-[#A5DBCB] px-4 py-3 rounded mb-6">
            List has been finalized and sent to dean's office
          </div>
        )}

        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Search students and advisors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 bg-[#FFFFFF] dark:bg-[#3E3E3E] text-[#2E2E2E] dark:text-[#F4F2F9] border-[#DCD9E4] dark:border-[#4A4A4A] focus:ring-2 focus:ring-[#5B3E96] dark:focus:ring-[#937DC7]"
        />

        {/* Top Students Button */}
        <div className="mb-6">
          <Button
            onClick={fetchTopStudents}
            disabled={topStudentsLoading}
            className="bg-[#5B3E96] hover:bg-[#4A2F7A] text-white"
          >
            {topStudentsLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              "View Top 3 Students"
            )}
          </Button>
        </div>

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
                          student.status !== "APPROVED_BY_ADVISOR" || isListFinalized
                            ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                            : "bg-gray-800 hover:bg-gray-900"
                        }
                        disabled={student.status !== "APPROVED_BY_ADVISOR" || isListFinalized}
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
                          student.status !== "APPROVED_BY_ADVISOR" || isListFinalized
                            ? "bg-red-300 cursor-not-allowed hover:bg-red-300"
                            : ""
                        }
                        disabled={student.status !== "APPROVED_BY_ADVISOR" || isListFinalized}
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

        {/* Advisor Lists Table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-[#2E2E2E] dark:text-[#F4F2F9] mb-4">
            Advisor Lists ({advisorLists.length})
          </h3>
        <div className="bg-[#FFFFFF] dark:bg-[#3E3E3E] rounded-lg shadow overflow-hidden mb-6 border border-[#DCD9E4] dark:border-[#4A4A4A]">
          {advisorListsLoading ? (
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
                    Advisor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6D6D6D] dark:text-[#A9A9A9] uppercase tracking-wider">
                    Department
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
                {filteredAdvisorLists.map((advisor) => (
                  <tr key={advisor.advisorId} className="hover:bg-[#F4F2F9] dark:hover:bg-[#4A4A4A]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E] dark:text-[#F4F2F9]">
                      {advisor.advisorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E] dark:text-[#F4F2F9]">
                      {advisor.advisorEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2E2E] dark:text-[#F4F2F9]">
                      {advisor.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {advisor.isFinalized ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-green-600 font-medium">Finalized</span>
                          {advisor.finalizedDate && (
                            <div className="text-xs text-gray-500 ml-2">
                              {new Date(advisor.finalizedDate).toLocaleDateString()}
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
                      {new Date(advisor.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredAdvisorLists.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {search ? "No advisors found matching your search." : "No advisor lists found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        </div>

        {/* Finalize Button */}
        <div className="space-y-2 mt-8">
          <Button 
            onClick={handleFinalize}
            disabled={!canFinalize() || isListFinalized}
            className={`w-full ${
              isListFinalized
                ? "bg-green-600 cursor-not-allowed hover:bg-green-600"
                : canFinalize() 
                  ? "bg-gray-800 hover:bg-gray-900" 
                  : "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
            }`}
          >
            {isListFinalized ? "List Already Finalized" : "Finalize List"}
          </Button>
          {!canFinalize() && !isListFinalized && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {advisorLists.length === 0 || !advisorLists.every(advisor => advisor.isFinalized) ? (
                <p>• All advisor lists must be finalized first</p>
              ) : null}
              {students.some(student => 
                student.status === 'APPROVED_BY_DEPT' || 
                student.status === 'REJECTED_BY_DEPT' ||
                student.status === 'APPROVED_BY_ADVISOR' ||
                student.status === 'REJECTED_BY_ADVISOR'
              ) ? (
                <p>• All students should be approved or rejected</p>
              ) : null}
            </div>
          )}
          {isListFinalized && (
            <div className="text-sm text-green-600 dark:text-green-400">
              <p>✓ The list has been finalized and sent to dean's office</p>
            </div>
          )}
        </div>
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
              <DialogTitle>Confirm Finalization</DialogTitle>
              <DialogDescription>
                Are you sure you want to finalize the list? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={confirmFinalize} className="bg-gray-800 hover:bg-gray-900">
                Finalize List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {modal && modal.type === "top-students" && (
        <Dialog open onOpenChange={() => setModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Top 3 Students</DialogTitle>
              <DialogDescription>
                Students with the highest GPA in the department
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {topStudents.length > 0 ? (
                <div className="space-y-4">
                  {topStudents.map((student, index) => (
                    <div 
                      key={student.studentNumber} 
                      className="flex items-center justify-between p-4 bg-[#F4F2F9] dark:bg-[#4A4A4A] rounded-lg border border-[#DCD9E4] dark:border-[#5C5C5C]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-[#5B3E96] text-white rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-[#2E2E2E] dark:text-[#F4F2F9]">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-[#6D6D6D] dark:text-[#A9A9A9]">
                            {student.studentNumber}
                          </div>
                          <div className="text-sm text-[#6D6D6D] dark:text-[#A9A9A9]">
                            {student.department}
                          </div>
                          <div className="text-sm text-[#6D6D6D] dark:text-[#A9A9A9]">
                            Semester: {student.semester} | Credits: {student.totalCredits}
                          </div>
                          {student.advisorName && (
                            <div className="text-sm text-[#6D6D6D] dark:text-[#A9A9A9]">
                              Advisor: {student.advisorName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#5B3E96]">
                          {student.gpa.toFixed(2)}
                        </div>
                        <div className="text-sm text-[#6D6D6D] dark:text-[#A9A9A9]">
                          GPA
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6D6D6D] dark:text-[#A9A9A9]">
                  No top students data available
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 