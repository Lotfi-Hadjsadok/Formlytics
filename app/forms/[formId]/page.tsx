"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getForm, submitFormEntry } from "@/lib/actions"
import { AlertCircle, Loader2 } from "lucide-react"
import { FormRenderer } from "@/components/forms/FormRenderer"
import { toast } from "sonner"
import { Form } from "@/lib/types"

export default function PublicFormPage() {
  const params = useParams()
  const formId = params.formId as string
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      const formData = await getForm(formId)
      setForm(formData as unknown as Form)
    } catch (err) {
      setError('Failed to load form')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setSubmitting(true)
    try {
      // Fetch client information for security tracking
      let clientInfo = {
        ipAddress: 'unknown',
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
      }
      
      try {
        const response = await fetch('/api/client-info')
        if (response.ok) {
          const info = await response.json()
          clientInfo = { ...clientInfo, ...info }
        }
      } catch (err) {
        console.warn('Could not fetch client IP:', err)
      }
      
      // Collect metadata for security tracking
      const metadata = {
        source: 'public_form',
        ...clientInfo,
        timestamp: new Date().toISOString()
      }
      
      const result = await submitFormEntry(formId, formData, metadata)
      
      if (!result.success) {
        // Show both toast and error page
        toast.error(result.error || "Multiple submissions not allowed for this form")
        // Set error state to show error page
        setShowError(true)
        setErrorMessage(result.error || "Multiple submissions not allowed for this form")
        return
      }
      
      // Form submission handled by FormRenderer
    } catch (error) {
      console.error('Error submitting form:', error)
      // Re-throw the error so FormRenderer can handle it
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">{error || 'The form you are looking for does not exist or has been deactivated.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen py-8"
      style={{ backgroundColor: form.styling?.backgroundColor || '#f9fafb' }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Form Header */}
        <div className="mb-6">
          <div 
            className="bg-white rounded-lg shadow-sm border p-6"
            style={{
          backgroundColor: form.styling?.backgroundColor || '#ffffff',
          color: form.styling?.textColor || '#000000',
          fontFamily: form.styling?.fontFamily || 'var(--font-inter)',
          borderRadius: form.styling?.borderRadius || '8px',
            }}
          >
            <h1 className="text-2xl font-semibold mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
              </div>
            </div>

        {/* Error Page */}
        {showError && (
          <div 
            className="bg-white rounded-lg shadow-sm border p-8"
            style={{
              backgroundColor: form.styling?.backgroundColor || '#ffffff',
              color: form.styling?.textColor || '#000000',
              fontFamily: form.styling?.fontFamily || 'var(--font-inter)',
              borderRadius: form.styling?.borderRadius || '8px',
            }}
          >
            <div className="text-center space-y-6 py-12">
              <div className="text-6xl">
                {form.errorPage?.icon || '⚠️'}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-4">
                  {form.errorPage?.title || 'Submission Not Allowed'}
                </h1>
                <p className="text-lg opacity-75 max-w-2xl mx-auto">
                  {form.errorPage?.text || errorMessage || 'You have already submitted this form. Multiple submissions are not allowed.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!showError && (
          <FormRenderer 
            form={form as any}
            onSubmit={handleFormSubmit}
            submitting={submitting}
            showHeader={false}
            onError={(message) => {
              setShowError(true)
              setErrorMessage(message)
            }}
          />
        )}
      </div>
    </div>
  )
}
