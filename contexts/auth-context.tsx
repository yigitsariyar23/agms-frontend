"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  name: string
  role: "student" | "advisor" | "department_secretary" | "deans_office" | "student_affairs"
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // In a real app, this would be an API call to verify the session
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      // In a real app, this would be an API call to authenticate
      // For demo purposes, we'll simulate different user roles based on email
      if (!email.endsWith("@iyte.edu.tr")) {
        return { success: false, message: "Email must be an IYTE email address" }
      }

      if (password.length < 8) {
        return { success: false, message: "Password must be at least 8 characters" }
      }

      // Simulate different user roles based on email prefix
      let role: User["role"] = "student"
      if (email.startsWith("advisor")) {
        role = "advisor"
      } else if (email.startsWith("secretary")) {
        role = "department_secretary"
      } else if (email.startsWith("dean")) {
        role = "deans_office"
      } else if (email.startsWith("affairs")) {
        role = "student_affairs"
      }

      const user = {
        id: Math.random().toString(36).substring(2, 9),
        email,
        name: email.split("@")[0],
        role,
      }

      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))

      return { success: true, message: "Login successful" }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, message: "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)

      // In a real app, this would be an API call to reset password
      if (!email.endsWith("@iyte.edu.tr")) {
        return { success: false, message: "Email must be an IYTE email address" }
      }

      return { success: true, message: "Password reset email sent" }
    } catch (error) {
      console.error("Password reset failed:", error)
      return { success: false, message: "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)

      // In a real app, this would be an API call to register
      if (!email.endsWith("@iyte.edu.tr")) {
        return { success: false, message: "Email must be an IYTE email address" }
      }

      if (password.length < 8) {
        return { success: false, message: "Password must be at least 8 characters" }
      }

      // Check password complexity
      const hasLowerCase = /[a-z]/.test(password)
      const hasUpperCase = /[A-Z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

      if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
        return {
          success: false,
          message:
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
        }
      }

      return { success: true, message: "Registration successful" }
    } catch (error) {
      console.error("Registration failed:", error)
      return { success: false, message: "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, resetPassword, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
