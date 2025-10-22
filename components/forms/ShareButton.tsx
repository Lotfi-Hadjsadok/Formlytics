"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonProps {
  formId: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ShareButton({ 
  formId, 
  className = "", 
  variant = "outline", 
  size = "default" 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyFormLink = async () => {
    try {
      const publicUrl = `${window.location.origin}/forms/${formId}`
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success('Form link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link to clipboard')
    }
  }

  return (
    <Button
      onClick={copyFormLink}
      variant={variant}
      size={size}
      className={className}
    >
      {copied ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          Share Form
        </>
      )}
    </Button>
  )
}
