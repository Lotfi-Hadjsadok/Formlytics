"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Settings,
  Users,
  BarChart3,
  Type
} from "lucide-react"
import { FormSettings } from "@/lib/types"

interface FormSettingsPanelProps {
  settings: FormSettings
  onSettingsChange: (settings: FormSettings) => void
  isMultistep: boolean
}

export function FormSettingsPanel({ settings, onSettingsChange, isMultistep }: FormSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'submissions' | 'progress'>('general')

  const stepUIOptions = [
    { value: 'numbers', label: 'Numbers', description: '1, 2, 3...' },
    { value: 'letters', label: 'Letters', description: 'A, B, C...' },
    { value: 'percentage', label: 'Percentage', description: 'Step 1 of 3 (33%)' },
    { value: 'bar', label: 'Simple Bar', description: 'Progress bar only' }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Tab Navigation */}
      <div className="flex border-b border-slate-200/60 bg-slate-50/50 rounded-t-lg">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-t-lg ${
            activeTab === 'general'
              ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-t-lg ${
            activeTab === 'submissions'
              ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Submissions</span>
          </div>
        </button>
        {isMultistep && (
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-t-lg ${
              activeTab === 'progress'
                ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Progress</span>
            </div>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Submit Button Text */}
            <div className="space-y-3">
              <Label htmlFor="submitButtonText" className="text-sm font-semibold text-slate-700">Submit Button Text</Label>
              <Input
                id="submitButtonText"
                value={settings.submitButtonText}
                onChange={(e) => onSettingsChange({ ...settings, submitButtonText: e.target.value })}
                placeholder="Submit"
                className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              />
              <p className="text-xs text-slate-500">Customize the text displayed on the submit button</p>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Allow Multiple Submissions */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-slate-700">Allow Multiple Submissions</Label>
                <p className="text-sm text-slate-600 mt-1">Users can submit the form multiple times</p>
              </div>
              <Switch
                checked={settings.allowMultipleSubmissions}
                onCheckedChange={(checked) => onSettingsChange({ ...settings, allowMultipleSubmissions: checked })}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Multiple Submissions Info */}
            {!settings.allowMultipleSubmissions && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Single Submission Mode</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Users will see an error page if they try to submit the form again.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Tab - Only for multistep forms */}
        {activeTab === 'progress' && isMultistep && (
          <div className="space-y-6">
            {/* Show Progress Bar */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-slate-700">Show Progress Bar</Label>
                <p className="text-sm text-slate-600 mt-1">Display completion progress to users</p>
              </div>
              <Switch
                checked={settings.showProgressBar !== false}
                onCheckedChange={(checked) => onSettingsChange({ ...settings, showProgressBar: checked })}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Step UI Configuration - Show when progress bar is enabled */}
            {settings.showProgressBar && (
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">Step Progress Style</Label>
                <div className="grid grid-cols-1 gap-3">
                  {stepUIOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        settings.stepUI === option.value
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      onClick={() => onSettingsChange({ ...settings, stepUI: option.value as any })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          settings.stepUI === option.value 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-slate-300'
                        }`}>
                          {settings.stepUI === option.value && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">{option.label}</div>
                          <div className="text-sm text-slate-500">{option.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar Info */}
            {!settings.showProgressBar && (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-slate-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Progress Bar Disabled</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Users won't see their progress through the form steps.
                    </p>
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
