"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Settings, GripVertical, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FormField } from "@/lib/types"

interface FieldRendererProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  editMode?: boolean
  onFieldSettings?: (field: FormField) => void
  onFieldUpdate?: (updates: Partial<FormField>) => void
  onFieldDelete?: (fieldId: string) => void
  formStyling?: any
  className?: string
  dragHandleProps?: {
    attributes: any
    listeners: any
  }
}

export function FieldRenderer({
  field,
  value,
  onChange,
  editMode = false,
  onFieldSettings,
  onFieldUpdate,
  onFieldDelete,
  formStyling,
  className = "",
  dragHandleProps
}: FieldRendererProps) {
  const [showWidthSettings, setShowWidthSettings] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const getFieldStyles = () => {
    return {
      backgroundColor: field.styling?.backgroundColor || 'transparent',
      color: field.styling?.textColor || formStyling?.textColor || '#000000',
      borderColor: field.styling?.borderColor || '#d1d5db',
      fontSize: field.styling?.fontSize || '14px',
      padding: field.styling?.padding || '8px 12px',
    }
  }

  const handleInputChange = (newValue: any) => {
    onChange(newValue)
  }

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentValues = value || []
    if (checked) {
      onChange([...currentValues, option])
    } else {
      onChange(currentValues.filter((v: string) => v !== option))
    }
  }

  const handleMultiselectChange = (option: string, checked: boolean) => {
    const currentValues = value || []
    if (checked) {
      onChange([...currentValues, option])
    } else {
      onChange(currentValues.filter((v: string) => v !== option))
    }
  }

  const handleMultiDropdownChange = (option: string, checked: boolean) => {
    const currentValues = value || []
    if (checked) {
      onChange([...currentValues, option])
    } else {
      onChange(currentValues.filter((v: string) => v !== option))
    }
  }

  const renderFieldContent = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={getFieldStyles()}
          />
        )
      
      case 'email':
        return (
          <Input
            id={field.id}
            type="email"
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={getFieldStyles()}
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            style={getFieldStyles()}
          />
        )
      
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={getFieldStyles()}
          />
        )
      
      case 'date':
        return (
          <DatePicker
            value={value || ''}
            onChange={(value) => handleInputChange(value)}
            placeholder="Pick a date"
            required={field.required}
          />
        )
      
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(value) => handleInputChange(value)}
            required={field.required}
          >
            <SelectTrigger style={getFieldStyles()}>
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
        )
      
      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => handleMultiselectChange(option, checked as boolean)}
                />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )
      
      case 'multi-dropdown':
        return (
          <div className="space-y-2">
            <Select
              value=""
              onValueChange={(selectedValue) => {
                if (selectedValue && !(value || []).includes(selectedValue)) {
                  handleMultiDropdownChange(selectedValue, true)
                }
              }}
            >
              <SelectTrigger 
                className="min-h-[40px] h-auto"
                onPointerDown={(e) => {
                  // Prevent dropdown from opening when clicking on badges
                  if ((e.target as HTMLElement).closest('[data-badge]')) {
                    e.preventDefault()
                  }
                }}
                style={getFieldStyles()}
              >
                <div className="flex flex-wrap gap-1 w-full">
                  {(value || []).length > 0 ? (
                    (value || []).map((selectedOption: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs px-2 py-1 cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                        data-badge="true"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          handleMultiDropdownChange(selectedOption, false)
                        }}
                      >
                        {selectedOption}
                        <span className="ml-1">
                          ×
                        </span>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">Select options...</span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => {
                  const isSelected = (value || []).includes(option)
                  return (
                    <div
                      key={index}
                      className={`cursor-pointer px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground ${isSelected ? "bg-muted text-muted-foreground" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMultiDropdownChange(option, !isSelected)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="text-black font-bold">✓</span>
                        )}
                        {option}
                      </div>
                    </div>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )
      
      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(value) => handleInputChange(value)}
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
        )
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )
      
      case 'title':
        return (
          <div className="flex items-center space-x-2">
            {/* Drag Handle for Title Field */}
            {editMode && dragHandleProps && (
              <div
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
                className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded hover:bg-slate-100 transition-all duration-200"
                style={{ touchAction: 'none' }}
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            
            {/* Title Content */}
            <div className="flex-1">
              {editMode && isEditingTitle ? (
                <Input
                  value={field.label}
                  onChange={(e) => {
                    if (onFieldUpdate) {
                      onFieldUpdate({ label: e.target.value })
                    }
                  }}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingTitle(false)
                    }
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false)
                    }
                  }}
                  className="text-lg font-semibold border-none bg-transparent p-0 focus:ring-0 focus:border-none"
                  style={{
                    fontSize: field.styling?.titleFontSize || '1.5rem',
                    color: field.styling?.textColor || formStyling?.textColor || '#1f2937'
                  }}
                  autoFocus
                />
              ) : (
                <div 
                  className={`font-semibold text-gray-900 ${editMode ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                  style={{
                    fontSize: field.styling?.titleFontSize || '1.5rem',
                    color: field.styling?.textColor || formStyling?.textColor || '#1f2937'
                  }}
                  onClick={() => {
                    if (editMode) {
                      setIsEditingTitle(true)
                    }
                  }}
                >
                  {field.label}
                </div>
              )}
            </div>
            
            {/* Settings and Delete Icons for Title Field */}
            {editMode && (
              <div className="flex items-center space-x-1">
                {onFieldSettings && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onFieldSettings(field)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Title Settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {onFieldDelete && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onFieldDelete(field.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Title</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        )
      
      case 'separator':
        return (
          <div className="flex items-center space-x-2">
            {/* Drag Handle for Separator Field */}
            {editMode && dragHandleProps && (
              <div
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
                className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded hover:bg-slate-100 transition-all duration-200"
                style={{ touchAction: 'none' }}
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            
            {/* Separator Line */}
            <div 
              className="flex-1 border-t border-gray-300"
              style={{
                width: field.styling?.separatorWidth || '100%',
                marginTop: field.styling?.separatorVerticalSpacing || '1rem',
                marginBottom: field.styling?.separatorVerticalSpacing || '1rem',
                borderTopWidth: field.styling?.separatorBorderWidth || '1px',
                borderTopColor: field.styling?.borderColor || formStyling?.primaryColor || '#d1d5db'
              }}
            />
            
            {/* Settings and Delete Icons for Separator Field */}
            {editMode && (
              <div className="flex items-center space-x-1">
                {onFieldSettings && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onFieldSettings(field)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Separator Settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {onFieldDelete && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onFieldDelete(field.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Separator</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <Input
            id={field.id}
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={getFieldStyles()}
          />
        )
    }
  }

  return (
    <div className={`space-y-2 ${className}`} style={getFieldStyles()}>
      {/* Field Label and Settings */}
      {field.type !== 'title' && field.type !== 'separator' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Drag Handle for Regular Fields */}
            {editMode && dragHandleProps && (
              <div
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
                className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded hover:bg-slate-100 transition-all duration-200"
                style={{ touchAction: 'none' }}
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
          {editMode && (
            <div className="flex items-center space-x-2">
              {/* Width Setting */}
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onFieldUpdate) {
                      // Cycle through width options
                      const widthOptions = ['full', 'half', 'third', 'two-thirds']
                      const currentIndex = widthOptions.indexOf(field.width)
                      const nextIndex = (currentIndex + 1) % widthOptions.length
                      onFieldUpdate({ width: widthOptions[nextIndex] as any })
                    }
                  }}
                  className="h-7 px-2 text-xs border-gray-300 hover:border-blue-500 hover:text-blue-600"
                >
                  {field.width === 'full' ? '100%' : 
                   field.width === 'half' ? '50%' : 
                   field.width === 'third' ? '33%' : 
                   field.width === 'two-thirds' ? '67%' : '100%'}
                </Button>
              </div>
              
              {/* Required Setting */}
              <Button
                type="button"
                variant={field.required ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onFieldUpdate) {
                    onFieldUpdate({ required: !field.required })
                  }
                }}
                className={`h-7 px-2 text-xs ${
                  field.required 
                    ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' 
                    : 'border-gray-300 hover:border-red-500 hover:text-red-600'
                }`}
              >
                {field.required ? 'Required' : 'Optional'}
              </Button>

              {/* Settings Icon */}
              {onFieldSettings && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onFieldSettings(field)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Field Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Delete Icon */}
              {onFieldDelete && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onFieldDelete(field.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Field</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Field Content */}
      {renderFieldContent()}
    </div>
  )
}
