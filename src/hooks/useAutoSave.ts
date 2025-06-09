import { useCallback, useRef, useState } from 'react'
import { updateSession } from '../lib/supabase'

interface AutoSaveState {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
}

export const useAutoSave = (sessionId: string | null) => {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const retryCountRef = useRef(0)
  const maxRetries = 3

  const saveToDatabase = useCallback(async (field: string, value: any) => {
    if (!sessionId) return

    setState(prev => ({ ...prev, isSaving: true, error: null }))

    try {
      await updateSession(sessionId, { [field]: value })
      setState(prev => ({ 
        ...prev, 
        isSaving: false, 
        lastSaved: new Date(),
        error: null 
      }))
      retryCountRef.current = 0
      console.log(`✅ Auto-saved ${field}`)
    } catch (error) {
      console.error('❌ Auto-save failed:', error)
      
      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        console.log(`🔄 Retrying auto-save (${retryCountRef.current}/${maxRetries})`)
        
        setTimeout(() => {
          saveToDatabase(field, value)
        }, 1000 * retryCountRef.current) // Exponential backoff
      } else {
        setState(prev => ({ 
          ...prev, 
          isSaving: false, 
          error: `Failed to save ${field}. Please check your connection.` 
        }))
        retryCountRef.current = 0
      }
    }
  }, [sessionId])

  const debouncedSave = useCallback((field: string, value: any) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveToDatabase(field, value)
    }, 500) // 500ms debounce
  }, [saveToDatabase])

  const saveImmediately = useCallback((field: string, value: any) => {
    // Clear any pending debounced saves
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    saveToDatabase(field, value)
  }, [saveToDatabase])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    autoSave: debouncedSave,
    saveImmediately,
    state,
    clearError,
    cleanup
  }
} 