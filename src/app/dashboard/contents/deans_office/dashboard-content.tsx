import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ViewStudentInfo, StudentInfoProps } from "@/components/student/ViewStudentInfo";

interface Student {
  number: string;
  name: string;
  status: "Approved" | "Declined" | "Pending";
  email: string;
  department: string;
  advisor: string;
  gpa?: number;
  curriculum?: string;
  credits?: number;
  files?: string[];
  advisorComment?: string;
  secretaryComment?: string;
  declineReason?: string;
  reviewed?: boolean;
  deanComment?: string;
  deanReviewed?: boolean;
  graduationStatus?: string;
  graduationComment?: string;
}

// Define a type for Department Secretary Status, replace 'any' with a proper structure later
interface DepartmentStatus {
  name: string;
  secretary: string;
  status: string;
  // Add other relevant fields as needed
}

export default function DeansOfficeDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departmentStatuses, setDepartmentStatuses] = useState<DepartmentStatus[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | {
    type: "decline" | "info" | "finalize";
    studentIdx?: number;
  }>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [sortBy, setSortBy] = useState<keyof Student | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // TODO: Fetch actual student data from the backend
  useEffect(() => {
    const fetchStudentsForDean = async () => {
      try {
        // const response = await fetch("/api/deans-office/students"); // Replace with your actual API endpoint
        // const data = await response.json();
        // setStudents(data);
        toast.info("Student data for Dean's Office would be fetched here.");
      } catch (error) {
        console.error("Failed to fetch students for Dean's Office:", error);
        toast.error("Failed to load student data for Dean's Office.");
      }
    };
    fetchStudentsForDean();
  }, []);

  // TODO: Fetch actual department secretary list statuses from the backend
  useEffect(() => {
    const fetchDepartmentStatuses = async () => {
      try {
        // const response = await fetch("/api/deans-office/department-statuses"); // Replace with your actual API endpoint
        // const data = await response.json();
        // setDepartmentStatuses(data);
        toast.info("Department secretary list statuses would be fetched here.");
      } catch (error) {
        console.error("Failed to fetch department secretary statuses:", error);
        toast.error("Failed to load department secretary statuses.");
      }
    };
    fetchDepartmentStatuses();
  }, []);

  const handleSort = (field: keyof Student) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.number.includes(search)
  );

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

    return 0;
  });

  const handleApprove = (idx: number) => {
    setStudents((students) =>
      students.map((s, i) =>
        i === idx
          ? {
              ...s,
              status: "Approved",
              deanReviewed: true,
              deanComment: undefined,
            }
          : s
      )
    );
    toast.success("Student approved.");
  };

  const handleDecline = () => {
    if (modal && modal.studentIdx !== undefined) {
      setStudents((students) =>
        students.map((s, i) =>
          i === modal.studentIdx
            ? {
                ...s,
                status: "Declined",
                deanReviewed: true,
                deanComment: declineReason,
              }
            : s
        )
      );
      setDeclineReason("");
      setModal(null);
      toast.success("Student declined.");
    }
  };

  const handleFinalize = () => {
    const hasUnreviewedStudents = students.some((s) => !s.deanReviewed);
    if (hasUnreviewedStudents) {
      toast.error(
        "All students must be approved or declined before finalizing"
      );
      return;
    }
    setModal({ type: "finalize" });
  };

  const confirmFinalize = () => {
    setIsFinalized(true);
    toast.success("List has been finalized and sent to student affairs");
    setModal(null);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Dean's Office Dashboard</h1>
      {/* Department Secretary List Status Table */}
      <div className="bg-white border rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Department Secretary List Status
        </h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left py-2">Department</th>
              <th className="text-left py-2">Secretary</th>
              <th className="text-left py-2">List Status</th>
            </tr>
          </thead>
          <tbody>
            {departmentStatuses.map((dept) => (
              <tr key={dept.name}>
                <td className="py-2">{dept.name}</td>
                <td className="py-2">{dept.secretary}</td>
                <td className="py-2">{dept.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button
          variant="default"
          className="mt-4"
          onClick={handleFinalize}
          disabled={isFinalized}
        >
          Finalize Graduation List
        </Button>
      </div>
      {isFinalized && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          List has been finalized and sent to student affairs
        </div>
      )}
      <Input
        type="text"
        placeholder="Search students..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6"
      />
      <table className="min-w-full bg-white border rounded mb-6">
        <thead>
          <tr>
            <th
              className="px-4 py-2 text-left cursor-pointer"
              onClick={() => handleSort("number")}
            >
              Student Number{" "}
              {sortBy === "number" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              className="px-4 py-2 text-left cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Student Name{" "}
              {sortBy === "name" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              className="px-4 py-2 text-left cursor-pointer"
              onClick={() => handleSort("department")}
            >
              Department{" "}
              {sortBy === "department"
                ? sortDirection === "asc"
                  ? "↑"
                  : "↓"
                : ""}
            </th>
            <th
              className="px-4 py-2 text-left cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Status{" "}
              {sortBy === "status" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
            </th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student, idx) => (
            <tr key={student.number} className="border-t">
              <td className="px-4 py-2">{student.number}</td>
              <td className="px-4 py-2">{student.name}</td>
              <td className="px-4 py-2">{student.department}</td>
              <td className="px-4 py-2">{student.status}</td>
              <td className="px-4 py-2 flex gap-2">
                <Button
                  variant="default"
                  onClick={() => handleApprove(idx)}
                  disabled={student.status === "Approved"}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setModal({ type: "decline", studentIdx: idx })}
                  disabled={student.status === "Declined"}
                >
                  Decline
                </Button>
                <Button
                  variant="default"
                  onClick={() => setModal({ type: "info", studentIdx: idx })}
                >
                  View Info
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Decline Modal */}
      <Dialog
        open={!!modal && modal.type === "decline"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Student</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this student.
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

      {/* View Info Modal */}
      <Dialog
        open={!!modal && modal.type === "info"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Student Information</DialogTitle>
          </DialogHeader>
          {modal && modal.studentIdx !== undefined && students[modal.studentIdx] ? (
            <ViewStudentInfo student={students[modal.studentIdx] as StudentInfoProps['student']} />
          ) : (
            <p>Loading student information or student not found.</p>
          )}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              will be sent to student affairs for final processing. This action
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
