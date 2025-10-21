"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'
import { authClient } from "@/lib/auth-client"

const FormBuilder = dynamic(() => import('@/components/forms/FormBuilder').then(mod => ({ default: mod.FormBuilder })), { ssr: false })

export default function NewFormPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create New Form</h2>
        <p className="text-gray-600 mt-2">Build and configure your form with custom fields and settings.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <FormBuilder />
      </div>
    </div>
  )
}
