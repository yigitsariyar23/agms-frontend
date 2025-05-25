"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useEffect } from "react"

interface ErrorDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message: string
}

export function ErrorDialog({ isOpen, onOpenChange, title = "Error", message }: ErrorDialogProps) {
  // Debug logging
  useEffect(() => {
    console.log("ErrorDialog state:", { isOpen, title, message });
  }, [isOpen, title, message]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#FFFFFF] dark:bg-[#3E3E3E] border-[#DCD9E4] dark:border-[#4A4A4A]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#E57373] dark:text-[#F4C7C7]">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-left text-[#6D6D6D] dark:text-[#A9A9A9]">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="border-[#DCD9E4] dark:border-[#4A4A4A] text-[#2E2E2E] dark:text-[#F4F2F9] hover:bg-[#F4F2F9] dark:hover:bg-[#4A4A4A]">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 