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
    const response = await fetch('http://localhost:8080/api/auth/reset-password', {
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Invalid Session</CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired. Please request a new password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/auth")}>
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mb-4 border-green-500 text-green-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 