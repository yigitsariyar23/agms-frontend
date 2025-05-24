import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/contexts/user-context"
import { ViewStudentInfo, StudentInfoProps } from "@/components/student/ViewStudentInfo"
import { DetailedStudentData } from "@/lib/contexts/user-context"
import { Loader2 } from "lucide-react"
import FileUploadCard from "@/components/student/FileUploadCard"

export default function StudentDashboard() {
  const { userProfile, detailedStudentData, loading, loadingDetailedInfo } = useUser();
  
  // Get the graduation status from the user profile or set to "NOT_REQUESTED" as fallback
  const graduationRequestStatus = userProfile?.graduationRequestStatus || "NOT_SUBMITTED";
  // Map backend status to user-friendly display
  const displayStatus = {
    "PENDING": "Processing",
    "APPROVED": "Approved",
    "REJECTED": "Rejected",
    "NOT_REQUESTED": "Not Requested",
    "NOT_SUBMITTED": "Not Submitted"
  }[graduationRequestStatus];
  
  // Determine if we should show the withdraw button (only if status is PENDING)
  const showWithdrawButton = graduationRequestStatus === "PENDING";
  
  // Don't show any button if status is APPROVED
  const showRequestButton = graduationRequestStatus !== "PENDING" && graduationRequestStatus !== "APPROVED";
  
  // Construct studentInfoForView by merging userProfile and detailedStudentData
  const studentInfoForView: StudentInfoProps['student'] | null = userProfile
    ? {
        name: `${userProfile.firstname || ""} ${userProfile.lastname || ""}`.trim(),
        number: userProfile.studentNumber || detailedStudentData?.studentNumber || "N/A",
        email: userProfile.email,
        department: detailedStudentData?.department || userProfile.department || "N/A",
        advisor: detailedStudentData?.advisor?.firstName && detailedStudentData?.advisor?.lastName 
                  ? `${detailedStudentData.advisor.firstName} ${detailedStudentData.advisor.lastName}` 
                  : userProfile.advisor || "N/A",
        gpa: detailedStudentData?.gpa ?? userProfile.gpa,
        credits: detailedStudentData?.totalCredit ?? userProfile.creditsCompleted,
        semester: detailedStudentData?.semester ?? userProfile.semester,
        graduationStatus: displayStatus,
      }
    : null;
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      
      {/* Display Student Information */}
      {loadingDetailedInfo && !detailedStudentData && (
        <div className="mb-8 flex items-center justify-center p-4">
           <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> 
           <span className="ml-2 text-muted-foreground">Loading detailed information...</span>
        </div>
      )}
      {studentInfoForView && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Information</h2>
          <ViewStudentInfo student={studentInfoForView} />
        </section>
      )}
      {!studentInfoForView && !loading && (
         <p className="mb-8 text-muted-foreground">Could not load student information.</p>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg sm:text-xl">Graduation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-base mb-4">Current Status: <span className="font-medium">{displayStatus}</span></div>
            {showWithdrawButton ? (
              <Button 
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium"
              >
                Withdraw Request
              </Button>
            ) : showRequestButton && (
              <Button 
                className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2 text-sm font-medium"
              >
                Request Graduation
              </Button>
            )}
          </CardContent>
        </Card>
        <FileUploadCard />
      </div>
    </div>
  )
} 