"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleProps {
  children: React.ReactNode
  title: string
  description?: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function Collapsible({ 
  children, 
  title, 
  description, 
  icon, 
  defaultOpen = true,
  className 
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("space-y-4", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon && <div className="text-gray-600">{icon}</div>}
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-gray-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-none opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  )
}
