"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Save,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createForm, updateForm, getForm } from "@/lib/actions"
import { FormField, FormStep, FormData, FormBuilderProps } from "@/lib/types"
import { DraggableFormBuilder } from "./DraggableFormBuilder"

export function FormBuilder({ formId, initialData }: FormBuilderProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(initialData || {
    title: '',
    description: '',
    fields: [],
    steps: [],
    isMultistep: false,
    formTypeSelected: false,
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      stepUI: 'numbers' as const,
      submitButtonText: 'Submit'
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      primaryColor: '#3b82f6',
      fontFamily: 'var(--font-inter)',
      borderRadius: '8px'
    },
    thankYouPage: {
      icon: '',
      title: '',
      text: ''
    },
    errorPage: {
      icon: '⚠️',
      title: 'Submission Not Allowed',
      text: 'You have already submitted this form. Multiple submissions are not allowed.'
    }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(!!formId)

  // Load form data when editing
  useEffect(() => {
    if (formId && !initialData) {
      const fetchForm = async () => {
        try {
          const form = await getForm(formId)
          const isMultistep = (form.isMultistep as boolean) || false
          
          setFormData({
            title: form.title,
            description: form.description || '',
            fields: isMultistep ? [] : ((form.fields as any[]) || []),
            settings: {
              allowMultipleSubmissions: (form.settings as any)?.allowMultipleSubmissions || false,
              showProgressBar: (form.settings as any)?.showProgressBar !== false,
              stepUI: (form.settings as any)?.stepUI || 'numbers',
              submitButtonText: (form.settings as any)?.submitButtonText || 'Submit'
            },
            steps: isMultistep ? ((form.steps as any[]) || []) : [],
            isMultistep: isMultistep,
            formTypeSelected: true,
            styling: (form.styling as any) || {
              backgroundColor: '#ffffff',
              textColor: '#000000',
              primaryColor: '#3b82f6',
              fontFamily: 'var(--font-inter)',
              borderRadius: '8px'
            },
            thankYouPage: (form.thankYouPage as any) || {
              icon: '',
              title: '',
              text: ''
            },
            errorPage: (form.errorPage as any) || {
              icon: '⚠️',
              title: 'Submission Not Allowed',
              text: 'You have already submitted this form. Multiple submissions are not allowed.'
            }
          })
        } catch (error) {
          console.error('Error loading form:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchForm()
    } else {
      setIsLoading(false)
    }
  }, [formId, initialData])

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a form title')
      return
    }

    // Validate form structure based on type
    if (formData.isMultistep) {
      if (!formData.steps || formData.steps.length === 0) {
        toast.error('Multistep forms must have at least one step')
        return
      }
      const hasFields = formData.steps.some(step => step.fields && step.fields.length > 0)
      if (!hasFields) {
        toast.error('At least one step must have fields')
        return
      }
    } else {
      if (!formData.fields || formData.fields.length === 0) {
        toast.error('Single-step forms must have at least one field')
        return
      }
    }

    setIsSaving(true)
    try {
      const saveData = {
        title: formData.title,
        description: formData.description,
        isMultistep: formData.isMultistep,
        settings: formData.settings,
        styling: formData.styling,
        thankYouPage: formData.thankYouPage,
        errorPage: formData.errorPage,
        ...(formData.isMultistep 
          ? { steps: formData.steps, fields: undefined }
          : { fields: formData.fields, steps: undefined }
        )
      }

      if (formId) {
        const result = await updateForm(formId, saveData)
        router.push('/dashboard')
      } else {
        const result = await createForm(saveData)
        router.push(`/form-builder/${result.form.id}/edit`)
      }
    } catch (error) {
      console.error('Error saving form:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save form. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {formId ? 'Edit Form' : 'Create New Form'}
                  </h1>
                  {formData.fields.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border-blue-200">
                      {formData.fields.length} field{formData.fields.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  {formId ? 'Modify your form settings and fields' : 'Build your form with drag and drop'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="h-10 px-4 border-slate-300 hover:border-slate-400 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : (formId ? 'Update Form' : 'Save Form')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Details Section */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4">
        <div className="flex items-center space-x-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700 mb-2 block">Form Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter form title"
                className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700 mb-2 block">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter form description (optional)"
                className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="h-[calc(100vh-140px)]">
        <DraggableFormBuilder
          formData={formData}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  )
}