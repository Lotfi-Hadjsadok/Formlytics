import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { FormField, FormStep } from "@/lib/types"
import { checkExistingSubmission } from "@/lib/actions"

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 10 // Max 10 submissions per window per IP

// CSRF token validation
function validateCSRFToken(request: NextRequest): boolean {
  const csrfToken = request.headers.get('x-csrf-token')
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Basic CSRF protection - in production, implement proper token validation
  if (origin && referer) {
    try {
      const originUrl = new URL(origin)
      const refererUrl = new URL(referer)
      return originUrl.hostname === refererUrl.hostname
    } catch {
      return false
    }
  }
  
  return true // Allow if no origin/referer (API calls)
}

// Rate limiting check
function checkRateLimit(clientIP: string): boolean {
  const now = Date.now()
  const key = `rate_limit_${clientIP}`
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }
  
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  current.count++
  return true
}

// Input sanitization
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      // Sanitize keys
      const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, '')
      sanitized[cleanKey] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// Request size validation
function validateRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    const MAX_REQUEST_SIZE = 1024 * 1024 // 1MB
    return size <= MAX_REQUEST_SIZE
  }
  return true
}

// Validate form submission data against form schema
function validateFormSubmission(formData: any, formSchema: FormField[] | FormStep[]) {
  const errors: string[] = []
  
  // Check if it's a multistep form
  const isMultistep = Array.isArray(formSchema) && formSchema.length > 0 && 'fields' in formSchema[0]
  
  if (isMultistep) {
    // For multistep forms, validate each step
    const steps = formSchema as FormStep[]
    steps.forEach((step, stepIndex) => {
      step.fields.forEach(field => {
        const fieldValue = formData[field.id]
        
        // Check required fields
        if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
          errors.push(`Field '${field.label}' (${field.id}) is required`)
          return
        }
        
        // Skip validation if field is empty and not required
        if (!fieldValue) return
        
        // Type-specific validation
        switch (field.type) {
          case 'email':
            if (typeof fieldValue !== 'string' || !fieldValue.includes('@')) {
              errors.push(`Field '${field.label}' must be a valid email address`)
            }
            break
          case 'number':
            if (isNaN(Number(fieldValue))) {
              errors.push(`Field '${field.label}' must be a valid number`)
            }
            break
          case 'date':
            if (isNaN(Date.parse(fieldValue))) {
              errors.push(`Field '${field.label}' must be a valid date`)
            }
            break
          case 'select':
          case 'radio':
            if (field.options && !field.options.includes(fieldValue)) {
              errors.push(`Field '${field.label}' must be one of: ${field.options.join(', ')}`)
            }
            break
          case 'multiselect':
          case 'multi-dropdown':
            if (!Array.isArray(fieldValue)) {
              errors.push(`Field '${field.label}' must be an array`)
            } else if (field.options) {
              const invalidOptions = fieldValue.filter(val => !field.options!.includes(val))
              if (invalidOptions.length > 0) {
                errors.push(`Field '${field.label}' contains invalid options: ${invalidOptions.join(', ')}`)
              }
            }
            break
          case 'checkbox':
            if (typeof fieldValue !== 'boolean') {
              errors.push(`Field '${field.label}' must be a boolean value (true or false)`)
            }
            break
        }
      })
    })
  } else {
    // For single-step forms, validate fields directly
    const fields = formSchema as FormField[]
    fields.forEach(field => {
      const fieldValue = formData[field.id]
      
      // Check required fields
      if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
        errors.push(`Field '${field.label}' (${field.id}) is required`)
        return
      }
      
      // Skip validation if field is empty and not required
      if (!fieldValue) return
      
      // Type-specific validation
      switch (field.type) {
        case 'email':
          if (typeof fieldValue !== 'string' || !fieldValue.includes('@')) {
            errors.push(`Field '${field.label}' must be a valid email address`)
          }
          break
        case 'number':
          if (isNaN(Number(fieldValue))) {
            errors.push(`Field '${field.label}' must be a valid number`)
          }
          break
        case 'date':
          if (isNaN(Date.parse(fieldValue))) {
            errors.push(`Field '${field.label}' must be a valid date`)
          }
          break
        case 'select':
        case 'radio':
          if (field.options && !field.options.includes(fieldValue)) {
            errors.push(`Field '${field.label}' must be one of: ${field.options.join(', ')}`)
          }
          break
        case 'multiselect':
        case 'multi-dropdown':
          if (!Array.isArray(fieldValue)) {
            errors.push(`Field '${field.label}' must be an array`)
          } else if (field.options) {
            const invalidOptions = fieldValue.filter(val => !field.options!.includes(val))
            if (invalidOptions.length > 0) {
              errors.push(`Field '${field.label}' contains invalid options: ${invalidOptions.join(', ')}`)
            }
          }
          break
        case 'checkbox':
          if (typeof fieldValue !== 'boolean') {
            errors.push(`Field '${field.label}' must be a boolean value (true or false)`)
          }
          break
      }
    })
  }
  
  return errors
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params
    
    // Security validations
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('cf-connecting-ip') ||
                    'unknown'
    
    // Check request size
    if (!validateRequestSize(request)) {
      return NextResponse.json({ 
        error: "Request too large" 
      }, { status: 413 })
    }
    
    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ 
        error: "Too many requests. Please try again later." 
      }, { status: 429 })
    }
    
    // Validate CSRF protection
    if (!validateCSRFToken(request)) {
      return NextResponse.json({ 
        error: "Invalid request origin" 
      }, { status: 403 })
    }
    
    // Validate Content-Type header
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ 
        error: "Invalid content type. Expected application/json" 
      }, { status: 400 })
    }
    
    const body = await request.json()
    
    // Extract and sanitize form data from request body
    const { data, metadata } = body
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ 
        error: "Invalid request body. Expected 'data' field with form submission data." 
      }, { status: 400 })
    }
    
    // Sanitize input data
    const sanitizedData = sanitizeInput(data)
    const sanitizedMetadata = metadata ? sanitizeInput(metadata) : {}

    // Verify the form exists and is active
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
        isActive: true,
      },
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 })
    }

    // Get form schema for validation
    const formSchema = form.isMultistep ? (form.steps as unknown as FormStep[]) : (form.fields as unknown as FormField[])
    
    if (!formSchema) {
      return NextResponse.json({ error: "Form schema not found" }, { status: 500 })
    }

    // Validate form submission with sanitized data
    const validationErrors = validateFormSubmission(sanitizedData, formSchema as FormField[] | FormStep[])
    
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validationErrors 
      }, { status: 400 })
    }

    // Check if multiple submissions are allowed
    const settings = form.settings as any
    if (!settings?.allowMultipleSubmissions) {
      // Use the shared helper function for consistency
      const hasExistingSubmission = await checkExistingSubmission(formId, clientIP)
      
      if (hasExistingSubmission) {
        return NextResponse.json({ 
          error: "Multiple submissions not allowed for this form",
          details: "A submission from this IP address already exists"
        }, { status: 400 })
      }
    }

    // Create form entry with sanitized data
    const entry = await prisma.formEntry.create({
      data: {
        formId,
        answers: {
          ...sanitizedData,
          _metadata: {
            submittedAt: new Date().toISOString(),
            userAgent: request.headers.get('user-agent') || 'unknown',
            ipAddress: clientIP,
            ...sanitizedMetadata
          }
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      entryId: entry.id,
      message: "Form submitted successfully"
    }, {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error("Error submitting form:", error)
    
    // Generic error response to prevent information leakage
    return NextResponse.json({ 
      error: "Internal server error"
    }, { status: 500 })
  }
}

// GET endpoint to retrieve form schema for API documentation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params
    
    // Basic security checks for GET endpoint
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('cf-connecting-ip') ||
                    'unknown'
    
    // Check rate limiting for GET requests too
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ 
        error: "Too many requests. Please try again later." 
      }, { status: 429 })
    }

    // Verify the form exists and is active
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
        isActive: true,
      },
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 })
    }

    // Return form schema for API documentation
    const schema = form.isMultistep ? (form.steps as unknown as FormStep[]) : (form.fields as unknown as FormField[])
    const settings = form.settings as any

    return NextResponse.json({
      formId: form.id,
      title: form.title,
      description: form.description,
      isMultistep: form.isMultistep,
      allowMultipleSubmissions: settings?.allowMultipleSubmissions || false,
      schema: schema,
      apiEndpoint: `/api/forms/${formId}/submit`,
      exampleRequest: {
        method: "POST",
        url: `/api/forms/${formId}/submit`,
        headers: {
          "Content-Type": "application/json"
        },
        body: generateExampleBody(schema as FormField[] | FormStep[], form.isMultistep)
      }
    }, {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error("Error fetching form schema:", error)
    
    // Generic error response to prevent information leakage
    return NextResponse.json({ 
      error: "Internal server error"
    }, { status: 500 })
  }
}

// Helper function to generate example request body
function generateExampleBody(schema: FormField[] | FormStep[], isMultistep: boolean): any {
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

// Helper function to generate example values for each field type
function generateExampleValue(field: FormField): any {
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
