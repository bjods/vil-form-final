import { create } from 'zustand';
import { FormState } from '../types/form';
import { determineFormPath, generateSessionId } from '../lib/utils';
import { createSession, updateSession, getSession, FormSession } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface FormStore {
  state: FormState;
  initializeSession: (specificSessionId?: string) => Promise<void>;
  initializeFreshSession: () => Promise<void>;
  setStep: (step: number) => void;
  setSubStep: (subStep: number) => void;
  setServices: (services: string[]) => void;
  setAddress: (address: string, postalCode: string, insideServiceArea: boolean) => void;
  setBudget: (serviceId: string, amount: number) => void;
  setServiceDetails: (serviceId: string, details: any) => void;
  setProjectScope: (scope: string) => void;
  setStartDeadline: (serviceId: string, startDate: string, deadline?: string) => void;
  setPreviousProvider: (info: string) => void;
  setPreviousQuotes: (hasQuotes: boolean) => void;
  setPriceVsLongTerm: (preference: 'price' | 'long-term') => void;
  setSiteChallenges: (challenges: string) => void;
  setProjectSuccessCriteria: (criteria: string) => void;
  setNotes: (notes: string) => void;
  setMeetingDetails: (staffMember: string, date: string, startTime: string, endTime: string) => void;
  setPersonalInfo: (info: Partial<FormState['personalInfo']>) => void;
  requestUploadLink: () => Promise<string | null>;
  submitForm: () => Promise<boolean>;
  submitAgentForm: () => Promise<boolean>;
  setMeetingBooked: (booked: boolean) => void;
  setEmbedData: (embedData: FormState['embedData']) => void;
  resetForm: () => void;
  clearErrors: () => void;
  wipeBrowserData: () => void;
}

const initialState: FormState = {
  sessionId: null,
  step: 0,
  currentSubStep: 0,
  services: [],
  formPath: null,
  address: '',
  postalCode: '',
  insideServiceArea: false,
  budgets: {},
  serviceDetails: {},
  projectScope: '',
  startDeadlines: {},
  previousProvider: '',
  previousQuotes: undefined,
  priceVsLongTerm: undefined,
  siteChallenges: '',
  projectSuccessCriteria: '',
  notes: '',
  meetingScheduled: false,
  meetingStaffMember: '',
  meetingDate: '',
  meetingStartTime: '',
  meetingEndTime: '',
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    textUploadLink: false,
    referralSource: undefined,
    uploadedImages: []
  },
  uploadLinkGenerated: false,
  formSubmitted: false,
  meetingBooked: false,
  isSubmitting: false,
  submissionError: null,
  errors: {},
  touched: {},
  isAgentForm: false
};

// Helper function to convert FormState to Supabase format
const convertToSupabaseFormat = (state: FormState): Partial<FormSession> => ({
  first_name: state.personalInfo.firstName || undefined,
  last_name: state.personalInfo.lastName || undefined,
  email: state.personalInfo.email || undefined,
  phone: state.personalInfo.phone || undefined,
  address: state.address || undefined,
  postal_code: state.postalCode || undefined,
  inside_service_area: state.insideServiceArea,
  services: state.services.length > 0 ? state.services : undefined,
  service_details: Object.keys(state.serviceDetails).length > 0 ? state.serviceDetails : undefined,
  budgets: Object.keys(state.budgets).length > 0 ? state.budgets : undefined,
  project_vision: state.projectScope || undefined,
  success_criteria: state.projectSuccessCriteria || undefined,
  referral_source: state.personalInfo.referralSource || undefined,
  previous_quotes: state.previousQuotes,
  price_vs_long_term: state.priceVsLongTerm || undefined,
  previous_provider: state.previousProvider || undefined,
  site_challenges: state.siteChallenges || undefined,
  notes: state.notes || undefined,
  meeting_scheduled: state.meetingScheduled || false,
  meeting_provider: state.meetingStaffMember || undefined,
  meeting_date: state.meetingDate || undefined,
  meeting_start_time: state.meetingStartTime || undefined,
  meeting_end_time: state.meetingEndTime || undefined,
  start_deadlines: Object.keys(state.startDeadlines).length > 0 ? state.startDeadlines : undefined,
  photo_urls: state.personalInfo.uploadedImages.length > 0 ? state.personalInfo.uploadedImages : undefined,
  photos_uploaded: state.personalInfo.uploadedImages.length > 0,
  initial_form_completed: state.formSubmitted
});

