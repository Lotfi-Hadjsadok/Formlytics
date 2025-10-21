"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Plus, Trash2, GripVertical, Layout } from "lucide-react"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'textarea', label: 'Text Area', icon: '📄' },
  { value: 'select', label: 'Dropdown', icon: '📋' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'radio', label: 'Radio Button', icon: '🔘' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
]

const widthOptions = [
  { value: 'full', label: 'Full Width', icon: '📏' },
  { value: 'half', label: 'Half Width', icon: '📐' },
  { value: 'third', label: 'One Third', icon: '📊' },
  { value: 'two-thirds', label: 'Two Thirds', icon: '📈' },
]

interface SortableStepFieldProps {
  field: FormField
  stepId: string
  index: number
  updateField: (stepId: string, fieldId: string, updates: Partial<FormField>) => void
  removeField: (stepId: string, fieldId: string) => void
  addOption: (stepId: string, fieldId: string) => void
  updateOption: (stepId: string, fieldId: string, optionIndex: number, value: string) => void
  removeOption: (stepId: string, fieldId: string, optionIndex: number) => void
}

export function SortableStepField({ 
  field, 
  stepId,
  index, 
  updateField, 
  removeField, 
  addOption, 
  updateOption, 
  removeOption 
}: SortableStepFieldProps) {
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
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const flexClass = field.width === 'full' ? 'w-full' : field.width === 'half' ? 'w-full md:w-1/2' : field.width === 'two-thirds' ? 'w-full md:w-2/3' : 'w-full md:w-1/3'

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      <div className={`border border-gray-200 rounded-lg bg-gray-50 shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600 group w-full h-full min-w-0 max-w-none flex-shrink-0 ${flexClass}`}>
        <div className="pt-6 pb-6 w-full px-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {fieldTypes.find(ft => ft.value === field.type)?.label}
              </Badge>
              <span className="text-sm text-gray-500 font-medium">Field {index + 1}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeField(stepId, field.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-gray-600">Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(stepId, field.id, { label: e.target.value })}
                  placeholder="Enter field label"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600">Field Width</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-9 text-sm">
                      <Layout className="h-3 w-3 mr-2" />
                      {widthOptions.find(w => w.value === field.width)?.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {widthOptions.map((width) => (
                      <DropdownMenuItem
                        key={width.value}
                        onClick={() => updateField(stepId, field.id, { width: width.value as FormField['width'] })}
                      >
                        <span className="mr-2">{width.icon}</span>
                        {width.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {field.type !== 'checkbox' && field.type !== 'radio' && (
              <div>
                <Label className="text-xs font-semibold text-gray-600">Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(stepId, field.id, { placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                  className="h-9 text-sm"
                />
              </div>
            )}
            
            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-gray-600">Options</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(stepId, field.id)}
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {field.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2 p-2 bg-white rounded border">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(stepId, field.id, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="h-8 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(stepId, field.id, optionIndex)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 p-2 bg-white rounded border">
              <input
                type="checkbox"
                id={`required-${field.id}`}
                checked={field.required}
                onChange={(e) => updateField(stepId, field.id, { required: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor={`required-${field.id}`} className="text-xs font-medium text-gray-700">
                Required field
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
