import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface Student {
  number: string
  name: string
  status: "Approved" | "Declined" | "Pending"
  email: string
  department: string
  advisor: string
  gpa: number
  curriculum: string
  credits: number
  files: string[]
  advisorComment: string
  declineReason?: string
  reviewed?: boolean
  secretaryComment?: string
  deanComment?: string
  deanReviewed?: boolean
  graduationStatus?: "Pending" | "Processed" | "Completed" | "Declined"
  graduationComment?: string
}

// This would typically come from an API
const initialStudents: Student[] = [
  {
    number: "20230001",
    name: "Alice Johnson",
    status: "Approved",
    email: "alice.johnson@example.com",
    department: "Computer Science",
    advisor: "Dr. Jane Doe",
    gpa: 3.8,
    curriculum: "Completed",
    credits: 120,
    files: [],
    advisorComment: "Student meets all requirements",
    secretaryComment: "All requirements verified, approved",
    reviewed: true,
    deanComment: "Approved for graduation",
    deanReviewed: true,
    graduationStatus: "Pending",
  },
  {
    number: "20230002",
    name: "Bob Smith",
    status: "Approved",
    email: "bob.smith@example.com",
    department: "Electrical Engineering",
    advisor: "Dr. Jane Doe",
    gpa: 3.2,
    curriculum: "Completed",
    credits: 120,
    files: [],
    advisorComment: "Student meets all requirements",
    secretaryComment: "Requirements verified, approved",
    reviewed: true,
    deanComment: "Approved for graduation",
    deanReviewed: true,
    graduationStatus: "Processed",
    graduationComment: "Diploma prepared, waiting for ceremony",
  },
  {
    number: "20230003",
    name: "Charlie Brown",
    status: "Declined",
    email: "charlie.brown@example.com",
    department: "Mechanical Engineering",
    advisor: "Dr. Jane Doe",
    gpa: 2.9,
    curriculum: "In Progress",
    credits: 100,
    files: [],
    advisorComment: "Insufficient credits and incomplete curriculum",
    declineReason: "Student has not completed required credits",
    secretaryComment: "Verified insufficient credits, decline approved",
    reviewed: true,
    deanComment: "Decline approved, student needs to complete requirements",
    deanReviewed: true,
    graduationStatus: "Pending",
  },
]

// Mock dean's office list status
const deansOfficeListStatus = [
  { faculty: "Faculty of Engineering", dean: "Prof. Williams", status: "Finalized" },
  { faculty: "Faculty of Science", dean: "Prof. Johnson", status: "Finalized" },
  { faculty: "Faculty of Arts", dean: "Prof. Davis", status: "In Process" },
  { faculty: "Faculty of Business", dean: "Prof. Wilson", status: "Finalized" },
]

