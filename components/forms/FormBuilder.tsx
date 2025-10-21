"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings,
  Save,
  Eye,
  Palette,
  Type,
  Layout,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSensor, useSensors, PointerSensor, KeyboardSensor, DragEndEvent, DndContext, closestCenter } from '@dnd-kit/core'
import { useSortable, arrayMove, SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createForm, updateForm, getForm } from "@/lib/actions"

interface FormField {
  id: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For select, radio, checkbox
  width: 'full' | 'half' | 'third' | 'two-thirds'
  styling?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
    fontSize?: string
    padding?: string
  }
}

interface FormData {
  title: string
  description: string
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
  thankYouPage: {
    icon?: string
    title?: string
    text?: string
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

const fontFamilies = [
  { value: 'var(--font-inter)', label: 'Inter' },
  { value: 'var(--font-roboto)', label: 'Roboto' },
  { value: 'var(--font-open-sans)', label: 'Open Sans' },
  { value: 'var(--font-lato)', label: 'Lato' },
  { value: 'var(--font-montserrat)', label: 'Montserrat' },
]

// Sortable Field Component
function SortableField({ 
  field, 
  index, 
  updateField, 
  removeField, 
  addOption, 
  updateOption, 
  removeOption 
}: {
  field: FormField
  index: number
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  removeField: (fieldId: string) => void
  addOption: (fieldId: string) => void
  updateOption: (fieldId: string, optionIndex: number, value: string) => void
  removeOption: (fieldId: string, optionIndex: number) => void
}) {
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
    <div ref={setNodeRef} style={style}>
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <Badge variant="outline">{fieldTypes.find(ft => ft.value === field.type)?.label}</Badge>
              <span className="text-sm text-gray-500">Field {index + 1}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeField(field.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  placeholder="Enter field label"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Field Width</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
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

            {field.type !== 'checkbox' && field.type !== 'radio' && (
              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              </div>
            )}

            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Options</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(field.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {field.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(field.id, optionIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`required-${field.id}`}
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor={`required-${field.id}`}>Required field</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface FormBuilderProps {
  formId?: string
  initialData?: FormData
}

export function FormBuilder({ formId, initialData }: FormBuilderProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(initialData || {
    title: '',
    description: '',
    fields: [],
    settings: {
      allowMultipleSubmissions: false,
      requireEmail: false,
      showProgressBar: true,
      submitButtonText: 'Submit'
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      primaryColor: '#3b82f6',
      fontFamily: 'var(--font-inter)',
      borderRadius: '8px'
    },
    thankYouPage: {
      icon: '',
      title: '',
      text: ''
    }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(!!formId)
  const [activePreviewTab, setActivePreviewTab] = useState<'form' | 'thankYou'>('form')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load form data when editing
  useEffect(() => {
    if (formId && !initialData) {
      const fetchForm = async () => {
        try {
          const form = await getForm(formId)
          setFormData({
            title: form.title,
            description: form.description || '',
            fields: (form.fields as any[]) || [],
            settings: (form.settings as any) || {
              allowMultipleSubmissions: false,
              requireEmail: false,
              showProgressBar: true,
              submitButtonText: 'Submit'
            },
            styling: (form.styling as any) || {
              backgroundColor: '#ffffff',
              textColor: '#000000',
              primaryColor: '#3b82f6',
              fontFamily: 'var(--font-inter)',
              borderRadius: '8px'
            },
            thankYouPage: (form.thankYouPage as any) || {
              icon: '',
              title: '',
              text: ''
            }
          })
        } catch (error) {
          console.error('Error loading form:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchForm()
    } else {
      setIsLoading(false)
    }
  }, [formId, initialData])

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      width: 'full',
      ...(type === 'select' || type === 'radio' || type === 'checkbox' ? { options: ['Option 1', 'Option 2'] } : {})
    }
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const removeField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const addOption = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { ...field, options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] }
          : field
      )
    }))
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { 
              ...field, 
              options: field.options?.map((opt, idx) => idx === optionIndex ? value : opt) 
            }
          : field
      )
    }))
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { 
              ...field, 
              options: field.options?.filter((_, idx) => idx !== optionIndex) 
            }
          : field
      )
    }))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.fields.findIndex(field => field.id === active.id)
        const newIndex = prev.fields.findIndex(field => field.id === over.id)

        return {
          ...prev,
          fields: arrayMove(prev.fields, oldIndex, newIndex)
        }
      })
    }
  }

  const getWidthClass = (width: string) => {
    switch (width) {
      case 'half': return 'md:col-span-1'
      case 'third': return 'md:col-span-1'
      case 'two-thirds': return 'md:col-span-2'
      default: return 'md:col-span-2'
    }
  }

  const getWidthValue = (width: string) => {
    switch (width) {
      case 'half': return 0.5
      case 'third': return 0.33
      case 'two-thirds': return 0.67
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

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a form title')
      return
    }

    setIsSaving(true)
    try {
      if (formId) {
        // Update existing form
        const result = await updateForm(formId, formData)
        router.push('/dashboard')
      } else {
        // Create new form
        const result = await createForm(formData)
        router.push(`/forms/${result.form.id}`)
      }
    } catch (error) {
      console.error('Error saving form:', error)
      alert(error instanceof Error ? error.message : 'Failed to save form. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter form title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter form description (optional)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Form Fields</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {fieldTypes.map((fieldType) => (
                  <DropdownMenuItem
                    key={fieldType.value}
                    onClick={() => addField(fieldType.value as FormField['type'])}
                  >
                    <span className="mr-2">{fieldType.icon}</span>
                    {fieldType.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {formData.fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No fields added yet. Click "Add Field" to get started.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.fields.map(field => field.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formData.fields.map((field, index) => (
                    <div key={field.id} className={`${getWidthClass(field.width)}`}>
                      <SortableField
                        field={field}
                        index={index}
                        updateField={updateField}
                        removeField={removeField}
                        addOption={addOption}
                        updateOption={updateOption}
                        removeOption={removeOption}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Form Styling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Form Styling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Palette Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Color Palette</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Background Color */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Background</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      style={{ backgroundColor: formData.styling.backgroundColor }}
                      onClick={() => document.getElementById('bg-color')?.click()}
                    >
                      <input
                        id="bg-color"
                        type="color"
                        value={formData.styling.backgroundColor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          styling: { ...prev.styling, backgroundColor: e.target.value }
                        }))}
                        className="opacity-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={formData.styling.backgroundColor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          styling: { ...prev.styling, backgroundColor: e.target.value }
                        }))}
                        placeholder="#ffffff"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Text</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      style={{ backgroundColor: formData.styling.textColor }}
                      onClick={() => document.getElementById('text-color')?.click()}
                    >
                      <input
                        id="text-color"
                        type="color"
                        value={formData.styling.textColor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          styling: { ...prev.styling, textColor: e.target.value }
                        }))}
                        className="opacity-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={formData.styling.textColor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          styling: { ...prev.styling, textColor: e.target.value }
                        }))}
                        placeholder="#000000"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Color */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Primary</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      style={{ backgroundColor: formData.styling.primaryColor }}
                      onClick={() => document.getElementById('primary-color')?.click()}
                    >
                      <input
                        id="primary-color"
                        type="color"
                        value={formData.styling.primaryColor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          styling: { ...prev.styling, primaryColor: e.target.value }
                        }))}
                        className="opacity-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={formData.styling.primaryColor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          styling: { ...prev.styling, primaryColor: e.target.value }
                        }))}
                        placeholder="#3b82f6"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Typography</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Font Family</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-12">
                      <Type className="h-4 w-4 mr-2" />
                      <span style={{ fontFamily: formData.styling.fontFamily }}>
                        {fontFamilies.find(font => font.value === formData.styling.fontFamily)?.label || formData.styling.fontFamily}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {fontFamilies.map((font) => (
                      <DropdownMenuItem
                        key={font.value}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          styling: { ...prev.styling, fontFamily: font.value }
                        }))}
                        className="w-full"
                      >
                        <span style={{ fontFamily: font.value }}>
                          {font.label}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Border Radius</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm flex items-center justify-center text-xs font-medium"
                      style={{ 
                        borderRadius: formData.styling.borderRadius,
                        backgroundColor: formData.styling.backgroundColor,
                        color: formData.styling.textColor,
                        borderColor: formData.styling.primaryColor
                      }}
                    >
                      Preview
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="range"
                          min="0"
                          max="20"
                          value={parseInt(formData.styling.borderRadius)}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styling: { ...prev.styling, borderRadius: `${e.target.value}px` }
                          }))}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 w-12 text-center">
                          {formData.styling.borderRadius}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Adjust the corner roundness of form elements
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Quick Presets</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  styling: {
                    backgroundColor: '#ffffff',
                    textColor: '#1f2937',
                    primaryColor: '#3b82f6',
                    fontFamily: 'var(--font-inter)',
                    borderRadius: '8px'
                  }
                }))}
                className="h-12 flex flex-col items-center justify-center space-y-1"
              >
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-xs">Default</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  styling: {
                    backgroundColor: '#f8fafc',
                    textColor: '#1e293b',
                    primaryColor: '#059669',
                    fontFamily: 'var(--font-inter)',
                    borderRadius: '12px'
                  }
                }))}
                className="h-12 flex flex-col items-center justify-center space-y-1"
              >
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-xs">Nature</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  styling: {
                    backgroundColor: '#fef2f2',
                    textColor: '#7f1d1d',
                    primaryColor: '#dc2626',
                    fontFamily: 'var(--font-inter)',
                    borderRadius: '4px'
                  }
                }))}
                className="h-12 flex flex-col items-center justify-center space-y-1"
              >
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-xs">Warm</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  styling: {
                    backgroundColor: '#1f2937',
                    textColor: '#f9fafb',
                    primaryColor: '#8b5cf6',
                    fontFamily: 'var(--font-inter)',
                    borderRadius: '16px'
                  }
                }))}
                className="h-12 flex flex-col items-center justify-center space-y-1"
              >
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                <span className="text-xs">Dark</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thank You Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Thank You Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Thank You Icon (Emoji)</Label>
            <Input
              value={formData.thankYouPage.icon || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                thankYouPage: { ...prev.thankYouPage, icon: e.target.value }
              }))}
              placeholder="🎉 (optional)"
              maxLength={2}
            />
            <p className="text-xs text-gray-500">Enter an emoji to display on the thank you page</p>
          </div>

          <div className="space-y-2">
            <Label>Thank You Title</Label>
            <Input
              value={formData.thankYouPage.title || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                thankYouPage: { ...prev.thankYouPage, title: e.target.value }
              }))}
              placeholder="Thank you! (optional)"
            />
            <p className="text-xs text-gray-500">Custom title for the thank you page</p>
          </div>

          <div className="space-y-2">
            <Label>Thank You Message</Label>
            <Textarea
              value={formData.thankYouPage.text || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                thankYouPage: { ...prev.thankYouPage, text: e.target.value }
              }))}
              placeholder="Your form has been submitted successfully. We'll get back to you soon! (optional)"
              rows={3}
            />
            <p className="text-xs text-gray-500">Custom message to show after form submission</p>
          </div>
        </CardContent>
      </Card>

      {/* Form Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Form Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Preview Tabs */}
          <div className="mb-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activePreviewTab === 'form' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActivePreviewTab('form')}
              >
                Form
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activePreviewTab === 'thankYou' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActivePreviewTab('thankYou')}
              >
                Thank You Page
              </button>
            </div>
          </div>

          {/* Form Preview */}
          {activePreviewTab === 'form' && (
            <div 
              className="p-6 rounded-lg border-2 border-dashed border-gray-200"
              style={{
                backgroundColor: formData.styling.backgroundColor,
                color: formData.styling.textColor,
                fontFamily: formData.styling.fontFamily,
                borderRadius: formData.styling.borderRadius,
              }}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{formData.title || 'Form Title'}</h3>
                  {formData.description && (
                    <p className="text-sm opacity-75 mt-1">{formData.description}</p>
                  )}
                </div>
                
                {formData.fields.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {formData.fields.map((field) => (
                        <div 
                          key={field.id} 
                          className={`space-y-2 ${getWidthClass(field.width)}`}
                        >
                          <Label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          
                          {field.type === 'text' && (
                            <Input
                              placeholder={field.placeholder || 'Enter text...'}
                              disabled
                              className="opacity-50"
                            />
                          )}
                          
                          {field.type === 'email' && (
                            <Input
                              type="email"
                              placeholder={field.placeholder || 'Enter email...'}
                              disabled
                              className="opacity-50"
                            />
                          )}
                          
                          {field.type === 'textarea' && (
                            <Textarea
                              placeholder={field.placeholder || 'Enter text...'}
                              disabled
                              className="opacity-50"
                              rows={3}
                            />
                          )}
                          
                          {field.type === 'select' && (
                            <Select disabled>
                              <SelectTrigger className="opacity-50">
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
                          
                          {field.type === 'number' && (
                            <Input
                              type="number"
                              placeholder={field.placeholder || 'Enter number...'}
                              disabled
                              className="opacity-50"
                            />
                          )}
                          
                          {field.type === 'date' && (
                            <DatePicker
                              placeholder="Pick a date"
                              disabled
                              className="opacity-50"
                            />
                          )}
                          
                          {field.type === 'radio' && (
                            <RadioGroup disabled className="opacity-50">
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
                            <div className="space-y-2 opacity-50">
                              {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Checkbox id={`${field.id}-${index}`} />
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
                        disabled
                        className="w-full opacity-50"
                        style={{
                          backgroundColor: formData.styling.primaryColor,
                          borderColor: formData.styling.primaryColor,
                        }}
                      >
                        {formData.settings.submitButtonText}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>Add fields to see preview</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thank You Page Preview */}
          {activePreviewTab === 'thankYou' && (
            <div 
              className="p-6 rounded-lg border-2 border-dashed border-gray-200"
              style={{
                backgroundColor: formData.styling.backgroundColor,
                color: formData.styling.textColor,
                fontFamily: formData.styling.fontFamily,
                borderRadius: formData.styling.borderRadius,
              }}
            >
              <div className="text-center space-y-4">
                {formData.thankYouPage.icon && (
                  <div className="text-6xl">{formData.thankYouPage.icon}</div>
                )}
                
                <div>
                  <h3 className="text-2xl font-semibold">
                    {formData.thankYouPage.title || 'Thank You!'}
                  </h3>
                  {formData.thankYouPage.text && (
                    <p className="text-sm opacity-75 mt-2 max-w-md mx-auto">
                      {formData.thankYouPage.text}
                    </p>
                  )}
                </div>
                
                {!formData.thankYouPage.icon && !formData.thankYouPage.title && !formData.thankYouPage.text && (
                  <div className="text-gray-400">
                    <p>Customize thank you page settings above to see preview</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Form Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Submit Button Text</Label>
            <Input
              value={formData.settings.submitButtonText}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, submitButtonText: e.target.value }
              }))}
              placeholder="Submit"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowMultipleSubmissions"
              checked={formData.settings.allowMultipleSubmissions}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, allowMultipleSubmissions: e.target.checked }
              }))}
              className="rounded"
            />
            <Label htmlFor="allowMultipleSubmissions">Allow multiple submissions from same user</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requireEmail"
              checked={formData.settings.requireEmail}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, requireEmail: e.target.checked }
              }))}
              className="rounded"
            />
            <Label htmlFor="requireEmail">Require email address</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showProgressBar"
              checked={formData.settings.showProgressBar}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, showProgressBar: e.target.checked }
              }))}
              className="rounded"
            />
            <Label htmlFor="showProgressBar">Show progress bar</Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : (formId ? 'Update Form' : 'Save Form')}
        </Button>
      </div>
    </div>
  )
}
