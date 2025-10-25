"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Palette,
  Type,
  Image,
  Settings,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone
} from "lucide-react"
import { FormStyling, ThankYouPage, ErrorPage } from "@/lib/types"

interface FormStylingPanelProps {
  styling: FormStyling
  onStylingChange: (styling: FormStyling) => void
  thankYouPage: ThankYouPage
  onThankYouPageChange: (thankYouPage: ThankYouPage) => void
  errorPage: ErrorPage
  onErrorPageChange: (errorPage: ErrorPage) => void
  allowMultipleSubmissions: boolean
}

export function FormStylingPanel({ 
  styling, 
  onStylingChange, 
  thankYouPage, 
  onThankYouPageChange,
  errorPage,
  onErrorPageChange,
  allowMultipleSubmissions
}: FormStylingPanelProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'devices' | 'pages'>('colors')
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const colorPresets = [
    { name: 'Blue', primary: '#3b82f6', bg: '#ffffff', text: '#1f2937' },
    { name: 'Green', primary: '#10b981', bg: '#ffffff', text: '#1f2937' },
    { name: 'Purple', primary: '#8b5cf6', bg: '#ffffff', text: '#1f2937' },
    { name: 'Red', primary: '#ef4444', bg: '#ffffff', text: '#1f2937' },
    { name: 'Orange', primary: '#f97316', bg: '#ffffff', text: '#1f2937' },
    { name: 'Dark', primary: '#6366f1', bg: '#1f2937', text: '#ffffff' },
  ]

  const fontPresets = [
    { name: 'Inter', value: 'var(--font-inter)' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  ]

  const borderRadiusPresets = [
    { name: 'None', value: '0px' },
    { name: 'Small', value: '4px' },
    { name: 'Medium', value: '8px' },
    { name: 'Large', value: '12px' },
    { name: 'Extra Large', value: '16px' },
    { name: 'Rounded', value: '24px' },
  ]

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    onStylingChange({
      ...styling,
      primaryColor: preset.primary,
      backgroundColor: preset.bg,
      textColor: preset.text
    })
  }

  const updateDeviceStyling = (device: 'desktop' | 'tablet' | 'mobile', updates: any) => {
    onStylingChange({
      ...styling,
      [device]: {
        ...styling[device],
        ...updates
      }
    })
  }

  const getDeviceIcon = (device: 'desktop' | 'tablet' | 'mobile') => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Tab Navigation */}
      <div className="flex border-b border-slate-200/60 bg-slate-50/50 rounded-t-lg">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-t-lg ${
            activeTab === 'colors'
              ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Colors</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-t-lg ${
            activeTab === 'typography'
              ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Type className="h-4 w-4" />
            <span>Typography</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-t-lg ${
            activeTab === 'devices'
              ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Monitor className="h-4 w-4" />
            <span>Devices</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-t-lg ${
            activeTab === 'pages'
              ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Pages</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            {/* Color Presets */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Color Presets</Label>
              <div className="grid grid-cols-2 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    className="flex items-center space-x-3 p-3 text-sm border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all duration-200 group"
                  >
                    <div className="flex space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: preset.bg }}
                      />
                    </div>
                    <span className="font-medium group-hover:text-blue-700 transition-colors duration-200">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color */}
            <div className="space-y-3">
              <Label htmlFor="primaryColor" className="text-sm font-semibold text-slate-700">Primary Color</Label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={styling.primaryColor}
                    onChange={(e) => onStylingChange({ ...styling, primaryColor: e.target.value })}
                    className="h-12 w-16 p-1 border-2 border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all duration-200"
                  />
                  <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none"></div>
                </div>
                <Input
                  value={styling.primaryColor}
                  onChange={(e) => onStylingChange({ ...styling, primaryColor: e.target.value })}
                  placeholder="#3b82f6"
                  className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-slate-500">Used for buttons, links, and accent elements</p>
            </div>

            {/* Background Color */}
            <div className="space-y-3">
              <Label htmlFor="backgroundColor" className="text-sm font-semibold text-slate-700">Background Color</Label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={styling.backgroundColor}
                    onChange={(e) => onStylingChange({ ...styling, backgroundColor: e.target.value })}
                    className="h-12 w-16 p-1 border-2 border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all duration-200"
                  />
                  <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none"></div>
                </div>
                <Input
                  value={styling.backgroundColor}
                  onChange={(e) => onStylingChange({ ...styling, backgroundColor: e.target.value })}
                  placeholder="#ffffff"
                  className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-slate-500">Main background color of the form</p>
            </div>

            {/* Text Color */}
            <div className="space-y-3">
              <Label htmlFor="textColor" className="text-sm font-semibold text-slate-700">Text Color</Label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Input
                    id="textColor"
                    type="color"
                    value={styling.textColor}
                    onChange={(e) => onStylingChange({ ...styling, textColor: e.target.value })}
                    className="h-12 w-16 p-1 border-2 border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all duration-200"
                  />
                  <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none"></div>
                </div>
                <Input
                  value={styling.textColor}
                  onChange={(e) => onStylingChange({ ...styling, textColor: e.target.value })}
                  placeholder="#000000"
                  className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-slate-500">Color for labels and text content</p>
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="space-y-6">
            {/* Font Family */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Font Family</Label>
              <Select
                value={styling.fontFamily}
                onValueChange={(value) => onStylingChange({ ...styling, fontFamily: value })}
              >
                <SelectTrigger className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <span style={{ fontFamily: preset.value }} className="font-medium">{preset.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Choose the font family for your form</p>
            </div>

            {/* Border Radius */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Border Radius</Label>
              <Select
                value={styling.borderRadius}
                onValueChange={(value) => onStylingChange({ ...styling, borderRadius: value })}
              >
                <SelectTrigger className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {borderRadiusPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-6 h-6 border-2 border-slate-300 rounded"
                          style={{ borderRadius: preset.value }}
                        />
                        <span className="font-medium">{preset.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Control the roundness of form elements</p>
            </div>
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            {/* Device Selector */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Select Device</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                  <button
                    key={device}
                    onClick={() => setSelectedDevice(device)}
                    className={`flex items-center justify-center space-x-2 p-3 text-sm border rounded-xl transition-all duration-200 ${
                      selectedDevice === device
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {getDeviceIcon(device)}
                    <span className="font-medium capitalize">{device}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">Configure styles for {selectedDevice} devices</p>
            </div>

            {/* Device-specific styling */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                {getDeviceIcon(selectedDevice)}
                <h4 className="text-base font-bold text-slate-800 capitalize">{selectedDevice} Styles</h4>
                <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  Override base styles
                </div>
              </div>

              {/* Primary Color Override */}
              <div className="space-y-3">
                <Label htmlFor={`${selectedDevice}PrimaryColor`} className="text-sm font-semibold text-slate-700">
                  Primary Color Override
                </Label>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      id={`${selectedDevice}PrimaryColor`}
                      type="color"
                      value={styling[selectedDevice]?.primaryColor || styling.primaryColor}
                      onChange={(e) => updateDeviceStyling(selectedDevice, { primaryColor: e.target.value })}
                      className="h-12 w-16 p-1 border-2 border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all duration-200"
                    />
                    <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none"></div>
                  </div>
                  <Input
                    value={styling[selectedDevice]?.primaryColor || styling.primaryColor}
                    onChange={(e) => updateDeviceStyling(selectedDevice, { primaryColor: e.target.value })}
                    placeholder={styling.primaryColor}
                    className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
                <p className="text-xs text-slate-500">Override primary color for {selectedDevice} devices</p>
              </div>

              {/* Background Color Override */}
              <div className="space-y-3">
                <Label htmlFor={`${selectedDevice}BackgroundColor`} className="text-sm font-semibold text-slate-700">
                  Background Color Override
                </Label>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      id={`${selectedDevice}BackgroundColor`}
                      type="color"
                      value={styling[selectedDevice]?.backgroundColor || styling.backgroundColor}
                      onChange={(e) => updateDeviceStyling(selectedDevice, { backgroundColor: e.target.value })}
                      className="h-12 w-16 p-1 border-2 border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-all duration-200"
                    />
                    <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none"></div>
                  </div>
                  <Input
                    value={styling[selectedDevice]?.backgroundColor || styling.backgroundColor}
                    onChange={(e) => updateDeviceStyling(selectedDevice, { backgroundColor: e.target.value })}
                    placeholder={styling.backgroundColor}
                    className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
                <p className="text-xs text-slate-500">Override background color for {selectedDevice} devices</p>
              </div>

              {/* Font Size Override */}
              <div className="space-y-3">
                <Label htmlFor={`${selectedDevice}FontSize`} className="text-sm font-semibold text-slate-700">
                  Font Size Override
                </Label>
                <Select
                  value={styling[selectedDevice]?.fontSize || 'inherit'}
                  onValueChange={(value) => updateDeviceStyling(selectedDevice, { fontSize: value === 'inherit' ? undefined : value })}
                >
                  <SelectTrigger className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Use base font size</SelectItem>
                    <SelectItem value="12px">Small (12px)</SelectItem>
                    <SelectItem value="14px">Medium (14px)</SelectItem>
                    <SelectItem value="16px">Large (16px)</SelectItem>
                    <SelectItem value="18px">Extra Large (18px)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Override font size for {selectedDevice} devices</p>
              </div>

              {/* Padding Override */}
              <div className="space-y-3">
                <Label htmlFor={`${selectedDevice}Padding`} className="text-sm font-semibold text-slate-700">
                  Padding Override
                </Label>
                <Select
                  value={styling[selectedDevice]?.padding || 'inherit'}
                  onValueChange={(value) => updateDeviceStyling(selectedDevice, { padding: value === 'inherit' ? undefined : value })}
                >
                  <SelectTrigger className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Use base padding</SelectItem>
                    <SelectItem value="8px">Small (8px)</SelectItem>
                    <SelectItem value="12px">Medium (12px)</SelectItem>
                    <SelectItem value="16px">Large (16px)</SelectItem>
                    <SelectItem value="20px">Extra Large (20px)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Override padding for {selectedDevice} devices</p>
              </div>

              {/* Clear Overrides Button */}
              {styling[selectedDevice] && Object.keys(styling[selectedDevice]!).length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newStyling = { ...styling }
                      delete newStyling[selectedDevice]
                      onStylingChange(newStyling)
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    Clear {selectedDevice} overrides
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-8">
            {/* Thank You Page */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-800 flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                Thank You Page
              </h4>
              <div className="space-y-4">
                {/* Icon */}
                <div className="space-y-2">
                  <Label htmlFor="thankYouIcon" className="text-sm font-semibold text-slate-700">Icon (Emoji)</Label>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {thankYouPage.icon || '🎉'}
                    </div>
                    <Input
                      id="thankYouIcon"
                      value={thankYouPage.icon || ''}
                      onChange={(e) => onThankYouPageChange({ ...thankYouPage, icon: e.target.value })}
                      placeholder="🎉"
                      maxLength={2}
                      className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="thankYouTitle" className="text-sm font-semibold text-slate-700">Title</Label>
                  <Input
                    id="thankYouTitle"
                    value={thankYouPage.title || ''}
                    onChange={(e) => onThankYouPageChange({ ...thankYouPage, title: e.target.value })}
                    placeholder="Thank you!"
                    className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="thankYouText" className="text-sm font-semibold text-slate-700">Message</Label>
                  <Textarea
                    id="thankYouText"
                    value={thankYouPage.text || ''}
                    onChange={(e) => onThankYouPageChange({ ...thankYouPage, text: e.target.value })}
                    placeholder="Your form has been submitted successfully!"
                    rows={3}
                    className="text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Page - Only show if multiple submissions not allowed */}
            {!allowMultipleSubmissions && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-800 flex items-center">
                  <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-red-600 text-sm">⚠</span>
                  </div>
                  Error Page
                </h4>
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="space-y-2">
                    <Label htmlFor="errorIcon" className="text-sm font-semibold text-slate-700">Icon (Emoji)</Label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                        {errorPage.icon || '⚠️'}
                      </div>
                      <Input
                        id="errorIcon"
                        value={errorPage.icon || ''}
                        onChange={(e) => onErrorPageChange({ ...errorPage, icon: e.target.value })}
                        placeholder="⚠️"
                        maxLength={2}
                        className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="errorTitle" className="text-sm font-semibold text-slate-700">Title</Label>
                    <Input
                      id="errorTitle"
                      value={errorPage.title || ''}
                      onChange={(e) => onErrorPageChange({ ...errorPage, title: e.target.value })}
                      placeholder="Submission Not Allowed"
                      className="h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="errorText" className="text-sm font-semibold text-slate-700">Message</Label>
                    <Textarea
                      id="errorText"
                      value={errorPage.text || ''}
                      onChange={(e) => onErrorPageChange({ ...errorPage, text: e.target.value })}
                      placeholder="You have already submitted this form."
                      rows={3}
                      className="text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
