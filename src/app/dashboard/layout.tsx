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
import { GraduationProvider } from "@/lib/contexts/graduation-context"
import { SubmissionProvider } from "@/lib/contexts/submission-context"
import ErrorBoundary from "@/components/ErrorBoundary"

export default function DashboardLayout() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { user, userProfile, loading: userLoading } = useUser();
  const router = useRouter()

  const loading = authLoading || userLoading;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth?tab=login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {    return (      <div className="flex h-screen items-center justify-center bg-[#F4F2F9] dark:bg-[#2E2E2E]" suppressHydrationWarning>        <Loader2 className="h-8 w-8 animate-spin text-[#5B3E96]" />      </div>    )  }

  if (!isAuthenticated || !user) {
    return null
  }

  // Render the dashboard based on user role
  const renderDashboard = () => {
    // Use userProfile role if available, otherwise fall back to basic user role
    const currentRole = userProfile?.role || user?.role;
    
    switch (currentRole) {
      case "STUDENT":
      case "ROLE_STUDENT":
        return (
          <ErrorBoundary>
            <GraduationProvider>
              <SubmissionProvider>
                <StudentDashboard />
              </SubmissionProvider>
            </GraduationProvider>
          </ErrorBoundary>
        )
      case "ADVISOR":
      case "ROLE_ADVISOR":
        return (
          <ErrorBoundary>
            <AdvisorDashboard />
          </ErrorBoundary>
        )
      case "DEPARTMENT_SECRETARY":
      case "ROLE_DEPARTMENT_SECRETARY":
        return (
          <ErrorBoundary>
            <DepartmentSecretaryDashboard />
          </ErrorBoundary>
        )
      case "DEAN_OFFICER":
      case "ROLE_DEANS_OFFICE":
        return (
          <ErrorBoundary>
            <DeansOfficeDashboard />
          </ErrorBoundary>
        )
      case "STUDENT_AFFAIRS":
      case "ROLE_STUDENT_AFFAIRS":
        return (
          <ErrorBoundary>
            <StudentAffairsDashboard />
          </ErrorBoundary>
        )
      default:
        return (
          <Alert className="m-4 bg-[#E3F6F1] dark:bg-[#2C4A42] border-[#3BAE8E] dark:border-[#3BAE8E]">
            <Info className="h-4 w-4 text-[#3BAE8E] dark:text-[#A5DBCB]" />
            <AlertTitle className="text-[#2E2E2E] dark:text-[#F4F2F9]">Welcome to AGMS</AlertTitle>
            <AlertDescription className="text-[#6D6D6D] dark:text-[#A9A9A9]">Your role-specific dashboard is not available. Please contact support.</AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2F9] dark:bg-[#2E2E2E]">
      <Header />
      <main className="flex-1">
        {renderDashboard()}
      </main>
    </div>
  )
}
