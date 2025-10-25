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
import { 
  Eye, 
  Layout, 
  Settings, 
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone
} from "lucide-react"
import { FormField, FormStep, FormData } from "@/lib/types"
import { getDeviceStyles } from "@/lib/utils"

interface LiveFormPreviewProps {
  formData: FormData
  device: 'desktop' | 'tablet' | 'mobile'
}

export function LiveFormPreview({ formData, device }: LiveFormPreviewProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'form' | 'thankYou' | 'errorPage'>('form')

  const getWidthStyle = (width: string) => {
    switch (width) {
      case 'half': return { flex: '1 1 50%', minWidth: 0 }
      case 'third': return { flex: '1 1 33.333%', minWidth: 0 }
      case 'two-thirds': return { flex: '1 1 66.666%', minWidth: 0 }
      case 'full': return { flex: '1 1 100%', minWidth: 0 }
      default: return { flex: '1 1 100%', minWidth: 0 }
    }
  }

  const getDeviceLayoutStyles = () => {
    switch (device) {
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
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Tabs */}
      <div className="mb-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activePreviewTab === 'form' 
                ? 'bg-white text-gray-900 shadow-sm' 
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
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activePreviewTab === 'thankYou' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActivePreviewTab('thankYou')}
          >
            <div className="flex items-center justify-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Thank You</span>
            </div>
          </button>
          {!formData.settings.allowMultipleSubmissions && (
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activePreviewTab === 'errorPage' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActivePreviewTab('errorPage')}
            >
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>Error</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-y-auto">
        <div 
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 shadow-sm"
          style={{
            ...getDeviceStyles(formData.styling, device),
            ...getDeviceLayoutStyles()
          }}
        >
          {/* Device Indicator */}
          <div className="flex items-center justify-center py-2 border-b border-gray-200 mb-4">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {getDeviceIcon()}
              <span className="capitalize">{device} Preview</span>
            </div>
          </div>

          {/* Form Preview */}
          {activePreviewTab === 'form' && (
            <div className="space-y-6">
              {/* Form Header */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">{formData.title || 'Untitled Form'}</h2>
                {formData.description && (
                  <p className="text-sm opacity-75">{formData.description}</p>
                )}
              </div>

              {/* Form Fields */}
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
                        
                        return (
                          <div className="flex flex-wrap gap-4">
                            {stepFields.map((field) => (
                              <div 
                                key={field.id} 
                                className="w-full md:w-auto space-y-2"
                                style={getWidthStyle(field.width)}
                              >
                                <Label className="text-sm font-medium">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                
                                {renderFieldPreview(field)}
                              </div>
                            ))}
                          </div>
                        )
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
                    return (
                      <div className="flex flex-wrap gap-4">
                        {formData.fields.map((field) => (
                          <div 
                            key={field.id} 
                            className="w-full md:w-auto space-y-2"
                            style={getWidthStyle(field.width)}
                          >
                            <Label className="text-sm font-medium">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            
                            {renderFieldPreview(field)}
                          </div>
                        ))}
                      </div>
                    )
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
          )}

          {/* Thank You Page Preview */}
          {activePreviewTab === 'thankYou' && (
            <div className="text-center space-y-4 py-8">
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
                  <p>Customize thank you page settings to see preview</p>
                </div>
              )}
            </div>
          )}

          {/* Error Page Preview */}
          {activePreviewTab === 'errorPage' && (
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl">
                {formData.errorPage.icon || '⚠️'}
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-red-600">
                  {formData.errorPage.title || 'Submission Not Allowed'}
                </h3>
                <p className="text-sm opacity-75 mt-2 max-w-md mx-auto">
                  {formData.errorPage.text || 'You have already submitted this form. Multiple submissions are not allowed.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  function renderFieldPreview(field: FormField) {
    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder || 'Enter text...'}
            disabled
            className="opacity-50"
          />
        )
      
      case 'email':
        return (
          <Input
            type="email"
            placeholder={field.placeholder || 'Enter email...'}
            disabled
            className="opacity-50"
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder || 'Enter text...'}
            disabled
            className="opacity-50"
            rows={3}
          />
        )
      
      case 'select':
        return (
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
        )
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder || 'Enter number...'}
            disabled
            className="opacity-50"
          />
        )
      
      case 'date':
        return (
          <DatePicker
            placeholder="Pick a date"
            disabled
            className="opacity-50"
          />
        )
      
      case 'radio':
        return (
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
        )
      
      case 'checkbox':
        return (
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
        )
      
      case 'multiselect':
        return (
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
        )
      
      case 'multi-dropdown':
        return (
          <Select disabled>
            <SelectTrigger className="opacity-50">
              <SelectValue placeholder="Select options..." />
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
      
      default:
        return (
          <Input
            placeholder={field.placeholder || 'Enter text...'}
            disabled
            className="opacity-50"
          />
        )
    }
  }
}
