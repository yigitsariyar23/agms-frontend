"use client"

import { useState, useEffect, useCallback } from "react"
import { LoginContents } from "./contents/login-contents"
import { ResetPasswordModal } from "./components/ResetPasswordModal"
import { ErrorDialog } from "./components/ErrorDialog"

export default function AuthPage() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string; title?: string }>({
    isOpen: false,
    message: "",
    title: ""
  })

  // Monitor errorDialog state changes
  useEffect(() => {
    console.log("errorDialog state changed:", errorDialog);
  }, [errorDialog]);

  const showErrorDialog = useCallback((message: string, title?: string) => {
    console.log("showErrorDialog called with:", { message, title });
    const newState = { isOpen: true, message, title };
    console.log("Setting errorDialog to:", newState);
    setErrorDialog(newState);
  }, [])

  const closeErrorDialog = useCallback(() => {
    console.log("closeErrorDialog called");
    setErrorDialog({ isOpen: false, message: "", title: "" })
  }, [])

  // Test function to manually trigger error dialog
  const testErrorDialog = () => {
    showErrorDialog("This is a test error message", "Test Error");
  }

  return (
    <div className="min-h-screen bg-[#F4F2F9] dark:bg-[#2E2E2E]">

      <LoginContents 
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onShowError={showErrorDialog}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal 
        isOpen={isResetModalOpen}
        onOpenChange={setIsResetModalOpen}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onOpenChange={(open) => {
          console.log("ErrorDialog onOpenChange called with:", open);
          if (!open) {
            closeErrorDialog();
          }
        }}
        title={errorDialog.title}
        message={errorDialog.message}
      />
    </div>
  )
} 