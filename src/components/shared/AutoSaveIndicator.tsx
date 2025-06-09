import React from 'react'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AutoSaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
  className?: string
}

export function AutoSaveIndicator({ 
  isSaving, 
  lastSaved, 
  error, 
  className 
}: AutoSaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (error) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm text-red-600",
        className
      )}>
        <AlertCircle className="w-4 h-4" />
        <span>Save failed</span>
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm text-blue-600",
        className
      )}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Saving...</span>
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm text-green-600",
        className
      )}>
        <CheckCircle2 className="w-4 h-4" />
        <span>Saved at {formatTime(lastSaved)}</span>
      </div>
    )
  }

  return null
} 