import { create } from 'zustand';
import { FormState } from '../types/form';
import { determineFormPath, generateSessionId, submitToZapier } from '../lib/utils';
import { createSession, updateSession, getSession, FormSession } from '../lib/supabase';

interface FormStore {
  state: FormState;
  initializeSession: () => Promise<void>;
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
  setPersonalInfo: (info: Partial<FormState['personalInfo']>) => void;
  requestUploadLink: () => Promise<string | null>;
  submitForm: () => Promise<boolean>;
  setMeetingBooked: (booked: boolean) => void;
  resetForm: () => void;
  clearErrors: () => void;
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
  touched: {}
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
  previous_provider: state.previousProvider ? true : undefined,
  site_challenges: state.siteChallenges || undefined,
  start_deadlines: Object.keys(state.startDeadlines).length > 0 ? state.startDeadlines : undefined,
  upload_link_requested: state.personalInfo.textUploadLink,
  photo_urls: state.personalInfo.uploadedImages.length > 0 ? state.personalInfo.uploadedImages : undefined,
  meeting_scheduled: state.meetingBooked,
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
  previousProvider: session.previous_provider ? 'yes' : '',
  previousQuotes: session.previous_quotes,
  priceVsLongTerm: session.price_vs_long_term as 'price' | 'long-term' | undefined,
  siteChallenges: session.site_challenges || '',
  projectSuccessCriteria: session.success_criteria || '',
  personalInfo: {
    firstName: session.first_name || '',
    lastName: session.last_name || '',
    email: session.email || '',
    phone: session.phone || '',
    textUploadLink: session.upload_link_requested || false,
    referralSource: session.referral_source,
    uploadedImages: session.photo_urls || []
  },
  uploadLinkGenerated: false,
  formSubmitted: session.initial_form_completed || false,
  meetingBooked: session.meeting_scheduled || false,
  isSubmitting: false,
  submissionError: null,
  errors: {},
  touched: {}
});

// Auto-save function with debouncing
let saveTimeout: NodeJS.Timeout | null = null;
const autoSave = async (sessionId: string, state: FormState) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(async () => {
    try {
      await updateSession(sessionId, convertToSupabaseFormat(state));
      console.log('✅ Auto-saved to Supabase');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, 1000); // 1 second debounce
};

export const useFormStore = create<FormStore>((set, get) => ({
  state: initialState,
  
  initializeSession: async () => {
    try {
      // Check for existing session ID in localStorage
      const savedSessionId = localStorage.getItem('currentSessionId');
      
      if (savedSessionId) {
        // Try to load existing session
        const session = await getSession(savedSessionId);
        if (session) {
          const formState = convertFromSupabaseFormat(session);
          set({ state: formState });
          return;
        }
      }
      
      // Create new session
      const newSessionId = generateSessionId();
      const session = await createSession({
        form_source: 'website'
      });
      
      localStorage.setItem('currentSessionId', session.id);
      
      set({ 
        state: { 
          ...initialState, 
          sessionId: session.id 
        } 
      });
    } catch (error) {
      console.error('Failed to initialize session:', error);
      // Fallback to local state
      const newSessionId = generateSessionId();
      set({ 
        state: { 
          ...initialState, 
          sessionId: newSessionId 
        } 
      });
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
      const success = await submitToZapier(state);
      console.log('Submission completed:', success);
      
      // Mark as submitted and save to Supabase
      set(currentState => {
        const newState = {
          ...currentState.state,
          formSubmitted: true,
          isSubmitting: false,
          submissionError: success ? null : 'Failed to submit form'
        };
        
        if (newState.sessionId) {
          autoSave(newState.sessionId, newState);
        }
        
        return { state: newState };
      });
      
      return success;
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
        
        if (newState.sessionId) {
          autoSave(newState.sessionId, newState);
        }
        
        return { state: newState };
      });
      
      return false;
    }
  },
  
  clearErrors: () => {
    set(state => ({
      state: {
        ...state.state,
        errors: {}
      }
    }));
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

  resetForm: () => {
    const newSessionId = generateSessionId();
    const newState = {
      ...initialState,
      sessionId: newSessionId,
      isSubmitting: false,
      submissionError: null
    };
    
    localStorage.removeItem('currentSessionId');
    set({ state: newState });
  }
}));