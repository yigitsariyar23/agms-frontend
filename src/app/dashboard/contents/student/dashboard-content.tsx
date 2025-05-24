"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, XCircle, User, GraduationCap } from "lucide-react"
import { ViewStudentInfoDialog } from "@/components/student/view-student-info-dialog"
import { GraduationRequestStatus } from "@/lib/types/graduation-status"
import { useStudent } from "@/lib/contexts/student-context"
import { useGraduation } from "@/lib/contexts/graduation-context"

export default function StudentDashboardContent() {
  const {
    graduationStatus,
    loading: graduationLoading,
    alert: graduationAlert,
    requestGraduation,
    withdrawGraduationRequest,
    clearAlert
  } = useGraduation()
  const [isStudentInfoDialogOpen, setIsStudentInfoDialogOpen] = useState(false)
  const { studentProfile, hasCompletedCurriculum, getCurriculumStatus, loading: studentLoading } = useStudent()

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

  useEffect(() => {
    if (graduationAlert?.message && typeof window !== "undefined") {
      console.log(`Graduation Alert: ${graduationAlert.type} - ${graduationAlert.message}`);
    }
  }, [graduationAlert, clearAlert])

  // Early return or skeleton if studentProfile or studentNumber is not yet loaded
  if (studentLoading || !studentProfile?.studentNumber) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        {/* Removed Student Dashboard title */}
      </div>

      {/* Global Alert Display Area - Using the new alert from context */}
      {graduationAlert && (
        <Alert className={`border-${graduationAlert.type === 'error' ? 'red' : graduationAlert.type === 'success' ? 'green' : 'blue'}-200 bg-${graduationAlert.type === 'error' ? 'red' : graduationAlert.type === 'success' ? 'green' : 'blue'}-50`}>
          {graduationAlert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {graduationAlert.type === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
          {graduationAlert.type === 'info' && <Clock className="h-4 w-4 text-blue-500" />}
          <AlertDescription className={`text-${graduationAlert.type === 'error' ? 'red' : graduationAlert.type === 'success' ? 'green' : 'blue'}-700`}>
            <strong>{graduationAlert.type.charAt(0).toUpperCase() + graduationAlert.type.slice(1)}</strong>
            <br />
            {graduationAlert.message}
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
            {hasCompletedCurriculum !== null && (
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

            <div className="flex gap-2 flex-col sm:flex-row">
              {graduationStatus.status === "NOT_SUBMITTED" && (
                <>
                  <Button 
                    onClick={requestGraduation}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium flex-grow"
                    disabled={hasCompletedCurriculum === false || graduationLoading}
                  >
                    {graduationLoading ? "Submitting..." : "Request Graduation"}
                  </Button>
                  {hasCompletedCurriculum === false && (
                    <p className="text-xs text-muted-foreground mt-1 sm:mt-0 sm:ml-2 flex-shrink-0">
                      Complete curriculum to request
                    </p>
                  )}
                </>
              )}
              
              {graduationStatus.status === "PENDING" && (
                <Button 
                  onClick={withdrawGraduationRequest}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 flex-grow"
                  disabled={graduationLoading}
                >
                  {graduationLoading && graduationStatus.status === "PENDING" ? "Withdrawing..." : "Withdraw Request"}
                </Button>
              )}

              {graduationStatus.status === "REJECTED" && (
                <>
                  <Button 
                    onClick={requestGraduation}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium flex-grow"
                    disabled={hasCompletedCurriculum === false || graduationLoading}
                  >
                    {graduationLoading ? "Submitting..." : "Request Graduation Again"}
                  </Button>
                  {hasCompletedCurriculum === false && (
                    <p className="text-xs text-muted-foreground mt-1 sm:mt-0 sm:ml-2 flex-shrink-0">
                      Complete curriculum to request
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

      {/* Student Info Dialog - Pass studentNumber */}
      {studentProfile?.studentNumber && (
        <ViewStudentInfoDialog 
          open={isStudentInfoDialogOpen}
          onOpenChange={setIsStudentInfoDialogOpen}
          studentNumber={studentProfile.studentNumber} 
        />
      )}
    </div>
  )
}
