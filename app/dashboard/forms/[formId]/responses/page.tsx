import { getUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { PaginatedFormEntriesTableClient } from "@/components/forms/PaginatedFormEntriesTableClient"

interface FormResponsesPageProps {
  params: Promise<{
    formId: string
  }>
}

export default async function FormResponsesPage({ params }: FormResponsesPageProps) {
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
        take: 10,
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

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Forms", href: "/dashboard" },
          { label: form.title, href: `/dashboard/forms/${form.id}` },
          { label: "Responses" }
        ]} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/forms/${form.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title} - Responses</h1>
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

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <PaginatedFormEntriesTableClient 
            formId={form.id}
            formFields={form.fields as any}
            initialEntries={form.entries}
            initialTotalCount={form._count.entries}
          />
        </CardContent>
      </Card>
    </div>
  )
}
