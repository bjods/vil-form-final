import { useState, useEffect, useCallback } from 'react'
import { FormSession, createSession, getSession, updateSession } from '../lib/supabase'

interface UseSessionOptions {
  sessionId?: string
  autoCreate?: boolean
  initialData?: Partial<FormSession>
}

interface SessionState {
  session: FormSession | null
  loading: boolean
  error: string | null
  isNew: boolean
}

export const useSession = (options: UseSessionOptions = {}) => {
  const { sessionId, autoCreate = false, initialData = {} } = options
  
  const [state, setState] = useState<SessionState>({
    session: null,
    loading: true,
    error: null,
    isNew: false
  })

  // Load existing session or create new one
  const initializeSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      if (sessionId) {
        // Load existing session
        const existingSession = await getSession(sessionId)
        if (existingSession) {
          setState({
            session: existingSession,
            loading: false,
            error: null,
            isNew: false
          })
          return existingSession
        } else {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Session not found' 
          }))
          return null
        }
      } else if (autoCreate) {
        // Create new session
        const newSession = await createSession({
          form_source: 'website',
          ...initialData
        })
        setState({
          session: newSession,
          loading: false,
          error: null,
          isNew: true
        })
        return newSession
      } else {
        setState(prev => ({ ...prev, loading: false }))
        return null
      }
    } catch (error) {
      console.error('Session initialization error:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }))
      return null
    }
  }, [sessionId, autoCreate, initialData])

  // Update session data
  const updateSessionData = useCallback(async (data: Partial<FormSession>) => {
    if (!state.session) return null

    try {
      const updatedSession = await updateSession(state.session.id, data)
      setState(prev => ({ 
        ...prev, 
        session: updatedSession,
        error: null 
      }))
      return updatedSession
    } catch (error) {
      console.error('Session update error:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Update failed' 
      }))
      return null
    }
  }, [state.session])

  // Create a new session manually
  const createNewSession = useCallback(async (data: Partial<FormSession> = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const newSession = await createSession({
        form_source: 'website',
        ...data
      })
      
      setState({
        session: newSession,
        loading: false,
        error: null,
        isNew: true
      })
      
      return newSession
    } catch (error) {
      console.error('Session creation error:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Creation failed' 
      }))
      return null
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Initialize on mount or when sessionId changes
  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  return {
    session: state.session,
    loading: state.loading,
    error: state.error,
    isNew: state.isNew,
    updateSession: updateSessionData,
    createSession: createNewSession,
    refreshSession: initializeSession,
    clearError
  }
} 