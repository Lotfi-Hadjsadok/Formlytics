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
    form.fields.forEach((field: FormField) => {
      if (field.type === 'checkbox') {
        initialData[field.id] = []
      } else {
        initialData[field.id] = ''
      }
    })
    return initialData
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

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
    
    // Validate required fields
    const requiredFields = form.fields.filter(field => field.required)
    const missingFields = requiredFields.filter(field => {
      const value = formData[field.id]
      return !value || (Array.isArray(value) && value.length === 0)
    })

    if (missingFields.length > 0) {
      alert('Please fill in all required fields')
      return
    }

    await onSubmit(formData)
    setIsSubmitted(true)
  }

  const getWidthClass = (width: string) => {
    switch (width) {
      case 'half': return 'md:col-span-1'
      case 'third': return 'md:col-span-1'
      case 'two-thirds': return 'md:col-span-2'
      default: return 'md:col-span-2'
    }
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {form.fields.map((field) => (
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
          
          <div className="pt-4">
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
          </div>
        </form>
      </div>
    </div>
  )
}