export default function StudentAffairsDashboard() {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<null | { 
    type: "decline" | "info" | "finalize", 
    studentIdx?: number 
  }>(null)
  const [declineReason, setDeclineReason] = useState("")
  const [isFinalized, setIsFinalized] = useState(false)

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.number.includes(search)
  )

  const handleApprove = (idx: number) => {
    setStudents(students => students.map((s, i) =>
      i === idx ? { ...s, graduationStatus: "Completed", graduationComment: undefined } : s
    ))
    toast.success("Graduation completed for student.")
  }

  const handleDecline = () => {
    if (modal && modal.studentIdx !== undefined) {
      setStudents(students => students.map((s, i) =>
        i === modal.studentIdx ? { ...s, graduationStatus: "Declined", graduationComment: declineReason } : s
      ))
      setDeclineReason("")
      setModal(null)
      toast.success("Graduation declined for student.")
    }
  }

  const handleFinalize = () => {
    const hasUnprocessedStudents = students.some(s =>
      s.status === "Approved" && s.graduationStatus !== "Completed" && s.graduationStatus !== "Declined"
    )
    if (hasUnprocessedStudents) {
      toast.error("All approved students must be processed before finalizing")
      return
    }
    setModal({ type: "finalize" })
  }

  const confirmFinalize = () => {
    setIsFinalized(true)
    toast.success("Graduation process has been finalized")
    setModal(null)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Student Affairs Dashboard</h1>
      {/* Dean's Office List Status Table */}
      <div className="bg-white border rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Dean's Office List Status</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left py-2">Faculty</th>
              <th className="text-left py-2">Dean</th>
              <th className="text-left py-2">List Status</th>
            </tr>
          </thead>
          <tbody>
            {deansOfficeListStatus.map((faculty) => (
              <tr key={faculty.faculty}>
                <td className="py-2">{faculty.faculty}</td>
                <td className="py-2">{faculty.dean}</td>
                <td className="py-2">{faculty.status}</td>
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
          Graduation process has been finalized
        </div>
      )}
      <Input
        type="text"
        placeholder="Search students..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-6"
      />
      <table className="min-w-full bg-white border rounded mb-6">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Student Number</th>
            <th className="px-4 py-2 text-left">Student Name</th>
            <th className="px-4 py-2 text-left">Department</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Graduation Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, idx) => (
            <tr key={student.number} className="border-t">
              <td className="px-4 py-2">{student.number}</td>
              <td className="px-4 py-2">{student.name}</td>
              <td className="px-4 py-2">{student.department}</td>
              <td className="px-4 py-2">{student.status}</td>
              <td className="px-4 py-2">
                {student.status === "Approved" ? (
                  <span className={
                    student.graduationStatus === "Completed" ? "text-green-600" :
                    student.graduationStatus === "Declined" ? "text-red-600" :
                    "text-yellow-600"
                  }>
                    {student.graduationStatus || "Pending"}
                  </span>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </td>
              <td className="px-4 py-2 flex gap-2">
                {student.status === "Approved" && student.graduationStatus !== "Completed" && student.graduationStatus !== "Declined" && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleApprove(idx)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setModal({ type: "decline", studentIdx: idx })}
                    >
                      Decline
                    </Button>
                  </>
                )}
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
      <Dialog open={!!modal && modal.type === "decline"} onOpenChange={open => !open && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Graduation</DialogTitle>
            <DialogDescription>Please provide a reason for declining graduation for this student.</DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <Label htmlFor="decline-reason">Reason</Label>
            <Textarea
              id="decline-reason"
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              className="mt-2"
              placeholder="Enter reason..."
            />
          </div>
          <DialogFooter>
            <Button onClick={handleDecline} disabled={!declineReason.trim()}>Submit</Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Info Modal */}
      <Dialog open={!!modal && modal.type === "info"} onOpenChange={open => !open && setModal(null)}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Student Information</DialogTitle>
          </DialogHeader>
          {modal && modal.studentIdx !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent>
                  <div className="pt-4">
                    <div className="text-2xl font-bold mb-2">{students[modal.studentIdx].name}</div>
                    <div className="mb-1"><span className="font-bold">Student Number:</span> {students[modal.studentIdx].number}</div>
                    <div className="mb-1"><span className="font-bold">Email:</span> {students[modal.studentIdx].email}</div>
                    <div className="mb-1"><span className="font-bold">Department:</span> {students[modal.studentIdx].department}</div>
                    <div className="mb-1"><span className="font-bold">Advisor:</span> {students[modal.studentIdx].advisor}</div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Graduation Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-1">✔ <span className="font-bold">GPA:</span> {students[modal.studentIdx].gpa}</div>
                    <div className="mb-1">✔ <span className="font-bold">Curriculum:</span> {students[modal.studentIdx].curriculum}</div>
                    <div className="mb-1">✔ <span className="font-bold">Credits:</span> {students[modal.studentIdx].credits}</div>
                    {students[modal.studentIdx].status === "Approved" && (
                      <div className="mt-2">
                        <span className="font-bold">Graduation Status:</span>{" "}
                        <span className={
                          students[modal.studentIdx].graduationStatus === "Completed" ? "text-green-600" :
                          students[modal.studentIdx].graduationStatus === "Processed" ? "text-blue-600" :
                          "text-yellow-600"
                        }>
                          {students[modal.studentIdx].graduationStatus || "Pending"}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Review Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <span className="font-bold">Advisor's Comment:</span>
                      <p className="mt-1">{students[modal.studentIdx].advisorComment}</p>
                    </div>
                    <div className="mb-2">
                      <span className="font-bold">Secretary's Comment:</span>
                      <p className="mt-1">{students[modal.studentIdx].secretaryComment}</p>
                    </div>
                    <div className="mb-2">
                      <span className="font-bold">Dean's Comment:</span>
                      <p className="mt-1">{students[modal.studentIdx].deanComment}</p>
                    </div>
                    {students[modal.studentIdx].status === "Declined" && (
                      <div className="mb-2">
                        <span className="font-bold">Decline Reason:</span>
                        <p className="mt-1">{students[modal.studentIdx].declineReason}</p>
                      </div>
                    )}
                    {students[modal.studentIdx].graduationStatus === "Processed" && (
                      <div className="mb-2">
                        <span className="font-bold">Processing Details:</span>
                        <p className="mt-1">{students[modal.studentIdx].graduationComment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Finalize Modal */}
      <Dialog open={!!modal && modal.type === "finalize"} onOpenChange={open => !open && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Graduation Process</DialogTitle>
            <DialogDescription>
              Are you sure you want to finalize the graduation process? This will mark the end of the current graduation cycle.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={confirmFinalize}>Yes, Finalize Process</Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 