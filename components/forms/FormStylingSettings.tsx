"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Palette, Type } from "lucide-react"
import { FormStyling, FormStylingSettingsProps } from "@/lib/types"

const fontFamilies = [
  { value: 'var(--font-inter)', label: 'Inter' },
  { value: 'var(--font-roboto)', label: 'Roboto' },
  { value: 'var(--font-open-sans)', label: 'Open Sans' },
  { value: 'var(--font-lato)', label: 'Lato' },
  { value: 'var(--font-montserrat)', label: 'Montserrat' },
]

export function FormStylingSettings({ styling, onStylingChange }: FormStylingSettingsProps) {
  const updateStyling = (updates: Partial<FormStyling>) => {
    onStylingChange({ ...styling, ...updates })
  }

  return (
    <div className="space-y-6">
        {/* Color Palette Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
            <h4 className="text-lg font-semibold text-gray-900">Color Palette</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Background Color */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <Label className="text-sm font-semibold text-gray-700">Background</Label>
              </div>
              <div className="space-y-3">
                <div 
                  className="w-16 h-16 rounded-xl border-2 border-gray-200 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 relative overflow-hidden"
                  style={{ backgroundColor: styling.backgroundColor }}
                  onClick={() => document.getElementById('bg-color')?.click()}
                >
                  <input
                    id="bg-color"
                    type="color"
                    value={styling.backgroundColor}
                    onChange={(e) => updateStyling({ backgroundColor: e.target.value })}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <div className="space-y-2">
                  <Input
                    value={styling.backgroundColor}
                    onChange={(e) => updateStyling({ backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                    className="font-mono text-sm h-10"
                  />
                  <p className="text-xs text-gray-500">Hex color code</p>
                </div>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <Label className="text-sm font-semibold text-gray-700">Text</Label>
              </div>
              <div className="space-y-3">
                <div 
                  className="w-16 h-16 rounded-xl border-2 border-gray-200 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 relative overflow-hidden"
                  style={{ backgroundColor: styling.textColor }}
                  onClick={() => document.getElementById('text-color')?.click()}
                >
                  <input
                    id="text-color"
                    type="color"
                    value={styling.textColor}
                    onChange={(e) => updateStyling({ textColor: e.target.value })}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <div className="space-y-2">
                  <Input
                    value={styling.textColor}
                    onChange={(e) => updateStyling({ textColor: e.target.value })}
                    placeholder="#000000"
                    className="font-mono text-sm h-10"
                  />
                  <p className="text-xs text-gray-500">Hex color code</p>
                </div>
              </div>
            </div>

            {/* Primary Color */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <Label className="text-sm font-semibold text-gray-700">Primary</Label>
              </div>
              <div className="space-y-3">
                <div 
                  className="w-16 h-16 rounded-xl border-2 border-gray-200 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 relative overflow-hidden"
                  style={{ backgroundColor: styling.primaryColor }}
                  onClick={() => document.getElementById('primary-color')?.click()}
                >
                  <input
                    id="primary-color"
                    type="color"
                    value={styling.primaryColor}
                    onChange={(e) => updateStyling({ primaryColor: e.target.value })}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <div className="space-y-2">
                  <Input
                    value={styling.primaryColor}
                    onChange={(e) => updateStyling({ primaryColor: e.target.value })}
                    placeholder="#3b82f6"
                    className="font-mono text-sm h-10"
                  />
                  <p className="text-xs text-gray-500">Hex color code</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
            <h4 className="text-lg font-semibold text-gray-900">Typography</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Type className="h-4 w-4 text-gray-600" />
                <Label className="text-sm font-semibold text-gray-700">Font Family</Label>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-12 text-left">
                    <Type className="h-4 w-4 mr-3 text-gray-500" />
                    <span style={{ fontFamily: styling.fontFamily }} className="font-medium">
                      {fontFamilies.find(font => font.value === styling.fontFamily)?.label || styling.fontFamily}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {fontFamilies.map((font) => (
                    <DropdownMenuItem
                      key={font.value}
                      onClick={() => updateStyling({ fontFamily: font.value })}
                      className="w-full cursor-pointer"
                    >
                      <span style={{ fontFamily: font.value }} className="font-medium">
                        {font.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gray-300"></div>
                <Label className="text-sm font-semibold text-gray-700">Border Radius</Label>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <div 
                    className="w-20 h-20 rounded-lg border-2 border-gray-200 shadow-lg flex items-center justify-center text-xs font-medium bg-gradient-to-br from-gray-50 to-gray-100"
                    style={{ 
                      borderRadius: styling.borderRadius,
                      backgroundColor: styling.backgroundColor,
                      color: styling.textColor,
                      borderColor: styling.primaryColor
                    }}
                  >
                    Preview
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Input
                        type="range"
                        min="0"
                        max="20"
                        value={parseInt(styling.borderRadius)}
                        onChange={(e) => updateStyling({ borderRadius: `${e.target.value}px` })}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-mono text-gray-700">
                          {styling.borderRadius}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Adjust the corner roundness of form elements
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
            <h4 className="text-lg font-semibold text-gray-900">Quick Presets</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStyling({
                backgroundColor: '#ffffff',
                textColor: '#1f2937',
                primaryColor: '#3b82f6',
                fontFamily: 'var(--font-inter)',
                borderRadius: '8px'
              })}
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-all duration-200"
            >
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <div className="w-3 h-3 rounded bg-gray-200"></div>
                <div className="w-3 h-3 rounded bg-gray-100"></div>
              </div>
              <span className="text-xs font-medium">Default</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStyling({
                backgroundColor: '#f8fafc',
                textColor: '#1e293b',
                primaryColor: '#059669',
                fontFamily: 'var(--font-inter)',
                borderRadius: '12px'
              })}
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-all duration-200"
            >
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <div className="w-3 h-3 rounded bg-slate-200"></div>
                <div className="w-3 h-3 rounded bg-slate-100"></div>
              </div>
              <span className="text-xs font-medium">Nature</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStyling({
                backgroundColor: '#fef2f2',
                textColor: '#7f1d1d',
                primaryColor: '#dc2626',
                fontFamily: 'var(--font-inter)',
                borderRadius: '4px'
              })}
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-all duration-200"
            >
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <div className="w-3 h-3 rounded bg-red-200"></div>
                <div className="w-3 h-3 rounded bg-red-100"></div>
              </div>
              <span className="text-xs font-medium">Warm</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStyling({
                backgroundColor: '#1f2937',
                textColor: '#f9fafb',
                primaryColor: '#8b5cf6',
                fontFamily: 'var(--font-inter)',
                borderRadius: '16px'
              })}
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-all duration-200"
            >
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <div className="w-3 h-3 rounded bg-gray-600"></div>
                <div className="w-3 h-3 rounded bg-gray-800"></div>
              </div>
              <span className="text-xs font-medium">Dark</span>
            </Button>
          </div>
        </div>
    </div>
  )
}
