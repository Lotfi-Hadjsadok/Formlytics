import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import  prisma  from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, fields, settings, styling, thankYouPage } = body

    if (!title || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    const form = await prisma.form.create({
      data: {
        title,
        description: description || null,
        fields: fields,
        settings: settings || {},
        styling: styling || {},
        thankYouPage: thankYouPage || {},
        organizationId: user.organizationId,
      },
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error("Error creating form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 })
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

    return NextResponse.json(forms)
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
