import { useState, useEffect } from 'react'
import { createSession, getSession, updateSession, FormSession } from '../lib/supabase'
import { FormState } from '../types/form'

interface UseSessionReturn {
  sessionId: string | null
  isLoading: boolean
  error: string | null
  createNewSession: (initialData?: Partial<FormState>) => Promise<string>
  loadSession: (id: string) => Promise<FormSession | null>
  updateCurrentSession: (data: Partial<FormSession>) => Promise<void>
}

export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const createNewSession = async (initialData?: Partial<FormState>): Promise<string> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const sessionData: Partial<FormSession> = {
        form_source: 'website',
        ...(initialData && {
          first_name: initialData.personalInfo?.firstName,
          last_name: initialData.personalInfo?.lastName,
          email: initialData.personalInfo?.email,
          phone: initialData.personalInfo?.phone,
          address: initialData.address,
          postal_code: initialData.postalCode,
          inside_service_area: initialData.insideServiceArea,
          services: initialData.services,
          service_details: initialData.serviceDetails,
          budgets: initialData.budgets,
          project_vision: initialData.projectScope,
          success_criteria: initialData.projectSuccessCriteria,
          referral_source: initialData.personalInfo?.referralSource,
          previous_quotes: initialData.previousQuotes,
          price_vs_long_term: initialData.priceVsLongTerm,
          previous_provider: !!initialData.previousProvider,
          site_challenges: initialData.siteChallenges,
          start_deadlines: initialData.startDeadlines,
          upload_link_requested: initialData.personalInfo?.textUploadLink,
          photo_urls: initialData.personalInfo?.uploadedImages,
          meeting_scheduled: initialData.meetingBooked,
          initial_form_completed: initialData.formSubmitted
        })
      }
      
      const session = await createSession(sessionData)
      setSessionId(session.id)
      return session.id
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadSession = async (id: string): Promise<FormSession | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const session = await getSession(id)
      if (session) {
        setSessionId(session.id)
      }
      return session
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateCurrentSession = async (data: Partial<FormSession>): Promise<void> => {
    if (!sessionId) {
      throw new Error('No active session')
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      await updateSession(sessionId, data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Load session from URL or localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionParam = urlParams.get('session')
    
    if (sessionParam) {
      loadSession(sessionParam)
    } else {
      // Check localStorage for existing session
      const savedSessionId = localStorage.getItem('currentSessionId')
      if (savedSessionId) {
        setSessionId(savedSessionId)
      }
    }
  }, [])
  
  // Save session ID to localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('currentSessionId', sessionId)
    } else {
      localStorage.removeItem('currentSessionId')
    }
  }, [sessionId])
  
  return {
    sessionId,
    isLoading,
    error,
    createNewSession,
    loadSession,
    updateCurrentSession
  }
} 