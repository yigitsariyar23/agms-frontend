import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"

interface ResetPasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordModal({ isOpen, onOpenChange }: ResetPasswordModalProps) {
  // Reset Password state
  const [resetEmail, setResetEmail] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetIsLoading, setResetIsLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  const { navigateToResetPasswordRequest } = useAuth()

  // Reset modal state when it closes
  useEffect(() => {
    if (!isOpen) {
      // Clear form state after a short delay to allow for animations
      const timer = setTimeout(() => {
        setResetEmail("")
        setResetError("")
        setResetMessage("")
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleResetModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetMessage("")
    setResetIsLoading(true)

    try {
      const result = await navigateToResetPasswordRequest(resetEmail)
      
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
  )
} 