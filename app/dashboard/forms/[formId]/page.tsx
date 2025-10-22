import { getUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, BarChart3, ExternalLink, Eye, Code, Terminal } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { format } from "date-fns"
import { ShareButton } from "@/components/forms/ShareButton"

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
          <ShareButton formId={form.id} />
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
                  {form.isMultistep ? (
                    // Handle multistep forms
                    <div className="space-y-4">
                      {(form.steps as any[])?.map((step, stepIndex) => (
                        <div key={stepIndex} className="relative">
                          {/* Step Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                              {stepIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {step.title || `Step ${stepIndex + 1}`}
                              </h4>
                              {step.description && (
                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {step.fields?.length || 0} fields
                            </Badge>
                          </div>
                          
                          {/* Step Fields */}
                          <div className="ml-11 space-y-2">
                            {step.fields?.map((field: any, fieldIndex: number) => (
                              <div key={fieldIndex} className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  <div>
                                    <span className="font-medium text-gray-900">{field.label}</span>
                                    <span className="text-sm text-gray-500 ml-2 capitalize">({field.type})</span>
                                    {field.placeholder && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        Placeholder: "{field.placeholder}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {field.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Required
                                    </Badge>
                                  )}
                                  {field.validation && (
                                    <Badge variant="secondary" className="text-xs">
                                      Validated
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )) || (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                No fields in this step
                              </div>
                            )}
                          </div>
                          
                          {/* Step Separator */}
                          {stepIndex < (form.steps as any[]).length - 1 && (
                            <div className="ml-11 mt-4 mb-2">
                              <div className="h-px bg-gradient-to-r from-blue-200 via-gray-300 to-blue-200"></div>
                            </div>
                          )}
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <p>No steps configured</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Handle single-step forms
                    (form.fields as any[])?.map((field, index) => (
                      <div key={field.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                    )) || <p className="text-gray-500">No fields configured</p>
                  )}
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
              <ShareButton formId={form.id} className="w-full justify-start" />
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
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/dashboard/forms/${form.id}/api-docs`}>
                  <Terminal className="h-4 w-4 mr-2" />
                  API Documentation
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
                <span className="font-semibold">
                  {form.isMultistep 
                    ? (form.steps as any[])?.reduce((total, step) => total + (step.fields?.length || 0), 0) || 0
                    : (form.fields as any[])?.length || 0
                  }
                </span>
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
