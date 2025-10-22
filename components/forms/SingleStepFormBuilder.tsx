"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { SortableField } from "./SortableField"
import { FormField, SingleStepFormBuilderProps, fieldTypes } from "@/lib/types"

export function SingleStepFormBuilder({ fields, onFieldsChange }: SingleStepFormBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      width: 'full',
      ...(type === 'select' || type === 'multiselect' || type === 'multi-dropdown' || type === 'radio' || type === 'checkbox' ? { options: ['Option 1', 'Option 2'] } : {})
    }
    
    onFieldsChange([...fields, newField])
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onFieldsChange(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const removeField = (fieldId: string) => {
    onFieldsChange(fields.filter(field => field.id !== fieldId))
  }

  const addOption = (fieldId: string) => {
    onFieldsChange(fields.map(field => 
      field.id === fieldId 
        ? { ...field, options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] }
        : field
    ))
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    onFieldsChange(fields.map(field => 
      field.id === fieldId 
        ? { 
            ...field, 
            options: field.options?.map((opt, idx) => idx === optionIndex ? value : opt) 
          }
        : field
    ))
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    onFieldsChange(fields.map(field => 
      field.id === fieldId 
        ? { 
            ...field, 
            options: field.options?.filter((_, idx) => idx !== optionIndex) 
          }
        : field
    ))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field.id === active.id)
      const newIndex = fields.findIndex(field => field.id === over.id)
      onFieldsChange(arrayMove(fields, oldIndex, newIndex))
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
          <h3 className="text-lg font-semibold text-gray-800">Fields</h3>
          <p className="text-sm text-gray-600 mt-1">
            Build your form by adding and configuring fields
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {fieldTypes.map((fieldType) => (
              <DropdownMenuItem
                key={fieldType.value}
                onClick={() => addField(fieldType.value as FormField['type'])}
                className="cursor-pointer"
              >
                <span className="mr-3 text-lg">{fieldType.icon}</span>
                <span className="font-medium">{fieldType.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Layout className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No fields added yet</h3>
            <p className="text-gray-500 mb-4">Start building your form by adding fields</p>
            <Button 
              variant="outline" 
              onClick={() => addField('text')}
              className="border-dashed border-2 border-gray-300 hover:border-green-500 hover:text-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first field
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map(field => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {(() => {
                  const organizedRows = organizeFieldsIntoRows(fields)
                  
                  return organizedRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex flex-col md:flex-row gap-4">
                      {row.map((field, fieldIndex) => {
                        const globalIndex = fields.findIndex(f => f.id === field.id)
                        const flexClass = field.width === 'full' ? 'w-full' : field.width === 'half' ? 'w-full md:w-1/2' : field.width === 'two-thirds' ? 'w-full md:w-2/3' : 'w-full md:w-1/3'
                        return (
                          <div key={field.id} className={`${flexClass} transition-all duration-300 ease-in-out`} style={{ minWidth: 0 }}>
                            <SortableField
                              field={field}
                              index={globalIndex}
                              updateField={updateField}
                              removeField={removeField}
                              addOption={addOption}
                              updateOption={updateOption}
                              removeOption={removeOption}
                            />
                          </div>
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
  )
}
