"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { StepProgressIndicator } from "./StepProgressIndicator"
import { FieldRenderer } from "./FieldRenderer"
import { FormField, FormStep, Form, FormRendererProps } from "@/lib/types"
import { getDeviceStyles } from "@/lib/utils"
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Field Wrapper Component
interface SortableFieldWrapperProps {
  field: FormField
  formData: Record<string, any>
  handleFieldChange: (fieldId: string, value: any) => void
  editMode: boolean
  onFieldSettings?: (field: FormField) => void
  onFieldUpdate?: (fieldId: string, updates: Partial<FormField>) => void
  onFieldDelete?: (fieldId: string) => void
  formStyling: any
  getWidthStyle: (width: string) => any
}

function SortableFieldWrapper({
  field,
  formData,
  handleFieldChange,
  editMode,
  onFieldSettings,
  onFieldUpdate,
  onFieldDelete,
  formStyling,
  getWidthStyle
}: SortableFieldWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...getWidthStyle(field.width)
      }}
      className={`w-full md:w-auto ${isDragging ? 'opacity-50' : ''}`}
    >
      <FieldRenderer
        field={field}
        value={formData[field.id]}
        onChange={(value) => handleFieldChange(field.id, value)}
        editMode={editMode}
        onFieldSettings={onFieldSettings}
        onFieldUpdate={(updates) => onFieldUpdate?.(field.id, updates)}
        onFieldDelete={onFieldDelete}
        formStyling={formStyling}
        dragHandleProps={editMode ? {
          attributes,
          listeners
        } : undefined}
      />
    </div>
  )
}

/**
 * FormRenderer - Renders forms for end users to fill out
 * 
 * @param editMode - When true, shows field settings icons next to field labels
 * @param onFieldSettings - Callback when field settings icon is clicked (only used when editMode=true)
 * 
 * Usage:
 * - For public forms: Use with editMode=false (default)
 * - For form editing: Use with editMode=true and provide onFieldSettings callback
 */
