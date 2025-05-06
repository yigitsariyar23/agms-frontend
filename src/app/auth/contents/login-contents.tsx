"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface LoginContentsProps {
  onOpenResetModal: () => void
}

export function LoginContents({ onOpenResetModal }: LoginContentsProps) {
  const router = useRouter()
  const { login } = useAuth()

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginIsLoading, setLoginIsLoading] = useState(false)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginIsLoading(true)
    try {
      const result = await login(loginEmail, loginPassword)
      if (result.success) {
        router.push("/dashboard")
      } else {
        setLoginError(result.message)
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("An unexpected error occurred during login")
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
              onChange={(e) => setLoginEmail(e.target.value)} 
              required 
            />
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
