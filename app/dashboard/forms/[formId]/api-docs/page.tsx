"use client"

import { use, useEffect, useState } from "react"
import { FormApiDocumentation } from "@/components/forms/FormApiDocumentation"
import { getForm } from "@/lib/actions"
import { Form } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface ApiDocumentationPageProps {
  params: Promise<{
    formId: string
  }>
}

export default function ApiDocumentationPage({ params }: ApiDocumentationPageProps) {
  const { formId } = use(params)
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formData = await getForm(formId)
        setForm(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [formId])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-gray-600">Loading form documentation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Form not found'}</p>
        </div>
      </div>
    )
  }

  const schema = form.isMultistep ? form.steps : form.fields
  const settings = form.settings as any

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-gray-600 mt-2">
          Programmatic access to submit data to "{form.title}"
        </p>
      </div>
      
      <FormApiDocumentation
        formId={form.id}
        formTitle={form.title}
        formDescription={form.description || undefined}
        isMultistep={form.isMultistep || false}
        schema={schema || []}
        allowMultipleSubmissions={settings?.allowMultipleSubmissions || false}
      />
    </div>
  )
}
