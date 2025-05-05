"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link" // Keep for external links if needed, but internal switching will use buttons
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

// Define the possible main views
type AuthView = "login" | "register"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialView = searchParams.get("tab") === "register" ? "register" : "login" // Default to login

  const [view, setView] = useState<AuthView>(initialView)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  // Effect to update view state if URL changes externally (e.g., back button)
  useEffect(() => {
    const tab = searchParams.get("tab")
    const newView = tab === "register" ? "register" : "login"
    if (newView !== view) {
        setView(newView)
    }
    // Only run when searchParams changes, not view
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- State for all forms (prefix to avoid conflicts) ---
  // Login
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginIsLoading, setLoginIsLoading] = useState(false)

  // Register
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registerIsLoading, setRegisterIsLoading] = useState(false)

  // Reset Password (for modal)
  const [resetEmail, setResetEmail] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetIsLoading, setResetIsLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  // --- Hooks ---
  const { login, register } = useAuth()

  // --- Validation Functions (from register page) ---
  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@(?:std\.iyte\.edu\.tr|iyte\.edu\.tr)$/i
    return emailRegex.test(email)
  }

  const validatePasswordFormat = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
    return passwordRegex.test(password)
  }

  // --- Handlers ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginIsLoading(true)
    try {
      const result = await login(loginEmail, loginPassword)
      if (result.success) {
        router.push("/dashboard") // Redirect to dashboard on successful login
      } else {
        setLoginError(result.message)
      }
    } catch (err) {
      setLoginError("An unexpected error occurred during login")
    } finally {
      setLoginIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")

    if (!validateEmailFormat(registerEmail)) {
        setRegisterError("Email must be a valid @iyte.edu.tr or @std.iyte.edu.tr address.")
        return
    }
    if (registerPassword !== registerConfirmPassword) {
        setRegisterError("Passwords do not match")
        return
    }
    if (!validatePasswordFormat(registerPassword)) {
        setRegisterError("Password must meet the requirements.")
        return
    }

    setRegisterIsLoading(true)
    try {
      const result = await register(registerEmail, registerPassword, registerName)
      if (result.success) {
        // Switch to login view by updating URL
        router.push("/auth?tab=login")
        setView("login") // Update state directly for immediate UI change
        // Clear registration form fields
        setRegisterName("")
        setRegisterEmail("")
        setRegisterPassword("")
        setRegisterConfirmPassword("")
      } else {
        setRegisterError(result.message)
      }
    } catch (err) {
      setRegisterError("An unexpected error occurred during registration")
    } finally {
      setRegisterIsLoading(false)
    }
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResetMessage("If an account exists for this email, reset instructions have been sent.")
        setResetEmail("")
        // Maybe close modal automatically after a delay? Or let user close.
    } catch (err) {
        setResetError("An error occurred while sending reset instructions.")
    } finally {
        setResetIsLoading(false)
    }
  }

  // Function to handle view switching via URL
  const switchView = (newView: AuthView) => {
      router.push(`/auth?tab=${newView}`);
      // setView(newView); // Let useEffect handle state update based on URL change
  }

  // --- Render Logic ---
  const renderForm = () => {
    switch (view) {
      case "register":
        return (
          <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent>
              {registerError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{registerError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="register-name">Full Name</Label>
                   <Input id="register-name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" type="email" placeholder="your.email@iyte.edu.tr" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input id="register-password" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                    <p className="text-xs text-gray-500">Password must be at least 8 characters and include lowercase, uppercase, number, and special character.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                    <Input id="register-confirmPassword" type="password" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={registerIsLoading}>
                  {registerIsLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registering...</> : "Register"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="w-full text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Button variant="link" className="p-0 h-auto font-medium text-primary hover:underline" onClick={() => switchView("login")}>
                  Login
                </Button>
              </p>
            </CardFooter>
          </motion.div>
        )
      case "login":
      default:
        return (
           <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Login to AGMS</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              {loginError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="login-email">Email</Label>
                   <Input id="login-email" type="email" placeholder="your.email@iyte.edu.tr" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <Button type="button" variant="link" className="p-0 h-auto text-sm text-gray-600 hover:text-gray-900" onClick={() => setIsResetModalOpen(true)}>
                            Forgot password?
                        </Button>
                    </div>
                    <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                 </div>
                 <Button type="submit" className="w-full" disabled={loginIsLoading}>
                    {loginIsLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</> : "Login"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="w-full text-center text-sm text-gray-600">
                 Don&apos;t have an account?{" "}
                 <Button variant="link" className="p-0 h-auto font-medium text-primary hover:underline" onClick={() => switchView("register")}>
                   Register
                 </Button>
               </p>
             </CardFooter>
           </motion.div>
        )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-hidden"> {/* Added overflow-hidden for smoother transitions */}
        <AnimatePresence mode="wait"> {/* Use AnimatePresence for transitions */}
          {renderForm()}
        </AnimatePresence>
      </Card>

      {/* Reset Password Modal */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address below. If an account exists, we'll send you instructions to reset your password.
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
             {!resetMessage && ( // Only show form if no success message
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
                {/* Show close button after success message, otherwise show submit */}
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