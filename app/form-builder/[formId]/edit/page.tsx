"use client"

import { use } from "react"
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Terminal, ExternalLink } from "lucide-react"

const FormBuilder = dynamic(() => import('@/components/forms/FormBuilder').then(mod => ({ default: mod.FormBuilder })), { ssr: false })

interface EditFormPageProps {
  params: Promise<{
    formId: string
  }>
}

export default function EditFormPage({ params }: EditFormPageProps) {
  const { formId } = use(params)
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Form</h1>
            <p className="text-gray-600 mt-2">Modify your form fields, styling, and settings.</p>
          </div>
          <Link href={`/dashboard/forms/${formId}/api-docs`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span>API Documentation</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <FormBuilder formId={formId} />
    </div>
  )
}
