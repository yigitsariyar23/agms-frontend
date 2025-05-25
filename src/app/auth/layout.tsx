"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F2F9] dark:bg-[#2E2E2E]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5B3E96]" />
      </div>
    )
  }
  return (
    <div>
    {children}
    </div>
  )
}
