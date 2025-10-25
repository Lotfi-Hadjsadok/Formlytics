"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getForm, updateEmbeddingSettings } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Copy, 
  Check, 
  Code, 
  Settings, 
  Link as LinkIcon, 
  Eye,
  ExternalLink,
  Shield,
  Globe
} from "lucide-react"
import { toast } from "sonner"
import { EmbeddingSettings, Form } from "@/lib/types"

export default function EmbeddingSettingsPage() {
  const params = useParams()
  const formId = params.formId as string
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  // Embedding settings state
  const [embeddingSettings, setEmbeddingSettings] = useState<EmbeddingSettings>({
    allowedOrigins: [],
    requireOrigin: false
  })

  // Temporary state for adding new origins
  const [newOrigin, setNewOrigin] = useState("")

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      const formData = await getForm(formId)
      setForm(formData as unknown as Form)
      setEmbeddingSettings((formData.embedding as any) || {
        allowedOrigins: [],
        requireOrigin: false
      })
    } catch (err) {
      console.error('Error fetching form:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveEmbeddingSettings = async () => {
    setSaving(true)
    try {
      await updateEmbeddingSettings(formId, embeddingSettings)
      toast.success("Embedding settings saved successfully")
      // Update form state
      setForm(prev => prev ? { ...prev, embedding: embeddingSettings } : null)
    } catch (err) {
      console.error('Error saving embedding settings:', err)
      toast.error(err instanceof Error ? err.message : "Failed to save embedding settings")
    } finally {
      setSaving(false)
    }
  }

  const addOrigin = () => {
    if (newOrigin.trim() && !embeddingSettings.allowedOrigins?.includes(newOrigin.trim())) {
      setEmbeddingSettings(prev => ({
        ...prev,
        allowedOrigins: [...(prev.allowedOrigins || []), newOrigin.trim()]
      }))
      setNewOrigin("")
    }
  }

  const removeOrigin = (origin: string) => {
    setEmbeddingSettings(prev => ({
      ...prev,
      allowedOrigins: prev.allowedOrigins?.filter(o => o !== origin) || []
    }))
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      toast.success("Copied to clipboard")
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const getEmbedUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'
    return `${baseUrl}/forms/${formId}/embed`
  }

  const getDirectUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'
    return `${baseUrl}/forms/${formId}`
  }

  const vanillaJSCode = `<!-- Formlytics Form Embed -->
<div id="formlytics-form-container"></div>

<script>
(function() {
  const container = document.getElementById('formlytics-form-container');
  const iframe = document.createElement('iframe');
  
  iframe.src = '${getEmbedUrl()}';
  iframe.width = '100%';
  iframe.height = '400';
  iframe.frameBorder = '0';
  iframe.style.border = 'none';
  
  // Auto-resize functionality
  window.addEventListener('message', function(event) {
    if (event.data.type === 'resize' && event.data.height) {
      iframe.style.height = event.data.height + 'px';
    }
  });
  
  container.appendChild(iframe);
})();
</script>`

  const reactJSCode = `import React, { useEffect, useRef } from 'react';

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
      src="${getEmbedUrl()}"
      width="100%"
      height="400"
      frameBorder="0"
      style={{ border: 'none' }}
    />
  );
};

export default FormlyticsForm;`

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">The form you are looking for does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Embedding Settings</h1>
          <p className="text-gray-600 mt-1">Configure how your form can be embedded</p>
        </div>
        <Button onClick={saveEmbeddingSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="vanilla" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vanilla" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Vanilla JS
          </TabsTrigger>
          <TabsTrigger value="react" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            React JS
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="direct" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Direct Link
          </TabsTrigger>
        </TabsList>

        {/* Vanilla JS Tab */}
        <TabsContent value="vanilla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Vanilla JavaScript Embed Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Embed Code</Label>
                <div className="relative">
                  <Textarea
                    value={vanillaJSCode}
                    readOnly
                    className="font-mono text-sm min-h-[200px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(vanillaJSCode, 'vanilla')}
                  >
                    {copiedStates.vanilla ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Usage Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Copy the embed code above</li>
                  <li>Paste it into your HTML page where you want the form to appear</li>
                  <li>The form will automatically resize to fit its content</li>
                  <li>Make sure your domain is added to the allowed origins in settings</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* React JS Tab */}
        <TabsContent value="react" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                React Component Embed Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>React Component Code</Label>
                <div className="relative">
                  <Textarea
                    value={reactJSCode}
                    readOnly
                    className="font-mono text-sm min-h-[200px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(reactJSCode, 'react')}
                  >
                    {copiedStates.react ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Usage Instructions:</h4>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Copy the React component code above</li>
                  <li>Create a new file (e.g., FormlyticsForm.tsx) and paste the code</li>
                  <li>Import and use the component in your React app</li>
                  <li>The component handles auto-resizing automatically</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Embedding Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require Origin Validation</Label>
                    <p className="text-sm text-gray-600">
                      Only allow embedding from specified domains
                    </p>
                  </div>
                  <Switch
                    checked={embeddingSettings.requireOrigin}
                    onCheckedChange={(checked) =>
                      setEmbeddingSettings(prev => ({ ...prev, requireOrigin: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Allowed Origins</Label>
                  <p className="text-sm text-gray-600">
                    Add domains that are allowed to embed this form. Use wildcards (*.example.com) for subdomains.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com or *.example.com"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addOrigin()}
                  />
                  <Button onClick={addOrigin} variant="outline">
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {embeddingSettings.allowedOrigins?.map((origin, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span className="font-mono text-sm">{origin}</span>
                        {origin.startsWith('*.') && (
                          <Badge variant="secondary" className="text-xs">
                            Wildcard
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOrigin(origin)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                {(!embeddingSettings.allowedOrigins || embeddingSettings.allowedOrigins.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No allowed origins configured</p>
                    <p className="text-sm">Form can be embedded from any domain</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Direct Link Tab */}
        <TabsContent value="direct" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Direct Form Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Form URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={getDirectUrl()}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(getDirectUrl(), 'direct')}
                  >
                    {copiedStates.direct ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Embed URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={getEmbedUrl()}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(getEmbedUrl(), 'embed')}
                  >
                    {copiedStates.embed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <a href={getDirectUrl()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Form
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={getEmbedUrl()} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Embed
                  </a>
                </Button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Form Preview</h4>
                <p className="text-sm text-yellow-800">
                  Use the preview links above to test your form and see how it will appear to users.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
