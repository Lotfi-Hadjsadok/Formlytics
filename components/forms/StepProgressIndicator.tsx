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
    <div className="flex items-center justify-between w-full">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center flex-1">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300",
              index <= currentStep
                ? "text-white"
                : "text-gray-500 bg-gray-200"
            )}
            style={{
              backgroundColor: index <= currentStep ? primaryColor : undefined
            }}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div 
              className="flex-1 h-0.5 mx-2 transition-all duration-300"
              style={{
                backgroundColor: index < currentStep ? primaryColor : '#e5e7eb'
              }}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderLetters = () => (
    <div className="flex items-center justify-between w-full">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center flex-1">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300",
              index <= currentStep
                ? "text-white"
                : "text-gray-500 bg-gray-200"
            )}
            style={{
              backgroundColor: index <= currentStep ? primaryColor : undefined
            }}
          >
            {String.fromCharCode(65 + index)}
          </div>
          {index < totalSteps - 1 && (
            <div 
              className="flex-1 h-0.5 mx-2 transition-all duration-300"
              style={{
                backgroundColor: index < currentStep ? primaryColor : '#e5e7eb'
              }}
            />
          )}
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
