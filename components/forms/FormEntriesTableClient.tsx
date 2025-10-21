"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"

const FormEntriesTable = dynamic(
  () => import('./FormEntriesTable').then(mod => ({ default: mod.FormEntriesTable })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center py-4">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="ml-2 text-gray-500 text-sm">Loading table...</span>
    </div>
  }
)

interface FormEntriesTableClientProps {
  entries: any[]
  formFields: any
}

export function FormEntriesTableClient(props: FormEntriesTableClientProps) {
  return <FormEntriesTable {...props} />
}
