import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StudentDashboard() {
  return (
    <div className="space-y-4 translate-x-10">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Graduation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base mb-4">Current Status: <span className="font-medium">Processing</span></div>
            <Button 
              className="bg-red-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 text-sm font-medium"
            >
              Withdraw Request
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 