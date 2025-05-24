"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, XCircle, User, GraduationCap } from "lucide-react"
import { ViewStudentInfoDialog } from "@/components/student/view-student-info-dialog"
import { GraduationRequestStatus } from "@/lib/types/graduation-status"
import { useStudent } from "@/lib/contexts/student-context"

interface GraduationStatusData {
  status: GraduationRequestStatus
  message?: string
}

export default function StudentDashboardContent() {
  const [graduationStatus, setGraduationStatus] = useState<GraduationStatusData>({
    status: "NOT_SUBMITTED"
  })
  const [showWithdrawnAlert, setShowWithdrawnAlert] = useState(false)
  const [isStudentInfoDialogOpen, setIsStudentInfoDialogOpen] = useState(false)
  const { hasCompletedCurriculum, getCurriculumStatus, loading } = useStudent()

  const handleRequestGraduation = () => {
    // Check if curriculum is completed before allowing graduation request
    if (hasCompletedCurriculum === false) {
      setGraduationStatus({ 
        status: "NOT_SUBMITTED", 
        message: "You cannot request graduation until you have completed all curriculum requirements." 
      })
      return
    }

    setGraduationStatus({ 
      status: "PENDING", 
      message: "Your graduation request has been submitted and is being reviewed." 
    })
  }

  const handleWithdrawRequest = () => {
    setGraduationStatus({ 
      status: "NOT_SUBMITTED", 
      message: "Your graduation request has been withdrawn." 
    })
    setShowWithdrawnAlert(true)
    setTimeout(() => setShowWithdrawnAlert(false), 5000) // Auto hide after 5 seconds
  }

  const getStatusIcon = (status: GraduationRequestStatus) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <GraduationCap className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: GraduationRequestStatus) => {
    switch (status) {
      case "NOT_SUBMITTED":
        return "Not Requested"
      case "PENDING":
        return "Under Review"
      case "APPROVED":
        return "Approved"
      case "REJECTED":
        return "Rejected"
      default:
        return "Unknown"
    }
  }

  const getStatusBadgeVariant = (status: GraduationRequestStatus) => {
    switch (status) {
      case "APPROVED":
        return "default" as const
      case "PENDING":
        return "secondary" as const
      case "REJECTED":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        {/* Removed Student Dashboard title */}
      </div>

      {/* Withdrawal Alert */}
      {showWithdrawnAlert && (
        <Alert className="border-orange-200 bg-orange-50">
          <XCircle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700">
            <strong>Graduation request withdrawn</strong>
            <br />
            Your request has been withdrawn.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Graduation Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Graduation Status
            </CardTitle>
            <CardDescription>
              Track your graduation application progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(graduationStatus.status)}
                <Badge variant={getStatusBadgeVariant(graduationStatus.status)}>
                  {getStatusText(graduationStatus.status)}
                </Badge>
              </div>
            </div>

            {/* Curriculum Completion Status */}
            {!loading && hasCompletedCurriculum !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Curriculum:</span>
                <div className="flex items-center gap-2">
                  {hasCompletedCurriculum ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                  <Badge variant={hasCompletedCurriculum ? "default" : "secondary"}>
                    {getCurriculumStatus()}
                  </Badge>
                </div>
              </div>
            )}

            {graduationStatus.message && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  {graduationStatus.message}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {graduationStatus.status === "NOT_SUBMITTED" && (
                <>
                  <Button 
                    onClick={handleRequestGraduation}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                    disabled={hasCompletedCurriculum === false}
                  >
                    Request Graduation
                  </Button>
                  {hasCompletedCurriculum === false && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Complete all curriculum requirements to request graduation
                    </p>
                  )}
                </>
              )}
              
              {graduationStatus.status === "PENDING" && (
                <Button 
                  onClick={handleWithdrawRequest}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Withdraw Request
                </Button>
              )}

              {graduationStatus.status === "REJECTED" && (
                <>
                  <Button 
                    onClick={handleRequestGraduation}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                    disabled={hasCompletedCurriculum === false}
                  >
                    Request Graduation
                  </Button>
                  {hasCompletedCurriculum === false && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Complete all curriculum requirements to request graduation
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6" />
              Student Information
            </CardTitle>
            <CardDescription>
              View and manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Access your complete student profile, including personal details, 
                academic information, and contact details.
              </p>
            </div>
            
            <Button 
              onClick={() => setIsStudentInfoDialogOpen(true)}
              variant="outline"
              className="w-full"
            >
              View Student Info
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Student Info Dialog */}
      <ViewStudentInfoDialog 
        open={isStudentInfoDialogOpen}
        onOpenChange={setIsStudentInfoDialogOpen}
      />
    </div>
  )
}
