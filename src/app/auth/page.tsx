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
import { RegisterContents } from "./contents/register-contents"

// Define the possible main views
type AuthView = "login" | "register"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialView = searchParams.get("tab") === "register" ? "register" : "login"

  const [view, setView] = useState<AuthView>(initialView)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  // Reset Password (for modal)
  const [resetEmail, setResetEmail] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetIsLoading, setResetIsLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  // Effect to update view state if URL changes externally (e.g., back button)
  useEffect(() => {
    const tab = searchParams.get("tab")
    const newView = tab === "register" ? "register" : "login"
    if (newView !== view) {
      setView(newView)
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to handle view switching via URL
  const switchView = (newView: AuthView) => {
    router.push(`/auth?tab=${newView}`)
  }

  // Renamed to indicate it's for the modal
  const handleResetModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetMessage("")
    setResetIsLoading(true)
    console.log("Password reset submitted for:", resetEmail)
    // TODO: Implement actual password reset API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResetMessage("If an account exists for this email, reset instructions have been sent.")
      setResetEmail("")
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
          {view === "login" ? (
            <LoginContents 
              onSwitchView={() => switchView("register")} 
              onOpenResetModal={() => setIsResetModalOpen(true)} 
            />
          ) : (
            <RegisterContents 
              onSwitchView={() => switchView("login")} 
            />
          )}
        </AnimatePresence>
      </Card>

      {/* Reset Password Modal */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address below. If an account exists, we&apos;ll send you instructions to reset your password.
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