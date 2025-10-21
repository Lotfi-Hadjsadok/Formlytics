import { getUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, BarChart3, ExternalLink, Eye, Code } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { format } from "date-fns"

interface FormDetailPageProps {
  params: Promise<{
    formId: string
  }>
}

export default async function FormDetailPage({ params }: FormDetailPageProps) {
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

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Forms", href: "/dashboard" },
          { label: form.title }
        ]} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
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
            {form._count.entries} responses
          </Badge>
        </div>
      </div>

      {/* Form Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Form Fields</h3>
                <div className="space-y-2">
                  {(form.fields as any[]).map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{field.label}</span>
                        <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                      </div>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Form Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Allow multiple submissions</span>
                    <Badge variant={(form.settings as any)?.allowMultiple ? "default" : "secondary"}>
                      {(form.settings as any)?.allowMultiple ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Collect email addresses</span>
                    <Badge variant={(form.settings as any)?.collectEmail ? "default" : "secondary"}>
                      {(form.settings as any)?.collectEmail ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href={`/dashboard/forms/${form.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Form
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/dashboard/forms/${form.id}/analytics`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/forms/${form.id}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Form
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/dashboard/forms/${form.id}/embedding`}>
                  <Code className="h-4 w-4 mr-2" />
                  Embedding Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Form Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Form Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Responses</span>
                <span className="font-semibold">{form._count.entries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Form Fields</span>
                <span className="font-semibold">{(form.fields as any[]).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="font-semibold">{format(new Date(form.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="font-semibold">{format(new Date(form.updatedAt), 'MMM dd, yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
