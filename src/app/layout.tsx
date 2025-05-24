import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { UserProvider } from "@/lib/contexts/user-context"
import { StudentProvider } from "@/lib/contexts/student-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AGMS - Automated Graduation Management System",
  description: "Manage the graduation process efficiently",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.ico/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon.ico/site.webmanifest" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <UserProvider>
            <StudentProvider>
              {children}
            </StudentProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
