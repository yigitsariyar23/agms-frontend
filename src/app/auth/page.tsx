"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { LoginContents } from "./contents/login-contents"

// Temporary mock function to simulate API call
const mockResetPasswordRequest = async (email: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate validation
  if (!email.includes('@iyte.edu.tr') && !email.includes('@std.iyte.edu.tr')) {
    return {
      success: false,
      message: "Please use a valid IYTE email address"
    }
  }

  // Simulate successful request
  return {
    success: true,
    message: "If an account exists for this email, reset instructions have been sent."
  }
}

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  // Reset Password (for modal)
  const [resetEmail, setResetEmail] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetIsLoading, setResetIsLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  // Reset modal state when it closes
  useEffect(() => {
    if (!isResetModalOpen) {
      // Clear form state after a short delay to allow for animations
      const timer = setTimeout(() => {
        setResetEmail("")
        setResetError("")
        setResetMessage("")
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isResetModalOpen])

  const handleResetModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetMessage("")
    setResetIsLoading(true)

    try {
      const result = await mockResetPasswordRequest(resetEmail)
      
      if (result.success) {
        setResetMessage(result.message)
        setResetEmail("")
      } else {
        setResetError(result.message)
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setResetError("An error occurred while sending reset instructions.")
    } finally {
      setResetIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-hidden">
        <AnimatePresence mode="wait">
          <LoginContents 
            onOpenResetModal={() => setIsResetModalOpen(true)} 
          />
        </AnimatePresence>
      </Card>

      {/* Reset Password Modal */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your IYTE email address below. If an account exists, we&apos;ll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetModalSubmit} className="space-y-4 py-4">
            {resetError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{resetError}</AlertDescription>
              </Alert>
            )}
            {resetMessage && (
              <Alert variant="default" className="mb-4 border-green-500 text-green-700">
                <AlertDescription>{resetMessage}</AlertDescription>
              </Alert>
            )}
            {!resetMessage && (
              <div className="space-y-2">
                <Label htmlFor="reset-modal-email">Email</Label>
                <Input 
                  id="reset-modal-email" 
                  type="email" 
                  placeholder="your.email@iyte.edu.tr" 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)} 
                  required 
                />
                <p className="text-xs text-gray-500">
                  Please use your IYTE email address (@iyte.edu.tr or @std.iyte.edu.tr)
                </p>
              </div>
            )}
            <DialogFooter>
              {resetMessage ? (
                <DialogClose asChild>
                  <Button type="button">Close</Button>
                </DialogClose>
              ) : (
                <Button type="submit" disabled={resetIsLoading}>
                  {resetIsLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send Instructions"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 