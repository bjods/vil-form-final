import { FormSession } from '../lib/supabase'

// Form validation states
export interface ValidationState {
  isValid: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}

// Initial Form (minimal) - public facing
export interface InitialFormData {
  // Contact Info
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  postal_code: string
  
  // Service Selection
  services: string[]
  
  // Quick Budget
  budgets: Record<string, number>
  
  // Photo Option
  upload_link_requested: boolean
}

// Follow-up Form (detailed) - sent via email
export interface FollowUpFormData extends InitialFormData {
  // Project Details
  project_vision: string
  timeline: string
  site_challenges: string
  
  // Success Criteria
  success_criteria: string
  price_vs_long_term: 'price' | 'long-term'
  
  // Previous Quotes
  previous_quotes: boolean
  previous_provider: boolean
  
  // Meeting Scheduling
  meeting_scheduled: boolean
  meeting_datetime?: string
  meeting_provider?: string
}

// Agent Form (internal) - comprehensive single page
export interface AgentFormData extends FormSession {
  // Additional agent-specific fields
  lead_priority: 'low' | 'medium' | 'high' | 'urgent'
  agent_notes: string
  lead_source_details: string
  follow_up_date: string
  estimated_value: number
  competition_notes: string
}

// Upload Form (standalone) - photo upload only
export interface UploadFormData {
  session_id: string
  photos: File[]
  photo_descriptions: Record<string, string>
}

// Form step configuration
export interface FormStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  validation?: (data: any) => ValidationState
  isOptional?: boolean
}

// Progress tracking
export interface FormProgress {
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  isComplete: boolean
} 