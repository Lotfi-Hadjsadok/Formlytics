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
  Loader2,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createForm, updateForm, getForm } from "@/lib/actions"
import { SingleStepFormBuilder } from "./SingleStepFormBuilder"
import { MultiStepFormBuilder } from "./MultiStepFormBuilder"
import { FormPreview } from "./FormPreview"
import { FormStylingSettings } from "./FormStylingSettings"
import { Collapsible } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { FormField, FormStep, FormData, FormBuilderProps, FormPreset, formPresets } from "@/lib/types"

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
  const [showPresets, setShowPresets] = useState(!formId && !initialData)

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
              showProgressBar: (form.settings as any)?.showProgressBar !== false, // Default to true unless explicitly false
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

  const applyPreset = (preset: FormPreset) => {
    setFormData({
      title: preset.title,
      description: preset.formDescription,
      fields: preset.fields || [],
      steps: preset.steps || [],
      isMultistep: preset.isMultistep,
      formTypeSelected: true,
      settings: preset.settings,
      styling: preset.styling,
      thankYouPage: preset.thankYouPage,
      errorPage: preset.errorPage || { icon: '', title: '', text: '' }
    })
    setShowPresets(false)
  }

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
        errorPage: formData.errorPage,
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
      <Collapsible
        title="Form Details"
        description="Configure your form's basic information"
        icon={<Type className="h-5 w-5 text-blue-600" />}
        defaultOpen={true}
      >
        <div className="space-y-6">
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
        </div>
      </Collapsible>

      {/* Form Presets */}
      {showPresets && (
        <Collapsible
          title="Choose a Template"
          description="Start with a pre-built form template or create from scratch"
          icon={<Layout className="h-5 w-5 text-purple-600" />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            {/* Single-step presets */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📄</span>
                Single-Step Forms
                <span className="ml-2 text-sm font-normal text-gray-500">({formPresets.filter(p => p.category === 'single-step').length} templates)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formPresets.filter(preset => preset.category === 'single-step').map((preset) => (
                  <div
                    key={preset.id}
                    className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{preset.icon}</div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Layout className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{preset.name}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{preset.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>{preset.fields?.length || 0} fields</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>Ready to customize</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-step presets */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Multi-Step Forms
                <span className="ml-2 text-sm font-normal text-gray-500">({formPresets.filter(p => p.category === 'multi-step').length} templates)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formPresets.filter(preset => preset.category === 'multi-step').map((preset) => (
                  <div
                    key={preset.id}
                    className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{preset.icon}</div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Layout className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{preset.name}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{preset.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                        <span>{preset.steps?.length || 0} steps</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>Progress tracking</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start from scratch option */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Layout className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Start from Scratch</h3>
                <p className="text-gray-600 mb-4">Create a custom form with your own fields and design</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPresets(false)}
                  className="border-dashed border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Create Custom Form
                </Button>
              </div>
            </div>
          </div>
        </Collapsible>
      )}

      {/* Form Type Selection */}
      {!formData.formTypeSelected && !showPresets && (
        <Collapsible
          title="Choose Form Type"
          description="Select how you want to structure your form"
          icon={<Layout className="h-5 w-5 text-blue-600" />}
          defaultOpen={true}
        >
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
        </Collapsible>
      )}

      {/* Form Fields */}
      {formData.formTypeSelected && (
        <Collapsible
          title={formData.isMultistep ? "Form Steps" : "Form Fields"}
          description={formData.isMultistep ? "Organize your form into steps for better user experience" : "Build your form by adding and configuring fields"}
          icon={<Layout className="h-5 w-5 text-green-600" />}
          defaultOpen={true}
        >
          {/* Back to Templates Button */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Using a Template?</h4>
                <p className="text-xs text-gray-500 mt-1">You can switch to a different template or start over</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPresets(true)}
                className="text-gray-600 hover:text-blue-600"
              >
                <Layout className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
            </div>
          </div>
          {formData.isMultistep ? (
            <MultiStepFormBuilder 
              steps={formData.steps}
              onStepsChange={(steps) => setFormData(prev => ({ ...prev, steps, isMultistep: steps.length > 0 }))}
            />
          ) : (
            <SingleStepFormBuilder 
              fields={formData.fields}
              onFieldsChange={(fields) => setFormData(prev => ({ ...prev, fields }))}
            />
          )}
        </Collapsible>
      )}


      {/* Form Styling */}
      {formData.formTypeSelected && (
        <Collapsible
          title="Form Styling"
          description="Customize the appearance of your form"
          icon={<Settings className="h-5 w-5 text-purple-600" />}
          defaultOpen={true}
        >
          <FormStylingSettings 
            styling={formData.styling}
            onStylingChange={(styling) => setFormData(prev => ({ ...prev, styling }))}
          />
        </Collapsible>
      )}

      {/* Thank You Page Settings */}
      {formData.formTypeSelected && (
        <Collapsible
          title="Thank You Page"
          description="Customize what users see after submitting the form"
          icon={<Settings className="h-5 w-5 text-orange-600" />}
          defaultOpen={true}
        >
          <div className="space-y-6">
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
          </div>
        </Collapsible>
      )}

      {/* Error Page Settings - Only show if multiple submissions are disabled */}
      {formData.formTypeSelected && !formData.settings.allowMultipleSubmissions && (
        <Collapsible
          title="Error Page Settings"
          description="Customize the error page shown when multiple submissions are not allowed"
          icon={<AlertCircle className="h-5 w-5 text-red-600" />}
          defaultOpen={false}
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Error Icon (Emoji)</Label>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {formData.errorPage.icon || '⚠️'}
                </div>
                <Input
                  value={formData.errorPage.icon || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    errorPage: { ...prev.errorPage, icon: e.target.value }
                  }))}
                  placeholder="⚠️"
                  maxLength={2}
                  className="h-12 text-lg"
                />
              </div>
              <p className="text-xs text-gray-500">Enter an emoji to display on the error page</p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Error Title</Label>
              <Input
                value={formData.errorPage.title || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  errorPage: { ...prev.errorPage, title: e.target.value }
                }))}
                placeholder="Submission Not Allowed"
                className="h-12 text-lg"
              />
              <p className="text-xs text-gray-500">Custom title for the error page</p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Error Message</Label>
              <Textarea
                value={formData.errorPage.text || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  errorPage: { ...prev.errorPage, text: e.target.value }
                }))}
                placeholder="You have already submitted this form. Multiple submissions are not allowed."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">Custom message to show when submission is blocked</p>
            </div>
          </div>
        </Collapsible>
      )}

      {/* Form Preview */}
      {formData.formTypeSelected && (
        <Collapsible
          title="Form Preview"
          description="Preview how your form will look to users"
          icon={<Layout className="h-5 w-5 text-blue-600" />}
          defaultOpen={true}
        >
          <FormPreview formData={formData} />
        </Collapsible>
      )}

      {/* Form Settings */}
      {formData.formTypeSelected && (
        <Collapsible
          title="Form Settings"
          description="Configure form behavior and submission options"
          icon={<Settings className="h-5 w-5 text-gray-600" />}
          defaultOpen={true}
        >
          <div className="space-y-6">
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
                <Switch
                  id="allowMultipleSubmissions"
                  checked={formData.settings.allowMultipleSubmissions}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, allowMultipleSubmissions: checked }
                  }))}
                />
                <div>
                  <Label htmlFor="allowMultipleSubmissions" className="text-sm font-medium text-gray-700">
                    Allow multiple submissions
                  </Label>
                  <p className="text-xs text-gray-500">Users can submit the form multiple times</p>
                </div>
              </div>

              {/* Progress bar settings - only show for multi-step forms */}
              {formData.isMultistep && (
                <>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Switch
                      id="showProgressBar"
                      checked={formData.settings.showProgressBar !== false}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, showProgressBar: checked }
                      }))}
                    />
                    <div>
                      <Label htmlFor="showProgressBar" className="text-sm font-medium text-gray-700">
                        Show progress bar
                      </Label>
                      <p className="text-xs text-gray-500">
                        Display completion progress to users and configure step progress style
                      </p>
                    </div>
                  </div>

                  {/* Step UI Configuration - Show when progress bar is enabled */}
                  {formData.settings.showProgressBar && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Step Progress Style</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'numbers', label: 'Numbers', description: '1, 2, 3...' },
                          { value: 'letters', label: 'Letters', description: 'A, B, C...' },
                          { value: 'percentage', label: 'Percentage', description: 'Step 1 of 3 (33%)' },
                          { value: 'bar', label: 'Simple Bar', description: 'Progress bar only' }
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.settings.stepUI === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, stepUI: option.value as any }
                            }))}
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="stepUI"
                                value={option.value}
                                checked={formData.settings.stepUI === option.value}
                                onChange={() => {}}
                                className="w-4 h-4 text-blue-600"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-700">{option.label}</div>
                                <div className="text-xs text-gray-500">{option.description}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Collapsible>
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
