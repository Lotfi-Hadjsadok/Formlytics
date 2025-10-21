"use client"

import { use } from "react"
import dynamic from 'next/dynamic'

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
        <h1 className="text-3xl font-bold">Edit Form</h1>
        <p className="text-gray-600 mt-2">Modify your form fields, styling, and settings.</p>
      </div>
      
      <FormBuilder formId={formId} />
    </div>
  )
}
