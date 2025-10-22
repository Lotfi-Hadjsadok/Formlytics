"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Plus, Layout, Trash2 } from "lucide-react"
import { useSensor, useSensors, PointerSensor, KeyboardSensor, DragEndEvent, DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { arrayMove } from '@dnd-kit/sortable'
import { SortableStepField } from "./SortableStepField"
import { Collapsible } from "@/components/ui/collapsible"

interface FormField {
  id: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'multiselect' | 'multi-dropdown' | 'checkbox' | 'radio' | 'number' | 'date'
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

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'textarea', label: 'Text Area', icon: '📄' },
  { value: 'select', label: 'Dropdown', icon: '📋' },
  { value: 'multiselect', label: 'Multiselect', icon: '☑️' },
  { value: 'multi-dropdown', label: 'Multi Dropdown', icon: '📋' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'radio', label: 'Radio Button', icon: '🔘' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
]

interface MultiStepFormBuilderProps {
  steps: FormStep[]
  onStepsChange: (steps: FormStep[]) => void
}

export function MultiStepFormBuilder({ steps, onStepsChange }: MultiStepFormBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addStep = () => {
    const newStep: FormStep = {
      id: `step_${Date.now()}`,
      title: `Step ${steps.length + 1}`,
      description: '',
      fields: []
    }
    
    onStepsChange([...steps, newStep])
  }

  const removeStep = (stepId: string) => {
    onStepsChange(steps.filter(step => step.id !== stepId))
  }

  const updateStep = (stepId: string, updates: Partial<FormStep>) => {
    onStepsChange(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  const addFieldToStep = (stepId: string, type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      width: 'full',
      ...(type === 'select' || type === 'multiselect' || type === 'multi-dropdown' || type === 'radio' || type === 'checkbox' ? { options: ['Option 1', 'Option 2'] } : {})
    }
    
    onStepsChange(steps.map(step => 
      step.id === stepId 
        ? { ...step, fields: [...step.fields, newField] }
        : step
    ))
  }

  const updateFieldInStep = (stepId: string, fieldId: string, updates: Partial<FormField>) => {
    onStepsChange(steps.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            fields: step.fields.map(field => 
              field.id === fieldId ? { ...field, ...updates } : field
            )
          }
        : step
    ))
  }

  const removeFieldFromStep = (stepId: string, fieldId: string) => {
    onStepsChange(steps.map(step => 
      step.id === stepId 
        ? { ...step, fields: step.fields.filter(field => field.id !== fieldId) }
        : step
    ))
  }

  const addOptionToStep = (stepId: string, fieldId: string) => {
    onStepsChange(steps.map(step => 
      step.id === stepId 
        ? {
            ...step,
            fields: step.fields.map(field => 
              field.id === fieldId 
                ? { ...field, options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] }
                : field
            )
          }
        : step
    ))
  }

  const updateOptionInStep = (stepId: string, fieldId: string, optionIndex: number, value: string) => {
    onStepsChange(steps.map(step => 
      step.id === stepId 
        ? {
            ...step,
            fields: step.fields.map(field => 
              field.id === fieldId 
                ? { 
                    ...field, 
                    options: field.options?.map((opt, idx) => idx === optionIndex ? value : opt) 
                  }
                : field
            )
          }
        : step
    ))
  }

  const removeOptionFromStep = (stepId: string, fieldId: string, optionIndex: number) => {
    onStepsChange(steps.map(step => 
      step.id === stepId 
        ? {
            ...step,
            fields: step.fields.map(field => 
              field.id === fieldId 
                ? { 
                    ...field, 
                    options: field.options?.filter((_, idx) => idx !== optionIndex) 
                  }
                : field
            )
          }
        : step
    ))
  }

  const handleStepDragEnd = (stepId: string) => (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      onStepsChange(steps.map(step => {
        if (step.id === stepId) {
          const oldIndex = step.fields.findIndex(field => field.id === active.id)
          const newIndex = step.fields.findIndex(field => field.id === over.id)
          
          return {
            ...step,
            fields: arrayMove(step.fields, oldIndex, newIndex)
          }
        }
        return step
      }))
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Steps</h3>
          <p className="text-sm text-gray-600 mt-1">
            Organize your form into steps for better user experience
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              onClick={addStep}
              className="cursor-pointer"
            >
              <span className="mr-3 text-lg">📋</span>
              <span className="font-medium">Add Step</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
        {steps.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Layout className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No steps added yet</h3>
            <p className="text-gray-500 mb-4">Start building your multistep form by adding steps</p>
            <Button 
              variant="outline" 
              onClick={addStep}
              className="border-dashed border-2 border-gray-300 hover:border-green-500 hover:text-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first step
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {steps.map((step, stepIndex) => (
              <Collapsible
                key={step.id}
                title={`Step ${stepIndex + 1}: ${step.title || 'Untitled Step'}`}
                description={step.description || 'Configure fields for this step'}
                icon={<Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Step {stepIndex + 1}</Badge>}
                defaultOpen={true}
                className="border-l-4 border-l-indigo-500"
              >
                <div className="space-y-6">
                  {/* Step Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-700">Step Configuration</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Step Title</Label>
                        <Input
                          value={step.title}
                          onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          placeholder="Step title"
                          className="h-10 font-semibold"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Step Description</Label>
                        <Textarea
                          value={step.description || ''}
                          onChange={(e) => updateStep(step.id, { description: e.target.value })}
                          placeholder="Step description (optional)"
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fields Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-700">Fields in this step</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          {fieldTypes.map((fieldType) => (
                            <DropdownMenuItem
                              key={fieldType.value}
                              onClick={() => addFieldToStep(step.id, fieldType.value as FormField['type'])}
                              className="cursor-pointer"
                            >
                              <span className="mr-3 text-lg">{fieldType.icon}</span>
                              <span className="font-medium">{fieldType.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {step.fields.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-sm">No fields in this step yet</p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleStepDragEnd(step.id)}
                      >
                        <SortableContext
                          items={step.fields.map(field => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {(() => {
                              const organizedRows = organizeFieldsIntoRows(step.fields)
                              
                              return organizedRows.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex flex-col md:flex-row gap-4">
                                  {row.map((field, fieldIndex) => {
                                    const globalFieldIndex = step.fields.findIndex(f => f.id === field.id)
                                    return (
                                      <SortableStepField
                                        key={field.id}
                                        field={field}
                                        stepId={step.id}
                                        index={globalFieldIndex}
                                        updateField={updateFieldInStep}
                                        removeField={removeFieldFromStep}
                                        addOption={addOptionToStep}
                                        updateOption={updateOptionInStep}
                                        removeOption={removeOptionFromStep}
                                      />
                                    )
                                  })}
                                </div>
                              ))
                            })()}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
    </div>
  )
}
