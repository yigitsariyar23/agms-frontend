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

  if (loading) {    return (      <div className="flex h-screen items-center justify-center" suppressHydrationWarning>        <Loader2 className="h-8 w-8 animate-spin text-primary" />      </div>    )  }

  if (!isAuthenticated || !user) {
    return null
  }

  // Render the dashboard based on user role
  const renderDashboard = () => {
    console.log('User profile:', userProfile); // Debug log
    console.log('User role:', userProfile?.role); // Debug log
    console.log('Basic user:', user); // Debug log
    
    // Use userProfile role if available, otherwise fall back to basic user role
    const currentRole = userProfile?.role || user?.role;
    console.log('Current role being used:', currentRole); // Debug log
    
    switch (currentRole) {
      case "STUDENT":
      case "ROLE_STUDENT":
        return (
          <ErrorBoundary>
            <StudentDashboard />
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
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Welcome to AGMS</AlertTitle>
            <AlertDescription>Your role-specific dashboard is not available. Please contact support.</AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {renderDashboard()}
      </main>
    </div>
  )
}
