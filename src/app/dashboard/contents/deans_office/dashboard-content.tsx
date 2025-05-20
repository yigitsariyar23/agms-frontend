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
  },
]

// Mock department secretary list status
const departmentSecretaryListStatus = [
  { name: "Computer Science Department", secretary: "Mrs. Anderson", status: "Finalized" },
  { name: "Electrical Engineering Department", secretary: "Mr. Thompson", status: "Finalized" },
  { name: "Mechanical Engineering Department", secretary: "Ms. Roberts", status: "In Process" },
  { name: "Civil Engineering Department", secretary: "Dr. Martinez", status: "Finalized" },
]

export default function DeansOfficeDashboard() {
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
      i === idx ? { ...s, status: "Approved", deanReviewed: true, deanComment: undefined } : s
    ))
    toast.success("Student approved.")
  }

  const handleDecline = () => {
    if (modal && modal.studentIdx !== undefined) {
      setStudents(students => students.map((s, i) =>
        i === modal.studentIdx ? { ...s, status: "Declined", deanReviewed: true, deanComment: declineReason } : s
      ))
      setDeclineReason("")
      setModal(null)
      toast.success("Student declined.")
    }
  }

  const handleFinalize = () => {
    const hasUnreviewedStudents = students.some(s => !s.deanReviewed)
    if (hasUnreviewedStudents) {
      toast.error("All students must be approved or declined before finalizing")
      return
    }
    setModal({ type: "finalize" })
  }

  const confirmFinalize = () => {
    setIsFinalized(true)
    toast.success("List has been finalized and sent to student affairs")
    setModal(null)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Dean's Office Dashboard</h1>
      {/* Department Secretary List Status Table */}
      <div className="bg-white border rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Department Secretary List Status</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left py-2">Department</th>
              <th className="text-left py-2">Secretary</th>
              <th className="text-left py-2">List Status</th>
            </tr>
          </thead>
          <tbody>
            {departmentSecretaryListStatus.map((dept) => (
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
      <Dialog open={!!modal && modal.type === "decline"} onOpenChange={open => !open && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Student</DialogTitle>
            <DialogDescription>Please provide a reason for declining this student.</DialogDescription>
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
                    {students[modal.studentIdx].status === "Declined" && (
                      <div className="mb-2">
                        <span className="font-bold">Decline Reason:</span>
                        <p className="mt-1">{students[modal.studentIdx].declineReason}</p>
                      </div>
                    )}
                    {students[modal.studentIdx].deanReviewed && (
                      <div className="mb-2">
                        <span className="font-bold">Dean's Comment:</span>
                        <p className="mt-1">{students[modal.studentIdx].deanComment}</p>
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
            <DialogTitle>Finalize Student List</DialogTitle>
            <DialogDescription>
              Are you sure you want to finalize this list? Once finalized, it will be sent to student affairs for final processing.
              This action cannot be undone.
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
  )
} 