"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Sparkles,
  Users,
  FileText,
  Mail,
  Calendar,
  Briefcase,
  BarChart3,
  Zap
} from "lucide-react"
import { formPresets, FormPreset } from "@/lib/types"

interface FormPresetsProps {
  onPresetSelect: (preset: FormPreset) => void
}

export function FormPresets({ onPresetSelect }: FormPresetsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'single-step' | 'multi-step'>('all')

  const filteredPresets = formPresets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getPresetIcon = (preset: FormPreset) => {
    switch (preset.id) {
      case 'contact-form': return <Mail className="h-5 w-5" />
      case 'survey-form': return <BarChart3 className="h-5 w-5" />
      case 'registration-form': return <Calendar className="h-5 w-5" />
      case 'newsletter-signup': return <Mail className="h-5 w-5" />
      case 'onboarding-form': return <Zap className="h-5 w-5" />
      case 'application-form': return <Briefcase className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'single-step': return <FileText className="h-4 w-4" />
      case 'multi-step': return <Users className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search presets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="text-sm font-medium h-9 px-4 transition-all duration-200"
          >
            All
          </Button>
          <Button
            variant={selectedCategory === 'single-step' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('single-step')}
            className="text-sm font-medium h-9 px-4 transition-all duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            Single Step
          </Button>
          <Button
            variant={selectedCategory === 'multi-step' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('multi-step')}
            className="text-sm font-medium h-9 px-4 transition-all duration-200"
          >
            <Users className="h-4 w-4 mr-2" />
            Multi Step
          </Button>
        </div>
      </div>

      {/* Enhanced Presets Grid */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredPresets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
              <Search className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-base font-semibold text-slate-600 mb-2">No presets found</p>
            <p className="text-sm text-slate-500">Try adjusting your search or filter</p>
          </div>
        ) : (
          filteredPresets.map((preset) => (
            <Card 
              key={preset.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-400 hover:-translate-y-1 group"
              onClick={() => onPresetSelect(preset)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="size-fit p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:shadow-md transition-all duration-300">
                      {getPresetIcon(preset)}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold group-hover:text-blue-700 transition-colors duration-200">{preset.name}</CardTitle>
                      <CardDescription className="text-sm text-slate-600 mt-1">{preset.description}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={preset.category === 'single-step' ? 'secondary' : 'default'}
                    className="text-xs px-3 py-1 h-6 bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(preset.category)}
                      <span className="capitalize">{preset.category.replace('-', ' ')}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>
                        {preset.isMultistep 
                          ? `${preset.steps?.length || 0} steps` 
                          : `${preset.fields?.length || 0} fields`
                        }
                      </span>
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-xs font-medium border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="pt-6 border-t border-slate-200">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <Sparkles className="h-8 w-8 text-slate-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-700 mb-2">Don't see what you need?</p>
            <p className="text-sm text-slate-500 mb-4">Start with a blank form and build from scratch</p>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => onPresetSelect({
              id: 'blank',
              name: 'Blank Form',
              description: 'Start from scratch',
              icon: '📝',
              category: 'single-step',
              isMultistep: false,
              title: 'Untitled Form',
              formDescription: '',
              fields: [],
              settings: {
                allowMultipleSubmissions: false,
                showProgressBar: true,
                submitButtonText: 'Submit'
              },
              styling: {
                backgroundColor: '#ffffff',
                textColor: '#1f2937',
                primaryColor: '#3b82f6',
                fontFamily: 'var(--font-inter)',
                borderRadius: '8px'
              },
              thankYouPage: {
                icon: '✅',
                title: 'Thank you!',
                text: 'Your form has been submitted successfully.'
              }
            })}
            className="h-12 px-6 text-sm font-semibold border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Start Blank
          </Button>
        </div>
      </div>
    </div>
  )
}