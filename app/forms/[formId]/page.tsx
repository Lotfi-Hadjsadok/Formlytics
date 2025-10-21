"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getForm, submitFormEntry } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Copy, 
  Share2, 
  CheckCircle,
  AlertCircle,
  Code,
  Eye,
  Shield,
  Settings,
  Loader2,
  ChevronDown
} from "lucide-react"
import { FormRenderer } from "@/components/forms/FormRenderer"
import { toast } from "sonner"

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

interface EmbeddingSettings {
  allowedOrigins?: string[]
  requireOrigin?: boolean
}

interface Form {
  id: string
  title: string
  description?: string
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
  thankYouPage?: {
    icon?: string
    title?: string
    text?: string
  }
  embedding?: EmbeddingSettings
  _count: {
    entries: number
  }
}

export default function FormPage() {
  const params = useParams()
  const formId = params.formId as string
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showEmbedDropdown, setShowEmbedDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeEmbedTab, setActiveEmbedTab] = useState('html')
  const [embeddingSettings, setEmbeddingSettings] = useState<EmbeddingSettings>({
    allowedOrigins: [],
    requireOrigin: false
  })

  useEffect(() => {
    fetchForm()
  }, [formId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showEmbedDropdown && !target.closest('.embed-dropdown')) {
        setShowEmbedDropdown(false)
      }
    }

    if (showEmbedDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmbedDropdown])

  const fetchForm = async () => {
    try {
      const formData = await getForm(formId)
      setForm(formData)
      
      // Load embedding settings
      if (formData.embedding) {
        setEmbeddingSettings(formData.embedding)
      }
    } catch (err) {
      setError('Failed to load form')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setSubmitting(true)
    try {
      await submitFormEntry(formId, formData)
      // Form submission handled by FormRenderer
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyEmbedCode = (type: 'html' | 'react') => {
    let embedCode = ''
    
    if (type === 'html') {
      embedCode = `<iframe src="${window.location.origin}/forms/${formId}/embed" width="100%" height="400" frameborder="0" style="border: none;"></iframe>
<script>
  // Auto-resize iframe to fit content exactly
  window.addEventListener('message', function(event) {
    if (event.data.type === 'resize') {
      const iframe = document.querySelector('iframe[src*="/embed"]');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>`
    } else if (type === 'react') {
      embedCode = `import React, { useEffect, useRef } from 'react';

const FormlyticsForm = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'resize' && iframeRef.current) {
        iframeRef.current.style.height = event.data.height + 'px';
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="${window.location.origin}/forms/${formId}/embed"
      width="100%"
      height="400"
      frameBorder="0"
      style={{ border: 'none' }}
    />
  );
};

export default FormlyticsForm;`
    }
    
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyFormUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmbeddingSettingsChange = (key: keyof EmbeddingSettings, value: any) => {
    setEmbeddingSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const addAllowedOrigin = (origin: string) => {
    if (origin && !embeddingSettings.allowedOrigins?.includes(origin)) {
      setEmbeddingSettings(prev => ({
        ...prev,
        allowedOrigins: [...(prev.allowedOrigins || []), origin]
      }))
    }
  }

  const removeAllowedOrigin = (origin: string) => {
    setEmbeddingSettings(prev => ({
      ...prev,
      allowedOrigins: prev.allowedOrigins?.filter(o => o !== origin) || []
    }))
  }

  const saveEmbeddingSettings = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embedding: embeddingSettings }),
      })

      if (response.ok) {
        setShowEmbedDropdown(false)
        // Reload form to get updated settings
        fetchForm()
      } else {
        throw new Error('Failed to save embedding settings')
      }
    } catch (err) {
      console.error('Error saving embedding settings:', err)
      toast.error('Failed to save embedding settings. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">{error || 'The form you are looking for does not exist or has been deactivated.'}</p>
        </div>
      </div>
    )
  }



  return (
    <div 
      className="min-h-screen py-8"
      style={{ backgroundColor: form.styling?.backgroundColor || '#f9fafb' }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Form Header */}
        <Card className="mb-6" style={{
          backgroundColor: form.styling?.backgroundColor || '#ffffff',
          color: form.styling?.textColor || '#000000',
          fontFamily: form.styling?.fontFamily || 'var(--font-inter)',
          borderRadius: form.styling?.borderRadius || '8px',
        }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{form.title}</CardTitle>
                {form.description && (
                  <p className="text-gray-600 mt-2">{form.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{form._count.entries} responses</Badge>
                <div className="relative embed-dropdown">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmbedDropdown(!showEmbedDropdown)}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Embed & Settings
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                  
                  {showEmbedDropdown && (
                    <Card className="absolute top-full right-0 mt-2 w-96 z-50">
                      <CardContent className="p-0">
                        <Tabs value={activeEmbedTab} onValueChange={setActiveEmbedTab}>
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="html">HTML/JS</TabsTrigger>
                            <TabsTrigger value="react">React</TabsTrigger>
                            <TabsTrigger value="link">Direct Link</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="html" className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>HTML/JavaScript</Label>
                                <Button onClick={() => copyEmbedCode('html')} size="sm">
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <div className="bg-gray-100 p-3 rounded-md">
                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${formId}/embed" width="100%" height="400" frameborder="0" style="border: none;"></iframe>
<script>
  // Auto-resize iframe to fit content exactly
  window.addEventListener('message', function(event) {
    if (event.data.type === 'resize') {
      const iframe = document.querySelector('iframe[src*="/embed"]');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>`}
                                </pre>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="react" className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>React Component</Label>
                                <Button onClick={() => copyEmbedCode('react')} size="sm">
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <div className="bg-gray-100 p-3 rounded-md">
                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`import React, { useEffect, useRef } from 'react';

const FormlyticsForm = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'resize' && iframeRef.current) {
        iframeRef.current.style.height = event.data.height + 'px';
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${formId}/embed"
      width="100%"
      height="400"
      frameBorder="0"
      style={{ border: 'none' }}
    />
  );
};

export default FormlyticsForm;`}
                                </pre>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="link" className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>Direct Link</Label>
                                <Button onClick={copyFormUrl} size="sm">
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <div className="bg-gray-100 p-3 rounded-md">
                                <code className="text-xs break-all">
                                  {typeof window !== 'undefined' ? window.location.href : ''}
                                </code>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="settings" className="p-4">
                            <div className="space-y-6">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="requireOrigin"
                                  checked={embeddingSettings.requireOrigin}
                                  onCheckedChange={(checked) => handleEmbeddingSettingsChange('requireOrigin', checked)}
                                />
                                <Label htmlFor="requireOrigin" className="text-sm font-medium">
                                  Restrict embedding to specific origins
                                </Label>
                              </div>
                              <p className="text-xs text-gray-500 ml-6">
                                When enabled, only domains in the allowed list can embed this form.
                              </p>

                              {embeddingSettings.requireOrigin && (
                                <div className="ml-6">
                                  <Label className="text-sm font-medium mb-2 block">Allowed Origins</Label>
                                  <div className="space-y-2">
                                    {embeddingSettings.allowedOrigins?.map((origin, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">{origin}</code>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeAllowedOrigin(origin)}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    ))}
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        placeholder="e.g., https://example.com or *.example.com"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            const input = e.target as HTMLInputElement
                                            addAllowedOrigin(input.value)
                                            input.value = ''
                                          }
                                        }}
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                          addAllowedOrigin(input.value)
                                          input.value = ''
                                        }}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Use wildcards (*.example.com) to allow all subdomains of a domain.
                                  </p>
                                </div>
                              )}

                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowEmbedDropdown(false)}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={saveEmbeddingSettings}>
                                  Save Settings
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyFormUrl}
                >
                  {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Share'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>


        {/* Form */}
        <FormRenderer 
          form={form}
          onSubmit={handleFormSubmit}
          submitting={submitting}
          showHeader={true}
        />
      </div>
    </div>
  )
}
