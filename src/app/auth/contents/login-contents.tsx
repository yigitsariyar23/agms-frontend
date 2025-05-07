"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface LoginContentsProps {
  onOpenResetModal: () => void
}

export function LoginContents({ onOpenResetModal }: LoginContentsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginIsLoading, setLoginIsLoading] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState("/dashboard")
  const [emailError, setEmailError] = useState("")
  
  // Get the callback URL from search params (set by middleware when redirecting)
  useEffect(() => {
    const callback = searchParams.get("callbackUrl")
    if (callback) {
      setCallbackUrl(callback)
    }
  }, [searchParams])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    
    // Validate email domain
    const validDomains = ["@iyte.edu.tr", "@std.iyte.edu.tr"]
    const isValidEmail = validDomains.some(domain => loginEmail.endsWith(domain))
    
    if (!isValidEmail) {
      setEmailError("Invalid email. Please try again.")
      return
    }
    
    setLoginIsLoading(true)
    try {
      const result = await login(loginEmail, loginPassword)
      if (result.success) {
        // Redirect to the callback URL if login is successful
        router.push(callbackUrl)
      } else {
        setLoginError(result.message)
      }
    } catch (error) {
      // Handle network or unexpected errors
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setLoginError("Invalid password. Please try again.")
      } else {
        setLoginError("An unexpected error occurred during login")
      }
    } finally {
      setLoginIsLoading(false)
    }
  }

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
            <Input 
              id="login-email" 
              type="email" 
              placeholder="your.email@iyte.edu.tr" 
              value={loginEmail} 
              onChange={(e) => {
                setLoginEmail(e.target.value);
                setEmailError("");
              }} 
              required 
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && (
              <p className="text-sm text-red-500 mt-1">{emailError}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-sm text-gray-600 hover:text-gray-900" 
                onClick={onOpenResetModal}
              >
                Forgot password?
              </Button>
            </div>
            <Input 
              id="login-password" 
              type="password" 
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)} 
              required 
            />
          </div>
          <Button type="submit" className="w-full" disabled={loginIsLoading}>
            {loginIsLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</> : "Login"}
          </Button>
        </form>
      </CardContent>
    </motion.div>
  )
}
