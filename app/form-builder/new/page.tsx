"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'
import { authClient } from "@/lib/auth-client"

const FormBuilder = dynamic(() => import('@/components/forms/FormBuilder').then(mod => ({ default: mod.FormBuilder })), { ssr: false })

export default function NewFormPage() {
  return (
    <div className="h-screen">
      <FormBuilder />
    </div>
  )
}
