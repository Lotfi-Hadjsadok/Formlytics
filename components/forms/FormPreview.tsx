"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Eye, Layout, Settings } from "lucide-react"

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

interface FormStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

interface FormData {
  title: string
  description: string
  fields: FormField[]
  steps: FormStep[]
  isMultistep: boolean
  settings: {
    allowMultipleSubmissions: boolean
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

interface FormPreviewProps {
  formData: FormData
}

export function FormPreview({ formData }: FormPreviewProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'form' | 'thankYou'>('form')

  const getWidthClass = (width: string) => {
    switch (width) {
      case 'half': return 'md:col-span-1'
      case 'third': return 'md:col-span-1'
      case 'two-thirds': return 'md:col-span-2'
      case 'full': return 'md:col-span-2'
      default: return 'md:col-span-2'
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
        {/* Preview Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activePreviewTab === 'form' 
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActivePreviewTab('form')}
            >
              <div className="flex items-center justify-center space-x-2">
                <Layout className="h-4 w-4" />
                <span>Form</span>
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activePreviewTab === 'thankYou' 
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActivePreviewTab('thankYou')}
            >
              <div className="flex items-center justify-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Thank You Page</span>
              </div>
            </button>
          </div>
        </div>

        {/* Form Preview */}
        {activePreviewTab === 'form' && (
          <div 
            className="p-8 rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white"
            style={{
              backgroundColor: formData.styling.backgroundColor,
              color: formData.styling.textColor,
              fontFamily: formData.styling.fontFamily,
              borderRadius: formData.styling.borderRadius,
            }}
          >
            <div className="space-y-4">
              {formData.isMultistep ? (
                formData.steps.length > 0 ? (
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    {formData.settings.showProgressBar && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Step 1 of {formData.steps.length}</span>
                          <span>33% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              backgroundColor: formData.styling.primaryColor,
                              width: '33%'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Step Preview */}
                    <div className="space-y-4">
                      
                      {(() => {
                        const stepFields = formData.steps[0]?.fields || []
                        const organizedRows = organizeFieldsIntoRows(stepFields)
                        
                        return organizedRows.map((row, rowIndex) => (
                          <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            {row.map((field) => (
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
                        ))
                      })()}
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="outline"
                        disabled
                        className="opacity-50"
                      >
                        Previous
                      </Button>
                      <Button 
                        disabled
                        className="opacity-50"
                        style={{
                          backgroundColor: formData.styling.primaryColor,
                          borderColor: formData.styling.primaryColor,
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>Add steps to see multistep preview</p>
                  </div>
                )
              ) : formData.fields.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const organizedRows = organizeFieldsIntoRows(formData.fields)
                    
                    return organizedRows.map((row, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {row.map((field) => (
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
                    ))
                  })()}
                  
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
            className="p-8 rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white"
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
    </div>
  )
}
