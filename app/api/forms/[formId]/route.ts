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
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error("Error fetching form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 })
    }

    const { formId } = await params
    const body = await request.json()
    const { title, description, fields, settings, styling, thankYouPage } = body

    if (!title || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    // Check if the form belongs to the user's organization
    const existingForm = await prisma.form.findFirst({
      where: {
        id: formId,
        organizationId: user.organizationId,
      },
    })

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    const updatedForm = await prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        title,
        description: description || null,
        fields: fields,
        settings: settings || {},
        styling: styling || {},
        thankYouPage: thankYouPage || {},
      },
    })

    return NextResponse.json(updatedForm)
  } catch (error) {
    console.error("Error updating form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 })
    }

    const { formId } = await params
    const body = await request.json()
    const { embedding } = body

    if (!embedding || typeof embedding !== 'object') {
      return NextResponse.json({ error: "Invalid embedding settings" }, { status: 400 })
    }

    // Check if the form belongs to the user's organization
    const existingForm = await prisma.form.findFirst({
      where: {
        id: formId,
        organizationId: user.organizationId,
      },
    })

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    const updatedForm = await prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        embedding: embedding,
      },
    })

    return NextResponse.json(updatedForm)
  } catch (error) {
    console.error("Error updating embedding settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 })
    }

    const { formId } = await params

    // Check if the form belongs to the user's organization
    const existingForm = await prisma.form.findFirst({
      where: {
        id: formId,
        organizationId: user.organizationId,
      },
    })

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Delete the form (entries will be automatically deleted due to cascade delete)
    await prisma.form.delete({
      where: {
        id: formId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params
    const body = await request.json()
    const { answers } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: "Invalid form submission" }, { status: 400 })
    }

    // Verify the form exists and is active
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
        isActive: true,
      },
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Create form entry
    const entry = await prisma.formEntry.create({
      data: {
        formId,
        answers,
      },
    })

    return NextResponse.json({ success: true, entryId: entry.id })
  } catch (error) {
    console.error("Error submitting form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
