import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our actual schema
export interface FormSession {
  id: string
  created_at: string
  updated_at: string
  
  // Contact Information
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  postal_code?: string
  city?: string
  inside_service_area?: boolean
  
  // Services & Project Details
  services?: string[]
  service_details?: Record<string, any>
  budgets?: Record<string, number>
  project_vision?: string
  success_criteria?: string
  referral_source?: string
  
  // Form Completion Status
  initial_form_completed?: boolean
  follow_up_email_sent?: boolean
  follow_up_form_completed?: boolean
  
  // Photo Management
  photos_uploaded?: boolean
  photo_urls?: string[]
  
  // Meeting Management
  meeting_scheduled?: boolean
  meeting_date?: string
  meeting_start_time?: string
  meeting_end_time?: string
  meeting_provider?: string // 'Dom' or 'Charlie'
  zapier_webhook_sent?: boolean
  zapier_webhook_sent_at?: string
  
  // Follow-up Management
  follow_up_reminder_count?: number
  last_reminder_sent?: string
  follow_up_sequence_status?: string
  follow_up_emails_sent?: number
  next_follow_up_at?: string
  follow_up_sequence_cancelled?: boolean
  follow_up_url_generated?: string
  
  // Metadata
  form_source?: string // 'website', 'agent', 'phone'
  form_type?: string
  
  // Additional fields
  previous_quotes?: boolean
  price_vs_long_term?: string // 'price' or 'long-term'
  previous_provider?: string
  site_challenges?: string
  start_deadlines?: Record<string, any>
  notes?: string
  
  // Gravity Forms Integration
  gravity_forms_data?: Record<string, any>
  gravity_forms_entry_date?: string
}

// Helper functions for database operations
export const createSession = async (data: Partial<FormSession>): Promise<FormSession> => {
  const { data: session, error } = await supabase
    .from('form_sessions')
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return session
}

export const updateSession = async (id: string, data: Partial<FormSession>): Promise<FormSession> => {
  const { data: session, error } = await supabase
    .from('form_sessions')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return session
}

export const getSession = async (id: string): Promise<FormSession | null> => {
  const { data: session, error } = await supabase
    .from('form_sessions')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return session
}

export const getSessionByEmail = async (email: string): Promise<FormSession[]> => {
  const { data: sessions, error } = await supabase
    .from('form_sessions')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return sessions || []
}

export const getAllSessions = async (): Promise<FormSession[]> => {
  const { data: sessions, error } = await supabase
    .from('form_sessions')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return sessions || []
} 