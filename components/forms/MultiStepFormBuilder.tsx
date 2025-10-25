"use client"

import { useState, useMemo, useCallback } from "react"
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
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor, 
  DragEndEvent, 
  DragStartEvent,
  closestCenter,
  closestCorners,
  rectIntersection,
  pointerWithin,
  useDraggable,
  useDroppable
} from '@dnd-kit/core'
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableStepField } from "./SortableStepField"
import { Collapsible } from "@/components/ui/collapsible"
import { FormField, FormStep, MultiStepFormBuilderProps, fieldTypes } from "@/lib/types"

export function MultiStepFormBuilder({ steps, onStepsChange }: MultiStepFormBuilderProps) {
  const [draggedField, setDraggedField] = useState<FormField | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const fieldId = active.id as string
    
    // Find the field being dragged
    for (const step of steps) {
      const field = step.fields.find(f => f.id === fieldId)
      if (field) {
        setDraggedField(field)
        return
      }
    }
  }, [steps])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setDraggedField(null)

    if (!over || active.id === over.id) return

    // Create a map for faster lookups
    const fieldToStepMap = new Map<string, { step: FormStep; fieldIndex: number }>()
    steps.forEach(step => {
      step.fields.forEach((field, index) => {
        fieldToStepMap.set(field.id, { step, fieldIndex: index })
      })
    })

    const sourceData = fieldToStepMap.get(active.id as string)
    const targetData = fieldToStepMap.get(over.id as string)

    if (sourceData && targetData && sourceData.step.id === targetData.step.id) {
      const { step, fieldIndex: oldIndex } = sourceData
      const { fieldIndex: newIndex } = targetData
      
      if (oldIndex !== newIndex) {
        const updatedFields = arrayMove(step.fields, oldIndex, newIndex)
        const updatedSteps = steps.map(s => 
          s.id === step.id ? { ...s, fields: updatedFields } : s
        )
        onStepsChange(updatedSteps)
      }
    }
  }, [steps, onStepsChange])

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

  // Custom collision detection for better field detection
  const customCollisionDetection = (args: any) => {
    // First try pointerWithin for better accuracy
    const pointerCollisions = pointerWithin(args)
    
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }
    
    // Fall back to closestCorners
    return closestCorners(args)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
                      <SortableContext
                        items={step.fields.map(field => field.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {step.fields.map((field, index) => {
                            const flexClass = field.width === 'full' ? 'w-full' : field.width === 'half' ? 'w-full md:w-1/2' : field.width === 'two-thirds' ? 'w-full md:w-2/3' : 'w-full md:w-1/3'
                            return (
                              <div key={field.id} className={`${flexClass}`}>
                                <SortableStepField
                                  field={field}
                                  stepId={step.id}
                                  index={index}
                                  updateField={updateFieldInStep}
                                  removeField={removeFieldFromStep}
                                  addOption={addOptionToStep}
                                  updateOption={updateOptionInStep}
                                  removeOption={removeOptionFromStep}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </SortableContext>
                    )}
                  </div>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedField ? (
          <Card className="shadow-2xl opacity-95 scale-105 border-blue-400 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 shadow-md">
                  <Layout className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-gray-900">{draggedField.label}</span>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