// Helper function to convert Supabase format to FormState
const convertFromSupabaseFormat = (session: FormSession): FormState => ({
  sessionId: session.id,
  step: 0,
  currentSubStep: 0,
  services: session.services || [],
  formPath: determineFormPath(session.services || []),
  address: session.address || '',
  postalCode: session.postal_code || '',
  insideServiceArea: session.inside_service_area || false,
  budgets: session.budgets || {},
  serviceDetails: session.service_details || {},
  projectScope: session.project_vision || '',
  startDeadlines: session.start_deadlines || {},
  previousProvider: session.previous_provider || '',
  previousQuotes: session.previous_quotes,
  priceVsLongTerm: session.price_vs_long_term as 'price' | 'long-term' | undefined,
  siteChallenges: session.site_challenges || '',
  projectSuccessCriteria: session.success_criteria || '',
  notes: session.notes || '',
  meetingScheduled: session.meeting_scheduled || false,
  meetingStaffMember: session.meeting_provider || '',
  meetingDate: session.meeting_date || '',
  meetingStartTime: session.meeting_start_time || '',
  meetingEndTime: session.meeting_end_time || '',
  personalInfo: {
    firstName: session.first_name || '',
    lastName: session.last_name || '',
    email: session.email || '',
    phone: session.phone || '',
    textUploadLink: false,
    referralSource: session.referral_source,
    uploadedImages: session.photo_urls || []
  },
  uploadLinkGenerated: false,
  formSubmitted: session.initial_form_completed || false,
  meetingBooked: session.meeting_scheduled || false,
  embedData: undefined,
  isSubmitting: false,
  submissionError: null,
  errors: {},
  touched: {}
});

