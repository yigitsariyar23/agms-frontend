"use client";

import { useState } from "react";
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
import { useAdvisor, AdvisorStudent } from "@/lib/contexts/advisor-context";
import { useUser } from "@/lib/contexts/user-context";
import { ViewStudentInfoDialog } from "@/components/student/view-student-info-dialog";
import { CheckCircle, XCircle } from "lucide-react";

interface ModalState {
  type: "accept" | "decline" | "info" | "finalize";
  student?: AdvisorStudent;
}

export default function AdvisorDashboard() {
  const { user } = useUser();
  const { 
    students, 
    loading, 
    approveStudent, 
    declineStudent, 
    finalizeList, 
    isListFinalized 
  } = useAdvisor();
  
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [sortBy, setSortBy] = useState<keyof AdvisorStudent | null>("studentNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [gpaLoadingStates, setGpaLoadingStates] = useState<Record<string, boolean>>({});

  const handleSort = (field: keyof AdvisorStudent) => {
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
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.studentNumber.toString().includes(search)
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
      await approveStudent(modal.student.id);
      toast.success("Student approved successfully");
      setModal(null);
    }
  };

  const handleDecline = async () => {
    if (modal && modal.student && declineReason.trim()) {
      await declineStudent(modal.student.id, declineReason);
      toast.success("Student declined");
      setDeclineReason("");
      setModal(null);
    }
  };

  const handleFinalize = () => {
    const hasPendingStudents = students.some((s) => s.status === "Pending");
    if (hasPendingStudents) {
      toast.error(
        "All students must be either approved or declined before finalizing"
      );
      return;
    }
    setModal({ type: "finalize" });
  };

  const confirmFinalize = async () => {
    await finalizeList();
    toast.success("List has been finalized and sent to department secretary");
    setModal(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600";
      case "Declined":
        return "text-red-600";
      case "Pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const refreshGPA = async (student: AdvisorStudent) => {
    setGpaLoadingStates(prev => ({ ...prev, [student.id]: true }));
    
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
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
      setGpaLoadingStates(prev => ({ ...prev, [student.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advisor Dashboard</h2>
        
        {isListFinalized && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            List has been finalized and sent to department secretary
          </div>
        )}


        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6"
        />

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("studentNumber")}>
                  Student Number {sortBy === "studentNumber" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("name")}>
                  Student Name {sortBy === "name" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("gpa")}>
                  <div className="flex flex-col">
                    <span>GPA (Min: 2.0) {sortBy === "gpa" ? (sortDirection === "asc" ? "↑" : "↓") : ""}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("status")}>
                  Status {sortBy === "status" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gpaLoadingStates[student.id] ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <span className="text-gray-500">Loading...</span>
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
                          disabled={gpaLoadingStates[student.id]}
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
                          student.status !== "Pending"
                            ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                            : "bg-gray-800 hover:bg-gray-900"
                        }
                        disabled={student.status !== "Pending" || isListFinalized}
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
                          student.status !== "Pending"
                            ? "bg-red-300 cursor-not-allowed hover:bg-red-300"
                            : ""
                        }
                        disabled={student.status !== "Pending" || isListFinalized}
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

        {/* Finalize Button */}
        <div className="flex justify-center">
          <Button
            className="px-8 py-2 bg-gray-800 hover:bg-gray-900"
            onClick={handleFinalize}
            disabled={isListFinalized}
          >
            {isListFinalized ? "List Finalized" : "Finalize List"}
          </Button>
        </div>
      </main>

      {/* Accept Modal */}
      <Dialog
        open={!!modal && modal.type === "accept"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {modal?.student?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleAccept}>Yes, Approve</Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Modal */}
      <Dialog
        open={!!modal && modal.type === "decline"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Student</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining {modal?.student?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <Label htmlFor="decline-reason">Reason</Label>
            <Textarea
              id="decline-reason"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="mt-2"
              placeholder="Enter reason..."
            />
          </div>
          <DialogFooter>
            <Button onClick={handleDecline} disabled={!declineReason.trim()}>
              Submit
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Info Modal */}
      {modal && modal.type === "info" && modal.student && (
        <ViewStudentInfoDialog 
          open={true} 
          onOpenChange={(open) => !open && setModal(null)}
          studentNumber={modal.student.studentNumber}
          initialStudentData={modal.student}
        />
      )}

      {/* Finalize Modal */}
      <Dialog
        open={!!modal && modal.type === "finalize"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Student List</DialogTitle>
            <DialogDescription>
              Are you sure you want to finalize this list? Once finalized, it
              will be sent to the department secretary for review. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={confirmFinalize}>Yes, Finalize List</Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
