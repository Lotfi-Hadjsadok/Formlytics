"use client"

import { useState } from "react"
import { FieldRenderer } from "@/components/forms/FieldRenderer"
import { FormField } from "@/lib/types"

// Test component to verify the unified field system works correctly
export function FieldRendererTest() {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const getWidthStyle = (width: string) => {
    switch (width) {
      case 'half': return { flex: '1 1 50%', minWidth: 0 }
      case 'third': return { flex: '1 1 33.333%', minWidth: 0 }
      case 'two-thirds': return { flex: '1 1 66.666%', minWidth: 0 }
      case 'full': return { flex: '1 1 100%', minWidth: 0 }
      default: return { flex: '1 1 100%', minWidth: 0 }
    }
  }

  const testFields: FormField[] = [
    {
      id: 'text-field',
      type: 'text',
      label: 'Text Input',
      placeholder: 'Enter text...',
      required: true,
      width: 'full'
    },
    {
      id: 'email-field',
      type: 'email',
      label: 'Email',
      placeholder: 'Enter email...',
      required: true,
      width: 'half'
    },
    {
      id: 'textarea-field',
      type: 'textarea',
      label: 'Message',
      placeholder: 'Enter your message...',
      required: false,
      width: 'full'
    },
    {
      id: 'select-field',
      type: 'select',
      label: 'Choose Option',
      required: true,
      width: 'half',
      options: ['Option 1', 'Option 2', 'Option 3']
    },
    {
      id: 'radio-field',
      type: 'radio',
      label: 'Select One',
      required: true,
      width: 'half',
      options: ['Choice A', 'Choice B', 'Choice C']
    },
    {
      id: 'checkbox-field',
      type: 'checkbox',
      label: 'Select Multiple',
      required: false,
      width: 'full',
      options: ['Check 1', 'Check 2', 'Check 3']
    },
    {
      id: 'multiselect-field',
      type: 'multiselect',
      label: 'Multiselect',
      required: false,
      width: 'full',
      options: ['Multi 1', 'Multi 2', 'Multi 3']
    },
    {
      id: 'multi-dropdown-field',
      type: 'multi-dropdown',
      label: 'Multi Dropdown',
      required: false,
      width: 'full',
      options: ['Drop 1', 'Drop 2', 'Drop 3']
    },
    {
      id: 'number-field',
      type: 'number',
      label: 'Number',
      placeholder: 'Enter number...',
      required: false,
      width: 'half'
    },
    {
      id: 'date-field',
      type: 'date',
      label: 'Date',
      required: false,
      width: 'half'
    },
    {
      id: 'title-field',
      type: 'title',
      label: 'This is a Title',
      required: false,
      width: 'full'
    },
    {
      id: 'separator-field',
      type: 'separator',
      label: '',
      required: false,
      width: 'full'
    }
  ]

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
    console.log('Field update:', fieldId, updates)
  }

  const handleFieldSettings = (field: FormField) => {
    console.log('Field settings:', field)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Unified Field Renderer Test</h1>
      
      <div className="flex flex-wrap gap-6">
        {testFields.map((field) => (
          <div key={field.id} className="w-full md:w-auto" style={getWidthStyle(field.width)}>
            <FieldRenderer
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              editMode={true}
              onFieldSettings={handleFieldSettings}
              onFieldUpdate={(updates) => handleFieldUpdate(field.id, updates)}
              formStyling={{
                backgroundColor: '#ffffff',
                textColor: '#1f2937',
                primaryColor: '#3b82f6',
                fontFamily: 'Inter',
                borderRadius: '8px'
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Form Data:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  )
}
