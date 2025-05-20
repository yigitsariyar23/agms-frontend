import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const initialStudents = [
  {
    number: "20230001",
    name: "Alice Johnson",
    status: "Pending",
    email: "alice.johnson@example.com",
    department: "Computer Science",
    advisor: "Dr. Jane Doe",
    gpa: 3.8,
    curriculum: "Completed",
    credits: 120,
    files: [],
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
  },
  {
    number: "20230003",
    name: "Charlie Brown",
    status: "Pending",
    email: "charlie.brown@example.com",
    department: "Mechanical Engineering",
    advisor: "Dr. Jane Doe",
    gpa: 2.9,
    curriculum: "In Progress",
    credits: 100,
    files: [],
  },
  {
    number: "20230004",
    name: "Diana Prince",
    status: "Declined",
    email: "diana.prince@example.com",
    department: "Civil Engineering",
    advisor: "Dr. Jane Doe",
    gpa: 3.5,
    curriculum: "Completed",
    credits: 120,
    files: [],
  },
]

export default function AdvisorDashboard() {
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<null | { type: "accept" | "decline" | "info", studentIdx: number }>(null)
  const [declineReason, setDeclineReason] = useState("")

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.number.includes(search)
  )

  const handleAccept = () => {
    if (modal) {
      setStudents(students => students.map((s, i) => i === modal.studentIdx ? { ...s, status: "Approved" } : s))
      setModal(null)
    }
  }

  const handleDecline = () => {
    if (modal) {
      setStudents(students => students.map((s, i) => i === modal.studentIdx ? { ...s, status: "Declined", declineReason } : s))
      setDeclineReason("")
      setModal(null)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Advisor Dashboard</h1>
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
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, idx) => {
            const realIdx = students.findIndex(s => s.number === student.number)
            return (
              <tr key={student.number} className="border-t">
                <td className="px-4 py-2">{student.number}</td>
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">{student.status}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    variant="default"
                    className={student.status !== "Pending" ? "bg-gray-400 cursor-not-allowed" : ""}
                    disabled={student.status !== "Pending"}
                    onClick={() => setModal({ type: "accept", studentIdx: realIdx })}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    className={student.status !== "Pending" ? "bg-red-200 cursor-not-allowed" : ""}
                    disabled={student.status !== "Pending"}
                    onClick={() => setModal({ type: "decline", studentIdx: realIdx })}
                  >
                    Decline
                  </Button>
                  <Button variant="default" onClick={() => setModal({ type: "info", studentIdx: realIdx })}>View Info</Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex justify-center">
        <Button variant="default" className="px-8 py-2">Finalize List</Button>
      </div>

      {/* Accept Modal */}
      <Dialog open={!!modal && modal.type === "accept"} onOpenChange={open => !open && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Student</DialogTitle>
            <DialogDescription>Are you sure you want to approve this student?</DialogDescription>
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
          {modal && (
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
                    <CardTitle>Attached Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>No files attached</div>
                    <Button className="mt-2">Attach Files</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 