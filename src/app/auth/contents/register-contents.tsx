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

interface RegisterContentsProps {
  onSwitchView: () => void
}

export function RegisterContents({ onSwitchView }: RegisterContentsProps) {
  const router = useRouter()
  const { register } = useAuth()

  const [registerFirstName, setRegisterFirstName] = useState("")
  const [registerLastName, setRegisterLastName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registerIsLoading, setRegisterIsLoading] = useState(false)

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@(?:std\.iyte\.edu\.tr|iyte\.edu\.tr)$/i
    return emailRegex.test(email)
  }

  const validatePasswordFormat = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
    return passwordRegex.test(password)
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
      const result = await register(registerEmail, registerPassword, `${registerFirstName} ${registerLastName}`)
      if (result.success) {
        router.push("/auth?tab=login")
        onSwitchView()
        // Clear registration form fields
        setRegisterFirstName("")
        setRegisterLastName("")
        setRegisterEmail("")
        setRegisterPassword("")
        setRegisterConfirmPassword("")
      } else {
        setRegisterError(result.message)
      }
    } catch (error) {
      console.error("Registration error:", error)
      setRegisterError("An unexpected error occurred during registration")
    } finally {
      setRegisterIsLoading(false)
    }
  }

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
            <Label htmlFor="register-firstName">First Name</Label>
            <Input 
              id="register-firstName" 
              value={registerFirstName} 
              onChange={(e) => setRegisterFirstName(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-lastName">Last Name</Label>
            <Input 
              id="register-lastName" 
              value={registerLastName} 
              onChange={(e) => setRegisterLastName(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input 
              id="register-email" 
              type="email" 
              placeholder="your.email@iyte.edu.tr" 
              value={registerEmail} 
              onChange={(e) => setRegisterEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input 
              id="register-password" 
              type="password" 
              value={registerPassword} 
              onChange={(e) => setRegisterPassword(e.target.value)} 
              required 
            />
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters and include lowercase, uppercase, number, and special character.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-confirmPassword">Confirm Password</Label>
            <Input 
              id="register-confirmPassword" 
              type="password" 
              value={registerConfirmPassword} 
              onChange={(e) => setRegisterConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          <Button type="submit" className="w-full" disabled={registerIsLoading}>
            {registerIsLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registering...</> : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="w-full text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto font-medium text-primary hover:underline" 
            onClick={onSwitchView}
          >
            Login
          </Button>
        </p>
      </CardFooter>
    </motion.div>
  )
}
