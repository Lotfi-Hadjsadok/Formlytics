"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  Settings,
  Save,
  Type,
  Layout,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createForm, updateForm, getForm } from "@/lib/actions"
import { SingleStepFormBuilder } from "./SingleStepFormBuilder"
import { MultiStepFormBuilder } from "./MultiStepFormBuilder"
import { FormPreview } from "./FormPreview"
import { FormStylingSettings } from "./FormStylingSettings"

interface FormField {
  id: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For select, radio, checkbox
  width: 'full' | 'half' | 'third' | 'two-thirds'
  styling?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
    fontSize?: string
    padding?: string
  }
}

interface FormStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

interface FormData {
  title: string
  description: string
  fields: FormField[]
  steps: FormStep[]
  isMultistep: boolean
  formTypeSelected: boolean
  settings: {
    allowMultipleSubmissions: boolean
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
  thankYouPage: {
    icon?: string
    title?: string
    text?: string
  }
}



interface FormBuilderProps {
  formId?: string
  initialData?: FormData
}

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
      showProgressBar: false,
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
            settings: (form.settings as any) || {
              allowMultipleSubmissions: false,
              showProgressBar: false,
              submitButtonText: 'Submit'
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
      // Check if any step has fields
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
      // Prepare the data to save based on form type
      const saveData = {
        title: formData.title,
        description: formData.description,
        isMultistep: formData.isMultistep,
        settings: formData.settings,
        styling: formData.styling,
        thankYouPage: formData.thankYouPage,
        // Only include fields or steps based on form type
        ...(formData.isMultistep 
          ? { steps: formData.steps, fields: undefined }
          : { fields: formData.fields, steps: undefined }
        )
      }

      if (formId) {
        // Update existing form
        const result = await updateForm(formId, saveData)
        router.push('/dashboard')
      } else {
        // Create new form
        const result = await createForm(saveData)
        router.push(`/forms/${result.form.id}`)
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
    <div className="space-y-6">
      {/* Form Header */}
      <Card className="shadow-[0_0_5px_0_rgba(0,0,0,0.1)] border-0 bg-gradient-to-r ">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <Type className="h-5 w-5 mr-2 text-blue-600" />
            Form Details
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Configure your form's basic information</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Form Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter form title"
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter form description (optional)"
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Type Selection */}
      {!formData.formTypeSelected && (
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <Layout className="h-5 w-5 mr-2 text-blue-600" />
              Choose Form Type
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Select how you want to structure your form</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Normal Form */}
              <div 
                className="p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  formTypeSelected: true, 
                  isMultistep: false 
                }))}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Layout className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Normal Form</h3>
                    <p className="text-sm text-gray-600">
                      Create a single-page form with all fields visible at once. Perfect for shorter forms and quick data collection.
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>All fields on one page</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Simple and straightforward</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Quick to complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multistep Form */}
              <div 
                className="p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all duration-200 group"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  formTypeSelected: true, 
                  isMultistep: true 
                }))}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Layout className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Multistep Form</h3>
                    <p className="text-sm text-gray-600">
                      Break your form into multiple steps or pages. Great for longer forms and better user experience.
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>Multiple steps/pages</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>Progress tracking</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>Better for long forms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Fields */}
      {formData.formTypeSelected && (
        formData.isMultistep ? (
          <MultiStepFormBuilder 
            steps={formData.steps}
            onStepsChange={(steps) => setFormData(prev => ({ ...prev, steps, isMultistep: steps.length > 0 }))}
          />
        ) : (
          <SingleStepFormBuilder 
            fields={formData.fields}
            onFieldsChange={(fields) => setFormData(prev => ({ ...prev, fields }))}
          />
        )
      )}


      {/* Form Styling */}
      {formData.formTypeSelected && (
        <FormStylingSettings 
          styling={formData.styling}
          onStylingChange={(styling) => setFormData(prev => ({ ...prev, styling }))}
        />
      )}

      {/* Thank You Page Settings */}
      {formData.formTypeSelected && (
        <Card className="shadow-sm border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-orange-600" />
            Thank You Page
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Customize what users see after submitting the form</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Thank You Icon (Emoji)</Label>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                {formData.thankYouPage.icon || '🎉'}
              </div>
              <Input
                value={formData.thankYouPage.icon || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  thankYouPage: { ...prev.thankYouPage, icon: e.target.value }
                }))}
                placeholder="🎉"
                maxLength={2}
                className="h-12 text-lg"
              />
            </div>
            <p className="text-xs text-gray-500">Enter an emoji to display on the thank you page</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Thank You Title</Label>
            <Input
              value={formData.thankYouPage.title || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                thankYouPage: { ...prev.thankYouPage, title: e.target.value }
              }))}
              placeholder="Thank you!"
              className="h-12 text-lg"
            />
            <p className="text-xs text-gray-500">Custom title for the thank you page</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Thank You Message</Label>
            <Textarea
              value={formData.thankYouPage.text || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                thankYouPage: { ...prev.thankYouPage, text: e.target.value }
              }))}
              placeholder="Your form has been submitted successfully. We'll get back to you soon!"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">Custom message to show after form submission</p>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Form Preview */}
      {formData.formTypeSelected && (
        <FormPreview formData={formData} />
      )}

      {/* Form Settings */}
      {formData.formTypeSelected && (
        <Card className="shadow-sm border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-gray-600" />
            Form Settings
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Configure form behavior and submission options</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Submit Button Text</Label>
            <Input
              value={formData.settings.submitButtonText}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, submitButtonText: e.target.value }
              }))}
              placeholder="Submit"
              className="h-12"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="allowMultipleSubmissions"
                checked={formData.settings.allowMultipleSubmissions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, allowMultipleSubmissions: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <Label htmlFor="allowMultipleSubmissions" className="text-sm font-medium text-gray-700">
                  Allow multiple submissions
                </Label>
                <p className="text-xs text-gray-500">Users can submit the form multiple times</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="showProgressBar"
                checked={formData.settings.showProgressBar && formData.isMultistep}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, showProgressBar: e.target.checked }
                }))}
                disabled={!formData.isMultistep}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <div>
                <Label htmlFor="showProgressBar" className="text-sm font-medium text-gray-700">
                  Show progress bar
                </Label>
                <p className="text-xs text-gray-500">
                  {formData.isMultistep 
                    ? "Display completion progress to users (only available for multistep forms)"
                    : "Enable multistep form to use progress bar"
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Actions */}
      {formData.formTypeSelected && (
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="h-12 px-8"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : (formId ? 'Update Form' : 'Save Form')}
        </Button>
        </div>
      )}
    </div>
  )
}
