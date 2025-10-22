'use server'

import { getUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Form Actions
export async function createForm(formData: {
  title: string
  description?: string
  fields?: any[]
  steps?: any[]
  isMultistep?: boolean
  settings?: any
  styling?: any
  thankYouPage?: any
}) {
  try {
    const user = await getUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (!user.organizationId) {
      throw new Error("Organization required")
    }

    if (!formData.title) {
      throw new Error("Form title is required")
    }

    // Validate form structure based on type
    if (formData.isMultistep) {
      if (!formData.steps || !Array.isArray(formData.steps) || formData.steps.length === 0) {
        throw new Error("Multistep forms must have at least one step")
      }
    } else {
      if (!formData.fields || !Array.isArray(formData.fields) || formData.fields.length === 0) {
        throw new Error("Single-step forms must have at least one field")
      }
    }

    const form = await prisma.form.create({
      data: {
        title: formData.title,
        description: formData.description || null,
        fields: formData.isMultistep ? undefined : formData.fields,
        steps: formData.isMultistep ? formData.steps : undefined,
        isMultistep: formData.isMultistep || false,
        settings: formData.settings || {},
        styling: formData.styling || {},
        thankYouPage: formData.thankYouPage || {},
        organizationId: user.organizationId,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, form }
  } catch (error) {
    console.error("Error creating form:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create form")
  }
}

export async function updateForm(formId: string, formData: {
  title: string
  description?: string
  fields?: any[]
  steps?: any[]
  isMultistep?: boolean
  settings?: any
  styling?: any
  thankYouPage?: any
}) {
  try {
    const user = await getUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (!user.organizationId) {
      throw new Error("Organization required")
    }

    if (!formData.title) {
      throw new Error("Form title is required")
    }

    // Validate form structure based on type
    if (formData.isMultistep) {
      if (!formData.steps || !Array.isArray(formData.steps) || formData.steps.length === 0) {
        throw new Error("Multistep forms must have at least one step")
      }
    } else {
      if (!formData.fields || !Array.isArray(formData.fields) || formData.fields.length === 0) {
        throw new Error("Single-step forms must have at least one field")
      }
    }

    // Check if the form belongs to the user's organization
    const existingForm = await prisma.form.findFirst({
      where: {
        id: formId,
        organizationId: user.organizationId,
      },
    })

    if (!existingForm) {
      throw new Error("Form not found")
    }

    const updatedForm = await prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        title: formData.title,
        description: formData.description || null,
        fields: formData.isMultistep ? undefined : formData.fields,
        steps: formData.isMultistep ? formData.steps : undefined,
        isMultistep: formData.isMultistep || false,
        settings: formData.settings || {},
        styling: formData.styling || {},
        thankYouPage: formData.thankYouPage || {},
      },
    })

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/forms/${formId}`)
    revalidatePath(`/forms/${formId}`)
    return { success: true, form: updatedForm }
  } catch (error) {
    console.error("Error updating form:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update form")
  }
}

export async function deleteForm(formId: string) {
  try {
    const user = await getUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (!user.organizationId) {
      throw new Error("Organization required")
    }

    // Check if the form belongs to the user's organization
    const existingForm = await prisma.form.findFirst({
      where: {
        id: formId,
        organizationId: user.organizationId,
      },
    })

    if (!existingForm) {
      throw new Error("Form not found")
    }

    // Delete the form (entries will be automatically deleted due to cascade delete)
    await prisma.form.delete({
      where: {
        id: formId,
      },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error("Error deleting form:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete form")
  }
}

export async function updateEmbeddingSettings(formId: string, embedding: any) {
  try {
    const user = await getUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (!user.organizationId) {
      throw new Error("Organization required")
    }

    if (!embedding || typeof embedding !== 'object') {
      throw new Error("Invalid embedding settings")
    }

    // Check if the form belongs to the user's organization
    const existingForm = await prisma.form.findFirst({
      where: {
        id: formId,
        organizationId: user.organizationId,
      },
    })

    if (!existingForm) {
      throw new Error("Form not found")
    }

    const updatedForm = await prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        embedding: embedding,
      },
    })

    revalidatePath(`/dashboard/forms/${formId}/embedding`)
    return { success: true, form: updatedForm }
  } catch (error) {
    console.error("Error updating embedding settings:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update embedding settings")
  }
}

export async function submitFormEntry(formId: string, answers: Record<string, any>) {
  try {
    if (!answers || typeof answers !== 'object') {
      throw new Error("Invalid form submission")
    }

    // Verify the form exists and is active
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
        isActive: true,
      },
    })

    if (!form) {
      throw new Error("Form not found")
    }

    // Create form entry
    const entry = await prisma.formEntry.create({
      data: {
        formId,
        answers,
      },
    })

    return { success: true, entryId: entry.id }
  } catch (error) {
    console.error("Error submitting form:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to submit form")
  }
}

// Form Data Fetching Actions
export async function getForm(formId: string) {
  try {
    const user = await getUser()

    // If user is authenticated, they can access any form from their organization
    // If not authenticated, only return active forms for public access
    const whereClause = user?.organizationId 
      ? {
          id: formId,
          organizationId: user.organizationId,
        }
      : {
          id: formId,
          isActive: true,
        }

    const form = await prisma.form.findFirst({
      where: whereClause,
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    })

    if (!form) {
      throw new Error("Form not found")
    }

    return form
  } catch (error) {
    console.error("Error fetching form:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch form")
  }
}

export async function getForms() {
  try {
    const user = await getUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (!user.organizationId) {
      throw new Error("Organization required")
    }

    const forms = await prisma.form.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return forms
  } catch (error) {
    console.error("Error fetching forms:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch forms")
  }
}

export async function getFormEntries(formId: string, options: {
  page?: number
  limit?: number
  search?: string
  dateFilter?: string
  sortBy?: string
  sortOrder?: string
} = {}) {
  try {
    const user = await getUser()
    
    if (!user?.organizationId) {
      throw new Error("Unauthorized")
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      dateFilter = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options

    // Verify the form belongs to the user's organization
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        organizationId: user.organizationId,
      },
    })

    if (!form) {
      throw new Error("Form not found")
    }

    // Build where clause for filtering
    const whereClause: any = {
      formId: formId,
    }

    // Add date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }
      
      whereClause.createdAt = {
        gte: startDate,
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.formEntry.count({
      where: whereClause,
    })

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Define valid database fields for sorting
    const validDbFields = ['id', 'formId', 'createdAt', 'updatedAt']
    
    // Get paginated entries
    let entries = await prisma.formEntry.findMany({
      where: whereClause,
      orderBy: validDbFields.includes(sortBy) ? {
        [sortBy]: sortOrder,
      } : {
        createdAt: 'desc', // Default sorting
      },
      skip,
      take: limit,
    })

    // If sorting by a dynamic field (not a database field), sort the results
    if (!validDbFields.includes(sortBy)) {
      entries = entries.sort((a, b) => {
        const aValue = (a.answers as any)?.[sortBy]
        const bValue = (b.answers as any)?.[sortBy]
        
        if (!aValue && !bValue) return 0
        if (!aValue) return sortOrder === 'asc' ? 1 : -1
        if (!bValue) return sortOrder === 'asc' ? -1 : 1
        
        // Convert to strings for comparison
        const aStr = String(aValue).toLowerCase()
        const bStr = String(bValue).toLowerCase()
        
        if (sortOrder === 'asc') {
          return aStr.localeCompare(bStr)
        } else {
          return bStr.localeCompare(aStr)
        }
      })
    }

    // If search is provided, filter entries on the client side
    // (This is not ideal for large datasets, but works for now)
    let filteredEntries = entries
    if (search) {
      filteredEntries = entries.filter(entry => {
        const searchLower = search.toLowerCase()
        return Object.values(entry.answers as Record<string, any>).some(answer => 
          String(answer).toLowerCase().includes(searchLower)
        )
      })
    }

    return {
      entries: filteredEntries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  } catch (error) {
    console.error("Error fetching form entries:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch form entries")
  }
}

// Analytics Actions
export async function getFormAnalytics(formId: string) {
  try {
    const user = await getUser()
    
    if (!user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Verify the form belongs to the user's organization
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        organizationId: user.organizationId,
      },
    })

    if (!form) {
      throw new Error("Form not found")
    }

    // Get total entries count
    const totalEntries = await prisma.formEntry.count({
      where: { formId }
    })

    // Get entries from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentEntries = await prisma.formEntry.count({
      where: {
        formId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Get entries grouped by day for the last 30 days
    const entriesByDay = await prisma.formEntry.groupBy({
      by: ['createdAt'],
      where: {
        formId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get entries grouped by day for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const entriesLast7Days = await prisma.formEntry.groupBy({
      by: ['createdAt'],
      where: {
        formId,
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return {
      totalEntries,
      recentEntries,
      entriesByDay,
      entriesLast7Days
    }
  } catch (error) {
    console.error("Error fetching form analytics:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch form analytics")
  }
}
