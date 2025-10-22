"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible } from "@/components/ui/collapsible"
import { 
  Copy, 
  Code, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileText,
  Globe
} from "lucide-react"
import { toast } from "sonner"
import { FormField, FormStep } from "@/lib/types"

interface FormApiDocumentationProps {
  formId: string
  formTitle: string
  formDescription?: string
  isMultistep: boolean
  schema: FormField[] | FormStep[]
  allowMultipleSubmissions: boolean
}

interface ApiDocumentation {
  formId: string
  title: string
  description?: string
  isMultistep: boolean
  allowMultipleSubmissions: boolean
  schema: FormField[] | FormStep[]
  apiEndpoint: string
  exampleRequest: {
    method: string
    url: string
    headers: Record<string, string>
    body: any
  }
}

export function FormApiDocumentation({ 
  formId, 
  formTitle, 
  formDescription, 
  isMultistep, 
  schema, 
  allowMultipleSubmissions 
}: FormApiDocumentationProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'endpoint']))

  const apiEndpoint = `/api/forms/${formId}/submit`
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => new Set(prev).add(itemId))
      toast.success("Copied to clipboard!")
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      }, 2000)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const generateExampleBody = (): any => {
    const exampleData: any = {}
    
    if (isMultistep) {
      const steps = schema as FormStep[]
      steps.forEach(step => {
        step.fields.forEach(field => {
          exampleData[field.id] = generateExampleValue(field)
        })
      })
    } else {
      const fields = schema as FormField[]
      fields.forEach(field => {
        exampleData[field.id] = generateExampleValue(field)
      })
    }
    
    return {
      data: exampleData,
      metadata: {
        source: "api",
        version: "1.0"
      }
    }
  }

  const generateExampleValue = (field: FormField): any => {
    switch (field.type) {
      case 'text':
        return field.placeholder || `Sample ${field.label}`
      case 'email':
        return 'user@example.com'
      case 'textarea':
        return field.placeholder || `Sample ${field.label} text`
      case 'number':
        return 123
      case 'date':
        return '2024-01-01'
      case 'select':
      case 'radio':
        return field.options?.[0] || 'Option 1'
      case 'multiselect':
      case 'multi-dropdown':
        return field.options?.slice(0, 2) || ['Option 1', 'Option 2']
      case 'checkbox':
        return true
      default:
        return `Sample ${field.label}`
    }
  }

  const getFieldTypeDescription = (field: FormField): string => {
    switch (field.type) {
      case 'text':
        return 'String - Single line text input'
      case 'email':
        return 'String - Valid email address'
      case 'textarea':
        return 'String - Multi-line text input'
      case 'number':
        return 'Number - Numeric value'
      case 'date':
        return 'String - Date in YYYY-MM-DD format'
      case 'select':
        return 'String - Single selection from allowed options'
      case 'radio':
        return 'String - Single selection from allowed radio options'
      case 'multiselect':
        return 'Array - Multiple selections from allowed options'
      case 'multi-dropdown':
        return 'Array - Multiple selections from allowed dropdown options'
      case 'checkbox':
        return 'Boolean - Must be true or false only'
      default:
        return 'String - Text input'
    }
  }

  const renderFieldDocumentation = (field: FormField) => (
    <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-gray-900">{field.label}</h4>
            <Badge variant={field.required ? "destructive" : "secondary"}>
              {field.required ? "Required" : "Optional"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Field ID: <code className="bg-gray-100 px-1 rounded">{field.id}</code></p>
          <p className="text-sm text-gray-500">{getFieldTypeDescription(field)}</p>
        </div>
      </div>
      
      {field.placeholder && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Placeholder:</span> {field.placeholder}
        </div>
      )}
      
      {field.options && field.options.length > 0 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Allowed Values:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {field.options.map((option, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {option}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {field.type === 'multiselect' || field.type === 'multi-dropdown' 
              ? 'Must be an array containing only these values'
              : 'Must be exactly one of these values'
            }
          </p>
        </div>
      )}
      
      {field.type === 'checkbox' && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Validation:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">true</Badge>
            <Badge variant="outline" className="text-xs">false</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Must be a boolean value (true or false) only
          </p>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">Example value:</span>
        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
          {JSON.stringify(generateExampleValue(field))}
        </code>
      </div>
    </div>
  )

  const curlExample = `curl -X POST "${baseUrl}${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(generateExampleBody(), null, 2)}'`

  const javascriptExample = `fetch('${baseUrl}${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${JSON.stringify(generateExampleBody(), null, 2)})
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));`

  const pythonExample = `import requests
import json

url = '${baseUrl}${apiEndpoint}'
data = ${JSON.stringify(generateExampleBody(), null, 2)}

response = requests.post(url, json=data)
print(response.json())`

  const laravelExample = `<?php

use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Http\\Request;

class FormlyticsController extends Controller
{
    public function submitForm(Request $request)
    {
        $formId = '${formId}';
        $apiUrl = '${baseUrl}${apiEndpoint}';
        
        $formData = [
            'data' => ${JSON.stringify(generateExampleBody().data, null, 16).replace(/"/g, "'")},
            'metadata' => [
                'source' => 'laravel-api',
                'version' => '1.0',
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'User-Agent' => 'Laravel-Formlytics-Client/1.0'
            ])->post($apiUrl, $formData);

            if ($response->successful()) {
                $result = $response->json();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Form submitted successfully',
                    'entry_id' => $result['entryId']
                ]);
            } else {
                $error = $response->json();
                
                return response()->json([
                    'success' => false,
                    'error' => $error['error'] ?? 'Unknown error',
                    'details' => $error['details'] ?? []
                ], $response->status());
            }
        } catch (\\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Network error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-blue-600" />
            <span>API Documentation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Section */}
          <div>
            <button
              onClick={() => toggleSection('overview')}
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {expandedSections.has('overview') ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <span>Overview</span>
            </button>
            
            {expandedSections.has('overview') && (
              <div className="mt-4 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Form API Endpoint</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Use this API endpoint to submit form data programmatically from your own applications.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900">Form Details</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Title:</span> {formTitle}</p>
                      {formDescription && (
                        <p><span className="font-medium">Description:</span> {formDescription}</p>
                      )}
                      <p><span className="font-medium">Type:</span> {isMultistep ? 'Multi-step' : 'Single-step'}</p>
                      <p><span className="font-medium">Multiple Submissions:</span> {allowMultipleSubmissions ? 'Allowed' : 'Not Allowed'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900">API Information</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Method:</span> POST</p>
                      <p><span className="font-medium">Endpoint:</span> <code className="bg-gray-100 px-1 rounded">{apiEndpoint}</code></p>
                      <p><span className="font-medium">Content-Type:</span> application/json</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Endpoint Section */}
          <div>
            <button
              onClick={() => toggleSection('endpoint')}
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {expandedSections.has('endpoint') ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <span>API Endpoint</span>
            </button>
            
            {expandedSections.has('endpoint') && (
              <div className="mt-4 space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">Request URL</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${baseUrl}${apiEndpoint}`, 'url')}
                    >
                      {copiedItems.has('url') ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <code className="text-sm bg-white border border-gray-200 rounded px-3 py-2 block">
                    {baseUrl}{apiEndpoint}
                  </code>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">Request Body Example</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(generateExampleBody(), null, 2), 'body')}
                    >
                      {copiedItems.has('body') ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm bg-white border border-gray-200 rounded p-3 overflow-x-auto">
                    <code>{JSON.stringify(generateExampleBody(), null, 2)}</code>
                  </pre>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-green-900">Success Response</h5>
                      <pre className="text-sm text-green-700 mt-2 bg-white border border-green-200 rounded p-3">
                        <code>{JSON.stringify({
                          success: true,
                          entryId: "entry_123456789",
                          message: "Form submitted successfully"
                        }, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-red-900">Error Response</h5>
                      <pre className="text-sm text-red-700 mt-2 bg-white border border-red-200 rounded p-3">
                        <code>{JSON.stringify({
                          error: "Validation failed",
                          details: [
                            "Field 'Email' is required", 
                            "Field 'Name' must be a valid email address",
                            "Field 'Agree to Terms' must be a boolean value (true or false)",
                            "Field 'Interests' contains invalid options: Invalid Option"
                          ]
                        }, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Field Documentation */}
          <div>
            <button
              onClick={() => toggleSection('fields')}
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {expandedSections.has('fields') ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <span>Field Documentation</span>
            </button>
            
            {expandedSections.has('fields') && (
              <div className="mt-4 space-y-4">
                {isMultistep ? (
                  (schema as FormStep[]).map((step, stepIndex) => (
                    <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Step {stepIndex + 1}: {step.title}
                      </h4>
                      {step.description && (
                        <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                      )}
                      <div className="space-y-3">
                        {step.fields.map(renderFieldDocumentation)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {(schema as FormField[]).map(renderFieldDocumentation)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Code Examples */}
          <div>
            <button
              onClick={() => toggleSection('examples')}
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {expandedSections.has('examples') ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <span>Code Examples</span>
            </button>
            
            {expandedSections.has('examples') && (
              <div className="mt-4 space-y-6">
                {/* cURL Example */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">cURL</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(curlExample, 'curl')}
                    >
                      {copiedItems.has('curl') ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <code>{curlExample}</code>
                  </pre>
                </div>

                {/* JavaScript Example */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">JavaScript (Fetch)</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(javascriptExample, 'javascript')}
                    >
                      {copiedItems.has('javascript') ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <code>{javascriptExample}</code>
                  </pre>
                </div>

                {/* Python Example */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">Python (requests)</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(pythonExample, 'python')}
                    >
                      {copiedItems.has('python') ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <code>{pythonExample}</code>
                  </pre>
                </div>

                {/* Laravel Example */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">Laravel (PHP Framework)</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(laravelExample, 'laravel')}
                    >
                      {copiedItems.has('laravel') ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <code>{laravelExample}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
