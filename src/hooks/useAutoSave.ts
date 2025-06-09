import { useEffect, useRef, useState } from 'react'
import { updateSession } from '../lib/supabase'
import { FormState } from '../types/form'

interface UseAutoSaveOptions {
  delay?: number // Debounce delay in milliseconds
  enabled?: boolean // Whether auto-save is enabled
}

interface UseAutoSaveReturn {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
  forceSave: () => Promise<void>
}

export function useAutoSave(
  sessionId: string | null,
  data: Partial<FormState>,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const { delay = 1000, enabled = true } = options
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastDataRef = useRef<string>('')
  
  const saveData = async () => {
    if (!sessionId || !enabled) return
    
    setIsSaving(true)
    setError(null)
    
    try {
             // Convert FormState to database format
       const dbData = {
         first_name: data.personalInfo?.firstName,
         last_name: data.personalInfo?.lastName,
         email: data.personalInfo?.email,
         phone: data.personalInfo?.phone,
         address: data.address,
         postal_code: data.postalCode,
         inside_service_area: data.insideServiceArea,
         services: data.services,
         service_details: data.serviceDetails,
         budgets: data.budgets,
         project_vision: data.projectScope,
         success_criteria: data.projectSuccessCriteria,
         referral_source: data.personalInfo?.referralSource,
         previous_quotes: data.previousQuotes,
         price_vs_long_term: data.priceVsLongTerm,
         previous_provider: !!data.previousProvider,
         site_challenges: data.siteChallenges,
         start_deadlines: data.startDeadlines,
         upload_link_requested: data.personalInfo?.textUploadLink,
         photo_urls: data.personalInfo?.uploadedImages,
         meeting_scheduled: data.meetingBooked,
         initial_form_completed: data.formSubmitted
       }
      
      await updateSession(sessionId, dbData)
      setLastSaved(new Date())
    } catch (err) {
      console.error('Auto-save failed:', err)
      setError(err instanceof Error ? err.message : 'Auto-save failed')
    } finally {
      setIsSaving(false)
    }
  }
  
  const forceSave = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await saveData()
  }
  
  useEffect(() => {
    if (!enabled || !sessionId) return
    
    const currentData = JSON.stringify(data)
    
    // Only save if data has actually changed
    if (currentData === lastDataRef.current) return
    
    lastDataRef.current = currentData
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(saveData, delay)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, sessionId, enabled, delay])
  
  return {
    isSaving,
    lastSaved,
    error,
    forceSave
  }
} 