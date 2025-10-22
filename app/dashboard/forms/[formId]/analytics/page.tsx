import { getUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, TrendingUp, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { FormAnalytics } from "@/components/forms/FormAnalytics"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { PaginatedFormEntriesTableClient } from "@/components/forms/PaginatedFormEntriesTableClient"

interface FormAnalyticsPageProps {
  params: Promise<{
    formId: string
  }>
}

export default async function FormAnalyticsPage({ params }: FormAnalyticsPageProps) {
  const user = await getUser()
  
  if (!user?.organizationId) {
    redirect('/dashboard')
  }

  const { formId } = await params

  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      organizationId: user.organizationId,
    },
    include: {
      entries: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          entries: true,
        },
      },
    },
  })

  if (!form) {
    notFound()
  }

  // Extract all fields from the form (handles both single-step and multistep forms)
  const getAllFormFields = () => {
    if (form.isMultistep && form.steps) {
      // For multistep forms, extract fields from all steps
      const allFields: any[] = []
      ;(form.steps as any[]).forEach((step: any) => {
        if (step.fields) {
          allFields.push(...step.fields)
        }
      })
      return allFields
    } else if (form.fields) {
      // For single-step forms, use the fields directly
      return form.fields as any[]
    }
    return []
  }

  const formFields = getAllFormFields()

  // Calculate analytics data
  const totalResponses = form._count.entries
  
  // Get response trends (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentEntries = form.entries.filter(entry => 
    new Date(entry.createdAt) >= thirtyDaysAgo
  )

  // Calculate daily response counts for the last 30 days
  const dailyResponses = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))
    
    const count = form.entries.filter(entry => {
      const entryDate = new Date(entry.createdAt)
      return entryDate >= dayStart && entryDate <= dayEnd
    }).length
    
    return {
      date: dayStart.toISOString().split('T')[0],
      responses: count,
      displayDate: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  })

  // Calculate field analytics
  const fieldAnalytics = formFields.map(field => {
    const fieldResponses = form.entries.map(entry => (entry.answers as any)?.[field.id]).filter(Boolean)
    
    let analytics: any = {
      fieldId: field.id,
      fieldLabel: field.label,
      fieldType: field.type,
      totalResponses: fieldResponses.length,
      completionRate: form.entries.length > 0 ? (fieldResponses.length / form.entries.length) * 100 : 0
    }

    // Field-specific analytics
    if (field.type === 'select' || field.type === 'radio') {
      const optionCounts: Record<string, number> = {}
      fieldResponses.forEach(response => {
        if (Array.isArray(response)) {
          response.forEach(option => {
            optionCounts[option] = (optionCounts[option] || 0) + 1
          })
        } else {
          optionCounts[response] = (optionCounts[response] || 0) + 1
        }
      })
      analytics.optionCounts = optionCounts
    } else if (field.type === 'checkbox' || field.type === 'multiselect' || field.type === 'multi-dropdown') {
      const optionCounts: Record<string, number> = {}
      fieldResponses.forEach(response => {
        if (Array.isArray(response)) {
          response.forEach(option => {
            optionCounts[option] = (optionCounts[option] || 0) + 1
          })
        }
      })
      analytics.optionCounts = optionCounts
    } else if (field.type === 'rating') {
      const ratingCounts: Record<string, number> = {}
      fieldResponses.forEach(response => {
        ratingCounts[response] = (ratingCounts[response] || 0) + 1
      })
      analytics.ratingCounts = ratingCounts
      analytics.averageRating = fieldResponses.length > 0 
        ? fieldResponses.reduce((sum, rating) => sum + Number(rating), 0) / fieldResponses.length 
        : 0
    }

    return analytics
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: "Responses", href: "/dashboard/responses" },
          { label: form.title, href: `/dashboard/forms/${form.id}/edit` },
          { label: "Analytics" }
        ]} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/responses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Responses
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 mt-1">{form.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={form.isActive ? "default" : "secondary"}>
            {form.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline">
            {totalResponses} responses
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Responses</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalResponses}</div>
            <p className="text-xs text-blue-600/70 font-medium">
              All time responses
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Recent Responses</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{recentEntries.length}</div>
            <p className="text-xs text-green-600/70 font-medium">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Avg. Daily</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {recentEntries.length > 0 ? (recentEntries.length / 30).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-purple-600/70 font-medium">
              Daily average
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Completion Rate</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {(() => {
                if (form.entries.length === 0 || formFields.length === 0) return 0
                
                const totalCompletionRate = formFields.reduce((sum, field) => {
                  const fieldResponses = form.entries.filter(entry => (entry.answers as any)?.[field.id]).length
                  return sum + (fieldResponses / form.entries.length)
                }, 0)
                
                return Math.round((totalCompletionRate / formFields.length) * 100)
              })()}%
            </div>
            <p className="text-xs text-orange-600/70 font-medium">
              Field completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <FormAnalytics 
        dailyResponses={dailyResponses}
        fieldAnalytics={fieldAnalytics}
      />

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <PaginatedFormEntriesTableClient 
            formId={form.id}
            formFields={formFields}
            initialEntries={form.entries.slice(0, 10)}
            initialTotalCount={totalResponses}
          />
        </CardContent>
      </Card>
    </div>
  )
}
