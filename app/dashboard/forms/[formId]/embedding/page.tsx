import { getUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import EmbeddingSettings from "@/components/forms/EmbeddingSettings"

interface EmbeddingSettingsPageProps {
  params: Promise<{
    formId: string
  }>
}

export default async function EmbeddingSettingsPage({ params }: EmbeddingSettingsPageProps) {
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
          { label: "Embedding Settings" }
        ]} 
      />

      <EmbeddingSettings />
    </div>
  )
}
