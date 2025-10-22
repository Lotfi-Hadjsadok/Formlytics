"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { getFormEntries } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { useSensor, useSensors, PointerSensor, KeyboardSensor, DragEndEvent, DndContext, closestCenter } from '@dnd-kit/core'
import { useSortable, arrayMove, SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, Download, Search, Filter, Settings, ArrowUpDown, ArrowUp, ArrowDown, GripVertical, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface FormEntry {
  id: string
  answers: any
  createdAt: Date
  updatedAt: Date
}

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  options?: string[]
}

interface ColumnConfig {
  id: string
  label: string
  visible: boolean
  sortable: boolean
}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface PaginatedFormEntriesTableProps {
  formId: string
  formFields: FormField[]
  initialEntries?: FormEntry[]
  initialTotalCount?: number
}

// Custom hook for persistent column order
function useColumnOrder(formFields: FormField[], formId?: string) {
  const storageKey = formId ? `formlytics-column-order-${formId}` : 'formlytics-column-order-default'
  
  const getDefaultColumns = useCallback((): ColumnConfig[] => [
    { id: 'submitted', label: 'Submitted', visible: true, sortable: true },
    ...(formFields || []).map(field => ({
      id: field.id,
      label: field.label,
      visible: true,
      sortable: true
    })),
    { id: 'actions', label: 'Actions', visible: true, sortable: false }
  ], [formFields])

  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    if (typeof window === 'undefined') return getDefaultColumns()
    
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsedColumns = JSON.parse(saved) as ColumnConfig[]
        // Validate that all current form fields are present
        const currentFieldIds = new Set((formFields || []).map(f => f.id))
        const savedFieldIds = new Set(parsedColumns.filter(c => c.id !== 'submitted' && c.id !== 'actions').map(c => c.id))
        
        // If form fields have changed, merge with defaults
        if (currentFieldIds.size !== savedFieldIds.size || 
            [...currentFieldIds].some(id => !savedFieldIds.has(id))) {
          return getDefaultColumns()
        }
        
        return parsedColumns
      }
    } catch (error) {
      console.warn('Failed to load column order from localStorage:', error)
    }
    
    return getDefaultColumns()
  })

  const saveColumnOrder = useCallback((newColumns: ColumnConfig[]) => {
    setColumns(newColumns)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newColumns))
      } catch (error) {
        console.warn('Failed to save column order to localStorage:', error)
      }
    }
  }, [storageKey])

  const resetColumnOrder = useCallback(() => {
    const defaultColumns = getDefaultColumns()
    setColumns(defaultColumns)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(defaultColumns))
      } catch (error) {
        console.warn('Failed to reset column order in localStorage:', error)
      }
    }
  }, [getDefaultColumns, storageKey])

  // Update columns when formFields change
  useEffect(() => {
    const currentFieldIds = new Set((formFields || []).map(f => f.id))
    const columnFieldIds = new Set(columns.filter(c => c.id !== 'submitted' && c.id !== 'actions').map(c => c.id))
    
    if (currentFieldIds.size !== columnFieldIds.size || 
        [...currentFieldIds].some(id => !columnFieldIds.has(id))) {
      const updatedColumns = getDefaultColumns()
      setColumns(updatedColumns)
      saveColumnOrder(updatedColumns)
    }
  }, [formFields, columns, getDefaultColumns, saveColumnOrder])

  return { columns, setColumns: saveColumnOrder, resetColumnOrder }
}

