"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Eye, Edit, Trash2, BarChart3, ExternalLink, Share2, Copy, CheckCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteForm } from "@/lib/actions"

interface Form {
  id: string
  title: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    entries: number
  }
}

interface FormsTableProps {
  forms: Form[]
}

export function FormsTable({ forms }: FormsTableProps) {
  const [selectedForm, setSelectedForm] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formToDelete, setFormToDelete] = useState<Form | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null)
  const router = useRouter()

  const handleDeleteClick = (form: Form) => {
    setFormToDelete(form)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return

    setIsDeleting(true)
    try {
      await deleteForm(formToDelete.id)
      toast.success(`"${formToDelete.title}" has been successfully deleted.`)
      router.refresh()
      setDeleteDialogOpen(false)
      setFormToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while deleting the form.")
    } finally {
      setIsDeleting(false)
    }
  }

  const copyFormLink = async (formId: string) => {
    try {
      const publicUrl = `${window.location.origin}/forms/${formId}`
      await navigator.clipboard.writeText(publicUrl)
      setCopiedFormId(formId)
      toast.success('Form link copied to clipboard!')
      setTimeout(() => setCopiedFormId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy link to clipboard')
    }
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
        <p className="text-gray-500 mb-4">Get started by creating your first form.</p>
        <Button asChild>
          <Link href="/form-builder/new">
            Create your first form
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{form.title}</CardTitle>
                  {form.description && (
                    <CardDescription className="text-sm">
                      {form.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyFormLink(form.id)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedFormId === form.id ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/forms/${form.id}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Public Form
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/forms/${form.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/form-builder/${form.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/forms/${form.id}/analytics`}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/forms/${form.id}/responses`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Responses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteClick(form)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={form.isActive ? "default" : "secondary"}>
                    {form.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {form._count.entries} responses
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {format(new Date(form.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form "{formToDelete?.title}" and all of its {formToDelete?._count.entries} responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
