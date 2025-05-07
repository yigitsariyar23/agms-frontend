"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Loader2 } from "lucide-react"
import StudentDashboard from "./contents/student/dashboard-content"
import AdvisorDashboard from "./contents/advisor/dashboard-content"
import DepartmentSecretaryDashboard from "./contents/department_secretary/dashboard-content"
import DeansOfficeDashboard from "./contents/deans_office/dashboard-content" 
import StudentAffairsDashboard from "./contents/student_affairs/dashboard-content"
import Header from "@/components/shared/header"
import { useUser } from "@/lib/contexts/user-context"
export default function DashboardLayout() {
  const { user, loading } = useAuth()
  const { userProfile } = useUser();
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?tab=login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Render the dashboard based on user role
  const renderDashboard = () => {
    switch (userProfile?.role) {
      case "ROLE_STUDENT":
        return <StudentDashboard />
      case "ROLE_ADVISOR":
        return <AdvisorDashboard />
      case "ROLE_DEPARTMENT_SECRETARY":
        return <DepartmentSecretaryDashboard />
      case "ROLE_DEANS_OFFICE":
        return <DeansOfficeDashboard />
      case "ROLE_STUDENT_AFFAIRS":
        return <StudentAffairsDashboard />
      default:
        return (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Welcome to AGMS</AlertTitle>
            <AlertDescription>Your role-specific dashboard is not available. Please contact support.</AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <div>
      <div className="space-y-6">
        <Header />
        {renderDashboard()}
      </div>
    </div>
  )
}
