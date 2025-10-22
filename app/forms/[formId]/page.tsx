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
      await submitFormEntry(formId, formData)
      // Form submission handled by FormRenderer
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit form. Please try again.')
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

        {/* Form */}
        <FormRenderer 
          form={form as any}
          onSubmit={handleFormSubmit}
          submitting={submitting}
          showHeader={false}
        />
      </div>
    </div>
  )
}
