"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, ArrowRight, Calendar, MessageSquare } from "lucide-react"
import { format } from "date-fns"

interface Form {
  id: string
  title: string
  description: string | null
  isActive: boolean
  entries: Array<{
    createdAt: Date
  }>
  _count: {
    entries: number
  }
}

interface FormsSummaryCardsProps {
  forms: Form[]
}

export function FormsSummaryCards({ forms }: FormsSummaryCardsProps) {
  const handleCardClick = (formId: string) => {
    window.location.href = `/dashboard/forms/${formId}/responses`
  }

  const handleActionClick = (e: React.MouseEvent, href: string) => {
    e.stopPropagation()
    window.location.href = href
  }

  if (forms.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No forms created yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {forms.map((form) => (
        <Card 
          key={form.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer h-full"
          onClick={() => handleCardClick(form.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{form.title}</CardTitle>
                {form.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{form.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={form.isActive ? "default" : "secondary"}>
                  {form.isActive ? "Active" : "Inactive"}
                </Badge>
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Response Count */}
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {form._count.entries} response{form._count.entries !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Last Response Date */}
              {form._count.entries > 0 ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Last: {format(new Date(form.entries[0]?.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">No responses yet</span>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => handleActionClick(e, `/dashboard/forms/${form.id}/analytics`)}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => handleActionClick(e, `/dashboard/forms/${form.id}`)}
                >
                  Edit Form
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