// Sortable Header Component with enhanced transitions
function SortableHeader({ 
  id, 
  children, 
  sortConfig, 
  onSort 
}: { 
  id: string
  children: React.ReactNode
  sortConfig: SortConfig | null
  onSort: (key: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging ? '0 8px 25px rgba(0, 0, 0, 0.15)' : 'none',
  }

  const getSortIcon = () => {
    if (sortConfig?.key !== id) return <ArrowUpDown className="h-4 w-4 opacity-50 transition-opacity duration-200" />
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-600 transition-colors duration-200" /> : 
      <ArrowDown className="h-4 w-4 text-blue-600 transition-colors duration-200" />
  }

  return (
    <TableHead 
      ref={setNodeRef} 
      style={style}
      className={`
        cursor-pointer select-none transition-all duration-200 ease-in-out
        hover:bg-gray-50 hover:shadow-sm
        ${isDragging ? 'bg-white border border-gray-200 rounded-md' : ''}
        ${sortConfig?.key === id ? 'bg-blue-50' : ''}
      `}
      onClick={() => onSort(id)}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2 group">
        <GripVertical className={`
          h-4 w-4 transition-all duration-200
          ${isDragging ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
        `} />
        <span className="font-medium">{children}</span>
        <div className="ml-auto transition-transform duration-200">
          {getSortIcon()}
        </div>
      </div>
    </TableHead>
  )
}

export function PaginatedFormEntriesTable({ 
  formId, 
  formFields, 
  initialEntries = [], 
  initialTotalCount = 0 
}: PaginatedFormEntriesTableProps) {
  const [entries, setEntries] = useState<FormEntry[]>(initialEntries)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  
  // Get sidebar state for dynamic width
  const { state: sidebarState } = useSidebar()
  
  // Use persistent column order hook
  const { columns, setColumns, resetColumnOrder } = useColumnOrder(formFields, formId)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const formatAnswer = (field: FormField, answer: any) => {
    if (!answer) return "-"
    
    switch (field.type) {
      case 'checkbox':
      case 'multiselect':
      case 'multi-dropdown':
        return Array.isArray(answer) ? answer.join(', ') : answer
      case 'date':
        try {
          const date = new Date(answer)
          if (isNaN(date.getTime())) {
            return String(answer)
          }
          return format(date, 'MMM dd, yyyy')
        } catch {
          return String(answer)
        }
      case 'textarea':
        return answer.length > 50 ? `${answer.substring(0, 50)}...` : answer
      default:
        return String(answer)
    }
  }

  const renderAnswer = (field: FormField, answer: any) => {
    if (!answer) return "-"
    
    switch (field.type) {
      case 'checkbox':
      case 'multiselect':
      case 'multi-dropdown':
        if (Array.isArray(answer) && answer.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {answer.map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          )
        }
        return answer
      case 'select':
      case 'radio':
        return (
          <Badge variant="secondary" className="text-xs">
            {answer}
          </Badge>
        )
      case 'date':
        try {
          const date = new Date(answer)
          if (isNaN(date.getTime())) {
            return String(answer)
          }
          return format(date, 'MMM dd, yyyy')
        } catch {
          return String(answer)
        }
      case 'textarea':
        return answer.length > 50 ? `${answer.substring(0, 50)}...` : answer
      default:
        return String(answer)
    }
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const newColumns = arrayMove(
        columns,
        columns.findIndex(item => item.id === active.id),
        columns.findIndex(item => item.id === over?.id)
      )
      setColumns(newColumns)
    }
  }, [columns, setColumns])

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? 
          { key, direction: 'desc' } : 
          null
      }
      return { key, direction: 'asc' }
    })
  }

  const toggleColumnVisibility = useCallback((columnId: string) => {
    const newColumns = columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    )
    setColumns(newColumns)
  }, [columns, setColumns])

  // Fetch entries when filters change
  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFormEntries(formId, {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        dateFilter: dateFilter !== 'all' ? dateFilter : undefined,
        sortBy: sortConfig?.key === 'submitted' ? 'createdAt' : sortConfig?.key,
        sortOrder: sortConfig?.direction
      })
      
      setEntries(data.entries)
      setTotalCount(data.pagination.totalCount)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }, [formId, currentPage, pageSize, searchTerm, dateFilter, sortConfig])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const totalPages = Math.ceil(totalCount / pageSize)
  const visibleColumns = columns.filter(col => col.visible)

  const exportToCSV = () => {
    const visibleFieldLabels = visibleColumns
      .filter(col => col.id !== 'submitted' && col.id !== 'actions')
      .map(col => col.label)
    
    const headers = ['Submitted At', ...visibleFieldLabels]
    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        (() => {
          try {
            const date = new Date(entry.createdAt)
            return isNaN(date.getTime()) ? entry.createdAt.toString() : format(date, 'MMM dd, yyyy HH:mm')
          } catch {
            return entry.createdAt.toString()
          }
        })(),
        ...visibleColumns
          .filter(col => col.id !== 'submitted' && col.id !== 'actions')
          .map(col => {
            const field = (formFields || []).find(f => f.id === col.id)
            if (!field) return ""
            const answer = entry.answers[field.id]
            const formatted = formatAnswer(field, answer)
            // Escape commas and quotes in CSV
            return `"${String(formatted).replace(/"/g, '""')}"`
          })
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `form-responses-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (totalCount === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No responses yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with stats and export */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h4 className="text-sm font-medium text-gray-700">
            {totalCount} response{totalCount !== 1 ? 's' : ''}
          </h4>
          {searchTerm && (
            <Badge variant="secondary">
              Filtered by: "{searchTerm}"
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        {/* Search */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Date Filter */}
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Date filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last week</SelectItem>
            <SelectItem value="month">Last month</SelectItem>
          </SelectContent>
        </Select>

        {/* Column Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem disabled>
              <span className="font-semibold">Toggle Columns</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => toggleColumnVisibility(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={resetColumnOrder}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              Reset Column Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div 
        className="border rounded-lg transition-all duration-300"
        style={{
          width: sidebarState === "expanded" ? "calc(100vw - var(--sidebar-width, 280px) - 5.5rem)" : "calc(100vw - var(--sidebar-width-icon, 64px) - 3rem)",
          maxWidth: "100%"
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table className="overflow-x-auto">
            <TableHeader>
              <TableRow>
                <SortableContext
                  items={visibleColumns.map(col => col.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {visibleColumns.map((column) => {
                    if (column.id === 'submitted') {
                      return (
                        <SortableHeader
                          key={column.id}
                          id={column.id}
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          {column.label}
                        </SortableHeader>
                      )
                    } else if (column.id === 'actions') {
                      return (
                        <TableHead key={column.id} className="w-20">
                          {column.label}
                        </TableHead>
                      )
                    } else {
                      return (
                        <SortableHeader
                          key={column.id}
                          id={column.id}
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          {column.label}
                        </SortableHeader>
                      )
                    }
                  })}
                </SortableContext>
              </TableRow>
            </TableHeader>
            <TableBody >
              {loading ? (
                <TableRow >
                  <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2 text-gray-500">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow  key={entry.id}>
                    {visibleColumns.map((column) => {
                      if (column.id === 'submitted') {
                        return (
                          <TableCell key={column.id} className="text-sm text-gray-500">
                            {(() => {
                              try {
                                const date = new Date(entry.createdAt)
                                return isNaN(date.getTime()) ? entry.createdAt.toString() : format(date, 'MMM dd, yyyy HH:mm')
                              } catch {
                                return entry.createdAt.toString()
                              }
                            })()}
                          </TableCell>
                        )
                      } else if (column.id === 'actions') {
                        return (
                          <TableCell key={column.id}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEntry(entry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )
                      } else {
                        const field = (formFields || []).find(f => f.id === column.id)
                        return (
                          <TableCell key={column.id} className="text-sm">
                            {field ? renderAnswer(field, entry.answers[field.id]) : "-"}
                          </TableCell>
                        )
                      }
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Response Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEntry(null)}
                >
                  ×
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Submitted on {(() => {
                  try {
                    const date = new Date(selectedEntry.createdAt)
                    return isNaN(date.getTime()) ? selectedEntry.createdAt.toString() : format(date, 'MMM dd, yyyy HH:mm')
                  } catch {
                    return selectedEntry.createdAt.toString()
                  }
                })()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formFields || []).map((field) => (
                <div key={field.id} className="border-b pb-3">
                  <h4 className="font-medium text-sm text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </h4>
                  <p className="text-sm text-gray-900">
                    {renderAnswer(field, selectedEntry.answers[field.id]) || (
                      <span className="text-gray-400 italic">No answer provided</span>
                    )}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