export function FormRenderer({ 
  form, 
  onSubmit, 
  submitting = false, 
  showHeader = true,
  className = "",
  onError,
  editMode = false,
  onFieldSettings,
  onFieldUpdate,
  onFieldDelete
}: FormRendererProps) {
  // Detect device type based on screen width
  const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
    if (typeof window === 'undefined') return 'desktop'
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>(getDeviceType)

  // Update device type on resize
  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType())
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {}
    
    // Initialize form data based on form type
    if (form.isMultistep && form.steps) {
      form.steps.forEach((step: FormStep) => {
        step.fields.forEach((field: FormField) => {
          if (field.type === 'checkbox' || field.type === 'multiselect' || field.type === 'multi-dropdown') {
            initialData[field.id] = []
          } else {
            initialData[field.id] = ''
          }
        })
      })
    } else if (form.fields) {
      form.fields.forEach((field: FormField) => {
        if (field.type === 'checkbox' || field.type === 'multiselect' || field.type === 'multi-dropdown') {
          initialData[field.id] = []
        } else {
          initialData[field.id] = ''
        }
      })
    }
    
    return initialData
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(0)

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get current step fields for validation
    const currentFields = form.isMultistep && form.steps 
      ? form.steps[currentStep]?.fields || []
      : form.fields || []
    
    // Validate required fields for current step
    const requiredFields = currentFields.filter(field => field.required)
    const missingFields = requiredFields.filter(field => {
      const value = formData[field.id]
      return !value || (Array.isArray(value) && value.length === 0)
    })

    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields')
      return
    }

    // If it's a multistep form and not the last step, go to next step
    if (form.isMultistep && form.steps && currentStep < form.steps.length - 1) {
      setCurrentStep(currentStep + 1)
      return
    }

    // If it's the last step or single-step form, submit
    try {
      await onSubmit(formData)
      setIsSubmitted(true)
      setIsError(false)
    } catch (error) {
      setIsError(true)
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
      if (onError) {
        onError(error instanceof Error ? error.message : 'An error occurred')
      }
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNextStep = () => {
    if (form.isMultistep && form.steps && currentStep < form.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const getWidthStyle = (width: string) => {
    switch (width) {
      case 'half': return { flex: '1 1 calc(50% - 0.5rem)', minWidth: 0, maxWidth: 'calc(50% - 0.5rem)' }
      case 'third': return { flex: '1 1 calc(33.333% - 0.67rem)', minWidth: 0, maxWidth: 'calc(33.333% - 0.67rem)' }
      case 'two-thirds': return { flex: '1 1 calc(66.666% - 0.33rem)', minWidth: 0, maxWidth: 'calc(66.666% - 0.33rem)' }
      case 'full': return { flex: '1 1 100%', minWidth: 0, maxWidth: '100%' }
      default: return { flex: '1 1 100%', minWidth: 0, maxWidth: '100%' }
    }
  }

  const getFormStyles = () => {
    return getDeviceStyles(form.styling, deviceType)
  }

  // Show error page if there's an error
  if (isError) {
    return (
      <div 
        className={className}
        style={{ 
          backgroundColor: form.styling?.backgroundColor || '#ffffff',
          minHeight: 'fit-content'
        }}
      >
        <div 
          className="max-w-4xl mx-auto"
          style={getFormStyles()}
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
      </div>
    )
  }

  // Show thank you page if form is submitted
  if (isSubmitted) {
    return (
      <div 
        className={className}
        style={{ 
          backgroundColor: form.styling?.backgroundColor || '#ffffff',
          minHeight: 'fit-content'
        }}
      >
        <div 
          className="max-w-4xl mx-auto"
          style={getFormStyles()}
        >
          <div className="text-center space-y-6 py-12">
            <div className="text-6xl">
              {form.thankYouPage?.icon || '🎉'}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-4">
                {form.thankYouPage?.title || 'Thank You!'}
              </h1>
              <p className="text-lg opacity-75 max-w-2xl mx-auto">
                {form.thankYouPage?.text || 'Your form has been submitted successfully. We\'ll get back to you soon!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={className}
      style={{ 
        backgroundColor: form.styling?.backgroundColor || '#ffffff',
        minHeight: 'fit-content'
      }}
    >
      <div 
        className="max-w-4xl mx-auto"
        style={getFormStyles()}
      >
        {/* Form Header - Removed */}

        {/* Step Progress Indicator for Multistep Forms */}
        {form.isMultistep && form.steps && (form.settings?.showProgressBar !== false) && (
          <StepProgressIndicator
            currentStep={currentStep}
            totalSteps={form.steps.length}
            stepUI={form.settings?.stepUI || 'numbers'}
            primaryColor={form.styling?.primaryColor || '#3b82f6'}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {(() => {
            const currentFields = form.isMultistep && form.steps 
              ? form.steps[currentStep]?.fields || []
              : form.fields || []
            
            return (
              <SortableContext
                items={currentFields.map(field => field.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-4">
                  {currentFields.map((field) => (
                    <SortableFieldWrapper
                      key={field.id}
                      field={field}
                      formData={formData}
                      handleFieldChange={handleFieldChange}
                      editMode={editMode}
                      onFieldSettings={onFieldSettings}
                      onFieldUpdate={onFieldUpdate}
                      onFieldDelete={onFieldDelete}
                      formStyling={form.styling}
                      getWidthStyle={getWidthStyle}
                    />
                  ))}
                </div>
              </SortableContext>
            )
          })()}
          
          <div className="pt-4">
            {form.isMultistep && form.steps ? (
              <div className="flex justify-between space-x-4">
                {currentStep > 0 && (
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handlePreviousStep}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className={currentStep > 0 ? "flex-1" : "w-full"}
                  disabled={submitting}
                  style={{
                    backgroundColor: form.styling?.primaryColor || '#3b82f6',
                    borderColor: form.styling?.primaryColor || '#3b82f6',
                  }}
                >
                  {submitting 
                    ? 'Submitting...' 
                    : currentStep < form.steps.length - 1 
                      ? 'Next' 
                      : (form.settings?.submitButtonText || 'Submit Form')
                  }
                </Button>
              </div>
            ) : (
              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting}
                style={{
                  backgroundColor: form.styling?.primaryColor || '#3b82f6',
                  borderColor: form.styling?.primaryColor || '#3b82f6',
                }}
              >
                {submitting ? 'Submitting...' : (form.settings?.submitButtonText || 'Submit Form')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
