import { getUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, TrendingUp } from "lucide-react"
import { FormsSummaryCards } from "@/components/forms/FormsSummaryCards"

export default async function ResponsesPage() {
  const user = await getUser()
  
  if (!user?.organizationId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Form Responses</h2>
          <p className="text-gray-600 mt-2">View and analyze form submissions.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-500">You need to be part of an organization to view responses.</p>
        </div>
      </div>
    )
  }

  // Fetch all forms and their entries for the organization
  const forms = await prisma.form.findMany({
    where: {
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
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Calculate total responses
  const totalResponses = forms.reduce((sum, form) => sum + form._count.entries, 0)

  // Get recent responses (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentResponses = await prisma.formEntry.count({
    where: {
      form: {
        organizationId: user.organizationId,
      },
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Form Responses</h2>
        <p className="text-gray-600 mt-2">View and analyze form submissions across all your forms.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              Across {forms.length} forms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Responses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentResponses}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forms.filter(form => form.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {forms.length} total forms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forms Summary Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Forms & Responses</h3>
        <FormsSummaryCards forms={forms} />
      </div>
    </div>
  )
}
