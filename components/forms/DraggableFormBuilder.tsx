"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trash2, 
  GripVertical,
  Type,
  Mail,
  FileText,
  List,
  CheckSquare,
  Radio,
  Hash,
  Calendar,
  Settings2,
  Eye,
  Layout,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Copy,
  Move,
  Palette,
  Sparkles,
  ChevronDown,
  Settings,
  Globe,
  X,
  Minus
} from "lucide-react"
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
  useDraggable,
  useDroppable,
  pointerWithin,
  rectIntersection as rectIntersectionCollision
} from '@dnd-kit/core'
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FormField, FormStep, FormData, fieldTypes } from "@/lib/types"
import { FormFieldConfig } from "./FormFieldConfig"
import { FormStylingPanel } from "./FormStylingPanel"
import { FormPresets } from "./FormPresets"
import { MultiStepFormBuilder } from "./MultiStepFormBuilder"
import { FormRenderer } from "./FormRenderer"
import { FieldRenderer } from "./FieldRenderer"
import { getDeviceStyles } from "@/lib/utils"

// Utility function to get field icon
const getFieldIcon = (type: string) => {
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

interface DraggableFormBuilderProps {
  formData: FormData
  onFormDataChange: (formData: FormData) => void
}

interface DraggableFieldProps {
  field: FormField
  index: number
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  onUpdate: (updates: Partial<FormField>) => void
}

interface FieldPaletteItemProps {
  fieldType: typeof fieldTypes[number]
  onDragStart: (fieldType: typeof fieldTypes[number]) => void
}

interface DropZoneProps {
  children: React.ReactNode
  className?: string
}

interface MultiStepDropZoneProps {
  step: FormStep
  stepIndex: number
  formData: FormData
  onFormDataChange: (formData: FormData) => void
  selectedField: FormField | null
  onSelectField: (field: FormField | null) => void
  previewDevice: 'desktop' | 'tablet' | 'mobile'
  setShowSettingsPanel: (show: boolean) => void
  dragHandleProps?: {
    attributes: any
    listeners: any
  }
}

interface SortableStepWrapperProps {
  step: FormStep
  stepIndex: number
  formData: FormData
  onFormDataChange: (formData: FormData) => void
  selectedField: FormField | null
  onSelectField: (field: FormField | null) => void
  previewDevice: 'desktop' | 'tablet' | 'mobile'
  setShowSettingsPanel: (show: boolean) => void
}

// Drop Zone Component
function DropZone({ children, className = "" }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'preview-drop-zone',
    data: {
      type: 'dropZone',
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-blue-50 border-blue-300' : ''}`}
    >
      {children}
    </div>
  )
}

// Multi Step Drop Zone Component
function MultiStepDropZone({ 
  step, 
  stepIndex, 
  formData, 
  onFormDataChange, 
  selectedField, 
  onSelectField, 
  previewDevice,
  setShowSettingsPanel,
  dragHandleProps
}: MultiStepDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `step-drop-zone-${step.id}`,
    data: {
      type: 'stepDropZone',
      stepId: step.id,
    },
  })

  const addFieldToStep = (type: FormField['type']) => {
    const getDefaultPlaceholder = (fieldType: FormField['type']) => {
      switch (fieldType) {
        case 'text': return 'Enter text...'
        case 'email': return 'Enter email address...'
        case 'textarea': return 'Enter your message...'
        case 'number': return 'Enter number...'
        case 'date': return 'Select date...'
        case 'select': return 'Choose an option...'
        case 'multiselect': return 'Select multiple options...'
        case 'multi-dropdown': return 'Choose options...'
        case 'checkbox': return 'Select options...'
        case 'radio': return 'Choose one option...'
        default: return 'Enter text...'
      }
    }

    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      width: 'full',
      placeholder: getDefaultPlaceholder(type),
      ...(type === 'select' || type === 'multiselect' || type === 'multi-dropdown' || type === 'radio' || type === 'checkbox' ? { options: ['Option 1', 'Option 2'] } : {})
    }
    
    const updatedSteps = formData.steps.map(s => 
      s.id === step.id 
        ? { ...s, fields: [...s.fields, newField] }
        : s
    )
    onFormDataChange({ ...formData, steps: updatedSteps })
    onSelectField(newField)
  }

  const updateStep = (updates: Partial<FormStep>) => {
    const updatedSteps = formData.steps.map(s => 
      s.id === step.id ? { ...s, ...updates } : s
    )
    onFormDataChange({ ...formData, steps: updatedSteps })
  }

  const updateFieldInStep = (fieldId: string, updates: Partial<FormField>) => {
    const updatedSteps = formData.steps.map(s => 
      s.id === step.id 
        ? { 
            ...s, 
            fields: s.fields.map(field => 
              field.id === fieldId ? { ...field, ...updates } : field
            )
          }
        : s
    )
    onFormDataChange({ ...formData, steps: updatedSteps })
    
    if (selectedField?.id === fieldId) {
      onSelectField({ ...selectedField, ...updates })
    }
  }

  const removeFieldFromStep = (fieldId: string) => {
    const updatedSteps = formData.steps.map(s => 
      s.id === step.id 
        ? { ...s, fields: s.fields.filter(field => field.id !== fieldId) }
        : s
    )
    onFormDataChange({ ...formData, steps: updatedSteps })
    
    if (selectedField?.id === fieldId) {
      onSelectField(null)
    }
  }

  const removeStep = () => {
    const updatedSteps = formData.steps.filter(s => s.id !== step.id)
    onFormDataChange({ ...formData, steps: updatedSteps })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg">
      {/* Step Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Drag Handle */}
            {dragHandleProps && (
              <div
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
                className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 transition-all duration-200"
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-600">{stepIndex + 1}</span>
            </div>
            <div className="flex-1">
              <Input
                value={step.title}
                onChange={(e) => updateStep({ title: e.target.value })}
                placeholder="Enter step title"
                className="h-8 text-lg font-semibold border-none bg-transparent p-0 focus:ring-0 focus:border-none"
              />
              <Input
                value={step.description || ''}
                onChange={(e) => updateStep({ description: e.target.value })}
                placeholder="Enter step description (optional)"
                className="h-6 text-sm text-slate-600 border-none bg-transparent p-0 focus:ring-0 focus:border-none mt-1"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeStep}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <div 
          ref={setNodeRef}
          className={`min-h-[200px] rounded-xl border-2 border-dashed transition-all duration-300 ${
            isOver 
              ? 'bg-purple-50 border-purple-300' 
              : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
          }`}
          style={{
            ...getDeviceStyles(formData.styling, previewDevice),
            padding: '24px'
          }}
        >
            {/* Device Indicator */}
            <div className="flex items-center justify-center py-2 border-b border-slate-200 mb-4">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                {previewDevice === 'mobile' ? <Smartphone className="h-4 w-4" /> : 
                 previewDevice === 'tablet' ? <Tablet className="h-4 w-4" /> : 
                 <Monitor className="h-4 w-4" />}
                <span className="capitalize">{previewDevice} Preview</span>
              </div>
            </div>

            {/* Step Fields */}
            {step.fields.length > 0 ? (
              <div className="space-y-4">
                <FormRenderer
                  form={{
                    id: `step-${step.id}`,
                    title: step.title,
                    description: step.description,
                    fields: step.fields,
                    isMultistep: false,
                    settings: formData.settings,
                    styling: formData.styling,
                    thankYouPage: formData.thankYouPage,
                    errorPage: formData.errorPage
                  } as any}
                  onSubmit={async () => {}}
                  editMode={true}
                  showHeader={false}
                  onFieldSettings={(field) => {
                    onSelectField(field)
                    setShowSettingsPanel(true)
                  }}
                  onFieldUpdate={(fieldId, updates) => {
                    updateFieldInStep(fieldId, updates)
                  }}
                  onFieldDelete={(fieldId) => {
                    removeFieldFromStep(fieldId)
                  }}
                  className=""
                />
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Layout className="h-10 w-10 text-purple-500" />
                </div>
                <p className="text-lg font-semibold mb-2 text-slate-600">Drop fields here for Step {stepIndex + 1}</p>
                <p className="text-sm text-slate-500">Drag field types from the left panel</p>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

// Sortable Step Wrapper Component
function SortableStepWrapper({ 
  step, 
  stepIndex, 
  formData, 
  onFormDataChange, 
  selectedField, 
  onSelectField, 
  previewDevice,
  setShowSettingsPanel
}: SortableStepWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-300 ${
        isDragging ? 'opacity-60 scale-105 shadow-2xl' : ''
      }`}
    >
      <MultiStepDropZone
        step={step}
        stepIndex={stepIndex}
        formData={formData}
        onFormDataChange={onFormDataChange}
        selectedField={selectedField}
        onSelectField={onSelectField}
        previewDevice={previewDevice}
        setShowSettingsPanel={setShowSettingsPanel}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  )
}

// Field Palette Item Component
function FieldPaletteItem({ fieldType, onDragStart }: FieldPaletteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `field-type-${fieldType.value}`,
    data: {
      type: 'fieldType',
      fieldType: fieldType,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
  }


  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 ${
              isDragging ? 'opacity-60 scale-110 shadow-2xl' : 'hover:scale-105'
            } group`}
          >
            <CardContent >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:shadow-md transition-all duration-300">
                  {getFieldIcon(fieldType.value)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors duration-200">{fieldType.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>Drag to add {fieldType.label} field</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Draggable Field Component for the palette
function DraggableField({ field, index, isSelected, onSelect, onRemove, onUpdate }: DraggableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const [showWidthSettings, setShowWidthSettings] = useState(false)
  const widthSettingsRef = useRef<HTMLDivElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Click outside handler for width settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widthSettingsRef.current && !widthSettingsRef.current.contains(event.target as Node)) {
        setShowWidthSettings(false)
      }
    }

    if (showWidthSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showWidthSettings])


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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group relative transition-all duration-300 ${
        isSelected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 bg-blue-50/50' 
          : isDragging 
            ? 'border-slate-300 shadow-xl opacity-60 scale-105' 
            : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:bg-slate-50/50'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 transition-all duration-200"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Field Info */}
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={onSelect}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600 shadow-sm group-hover:shadow-md transition-all duration-300">
                {getFieldIcon(field.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-3">
                  <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors duration-200">
                    {field.label}
                  </p>
                  {field.required && (
                    <Badge variant="destructive" className="text-xs px-2 py-1 h-5 bg-red-100 text-red-700 border-red-200">
                      Required
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 group-hover:text-blue-600 transition-colors duration-200">
                  {getFieldTypeLabel(field.type)}
                </p>
              </div>
            </div>
          </div>

          {/* Inline Field Settings */}
          <div className="flex items-center space-x-2 opacity-100 transition-all duration-200">
            {/* Width Setting */}
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowWidthSettings(!showWidthSettings)
                }}
                className="h-6 px-2 text-xs border-gray-300 hover:border-blue-500 hover:text-blue-600"
              >
                {field.width === 'full' ? '100%' : 
                 field.width === 'half' ? '50%' : 
                 field.width === 'third' ? '33%' : 
                 field.width === 'two-thirds' ? '67%' : '100%'}
              </Button>
              {showWidthSettings && (
                <div ref={widthSettingsRef} className="absolute top-7 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[120px]">
                  <div className="space-y-1">
                    {[
                      { value: 'full', label: 'Full Width', icon: '100%' },
                      { value: 'half', label: 'Half Width', icon: '50%' },
                      { value: 'third', label: 'One Third', icon: '33%' },
                      { value: 'two-thirds', label: 'Two Thirds', icon: '67%' }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdate({ width: option.value as any })
                          setShowWidthSettings(false)
                        }}
                        className={`w-full justify-start h-6 text-xs ${
                          field.width === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Required Setting */}
            <Button
              type="button"
              variant={field.required ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onUpdate({ required: !field.required })
              }}
              className={`h-6 px-2 text-xs ${
                field.required 
                  ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' 
                  : 'border-gray-300 hover:border-red-500 hover:text-red-600'
              }`}
            >
              {field.required ? 'Required' : 'Optional'}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 opacity-100 transition-all duration-200">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect()
                    }}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure field</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove()
                    }}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove field</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-lg" />
      )}
    </Card>
  )
}

export function DraggableFormBuilder({ formData, onFormDataChange }: DraggableFormBuilderProps) {
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [draggedField, setDraggedField] = useState<FormField | null>(null)
  const [draggedFieldType, setDraggedFieldType] = useState<typeof fieldTypes[number] | null>(null)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [activeSettingsTab, setActiveSettingsTab] = useState<'styling' | 'global' | 'presets'>('styling')
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [showFormTypeSelection, setShowFormTypeSelection] = useState(!formData.formTypeSelected)

  // Refs for click-outside detection
  const settingsPanelRef = useRef<HTMLDivElement>(null)

  // Click-outside handler for settings panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(event.target as Node)) {
        setShowSettingsPanel(false)
        setSelectedField(null)
      }
    }

    if (showSettingsPanel) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettingsPanel])

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

  const getWidthClass = (width: string) => {
    switch (width) {
      case 'half': return 'flex-[1_1_50%] min-w-0'
      case 'third': return 'flex-[1_1_33.333%] min-w-0'
      case 'two-thirds': return 'flex-[1_1_66.666%] min-w-0'
      case 'full': return 'flex-[1_1_100%] min-w-0'
      default: return 'flex-[1_1_100%] min-w-0'
    }
  }

  const handleFormTypeSelection = (isMultistep: boolean) => {
    onFormDataChange({
      ...formData,
      isMultistep,
      formTypeSelected: true,
      // Clear existing data when switching types
      fields: isMultistep ? [] : formData.fields,
      steps: isMultistep ? formData.steps : []
    })
    setShowFormTypeSelection(false)
  }

  const addField = (type: FormField['type']) => {
    // Get default placeholder based on field type
    const getDefaultPlaceholder = (fieldType: FormField['type']) => {
      switch (fieldType) {
        case 'text': return 'Enter text...'
        case 'email': return 'Enter email address...'
        case 'textarea': return 'Enter your message...'
        case 'number': return 'Enter number...'
        case 'date': return 'Select date...'
        case 'select': return 'Choose an option...'
        case 'multiselect': return 'Select multiple options...'
        case 'multi-dropdown': return 'Choose options...'
        case 'checkbox': return 'Select options...'
        case 'radio': return 'Choose one option...'
        default: return 'Enter text...'
      }
    }

    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      width: 'full',
      placeholder: getDefaultPlaceholder(type),
      ...(type === 'select' || type === 'multiselect' || type === 'multi-dropdown' || type === 'radio' || type === 'checkbox' ? { options: ['Option 1', 'Option 2'] } : {})
    }
    
    const updatedFields = [...formData.fields, newField]
    onFormDataChange({ ...formData, fields: updatedFields })
    // Automatically select the new field
    setSelectedField(newField)
  }

  const addFieldToStep = (stepId: string, type: FormField['type']) => {
    // Get default placeholder based on field type
    const getDefaultPlaceholder = (fieldType: FormField['type']) => {
      switch (fieldType) {
        case 'text': return 'Enter text...'
        case 'email': return 'Enter email address...'
        case 'textarea': return 'Enter your message...'
        case 'number': return 'Enter number...'
        case 'date': return 'Select date...'
        case 'select': return 'Choose an option...'
        case 'multiselect': return 'Select multiple options...'
        case 'multi-dropdown': return 'Choose options...'
        case 'checkbox': return 'Select options...'
        case 'radio': return 'Choose one option...'
        default: return 'Enter text...'
      }
    }

    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      width: 'full',
      placeholder: getDefaultPlaceholder(type),
      ...(type === 'select' || type === 'multiselect' || type === 'multi-dropdown' || type === 'radio' || type === 'checkbox' ? { options: ['Option 1', 'Option 2'] } : {})
    }
    
    const updatedSteps = formData.steps.map(step => 
      step.id === stepId 
        ? { ...step, fields: [...step.fields, newField] }
        : step
    )
    onFormDataChange({ ...formData, steps: updatedSteps })
    // Automatically select the new field
    setSelectedField(newField)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = formData.fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    )
    onFormDataChange({ ...formData, fields: updatedFields })
    
    // Update selected field if it's the one being updated
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates })
    }
  }

  const removeField = (fieldId: string) => {
    const updatedFields = formData.fields.filter(field => field.id !== fieldId)
    onFormDataChange({ ...formData, fields: updatedFields })
    
    // Clear selection if the removed field was selected
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    
    // Check if dragging from palette
    if (active.data.current?.type === 'fieldType') {
      setDraggedFieldType(active.data.current.fieldType)
    } else {
      // Check if dragging existing field
      const fieldId = active.id as string
      
      // For single-step forms
      const field = formData.fields.find(f => f.id === fieldId)
      if (field) {
        setDraggedField(field)
        return
      }
      
      // For multistep forms
      for (const step of formData.steps) {
        const stepField = step.fields.find(f => f.id === fieldId)
        if (stepField) {
          setDraggedField(stepField)
          return
        }
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedField(null)
    setDraggedFieldType(null)

    if (!over) return

    // Handle dropping field type from palette
    if (active.data.current?.type === 'fieldType') {
      const fieldType = active.data.current.fieldType
      
      // Check if dropping over an existing field in a step (add before it)
      if (formData.isMultistep) {
        for (const step of formData.steps) {
          const targetField = step.fields.find(f => f.id === over.id)
          if (targetField) {
            addFieldToStep(step.id, fieldType.value as FormField['type'])
            return
          }
        }
      }
      
      // Check if dropping into a step drop zone
      if (over.data.current?.type === 'stepDropZone') {
        const stepId = over.data.current.stepId
        addFieldToStep(stepId, fieldType.value as FormField['type'])
        return
      }
      
      // Handle single-step form
      if (!formData.isMultistep) {
        addField(fieldType.value as FormField['type'])
        return
      }
    }

    // Prioritize field reordering over step reordering
    // First, check if we're dragging a field (not a step)
    let isDraggingField = false
    let isDraggingStep = false
    
    // Check if dragging a field
    if (!formData.isMultistep) {
      isDraggingField = formData.fields.some(f => f.id === active.id)
    } else {
      for (const step of formData.steps) {
        if (step.fields.some(f => f.id === active.id)) {
          isDraggingField = true
          break
        }
      }
    }
    
    // Check if dragging a step
    if (formData.isMultistep && !isDraggingField) {
      isDraggingStep = formData.steps.some(s => s.id === active.id)
    }

    // Handle reordering existing fields in single-step form
    if (!formData.isMultistep && isDraggingField && active.id !== over.id) {
      const oldIndex = formData.fields.findIndex(field => field.id === active.id)
      const newIndex = formData.fields.findIndex(field => field.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedFields = arrayMove(formData.fields, oldIndex, newIndex)
        onFormDataChange({ ...formData, fields: updatedFields })
        return
      }
    }

    // Handle reordering fields within steps
    if (formData.isMultistep && isDraggingField && active.id !== over.id) {
      // Find which step contains the dragged field
      let sourceStep = null
      let targetStep = null
      
      for (const step of formData.steps) {
        if (step.fields.find(f => f.id === active.id)) {
          sourceStep = step
        }
        if (step.fields.find(f => f.id === over.id)) {
          targetStep = step
        }
      }
      
      // Only allow reordering within the same step
      if (sourceStep && targetStep && sourceStep.id === targetStep.id) {
        const oldIndex = sourceStep.fields.findIndex(field => field.id === active.id)
        const newIndex = sourceStep.fields.findIndex(field => field.id === over.id)
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const updatedFields = arrayMove(sourceStep.fields, oldIndex, newIndex)
          const updatedSteps = formData.steps.map(step => 
            step.id === sourceStep.id ? { ...step, fields: updatedFields } : step
          )
          onFormDataChange({ ...formData, steps: updatedSteps })
          return
        }
      }
    }

    // Handle reordering steps (only if we're dragging a step, not a field)
    if (formData.isMultistep && isDraggingStep && active.id !== over.id) {
      const oldIndex = formData.steps.findIndex(step => step.id === active.id)
      const newIndex = formData.steps.findIndex(step => step.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedSteps = arrayMove(formData.steps, oldIndex, newIndex)
        onFormDataChange({ ...formData, steps: updatedSteps })
        return
      }
    }
  }

  const getDeviceLayoutStyles = () => {
    switch (previewDevice) {
      case 'mobile':
        return {
          maxWidth: '375px',
          margin: '0 auto',
          padding: '16px'
        }
      case 'tablet':
        return {
          maxWidth: '768px',
          margin: '0 auto',
          padding: '24px'
        }
      default:
        return {
          maxWidth: '100%',
          margin: '0',
          padding: '32px'
        }
    }
  }

  const getDeviceIcon = () => {
    switch (previewDevice) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  // Show form type selection if not selected yet
  if (showFormTypeSelection) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-2xl mx-auto p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg">
              <Layout className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Form Type</h2>
            <p className="text-lg text-slate-600">Select how you want to structure your form</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single Step Form */}
            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-300"
              onClick={() => handleFormTypeSelection(false)}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Single Step Form</h3>
                <p className="text-slate-600 mb-4">All fields on one page. Perfect for simple forms like contact forms or surveys.</p>
                <div className="text-sm text-slate-500">
                  <p>✓ Quick and simple</p>
                  <p>✓ Easy to fill out</p>
                  <p>✓ Perfect for short forms</p>
                </div>
              </CardContent>
            </Card>

            {/* Multi Step Form */}
            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-300"
              onClick={() => handleFormTypeSelection(true)}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Layout className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Multi Step Form</h3>
                <p className="text-slate-600 mb-4">Break your form into multiple steps. Great for complex forms like applications or onboarding.</p>
                <div className="text-sm text-slate-500">
                  <p>✓ Better user experience</p>
                  <p>✓ Progress tracking</p>
                  <p>✓ Perfect for long forms</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Custom collision detection that prioritizes fields over drop zones
  const customCollisionDetection = (args: any) => {
    // First try to find collisions using pointerWithin for better accuracy
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
      <div className="flex h-full">
        {/* Left Sidebar - Field Palette */}
        <div className="max-w-fit bg-white/90 backdrop-blur-sm border-r border-slate-200/60 flex flex-col shadow-sm">
          {/* Field Palette Header */}
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Field Types</h3>
                <p className="text-sm text-slate-600">
                  {formData.isMultistep 
                    ? "Drag fields to add them to steps" 
                    : "Drag fields to add them to your form"
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Field Palette Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {fieldTypes.map((fieldType) => (
                <FieldPaletteItem
                  key={fieldType.value}
                  fieldType={fieldType}
                  onDragStart={() => {}}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center - Live Preview */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-white">
          {/* Preview Header */}
          <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 px-8 py-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Live Preview</h2>
                  <p className="text-sm text-slate-600">See how your form will look</p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-3">
                {/* Form Type Toggle */}
                <div className="flex items-center space-x-2 bg-slate-100/80 rounded-xl p-1 shadow-sm">
                  <Button
                    variant={!formData.isMultistep ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      if (formData.isMultistep) {
                        onFormDataChange({ ...formData, isMultistep: false, fields: [], steps: [] })
                      }
                    }}
                    className="h-9 px-3 rounded-lg transition-all duration-200"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Single Step
                  </Button>
                  <Button
                    variant={formData.isMultistep ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      if (!formData.isMultistep) {
                        onFormDataChange({ ...formData, isMultistep: true, fields: [], steps: [] })
                      }
                    }}
                    className="h-9 px-3 rounded-lg transition-all duration-200"
                  >
                    <Layout className="h-4 w-4 mr-1" />
                    Multi Step
                  </Button>
                </div>
                
                {/* Settings Toggle */}
                <Button
                  variant={showSettingsPanel ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                  className="h-9 px-3 rounded-lg transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                
                {/* Device Preview Toggle */}
                <div className="flex items-center space-x-2 bg-slate-100/80 rounded-xl p-1 shadow-sm">
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-9 w-9 p-0 rounded-lg transition-all duration-200"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('tablet')}
                    className="h-9 w-9 p-0 rounded-lg transition-all duration-200"
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-9 w-9 p-0 rounded-lg transition-all duration-200"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {formData.isMultistep ? (
              /* Multi Step Form Builder */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                        <Layout className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Multi Step Form Builder</h3>
                        <p className="text-sm text-slate-600">Organize your form into steps</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        const stepNumber = formData.steps.length + 1
                        const newStep: FormStep = {
                          id: `step_${Date.now()}`,
                          title: `Step ${stepNumber}`,
                          description: '',
                          fields: []
                        }
                        onFormDataChange({ ...formData, steps: [...formData.steps, newStep] })
                      }}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  {formData.steps.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-sm">
                        <Layout className="h-10 w-10 text-purple-500" />
                      </div>
                      <p className="text-lg font-semibold mb-2 text-slate-600">No steps added yet</p>
                      <p className="text-sm text-slate-500 mb-4">Start building your multistep form by adding steps</p>
                      <Button 
                        onClick={() => {
                          const newStep: FormStep = {
                            id: `step_${Date.now()}`,
                            title: 'New Step',
                            description: '',
                            fields: []
                          }
                          onFormDataChange({ ...formData, steps: [newStep] })
                        }}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first step
                      </Button>
                    </div>
                  ) : (
                    <SortableContext
                      items={formData.steps.map(step => step.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-6">
                        {formData.steps.map((step, stepIndex) => (
                          <SortableStepWrapper
                            key={step.id}
                            step={step}
                            stepIndex={stepIndex}
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                            selectedField={selectedField}
                            onSelectField={setSelectedField}
                            previewDevice={previewDevice}
                            setShowSettingsPanel={setShowSettingsPanel}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  )}
                </div>
              </div>
            ) : (
              /* Single Step Form Builder */
              <DropZone className="bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-lg hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                <div 
                  style={{
                    ...getDeviceStyles(formData.styling, previewDevice),
                    ...getDeviceLayoutStyles()
                  }}
                >
                {/* Device Indicator */}
                <div className="flex items-center justify-center py-2 border-b border-slate-200 mb-4">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    {getDeviceIcon()}
                    <span className="capitalize">{previewDevice} Preview</span>
                  </div>
                </div>

                {/* Form Header */}
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-xl font-semibold">{formData.title || 'Untitled Form'}</h2>
                  {formData.description && (
                    <p className="text-sm opacity-75">{formData.description}</p>
                  )}
                </div>

                {/* Form Fields */}
                <div className="min-h-[200px]">
                  {formData.fields.length > 0 ? (
                    <FormRenderer
                      form={{
                        id: 'preview-form',
                        title: formData.title || 'Untitled Form',
                        description: formData.description,
                        fields: formData.fields,
                        isMultistep: false,
                        settings: formData.settings,
                        styling: formData.styling,
                        thankYouPage: formData.thankYouPage,
                        errorPage: formData.errorPage
                      } as any}
                      onSubmit={async () => {}}
                      editMode={true}
                      showHeader={false}
                      onFieldSettings={(field) => {
                        setSelectedField(field)
                        setShowSettingsPanel(true)
                      }}
                      onFieldUpdate={(fieldId, updates) => {
                        // Update the field in formData
                        const updatedFields = formData.fields.map(field => 
                          field.id === fieldId ? { ...field, ...updates } : field
                        )
                        onFormDataChange({ ...formData, fields: updatedFields })
                      }}
                      onFieldDelete={(fieldId) => {
                        removeField(fieldId)
                      }}
                      className=""
                    />
                  ) : (
                    <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                        <Layout className="h-10 w-10 text-slate-500" />
                      </div>
                      <p className="text-lg font-semibold mb-2 text-slate-600">Drop fields here to build your form</p>
                      <p className="text-sm text-slate-500">Drag field types from the left panel</p>
                    </div>
                  )}
                </div>

                </div>
              </DropZone>
            )}
          </div>
        </div>

        {/* Floating Settings Panel */}
        {showSettingsPanel && (
          <div ref={settingsPanelRef} className="fixed top-20 right-4 w-96 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl z-50 flex flex-col max-h-[calc(100vh-6rem)]">
            {/* Field Configuration Panel */}
            {selectedField && (
              <div className="border-b border-slate-200/60">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Settings2 className="h-5 w-5 text-slate-600" />
                      <h3 className="text-lg font-bold text-slate-900">Field Settings</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedField(null)
                        setShowSettingsPanel(false)
                      }}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormFieldConfig
                    field={selectedField}
                    onUpdate={(updates) => updateField(selectedField.id, updates)}
                    onClose={() => {
                      setSelectedField(null)
                      setShowSettingsPanel(false)
                    }}
                  />
                </div>
              </div>
            )}
            {/* Settings Header */}
            {!selectedField && (
              <div className="p-4 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-900">Settings</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettingsPanel(false)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Settings Tabs */}
            {!selectedField && (
              <div className="flex-1 overflow-hidden">
              <Tabs value={activeSettingsTab} onValueChange={(value) => setActiveSettingsTab(value as any)} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
                  <TabsTrigger value="styling" className="text-xs">
                    <Palette className="h-3 w-3 mr-1" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="global" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Global
                  </TabsTrigger>
                  <TabsTrigger value="presets" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Presets
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="styling" className="h-full m-0">
                    <FormStylingPanel
                      styling={formData.styling}
                      onStylingChange={(styling) => onFormDataChange({ ...formData, styling })}
                      thankYouPage={formData.thankYouPage}
                      onThankYouPageChange={(thankYouPage) => onFormDataChange({ ...formData, thankYouPage })}
                      errorPage={formData.errorPage}
                      onErrorPageChange={(errorPage) => onFormDataChange({ ...formData, errorPage })}
                      allowMultipleSubmissions={formData.settings.allowMultipleSubmissions}
                    />
                  </TabsContent>

                  <TabsContent value="global" className="h-full m-0">
                    <div className="p-6 space-y-6">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                          <Globe className="h-8 w-8 text-slate-500" />
                        </div>
                        <p className="text-base font-semibold text-slate-600 mb-2">Global Settings</p>
                        <p className="text-sm text-slate-500">Configure form-wide settings</p>
                      </div>

                      {/* Form Title */}
                      <div className="space-y-2">
                        <Label htmlFor="formTitle" className="text-sm font-semibold text-slate-700">Form Title</Label>
                        <Input
                          id="formTitle"
                          value={formData.title || ''}
                          onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                          placeholder="Enter form title"
                          className="h-10 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Form Description */}
                      <div className="space-y-2">
                        <Label htmlFor="formDescription" className="text-sm font-semibold text-slate-700">Form Description</Label>
                        <Textarea
                          id="formDescription"
                          value={formData.description || ''}
                          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                          placeholder="Enter form description"
                          rows={3}
                          className="text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      {/* Submit Button Text */}
                      <div className="space-y-2">
                        <Label htmlFor="submitButtonText" className="text-sm font-semibold text-slate-700">Submit Button Text</Label>
                        <Input
                          id="submitButtonText"
                          value={formData.settings.submitButtonText}
                          onChange={(e) => onFormDataChange({ 
                            ...formData, 
                            settings: { ...formData.settings, submitButtonText: e.target.value }
                          })}
                          placeholder="Submit"
                          className="h-10 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Allow Multiple Submissions */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <Label className="text-sm font-semibold text-slate-700">Allow Multiple Submissions</Label>
                          <p className="text-xs text-slate-500">Let users submit the form multiple times</p>
                        </div>
                        <Switch
                          checked={formData.settings.allowMultipleSubmissions}
                          onCheckedChange={(checked) => onFormDataChange({ 
                            ...formData, 
                            settings: { ...formData.settings, allowMultipleSubmissions: checked }
                          })}
                        />
                      </div>

                      {/* Show Progress Bar */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <Label className="text-sm font-semibold text-slate-700">Show Progress Bar</Label>
                          <p className="text-xs text-slate-500">Display progress indicator for multi-step forms</p>
                        </div>
                        <Switch
                          checked={formData.settings.showProgressBar}
                          onCheckedChange={(checked) => onFormDataChange({ 
                            ...formData, 
                            settings: { ...formData.settings, showProgressBar: checked }
                          })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="presets" className="h-full m-0">
                    <div className="p-6">
                      <FormPresets
                        onPresetSelect={(preset) => {
                          onFormDataChange({
                            ...formData,
                            title: preset.title,
                            description: preset.formDescription,
                            isMultistep: preset.isMultistep,
                            fields: preset.isMultistep ? [] : (preset.fields || []),
                            steps: preset.isMultistep ? (preset.steps || []) : [],
                            styling: preset.styling,
                            thankYouPage: preset.thankYouPage,
                            settings: preset.settings,
                            formTypeSelected: true
                          })
                        }}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedFieldType ? (
          <Card className="shadow-2xl opacity-95 scale-110 border-blue-400">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 shadow-md">
                  {getFieldIcon(draggedFieldType.value)}
                </div>
                <span className="text-sm font-semibold text-slate-900">{draggedFieldType.label}</span>
              </div>
            </CardContent>
          </Card>
        ) : draggedField ? (
          <Card className="shadow-2xl opacity-95 scale-110 border-blue-400">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600 shadow-md">
                  {getFieldIcon(draggedField.type)}
                </div>
                <span className="text-sm font-semibold text-slate-900">{draggedField.label}</span>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
