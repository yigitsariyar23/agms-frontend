"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Eye, XCircle } from "lucide-react"

export default function ReviewRequestsPage() {
  const { user } = useAuth()
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState("")

  if (!user || user.role !== "advisor") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>You do not have permission to view this page.</AlertDescription>
      </Alert>
    )
  }

  // Mock graduation requests data
  const graduationRequests = [
    {
      id: "GR-2023-001",
      studentId: "20180101001",
      studentName: "John Doe",
      department: "Computer Engineering",
      gpa: 3.75,
      credits: 240,
      submittedAt: "2023-11-20T10:30:00Z",
      status: "pending",
    },
    {
      id: "GR-2023-002",
      studentId: "20180101002",
      studentName: "Jane Smith",
      department: "Computer Engineering",
      gpa: 3.45,
      credits: 240,
      submittedAt: "2023-11-19T14:15:00Z",
      status: "pending",
    },
    {
      id: "GR-2023-003",
      studentId: "20180101003",
      studentName: "Bob Johnson",
      department: "Computer Engineering",
      gpa: 3.2,
      credits: 240,
      submittedAt: "2023-11-18T09:45:00Z",
      status: "pending",
    },
    {
      id: "GR-2023-004",
      studentId: "20180101004",
      studentName: "Alice Williams",
      department: "Computer Engineering",
      gpa: 3.9,
      credits: 240,
      submittedAt: "2023-11-17T16:30:00Z",
      status: "pending",
    },
    {
      id: "GR-2023-005",
      studentId: "20180101005",
      studentName: "Charlie Brown",
      department: "Computer Engineering",
      gpa: 3.1,
      credits: 240,
      submittedAt: "2023-11-16T11:20:00Z",
      status: "pending",
    },
  ]

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request)
    setViewDialogOpen(true)
  }

  const handleDeclineRequest = (request: any) => {
    setSelectedRequest(request)
    setDeclineDialogOpen(true)
  }

  const handleAcceptRequest = (request: any) => {
    // In a real app, this would call an API to update the request status
    console.log("Accepting request:", request.id)
  }

  const handleSubmitDecline = () => {
    // In a real app, this would call an API to update the request status with the reason
    console.log("Declining request:", selectedRequest?.id, "Reason:", declineReason)
    setDeclineDialogOpen(false)
    setDeclineReason("")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Review Graduation Requests</h2>
        <p className="text-muted-foreground">Review and approve or decline student graduation requests</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({graduationRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved (0)</TabsTrigger>
          <TabsTrigger value="declined">Declined (0)</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          {graduationRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{request.studentName}</CardTitle>
                    <CardDescription>
                      ID: {request.studentId} | Submitted: {formatDate(request.submittedAt)}
                    </CardDescription>
                  </div>
                  <Badge>Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{request.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">GPA</p>
                    <p className="text-sm text-muted-foreground">{request.gpa}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Credits</p>
                    <p className="text-sm text-muted-foreground">{request.credits}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeclineRequest(request)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button variant="default" size="sm" onClick={() => handleAcceptRequest(request)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>No Approved Requests</CardTitle>
              <CardDescription>You haven't approved any graduation requests yet.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="declined">
          <Card>
            <CardHeader>
              <CardTitle>No Declined Requests</CardTitle>
              <CardDescription>You haven't declined any graduation requests yet.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Student Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Detailed information about {selectedRequest?.studentName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Student Information</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest?.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Student ID</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest?.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest?.department}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Academic Information</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-sm font-medium">GPA</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest?.gpa}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Credits Completed</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest?.credits}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Graduation Status</p>
                    <p className="text-sm text-muted-foreground">Eligible</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Curriculum</h3>
              <p className="text-sm text-muted-foreground">All required courses completed</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setViewDialogOpen(false)
                handleDeclineRequest(selectedRequest)
              }}
            >
              Decline
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false)
                handleAcceptRequest(selectedRequest)
              }}
            >
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Request Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Graduation Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining {selectedRequest?.studentName}'s graduation request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter reason for declining the request..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmitDecline} disabled={!declineReason.trim()}>
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
