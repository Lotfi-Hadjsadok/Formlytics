import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params
    const user = await getUser()
    
    if (!user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const dateFilter = searchParams.get('dateFilter') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Verify the form belongs to the user's organization
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        organizationId: user.organizationId,
      },
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
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

    // Get paginated entries
    const entries = await prisma.formEntry.findMany({
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    })

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

    return NextResponse.json({
      entries: filteredEntries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching form entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
