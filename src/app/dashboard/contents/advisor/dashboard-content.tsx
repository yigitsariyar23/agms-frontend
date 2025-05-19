import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GraduationCap, Info } from "lucide-react"

export default function AdvisorDashboard() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Advisor Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">Pending Requests</CardTitle>
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold mb-1">5</div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Graduation requests awaiting your review
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">Approved Requests</CardTitle>
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold mb-1">12</div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Graduation requests you&apos;ve approved
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">List Status</CardTitle>
            <Info className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold mb-1">Not Finalized</div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your graduation list needs to be finalized
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 