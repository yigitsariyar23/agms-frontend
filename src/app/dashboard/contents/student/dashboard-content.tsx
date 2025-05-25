"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, XCircle, User, GraduationCap } from "lucide-react"
import { ViewStudentInfoDialog } from "@/components/student/view-student-info-dialog"
import { SubmissionDetails } from "@/lib/types/submission-details"
import { useStudent } from "@/lib/contexts/student-context"
import { useSubmission } from "@/lib/contexts/submission-context"
import { useGraduation } from "@/lib/contexts/graduation-context"

export default function StudentDashboardContent() {
  const {
    loading: graduationLoading,
    alert: graduationAlert,
    requestGraduation,
    clearAlert
  } = useGraduation()

  const { 
    submission, 
    loading: submissionLoading, 
    error: submissionError, 
    fetchSubmissionByStudentNumber,
    clearSubmission
  } = useSubmission()

  const [isStudentInfoDialogOpen, setIsStudentInfoDialogOpen] = useState(false)
  const { studentProfile, hasCompletedCurriculum, getCurriculumStatus, loading: studentLoading } = useStudent()

  useEffect(() => {
    if (studentProfile?.studentNumber && fetchSubmissionByStudentNumber) {
      fetchSubmissionByStudentNumber(studentProfile.studentNumber);
    }
    // Clear submission data if student logs out or changes
    return () => {
      if (clearSubmission) clearSubmission();
    }
  }, [studentProfile?.studentNumber, fetchSubmissionByStudentNumber, clearSubmission]);

  const getStatusIcon = (status: SubmissionDetails['status'] | undefined) => {
    switch (status) {
      case "APPROVED_BY_ADVISOR":
      case "APPROVED_BY_DEPT":
      case "APPROVED_BY_DEAN":
      case "GRADUATION_APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "REJECTED_BY_ADVISOR":
      case "REJECTED_BY_DEPT":
      case "REJECTED_BY_DEAN":
      case "STUDENT_AFFAIRS_REJECTED":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "NOT_REQUESTED":
      default:
        return <GraduationCap className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: SubmissionDetails['status'] | undefined) => {
    if (submissionLoading && !submission) return "Loading Status...";
    switch (status) {
      case "PENDING":
        return "Under Review"
      case "APPROVED_BY_ADVISOR":
        return "Approved by Advisor"
      case "APPROVED_BY_DEPT":
        return "Approved by Department"
      case "APPROVED_BY_DEAN":
        return "Approved by Dean"
      case "GRADUATION_APPROVED":
        return "Graduation Approved"
      case "REJECTED_BY_ADVISOR":
        return "Declined by Advisor"
      case "REJECTED_BY_DEPT":
        return "Rejected by Department"
      case "REJECTED_BY_DEAN":
        return "Rejected by Dean"
      case "STUDENT_AFFAIRS_REJECTED":
        return "Rejected by Student Affairs"
      case "NOT_REQUESTED":
      default:
        return "Not Requested"
    }
  }

  const getStatusBadgeVariant = (status: SubmissionDetails['status'] | undefined) => {
    if (submissionLoading && !submission) return "outline" as const;
    switch (status) {
      case "APPROVED_BY_ADVISOR":
      case "APPROVED_BY_DEPT":
      case "APPROVED_BY_DEAN":
      case "GRADUATION_APPROVED":
        return "default" as const
      case "PENDING":
        return "secondary" as const
      case "REJECTED_BY_ADVISOR":
      case "REJECTED_BY_DEPT":
      case "REJECTED_BY_DEAN":
      case "STUDENT_AFFAIRS_REJECTED":
        return "destructive" as const
      case "NOT_REQUESTED":
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

  const currentSubmissionStatus = submission?.status;
  console.log(currentSubmissionStatus);
  const displayStatusMessage = () => {
    if (!submission && !submissionLoading && !submissionError) return "No submission information available.";
    if (submissionError) return null; // Error handled by separate Alert
    if (submissionLoading && !submission) return "Loading submission details...";
    if (!currentSubmissionStatus) return "Status not available yet.";

    if (["REJECTED_BY_ADVISOR", "REJECTED_BY_DEPT", "REJECTED_BY_DEAN", "STUDENT_AFFAIRS_REJECTED"].includes(currentSubmissionStatus)) {
      return submission.content || "Your application was not approved. Please check comments for details.";
    }
    if (currentSubmissionStatus === "GRADUATION_APPROVED") {
      return submission.content || "Congratulations! Your graduation has been approved.";
    }
    if (submission.deanComment) return `Dean: ${submission.deanComment}`;
    if (submission.secretaryComment) return `Secretary: ${submission.secretaryComment}`;
    if (submission.advisorComment) return `Advisor: ${submission.advisorComment}`;
    if (submission.content) return submission.content;
    return "Further information will be displayed here.";
  };
  
  const canRequestGraduation = !submission || 
                               currentSubmissionStatus === "NOT_REQUESTED" || 
                               currentSubmissionStatus === "REJECTED_BY_ADVISOR" ||
                               currentSubmissionStatus === "REJECTED_BY_DEPT" ||
                               currentSubmissionStatus === "REJECTED_BY_DEAN" ||
                               currentSubmissionStatus === "STUDENT_AFFAIRS_REJECTED";

  const requestButtonText = () => {
    if (graduationLoading && canRequestGraduation) return "Submitting...";
    if (currentSubmissionStatus === "REJECTED_BY_ADVISOR" || currentSubmissionStatus === "REJECTED_BY_DEPT" || currentSubmissionStatus === "REJECTED_BY_DEAN" || currentSubmissionStatus === "STUDENT_AFFAIRS_REJECTED") {
      return "Request Graduation Again";
    }
    return "Request Graduation";
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
      {submissionError && (
         <Alert variant="destructive">
           <XCircle className="h-4 w-4" />
           <AlertDescription>
             <strong>Error Fetching Submission</strong>
             <br />
             {submissionError}
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
              {(submissionLoading && !submission) ? (
                <span className="text-sm text-muted-foreground">Loading status...</span>
              ) : (
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentSubmissionStatus)}
                  <Badge variant={getStatusBadgeVariant(currentSubmissionStatus)}>
                    {getStatusText(currentSubmissionStatus)}
                  </Badge>
                </div>
              )}
            </div>

            {(submission || submissionError || (submissionLoading && !submission)) && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  {displayStatusMessage()}
                </p>
              </div>
            )}

            <div className="flex gap-2 flex-col sm:flex-row">
              {canRequestGraduation && (
                <>
                  <Button 
                    onClick={async () => {
                      await requestGraduation();
                      if (studentProfile?.studentNumber && fetchSubmissionByStudentNumber) {
                        fetchSubmissionByStudentNumber(studentProfile.studentNumber);
                      }
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium flex-grow"
                    disabled={graduationLoading || submissionLoading}
                  >
                    {requestButtonText()}
                  </Button>
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
          initialStudentData={submission || undefined}
        />
      )}
    </div>
  )
}
