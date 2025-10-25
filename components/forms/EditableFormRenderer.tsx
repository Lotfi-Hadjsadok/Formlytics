"use client"

import { useState } from "react"
import { FormRenderer } from "./FormRenderer"
import { FormFieldConfig } from "./FormFieldConfig"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { FormField, Form } from "@/lib/types"

/**
 * EditableFormRenderer - A wrapper around FormRenderer that adds field editing capabilities
 * 
 * This component demonstrates how to use FormRenderer in edit mode with field settings.
 * It provides a floating settings panel that opens when a field settings icon is clicked.
 * 
 * Usage:
 * <EditableFormRenderer
 *   form={form}
 *   onSubmit={handleSubmit}
 *   onFieldUpdate={handleFieldUpdate}
 * />
 */
interface EditableFormRendererProps {
  form: Form
  onSubmit: (formData: Record<string, any>) => Promise<void>
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void
  submitting?: boolean
  className?: string
}

export function EditableFormRenderer({ 
  form, 
  onSubmit, 
  onFieldUpdate,
  submitting = false,
  className = ""
}: EditableFormRendererProps) {
  const [selectedField, setSelectedField] = useState<FormField | null>(null)

  const handleFieldSettings = (field: FormField) => {
    setSelectedField(field)
  }

  const handleFieldUpdate = (updates: Partial<FormField>) => {
    if (selectedField) {
      onFieldUpdate(selectedField.id, updates)
    }
  }

  const handleCloseSettings = () => {
    setSelectedField(null)
  }

  return (
    <div className="relative">
      <FormRenderer
        form={form}
        onSubmit={onSubmit}
        submitting={submitting}
        className={className}
        editMode={true}
        onFieldSettings={handleFieldSettings}
      />
      
      {/* Field Settings Panel */}
      {selectedField && (
        <div className="fixed top-20 right-4 w-96 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl z-50 flex flex-col max-h-[calc(100vh-6rem)]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Field Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseSettings}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <FormFieldConfig
              field={selectedField}
              onUpdate={handleFieldUpdate}
              onClose={handleCloseSettings}
            />
          </div>
        </div>
      )}
    </div>
  )
}
