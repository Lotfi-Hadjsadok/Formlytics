"use client"

import { cn } from "@/lib/utils"

export type StepUI = 'numbers' | 'letters' | 'percentage' | 'bar'

interface StepProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepUI: StepUI
  primaryColor?: string
  className?: string
}

export function StepProgressIndicator({
  currentStep,
  totalSteps,
  stepUI,
  primaryColor = '#3b82f6',
  className
}: StepProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  const renderNumbers = () => (
    <div className="relative flex items-center justify-between w-full">
      {/* Background line that goes through all circles */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2 transition-all duration-300"
        style={{
          backgroundColor: '#e5e7eb'
        }}
      />
      {/* Active line that fills up to current step */}
      <div 
        className="absolute top-1/2 left-0 h-0.5 transform -translate-y-1/2 transition-all duration-300"
        style={{
          backgroundColor: primaryColor,
          width: totalSteps > 1 ? `${(currentStep / (totalSteps - 1)) * 100}%` : '0%'
        }}
      />
      
      {/* Circles positioned on top of the line */}
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={cn(
            "relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm",
            index <= currentStep
              ? "text-white shadow-md"
              : "text-gray-500 bg-gray-200"
          )}
          style={{
            backgroundColor: index <= currentStep ? primaryColor : undefined
          }}
        >
          {index + 1}
        </div>
      ))}
    </div>
  )

  const renderLetters = () => (
    <div className="relative flex items-center justify-between w-full">
      {/* Background line that goes through all circles */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2 transition-all duration-300"
        style={{
          backgroundColor: '#e5e7eb'
        }}
      />
      {/* Active line that fills up to current step */}
      <div 
        className="absolute top-1/2 left-0 h-0.5 transform -translate-y-1/2 transition-all duration-300"
        style={{
          backgroundColor: primaryColor,
          width: totalSteps > 1 ? `${(currentStep / (totalSteps - 1)) * 100}%` : '0%'
        }}
      />
      
      {/* Circles positioned on top of the line */}
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={cn(
            "relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm",
            index <= currentStep
              ? "text-white shadow-md"
              : "text-gray-500 bg-gray-200"
          )}
          style={{
            backgroundColor: index <= currentStep ? primaryColor : undefined
          }}
        >
          {String.fromCharCode(65 + index)}
        </div>
      ))}
    </div>
  )

  const renderPercentage = () => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            backgroundColor: primaryColor,
            width: `${progress}%`
          }}
        />
      </div>
    </div>
  )

  const renderBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="h-2 rounded-full transition-all duration-300"
        style={{ 
          backgroundColor: primaryColor,
          width: `${progress}%`
        }}
      />
    </div>
  )

  const renderStepUI = () => {
    switch (stepUI) {
      case 'numbers':
        return renderNumbers()
      case 'letters':
        return renderLetters()
      case 'percentage':
        return renderPercentage()
      case 'bar':
        return renderBar()
      default:
        return renderNumbers()
    }
  }

  return (
    <div className={cn("mb-6", className)}>
      {renderStepUI()}
    </div>
  )
}
