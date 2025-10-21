"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { StepProgressIndicator } from "./StepProgressIndicator"

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

interface FormStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

interface Form {
  id: string
  title: string
  description?: string
  fields?: FormField[]
  steps?: FormStep[]
  isMultistep?: boolean
  settings: {
    allowMultipleSubmissions: boolean
    showProgressBar: boolean
    stepUI?: 'numbers' | 'letters' | 'percentage' | 'bar'
    submitButtonText: string
  }
  styling: {
    backgroundColor: string
    textColor: string
    primaryColor: string
    fontFamily: string
    borderRadius: string
  }
  thankYouPage?: {
    icon?: string
    title?: string
    text?: string
  }
  _count: {
    entries: number
  }
}

interface FormRendererProps {
  form: Form
  onSubmit: (formData: Record<string, any>) => Promise<void>
  submitting?: boolean
  showHeader?: boolean
  className?: string
}

export function FormRenderer({ 
  form, 
  onSubmit, 
  submitting = false, 
  showHeader = true,
  className = ""
}: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {}
    
    // Initialize form data based on form type
    if (form.isMultistep && form.steps) {
      form.steps.forEach((step: FormStep) => {
        step.fields.forEach((field: FormField) => {
          if (field.type === 'checkbox') {
            initialData[field.id] = []
          } else {
            initialData[field.id] = ''
          }
        })
      })
    } else if (form.fields) {
      form.fields.forEach((field: FormField) => {
        if (field.type === 'checkbox') {
          initialData[field.id] = []
        } else {
          initialData[field.id] = ''
        }
      })
    }
    
    return initialData
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = prev[fieldId] || []
      if (checked) {
        return {
          ...prev,
          [fieldId]: [...currentValues, option]
        }
      } else {
        return {
          ...prev,
          [fieldId]: currentValues.filter((v: string) => v !== option)
        }
      }
    })
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
    await onSubmit(formData)
    setIsSubmitted(true)
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

  const getWidthClass = (width: string) => {
    switch (width) {
      case 'half': return 'md:col-span-1'
      case 'third': return 'md:col-span-1'
      case 'two-thirds': return 'md:col-span-2'
      case 'full': return 'md:col-span-2'
      default: return 'md:col-span-2'
    }
  }

  const getWidthValue = (width: string) => {
    switch (width) {
      case 'half': return 0.5
      case 'third': return 0.33
      case 'two-thirds': return 0.67
      case 'full': return 1
      default: return 1
    }
  }

  const organizeFieldsIntoRows = (fields: FormField[]) => {
    const rows: FormField[][] = []
    let currentRow: FormField[] = []
    let currentRowWidth = 0

    fields.forEach(field => {
      const fieldWidth = getWidthValue(field.width)
      
      // If adding this field would exceed 1.0 width, start a new row
      if (currentRowWidth + fieldWidth > 1.0 && currentRow.length > 0) {
        rows.push([...currentRow])
        currentRow = [field]
        currentRowWidth = fieldWidth
      } else {
        currentRow.push(field)
        currentRowWidth += fieldWidth
      }
    })

    // Add the last row if it has fields
    if (currentRow.length > 0) {
      rows.push(currentRow)
    }

    return rows
  }

  const getFormStyles = () => {
    return {
      backgroundColor: form.styling?.backgroundColor || '#ffffff',
      color: form.styling?.textColor || '#000000',
      fontFamily: form.styling?.fontFamily || 'var(--font-inter)',
      borderRadius: form.styling?.borderRadius || '8px',
    }
  }

  const getFieldStyles = (field: FormField) => {
    return {
      backgroundColor: field.styling?.backgroundColor || 'transparent',
      color: field.styling?.textColor || form.styling?.textColor || '#000000',
      borderColor: field.styling?.borderColor || '#d1d5db',
      fontSize: field.styling?.fontSize || '14px',
      padding: field.styling?.padding || '8px 12px',
    }
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
        {/* Form Header */}
        {showHeader && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>
        )}

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
            
            const organizedRows = organizeFieldsIntoRows(currentFields)
            
            return organizedRows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {row.map((field) => (
                  <div 
                    key={field.id} 
                    className={`space-y-2 ${getWidthClass(field.width)}`}
                    style={getFieldStyles(field)}
                  >
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                
                {field.type === 'text' && (
                  <Input
                    id={field.id}
                    type="text"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
                
                {field.type === 'email' && (
                  <Input
                    id={field.id}
                    type="email"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Textarea
                    id={field.id}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                  />
                )}
                
                {field.type === 'number' && (
                  <Input
                    id={field.id}
                    type="number"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
                
                {field.type === 'date' && (
                  <DatePicker
                    value={formData[field.id] || ''}
                    onChange={(value) => handleInputChange(field.id, value)}
                    placeholder="Pick a date"
                    required={field.required}
                  />
                )}
                
                {field.type === 'select' && (
                  <Select
                    value={formData[field.id] || ''}
                    onValueChange={(value) => handleInputChange(field.id, value)}
                    required={field.required}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {field.type === 'radio' && (
                  <RadioGroup
                    value={formData[field.id] || ''}
                    onValueChange={(value) => handleInputChange(field.id, value)}
                    required={field.required}
                  >
                    {field.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                        <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {field.type === 'checkbox' && (
                  <div className="space-y-2">
                    {field.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${field.id}-${index}`}
                          checked={(formData[field.id] || []).includes(option)}
                          onCheckedChange={(checked) => handleCheckboxChange(field.id, option, checked as boolean)}
                        />
                        <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                  </div>
                ))}
              </div>
            ))
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
