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
      <DialogContent className="sm:max-w-[425px] bg-[#FFFFFF] dark:bg-[#3E3E3E] border-[#DCD9E4] dark:border-[#4A4A4A]">
        <DialogHeader>
          <DialogTitle className="text-[#2E2E2E] dark:text-[#F4F2F9]">Reset Password</DialogTitle>
          <DialogDescription className="text-[#6D6D6D] dark:text-[#A9A9A9]">
            Enter your IYTE email address below. If an account exists, we&apos;ll send you instructions to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleResetModalSubmit} className="space-y-4 py-4">
          {resetError && (
            <Alert variant="destructive" className="mb-4 bg-[#FCE8E8] dark:bg-[#5E2E2E] border-[#E57373] dark:border-[#E57373]">
              <AlertDescription className="text-[#E57373] dark:text-[#F4C7C7]">{resetError}</AlertDescription>
            </Alert>
          )}
          {resetMessage && (
            <Alert variant="default" className="mb-4 border-[#3BAE8E] text-[#3BAE8E] bg-[#E3F6F1] dark:bg-[#2C4A42] dark:text-[#A5DBCB]">
              <AlertDescription>{resetMessage}</AlertDescription>
            </Alert>
          )}
          {!resetMessage && (
            <div className="space-y-2">
              <Label htmlFor="reset-modal-email" className="text-[#2E2E2E] dark:text-[#F4F2F9]">Email</Label>
              <Input 
                id="reset-modal-email" 
                type="email" 
                placeholder="your.email@iyte.edu.tr" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                required 
                className="bg-[#FFFFFF] dark:bg-[#3E3E3E] border-[#DCD9E4] dark:border-[#4A4A4A] text-[#2E2E2E] dark:text-[#F4F2F9] focus:ring-[#5B3E96] dark:focus:ring-[#937DC7]"
              />
              <p className="text-xs text-[#6D6D6D] dark:text-[#A9A9A9]">
                Please use your IYTE email address (@iyte.edu.tr or @std.iyte.edu.tr)
              </p>
            </div>
          )}
          <DialogFooter>
            {resetMessage ? (
              <DialogClose asChild>
                <Button type="button" className="bg-[#5B3E96] hover:bg-[#49317A] dark:bg-[#7A5FB8] dark:hover:bg-[#5B3E96] text-white">Close</Button>
              </DialogClose>
            ) : (
              <Button type="submit" disabled={resetIsLoading} className="bg-[#5B3E96] hover:bg-[#49317A] dark:bg-[#7A5FB8] dark:hover:bg-[#5B3E96] text-white disabled:opacity-50">
                {resetIsLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />Sending...</> : "Send Instructions"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 