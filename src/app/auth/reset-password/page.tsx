"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

// Temporary mock function to simulate API call
const mockValidateToken = async (token: string): Promise<{ valid: boolean }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  // For testing, consider any non-empty token as valid
  return { valid: token.length > 0 }
}

const mockResetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    success: true,
    message: "Password has been reset successfully. You can now login with your new password."
  }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Password validation regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false)
        setIsTokenValid(false)
        return
      }

      try {
        const result = await mockValidateToken(token)
        setIsTokenValid(result.valid)
      } catch (error) {
        console.error("Token validation error:", error)
        setIsTokenValid(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password requirements
    if (!passwordRegex.test(newPassword)) {
      setError("Password must be at least 8 characters and include lowercase, uppercase, number, and special character")
      return
    }

    setIsLoading(true)
    try {
      const result = await mockResetPassword(token!, newPassword)
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

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Link Expired</CardTitle>
            <CardDescription className="text-center">
              This password reset link has expired or is invalid. Please request a new password reset link.
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
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters and include lowercase, uppercase, number, and special character
              </p>
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