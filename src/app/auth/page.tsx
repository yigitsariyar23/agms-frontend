"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { LoginContents } from "./contents/login-contents"
import { ResetPasswordModal } from "./components/ResetPasswordModal"

export default function AuthPage() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

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
      <ResetPasswordModal 
        isOpen={isResetModalOpen}
        onOpenChange={setIsResetModalOpen}
      />
    </div>
  )
} 