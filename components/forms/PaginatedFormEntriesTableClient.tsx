"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"

const PaginatedFormEntriesTable = dynamic(
  () => import('./PaginatedFormEntriesTable').then(mod => ({ default: mod.PaginatedFormEntriesTable })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ml-2 text-gray-500">Loading table...</span>
    </div>
  }
)

interface PaginatedFormEntriesTableClientProps {
  formId: string
  formFields: any
  initialEntries: any[]
  initialTotalCount: number
}

export function PaginatedFormEntriesTableClient(props: PaginatedFormEntriesTableClientProps) {
  return <PaginatedFormEntriesTable {...props} />
}
