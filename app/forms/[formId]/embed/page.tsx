"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { getForm, submitFormEntry } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Shield, Loader2 } from "lucide-react"
import { FormRenderer } from "@/components/forms/FormRenderer"
import { toast } from "sonner"

interface FormField {
  id: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  width: 'full' | 'half' | 'third' | 'two-thirds'
  styling?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
    fontSize?: string
    padding?: string
  }
}

interface EmbeddingSettings {
  allowedOrigins?: string[]
  requireOrigin?: boolean
}

interface Form {
  id: string
  title: string
  description?: string
  fields: FormField[]
  settings: {
    allowMultipleSubmissions: boolean
    requireEmail: boolean
    showProgressBar: boolean
    submitButtonText: string
  }
  styling: {
    backgroundColor: string
    textColor: string
    primaryColor: string
    fontFamily: string
    borderRadius: string
  }
  embedding?: EmbeddingSettings
  _count: {
    entries: number
  }
}

export default function EmbedFormPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const formId = params.formId as string
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [originError, setOriginError] = useState<string | null>(null)

  useEffect(() => {
    fetchForm()
  }, [formId])

  // Validate origin when form loads
  useEffect(() => {
    if (form?.embedding) {
      validateOrigin()
    }
  }, [form])

  const validateOrigin = () => {
    if (!form?.embedding) return

    const embeddingSettings = form.embedding
    const referrer = document.referrer
    const origin = searchParams.get('origin')
    
    // If origin restrictions are enabled, validate the origin
    if (embeddingSettings.requireOrigin && embeddingSettings.allowedOrigins?.length) {
      const allowedOrigins = embeddingSettings.allowedOrigins
      const currentOrigin = origin || (referrer ? new URL(referrer).origin : null)
      
      if (!currentOrigin) {
        setOriginError('Origin validation failed: No origin provided')
        return
      }

      const isAllowed = allowedOrigins.some(allowedOrigin => {
        // Support wildcard subdomains
        if (allowedOrigin.startsWith('*.')) {
          const domain = allowedOrigin.substring(2)
          return currentOrigin.endsWith(domain)
        }
        return currentOrigin === allowedOrigin
      })

      if (!isAllowed) {
        setOriginError(`Origin validation failed: ${currentOrigin} is not in the allowed list`)
        return
      }
    }

    setOriginError(null)
  }

  // Auto-resize iframe to fit content exactly
  useEffect(() => {
    const resizeIframe = () => {
      if (window.parent !== window) {
        const height = document.body.scrollHeight
        window.parent.postMessage({ type: 'resize', height }, '*')
      }
    }

    // Resize after form loads
    if (form && !loading) {
      setTimeout(resizeIframe, 100)
    }

    // Resize after submission
    if (submitted) {
      setTimeout(resizeIframe, 100)
    }

    // Listen for window resize
    window.addEventListener('resize', resizeIframe)
    return () => window.removeEventListener('resize', resizeIframe)
  }, [form, loading, submitted])


  const fetchForm = async () => {
    try {
      const formData = await getForm(formId)
      setForm(formData)
    } catch (err) {
      setError('Failed to load form')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: Record<string, any>) => {
    setSubmitting(true)
    try {
      await submitFormEntry(formId, formData)
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting form:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to submit form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">{error || 'The form you are looking for does not exist or has been deactivated.'}</p>
        </div>
      </div>
    )
  }

  if (originError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-4">{originError}</p>
          <p className="text-sm text-gray-500">
            This form has embedding restrictions. Please contact the form owner for access.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {form.thankYouPage?.icon || '🎉'}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {form.thankYouPage?.title || 'Thank You!'}
          </h1>
          <p className="text-gray-600 mb-6">
            {form.thankYouPage?.text || 'Your form has been submitted successfully.'}
          </p>
          {form.settings?.allowMultipleSubmissions && (
            <Button onClick={() => window.location.reload()} variant="outline">
              Submit Another Response
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <FormRenderer
      form={form}
      onSubmit={handleSubmit}
      submitting={submitting}
      showHeader={false}
      className="p-6"
    />
  )
}
