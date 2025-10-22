"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { FormField, SortableFieldProps, fieldTypes, widthOptions } from "@/lib/types"

export function SortableField({ 
  field, 
  index, 
  updateField, 
  removeField, 
  addOption, 
  updateOption, 
  removeOption 
}: SortableFieldProps) {
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

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600 group w-full h-full min-w-0 max-w-none flex-shrink-0">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    <span className="mr-2 text-sm">
                      {fieldTypes.find(ft => ft.value === field.type)?.icon}
                    </span>
                    <span className="text-xs font-medium">
                      {fieldTypes.find(ft => ft.value === field.type)?.label}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {fieldTypes.map((fieldType) => (
                    <DropdownMenuItem
                      key={fieldType.value}
                      onClick={() => {
                        const updates: Partial<FormField> = { type: fieldType.value as FormField['type'] }
                        
                        // Clear options if switching to a field type that doesn't use them
                        if (!['select', 'multiselect', 'multi-dropdown', 'radio', 'checkbox'].includes(fieldType.value)) {
                          updates.options = undefined
                        } else if (!field.options) {
                          // Add default options if switching to a field type that needs them
                          updates.options = ['Option 1', 'Option 2']
                        }
                        
                        updateField(field.id, updates)
                      }}
                    >
                      <span className="mr-2 text-sm">{fieldType.icon}</span>
                      {fieldType.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-sm text-gray-500 font-medium">Field {index + 1}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeField(field.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  placeholder="Enter field label"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Field Width</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-11">
                      <Layout className="h-4 w-4 mr-2" />
                      {widthOptions.find(w => w.value === field.width)?.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {widthOptions.map((width) => (
                      <DropdownMenuItem
                        key={width.value}
                        onClick={() => updateField(field.id, { width: width.value as FormField['width'] })}
                      >
                        <span className="mr-2">{width.icon}</span>
                        {width.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {field.type !== 'checkbox' && field.type !== 'radio' && field.type !== 'multiselect' && field.type !== 'multi-dropdown' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                  className="h-11"
                />
              </div>
            )}

            {(field.type === 'select' || field.type === 'multiselect' || field.type === 'multi-dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700">Options</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(field.id)}
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-3">
                  {field.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="h-10 bg-white"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(field.id, optionIndex)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Switch
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
              />
              <Label htmlFor={`required-${field.id}`} className="text-sm font-medium text-gray-700">
                Required field
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
