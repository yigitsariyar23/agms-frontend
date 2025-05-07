import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/contexts/user-context"

export default function StudentDashboard() {
  const { userProfile } = useUser();
  
  // Get the graduation status from the user profile or set to "NOT_REQUESTED" as fallback
  const graduationStatus = userProfile?.graduationRequestStatus || "NOT_SUBMITTED";
  // Map backend status to user-friendly display
  const displayStatus = {
    "PENDING": "Processing",
    "APPROVED": "Approved",
    "REJECTED": "Rejected",
    "NOT_REQUESTED": "Not Requested",
    "NOT_SUBMITTED": "Not Submitted"
  }[graduationStatus];
  
  // Determine if we should show the withdraw button (only if status is PENDING)
  const showWithdrawButton = graduationStatus === "PENDING";
  
  // Don't show any button if status is APPROVED
  const showRequestButton = graduationStatus !== "PENDING" && graduationStatus !== "APPROVED";
  
  return (
    <div className="space-y-4 translate-x-10">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Graduation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base mb-4">Current Status: <span className="font-medium">{displayStatus}</span></div>
            {showWithdrawButton ? (
              <Button 
                className="bg-red-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 text-sm font-medium"
              >
                Withdraw Request
              </Button>
            ) : showRequestButton && (
              <Button 
                className="bg-black hover:bg-gray-800 text-white rounded-md px-4 py-2 text-sm font-medium"
              >
                Request Graduation
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 