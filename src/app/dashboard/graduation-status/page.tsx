"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"

export default function GraduationStatusPage() {
  const { user } = useAuth()

  if (!user || user.role !== "student") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>You do not have permission to view this page.</AlertDescription>
      </Alert>
    )
  }

  // Mock graduation request data
  const graduationRequest = {
    id: "GR-2023-001",
    status: "pending",
    submittedAt: "2023-11-20T10:30:00Z",
    currentStep: "advisor_review",
    steps: [
      { id: "submission", name: "Request Submitted", status: "completed", date: "2023-11-20T10:30:00Z" },
      { id: "advisor_review", name: "Advisor Review", status: "in_progress", date: null },
      { id: "department_review", name: "Department Review", status: "pending", date: null },
      { id: "faculty_review", name: "Faculty Review", status: "pending", date: null },
      { id: "student_affairs_review", name: "Student Affairs Review", status: "pending", date: null },
      { id: "finalization", name: "Finalization", status: "pending", date: null },
    ],
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-gray-300" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Pending"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Graduation Status</h2>
        <p className="text-muted-foreground">Track the status of your graduation request</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Graduation Request #{graduationRequest.id}</CardTitle>
              <CardDescription>Submitted on {formatDate(graduationRequest.submittedAt)}</CardDescription>
            </div>
            <div>{getStatusBadge(graduationRequest.status)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {graduationRequest.steps.map((step, index) => (
              <div key={step.id} className="relative flex items-start">
                <div className="flex h-9 items-center">{getStatusIcon(step.status)}</div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{step.name}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(step.date)}</p>
                </div>
                {index < graduationRequest.steps.length - 1 && (
                  <div className="absolute left-[10px] top-[28px] h-full w-[1px] bg-border" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Refresh Status</Button>
          <Button variant="destructive">Withdraw Request</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
