import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FormStyling, DeviceStyling } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to merge device-specific styles with base styles
export function getDeviceStyles(styling: FormStyling, device: 'desktop' | 'tablet' | 'mobile') {
  const baseStyles = {
    backgroundColor: styling.backgroundColor,
    textColor: styling.textColor,
    primaryColor: styling.primaryColor,
    fontFamily: styling.fontFamily,
    borderRadius: styling.borderRadius,
  }

  const deviceStyles = styling[device] || {}

  return {
    ...baseStyles,
    ...deviceStyles,
  }
}
