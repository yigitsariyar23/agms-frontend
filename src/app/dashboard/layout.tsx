"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Loader2 } from "lucide-react"
import StudentDashboard from "./student/dashboard-content"
import AdvisorDashboard from "./advisor/dashboard-content"
import DepartmentSecretaryDashboard from "./department_secretary/dashboard-content"
import DeansOfficeDashboard from "./deans_office/dashboard-content" 
import StudentAffairsDashboard from "./student_affairs/dashboard-content"
import Header from "@/components/header"

export default function DashboardLayout() {
  const { user, loading } = useAuth()
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
    switch (user.role) {
      case "student":
        return <StudentDashboard />
      case "advisor":
        return <AdvisorDashboard />
      case "department_secretary":
        return <DepartmentSecretaryDashboard />
      case "deans_office":
        return <DeansOfficeDashboard />
      case "student_affairs":
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
