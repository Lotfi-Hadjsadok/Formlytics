"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  X,
  Plus,
  Trash2,
  Type,
  Mail,
  FileText,
  List,
  CheckSquare,
  Radio,
  Hash,
  Calendar,
  Minus
} from "lucide-react"
import { FormField, FieldWidth, widthOptions } from "@/lib/types"

interface FormFieldConfigProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
  onClose: () => void
}

export function FormFieldConfig({ field, onUpdate, onClose }: FormFieldConfigProps) {
  const [localField, setLocalField] = useState<FormField>(field)

  const handleUpdate = (updates: Partial<FormField>) => {
    const updatedField = { ...localField, ...updates }
    setLocalField(updatedField)
    onUpdate(updates)
  }

  const addOption = () => {
    const newOptions = [...(localField.options || []), `Option ${(localField.options?.length || 0) + 1}`]
    handleUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = localField.options?.map((opt, idx) => idx === index ? value : opt) || []
    handleUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = localField.options?.filter((_, idx) => idx !== index) || []
    handleUpdate({ options: newOptions })
  }

  const getFieldIcon = (type: FormField['type']) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'textarea': return <FileText className="h-4 w-4" />
      case 'select': return <List className="h-4 w-4" />
      case 'multiselect': return <CheckSquare className="h-4 w-4" />
      case 'multi-dropdown': return <List className="h-4 w-4" />
      case 'checkbox': return <CheckSquare className="h-4 w-4" />
      case 'radio': return <Radio className="h-4 w-4" />
      case 'number': return <Hash className="h-4 w-4" />
      case 'date': return <Calendar className="h-4 w-4" />
      case 'title': return <Type className="h-4 w-4" />
      case 'separator': return <Minus className="h-4 w-4" />
      default: return <Type className="h-4 w-4" />
    }
  }

  const getFieldTypeLabel = (type: FormField['type']) => {
    switch (type) {
      case 'text': return 'Text Input'
      case 'email': return 'Email'
      case 'textarea': return 'Text Area'
      case 'select': return 'Dropdown'
      case 'multiselect': return 'Multiselect'
      case 'multi-dropdown': return 'Multi Dropdown'
      case 'checkbox': return 'Checkbox'
      case 'radio': return 'Radio Button'
      case 'number': return 'Number'
      case 'date': return 'Date'
      case 'title': return 'Title'
      case 'separator': return 'Separator'
      default: return 'Text Input'
    }
  }

  const hasOptions = ['select', 'multiselect', 'multi-dropdown', 'checkbox', 'radio'].includes(localField.type)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getFieldIcon(localField.type)}
            <h3 className="text-sm font-semibold text-gray-900">Field Settings</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">{getFieldTypeLabel(localField.type)}</p>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label */}
        <div>
          <Label htmlFor="label" className="text-xs font-medium text-gray-700">Label</Label>
          <Input
            id="label"
            value={localField.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            placeholder="Field label"
            className="mt-1 h-8 text-sm"
          />
        </div>

        {/* Width Setting */}
        <div>
          <Label htmlFor="width" className="text-xs font-medium text-gray-700">Field Width</Label>
          <Select
            value={localField.width}
            onValueChange={(value) => handleUpdate({ width: value as FieldWidth })}
          >
            <SelectTrigger className="mt-1 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {widthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Required Setting */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Switch
            id={`required-${localField.id}`}
            checked={localField.required}
            onCheckedChange={(checked) => handleUpdate({ required: checked })}
          />
          <Label htmlFor={`required-${localField.id}`} className="text-xs font-medium text-gray-700">
            Required field
          </Label>
        </div>

        {/* Placeholder */}
        <div>
          <Label htmlFor="placeholder" className="text-xs font-medium text-gray-700">Placeholder</Label>
          <Input
            id="placeholder"
            value={localField.placeholder || ''}
            onChange={(e) => handleUpdate({ placeholder: e.target.value })}
            placeholder="Placeholder text"
            className="mt-1 h-8 text-sm"
          />
        </div>

        {/* Title Field Specific Settings */}
        {localField.type === 'title' && (
          <div>
            <Label htmlFor="titleFontSize" className="text-xs font-medium text-gray-700">Font Size</Label>
            <Select
              value={localField.styling?.titleFontSize || '1.5rem'}
              onValueChange={(value) => handleUpdate({ 
                styling: { ...localField.styling, titleFontSize: value }
              })}
            >
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1rem">Small (1rem)</SelectItem>
                <SelectItem value="1.25rem">Medium (1.25rem)</SelectItem>
                <SelectItem value="1.5rem">Large (1.5rem)</SelectItem>
                <SelectItem value="1.875rem">Extra Large (1.875rem)</SelectItem>
                <SelectItem value="2.25rem">2XL (2.25rem)</SelectItem>
                <SelectItem value="3rem">3XL (3rem)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Separator Field Specific Settings */}
        {localField.type === 'separator' && (
          <>
            <div>
              <Label htmlFor="separatorWidth" className="text-xs font-medium text-gray-700">Width</Label>
              <Select
                value={localField.styling?.separatorWidth || '100%'}
                onValueChange={(value) => handleUpdate({ 
                  styling: { ...localField.styling, separatorWidth: value }
                })}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25%">25%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="75%">75%</SelectItem>
                  <SelectItem value="100%">100%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="separatorVerticalSpacing" className="text-xs font-medium text-gray-700">Vertical Spacing</Label>
              <Select
                value={localField.styling?.separatorVerticalSpacing || '1rem'}
                onValueChange={(value) => handleUpdate({ 
                  styling: { ...localField.styling, separatorVerticalSpacing: value }
                })}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5rem">Small (0.5rem)</SelectItem>
                  <SelectItem value="1rem">Medium (1rem)</SelectItem>
                  <SelectItem value="1.5rem">Large (1.5rem)</SelectItem>
                  <SelectItem value="2rem">Extra Large (2rem)</SelectItem>
                  <SelectItem value="3rem">3XL (3rem)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="separatorBorderWidth" className="text-xs font-medium text-gray-700">Border Width</Label>
              <Select
                value={localField.styling?.separatorBorderWidth || '1px'}
                onValueChange={(value) => handleUpdate({ 
                  styling: { ...localField.styling, separatorBorderWidth: value }
                })}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1px">Thin (1px)</SelectItem>
                  <SelectItem value="2px">Medium (2px)</SelectItem>
                  <SelectItem value="3px">Thick (3px)</SelectItem>
                  <SelectItem value="4px">Extra Thick (4px)</SelectItem>
                  <SelectItem value="5px">5px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}


        {/* Options for select/radio/checkbox fields */}
        {hasOptions && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium text-gray-700">Options</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={addOption}
                className="h-6 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {localField.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="h-7 text-xs"
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
