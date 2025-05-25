"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"


const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newPassword: newPassword,
        token: token
      }),
    })

    let data;
    try {
      data = await response.json()
    } catch {
      return { 
        success: false, 
        message: "New password must be different from the old password"
      }
    }
    
    if (response.ok) {
      return { 
        success: true, 
        message: data.message || "Password has been reset successfully. Redirecting to login..."
      }
    } else {
      return { 
        success: false, 
        message: data.message || "Failed to reset password. Please try again."
      }
    }
  } catch (error) {
    console.error("Reset password error:", error)
    throw error
  }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const tokenValid = !!token

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Password validation regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Confirm Password do not match")
      return
    }

    // Validate password requirements
    if (!passwordRegex.test(newPassword)) {
      setError("Password must meet complexity requirements (min.8 character, at least one lower case, one upper case, one number and one special character)")
      return
    }

    if (!token) {
      setError("Reset token is missing")
      return
    }

    setIsLoading(true)
    try {
      const result = await resetPassword(token, newPassword)
      if (result.success) {
        setSuccess(result.message)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth")
        }, 3000)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setError("An error occurred while resetting your password")
    } finally {
      setIsLoading(false)
    }
  }

  // if (isValidating) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
  //       <Card className="w-full max-w-md">
  //         <CardContent className="flex items-center justify-center py-8">
  //           <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  if (!tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F2F9] dark:bg-[#2E2E2E] px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#3E3E3E] border-[#DCD9E4] dark:border-[#4A4A4A]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-[#2E2E2E] dark:text-[#F4F2F9]">Invalid Session</CardTitle>
            <CardDescription className="text-center text-[#6D6D6D] dark:text-[#A9A9A9]">
              This password reset link is invalid or has expired. Please request a new password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/auth")} className="bg-[#5B3E96] hover:bg-[#49317A] dark:bg-[#7A5FB8] dark:hover:bg-[#5B3E96] text-white">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F2F9] dark:bg-[#2E2E2E] px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#3E3E3E] border-[#DCD9E4] dark:border-[#4A4A4A]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#2E2E2E] dark:text-[#F4F2F9]">Reset Password</CardTitle>
          <CardDescription className="text-[#6D6D6D] dark:text-[#A9A9A9]">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-[#FCE8E8] dark:bg-[#5E2E2E] border-[#E57373] dark:border-[#E57373]">
              <AlertDescription className="text-[#E57373] dark:text-[#F4C7C7]">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mb-4 border-[#3BAE8E] text-[#3BAE8E] bg-[#E3F6F1] dark:bg-[#2C4A42] dark:text-[#A5DBCB]">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[#2E2E2E] dark:text-[#F4F2F9]">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-[#FFFFFF] dark:bg-[#3E3E3E] border-[#DCD9E4] dark:border-[#4A4A4A] text-[#2E2E2E] dark:text-[#F4F2F9] focus:ring-[#5B3E96] dark:focus:ring-[#937DC7]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[#2E2E2E] dark:text-[#F4F2F9]">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[#FFFFFF] dark:bg-[#3E3E3E] border-[#DCD9E4] dark:border-[#4A4A4A] text-[#2E2E2E] dark:text-[#F4F2F9] focus:ring-[#5B3E96] dark:focus:ring-[#937DC7]"
              />
            </div>
            <Button type="submit" className="w-full bg-[#5B3E96] hover:bg-[#49317A] dark:bg-[#7A5FB8] dark:hover:bg-[#5B3E96] text-white disabled:opacity-50" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />Resetting...</> : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 