// Auto-save function with debouncing (disabled for agent forms)
let saveTimeout: NodeJS.Timeout | null = null;
const autoSave = async (sessionId: string, state: FormState) => {
  // Skip auto-save for agent forms
  if (state.isAgentForm) {
    console.log('🚫 Auto-save skipped for agent form');
    return;
  }
  
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(async () => {
    try {
      const supabaseData = convertToSupabaseFormat(state);
      await updateSession(sessionId, supabaseData);
      console.log('✅ Auto-saved to Supabase');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, 1000); // 1 second debounce
};

export const useFormStore = create<FormStore>((set, get) => ({
  state: initialState,
  
  initializeSession: async (specificSessionId?: string) => {
    try {
      console.log('🔄 Initializing session...', { specificSessionId });
      
      // If a specific session ID is provided (from URL), prioritize it
      if (specificSessionId) {
        console.log('🔍 Loading specific session:', specificSessionId);
        const session = await getSession(specificSessionId);
        if (session) {
          console.log('✅ Session found:', session.id);
          const formState = convertFromSupabaseFormat(session);
          localStorage.setItem('currentSessionId', session.id);
          set({ state: formState });
          return;
        } else {
          console.error('❌ Session not found:', specificSessionId);
          // Instead of throwing an error, create a new session with the specific ID
          // This handles cases where the URL has a session ID but it doesn't exist in DB
          throw new Error(`Session ${specificSessionId} not found`);
        }
      }
      
      // Check localStorage for existing session (only if no specific session requested)
      const cachedSessionId = localStorage.getItem('currentSessionId');
      if (cachedSessionId) {
        console.log('🔍 Checking cached session:', cachedSessionId);
        const session = await getSession(cachedSessionId);
        if (session) {
          console.log('✅ Cached session found:', session.id);
          const formState = convertFromSupabaseFormat(session);
          set({ state: formState });
          return;
        } else {
          console.log('🗑️ Cached session not found, clearing localStorage');
          localStorage.removeItem('currentSessionId');
        }
      }
      
      // Create new session if no existing session found
      console.log('🆕 Creating new session...');
      
      const session = await createSession({
        form_source: 'website'
      });
      
      console.log('✅ New session created:', session.id);
      localStorage.setItem('currentSessionId', session.id);
      
      set({ 
        state: { 
          ...initialState, 
          sessionId: session.id 
        } 
      });
    } catch (error) {
      console.error('❌ Failed to initialize session:', error);
      
      if (specificSessionId) {
        // If a specific session was requested but failed, re-throw the error
        throw error;
      }
      
      // Fallback to local state only for general initialization
      console.log('🔄 Falling back to local session...');
      const newSessionId = generateSessionId();
      set({ 
        state: { 
        ...initialState,
          sessionId: newSessionId 
        } 
      });
    }
  },

  initializeFreshSession: async () => {
    try {
      // Create a fresh session in the database for agent form
      const session = await createSession({
        form_source: 'agent'
      });
      
      const newState = {
        ...initialState,
        sessionId: session.id,
        isSubmitting: false,
        submissionError: null,
        isAgentForm: true // Mark as agent form to disable caching
      };
      
      // Clear any cached session data
      localStorage.removeItem('currentSessionId');
      console.log('🆕 Fresh agent form session created in database:', session.id);
      set({ state: newState });
    } catch (error) {
      console.error('Failed to create agent form session:', error);
      // Fallback to local session if database fails
      const newSessionId = generateSessionId();
      const newState = {
        ...initialState,
        sessionId: newSessionId,
        isSubmitting: false,
        submissionError: null,
        isAgentForm: true
      };
      
      localStorage.removeItem('currentSessionId');
      console.log('🆕 Fresh agent form session created locally:', newSessionId);
      set({ state: newState });
    }
  },

  setStep: (step) => {
    set(state => {
      const newState = {
        ...state.state,
        step,
        currentSubStep: 0,
        errors: {}
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setServices: (services) => {
    set(state => {
      const newState = {
        ...state.state,
        services,
        formPath: determineFormPath(services),
        errors: {
          ...state.state.errors
        }
      };
      delete newState.errors.services;
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  submitForm: async () => {
    const { state } = get();
    
    // Prevent multiple submissions
    if (state.formSubmitted || state.isSubmitting) {
      console.log('Form already submitted or submitting, skipping...');
      return true;
    }
    
    console.log('Starting form submission...');
    
    // Set submitting state
    set(currentState => {
      const newState = {
        ...currentState.state,
        isSubmitting: true,
        submissionError: null
      };
      return { state: newState };
    });
    
    try {
      // Create form data for tracking
      const formData = {
        formId: 'vl-landscape-form',
        sessionId: state.sessionId,
        firstName: state.personalInfo.firstName,
        lastName: state.personalInfo.lastName,
        email: state.personalInfo.email,
        phone: state.personalInfo.phone,
        address: state.address,
        postalCode: state.postalCode,
        services: state.services.join(', '),
        referralSource: state.personalInfo.referralSource,
        timestamp: new Date().toISOString(),
        // Include embed tracking data
        sourceUrl: state.embedData?.sourceUrl || window.location.href,
        referrer: state.embedData?.referrer || document.referrer,
        urlParams: state.embedData?.urlParams || window.location.search
      };

      // Dispatch custom event for tracking tools
      window.dispatchEvent(new CustomEvent('vl-form-submitted', {
        detail: formData,
        bubbles: true,
        cancelable: false
      }));

      // Create and submit hidden form for WhatConverts
      const hiddenForm = document.createElement('form');
      hiddenForm.id = 'vl-tracking-form';
      hiddenForm.style.display = 'none';
      hiddenForm.method = 'POST';
      hiddenForm.action = '#';

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value || '');
        hiddenForm.appendChild(input);
      });

      // Append to body temporarily
      document.body.appendChild(hiddenForm);

      // Trigger form submit event for tracking tools
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
      });
      hiddenForm.dispatchEvent(submitEvent);

      // Remove the form after a brief delay
      setTimeout(() => {
        document.body.removeChild(hiddenForm);
      }, 100);

      // Mark as submitted and save to Supabase
        const newState = {
        ...state,
          formSubmitted: true,
          isSubmitting: false,
        submissionError: null
      };
      
      if (newState.sessionId) {
        // Update the database to mark form as completed
        const supabaseData = convertToSupabaseFormat(newState);
        const { error } = await supabase
          .from('form_sessions')
          .update({
            ...supabaseData,
            initial_form_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', newState.sessionId);
          
        if (error) {
          console.error('Error updating form completion status:', error);
          throw error;
        }
        
        console.log('Form marked as completed in database');
      }
      
      set(currentState => ({ state: newState }));
      
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Mark submission error but don't prevent navigation
      set(currentState => {
        const newState = {
          ...currentState.state,
          formSubmitted: true,
          isSubmitting: false,
          submissionError: 'Failed to submit form'
        };
        
        return { state: newState };
      });
      
      return false;
    }
  },

  submitAgentForm: async () => {
    const { state } = get();
    
    console.log('🚀 Starting agent form submission via edge function...');
    console.log('📅 Meeting data from form store:', {
      meetingScheduled: state.meetingScheduled,
      meetingStaffMember: state.meetingStaffMember,
      meetingDate: state.meetingDate,
      meetingStartTime: state.meetingStartTime,
      meetingEndTime: state.meetingEndTime
    });
    
    // Prevent multiple submissions
    if (state.isSubmitting) {
      console.log('⚠️ Already submitting, skipping...');
      return false;
    }
    
    // Set submitting state
    set(currentState => ({
      state: {
        ...currentState.state,
        isSubmitting: true,
        submissionError: null
      }
    }));
    
    try {
      // Validate required fields client-side
      const errors: string[] = [];
      if (!state.personalInfo.firstName?.trim()) errors.push('First name is required');
      if (!state.personalInfo.email?.trim()) errors.push('Email is required');
      if (!state.personalInfo.phone?.trim()) errors.push('Phone is required');
      if (!state.address?.trim()) errors.push('Address is required');
      
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      
      if (!state.sessionId) {
        throw new Error('No session ID available');
      }
      
      console.log('✅ Client validation passed, sending to edge function...');
      
      // Send all form data to edge function (meeting data is already in state)
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-agent-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          session_id: state.sessionId,
          form_data: {
            personalInfo: state.personalInfo,
            address: state.address,
            postalCode: state.postalCode,
            services: state.services,
            budgets: state.budgets,
            notes: state.notes,
            meetingScheduled: state.meetingScheduled,
            meetingStaffMember: state.meetingStaffMember,
            meetingDate: state.meetingDate,
            meetingStartTime: state.meetingStartTime,
            meetingEndTime: state.meetingEndTime
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ Edge function response:', responseData);

      // Create WhatConverts tracking event
      try {
        const totalBudget = Object.values(state.budgets).reduce((sum, budget) => sum + (budget || 0), 0);
        
        const trackingData = {
          formId: 'vl-agent-form',
          sessionId: state.sessionId,
          firstName: state.personalInfo.firstName,
          lastName: state.personalInfo.lastName || '',
          email: state.personalInfo.email,
          phone: state.personalInfo.phone,
          address: state.address,
          services: state.services.join(', '),
          totalBudget: totalBudget,
          timestamp: new Date().toISOString()
        };
        
        // Dispatch custom event for WhatConverts
        window.dispatchEvent(new CustomEvent('vl-agent-form-submitted', {
          detail: trackingData,
          bubbles: true,
          cancelable: false
        }));
        
        // Create hidden form for WhatConverts tracking
        const hiddenForm = document.createElement('form');
        hiddenForm.id = 'vl-agent-tracking-form';
        hiddenForm.style.display = 'none';
        hiddenForm.method = 'POST';
        hiddenForm.action = '#';
        
        Object.entries(trackingData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value || '');
          hiddenForm.appendChild(input);
        });
        
        document.body.appendChild(hiddenForm);
        
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        hiddenForm.dispatchEvent(submitEvent);
        
        setTimeout(() => {
          if (document.body.contains(hiddenForm)) {
            document.body.removeChild(hiddenForm);
          }
        }, 100);
        
        console.log('✅ WhatConverts tracking event created');
      } catch (trackingError) {
        console.error('⚠️ Tracking error:', trackingError);
        // Don't fail submission if tracking fails
      }
      
      console.log('🎉 Agent form submission completed successfully!');
      
      // Update form state to submitted
      set(currentState => ({
        state: {
          ...currentState.state,
          formSubmitted: true,
          isSubmitting: false,
          submissionError: null
        }
      }));
      
      return true;
      
    } catch (error) {
      console.error('💥 Agent form submission failed:', error);
      
      // Update error state
      set(currentState => ({
        state: {
          ...currentState.state,
          isSubmitting: false,
          submissionError: error instanceof Error ? error.message : 'Submission failed'
        }
      }));
      
      return false;
    }
  },

  setSubStep: (subStep) => {
    set(state => ({
      state: {
        ...state.state,
        currentSubStep: subStep,
        errors: {}
      }
    }));
  },

  setAddress: (address, postalCode, insideServiceArea) => {
    set(state => {
      const newState = {
        ...state.state,
        address,
        postalCode,
        insideServiceArea,
        errors: {
          ...state.state.errors
        }
      };
      delete newState.errors.address;
      delete newState.errors.postalCode;
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setBudget: (serviceId, amount) => {
    set(state => {
      const newState = {
        ...state.state,
        budgets: {
          ...state.state.budgets,
          [serviceId]: amount
        }
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setServiceDetails: (serviceId, details) => {
    set(state => {
      const newState = {
        ...state.state,
        serviceDetails: {
          ...state.state.serviceDetails,
          [serviceId]: details
        }
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setProjectScope: (scope) => {
    set(state => {
      const newState = {
        ...state.state,
        projectScope: scope
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setStartDeadline: (serviceId, startDate, deadline) => {
    set(state => {
      const newState = {
        ...state.state,
        startDeadlines: {
          ...state.state.startDeadlines,
          [serviceId]: { startDate, deadline }
        }
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setPreviousProvider: (info) => {
    set(state => {
      const newState = {
        ...state.state,
        previousProvider: info
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setPreviousQuotes: (hasQuotes) => {
    set(state => {
      const newState = {
        ...state.state,
        previousQuotes: hasQuotes
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setPriceVsLongTerm: (preference) => {
    set(state => {
      const newState = {
        ...state.state,
        priceVsLongTerm: preference
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setSiteChallenges: (challenges) => {
    set(state => {
      const newState = {
        ...state.state,
        siteChallenges: challenges
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setProjectSuccessCriteria: (criteria) => {
    set(state => {
      const newState = {
        ...state.state,
        projectSuccessCriteria: criteria
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setNotes: (notes) => {
    set(state => {
      const newState = {
        ...state.state,
        notes: notes
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setMeetingDetails: (staffMember, date, startTime, endTime) => {
    set(state => {
      const newState = {
        ...state.state,
        meetingScheduled: true,
        meetingStaffMember: staffMember,
        meetingDate: date,
        meetingStartTime: startTime,
        meetingEndTime: endTime
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setPersonalInfo: (info) => {
    set(state => {
      const newState = {
        ...state.state,
        personalInfo: {
          ...state.state.personalInfo,
          ...info
        }
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  requestUploadLink: async () => {
    const { state } = get();
    if (!state.sessionId) return null;
    return `/upload/${state.sessionId}`;
  },

  setMeetingBooked: (booked) => {
    set(state => {
      const newState = {
        ...state.state,
        meetingBooked: booked
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  setEmbedData: (embedData) => {
    set(state => {
      const newState = {
        ...state.state,
        embedData
      };
      
      if (newState.sessionId) {
        autoSave(newState.sessionId, newState);
      }
      
      return { state: newState };
    });
  },

  resetForm: () => {
    // Clear localStorage and reset to initial state
    localStorage.removeItem('currentSessionId');
    set({ state: initialState });
  },

  clearErrors: () => {
    set(state => ({
      state: {
        ...state.state,
        errors: {},
        touched: {}
      }
    }));
  },

  wipeBrowserData: () => {
    console.log('🧹 Wiping all browser data...');
    
    // Clear all localStorage data
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Reset form store to initial state
    set({ state: initialState });
    
    // Clear any cached form data in the browser
    try {
      // Clear any form elements that might have cached data
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        if (form instanceof HTMLFormElement) {
          form.reset();
        }
      });
      
      // Clear any input elements
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          input.value = '';
        } else if (input instanceof HTMLSelectElement) {
          input.selectedIndex = 0;
        }
      });
    } catch (error) {
      console.warn('Could not clear all form elements:', error);
    }
    
    console.log('✅ Browser data wiped successfully');
  }
}));