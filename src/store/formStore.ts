import { create } from 'zustand';
import { FormState } from '../types/form';
import { determineFormPath, generateSessionId, saveFormState, loadFormState, submitToZapier } from '../lib/utils';

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
  submitForm: () => Promise<void>;
  setMeetingBooked: (booked: boolean) => void;
  resetForm: () => void;
  clearErrors: () => void;
}

const initialState: FormState = {
  sessionId: generateSessionId(),
  step: 0,
  currentSubStep: 0,
  services: [],
  formPath: null,
  address: '',
  postalCode: '',
  insideServiceArea: null,
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
  errors: {},
  touched: {}
};

export const useFormStore = create<FormStore>((set, get) => ({
  state: initialState,
  
  initializeSession: async () => {
    const savedState = loadFormState();
    if (savedState) {
      set({ state: { ...savedState, sessionId: savedState.sessionId || generateSessionId() } });
    } else {
      const newState = {
        ...initialState,
        sessionId: generateSessionId()
      };
      set({ state: newState });
      saveFormState(newState);
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
      saveFormState(newState);
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
          ...state.state.errors,
          services: undefined
        }
      };
      saveFormState(newState);
      return { state: newState };
    });
  },

  submitForm: async () => {
    const { state } = get();
    console.log('Attempting to submit form with data:', state);
    
    try {
      const success = await submitToZapier(state);
      console.log('Submission result:', success);
      
      // Always mark as submitted regardless of webhook success
      if (success) {
        set(state => {
          const newState = {
            ...state.state,
            formSubmitted: true
          };
          saveFormState(newState);
          return { state: newState };
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to submit form:', error);
      
      // Still mark as submitted even if there's an error
      set(state => {
        const newState = {
          ...state.state,
          formSubmitted: true
        };
        saveFormState(newState);
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
          ...state.state.errors,
          address: undefined,
          postalCode: undefined
        }
      };
      saveFormState(newState);
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
      saveFormState(newState);
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
      saveFormState(newState);
      return { state: newState };
    });
  },

  setProjectScope: (scope) => {
    set(state => {
      const newState = {
        ...state.state,
        projectScope: scope
      };
      saveFormState(newState);
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
      saveFormState(newState);
      return { state: newState };
    });
  },

  setPreviousProvider: (info) => {
    set(state => {
      const newState = {
        ...state.state,
        previousProvider: info
      };
      saveFormState(newState);
      return { state: newState };
    });
  },

  setPreviousQuotes: (hasQuotes) => {
    set(state => {
      const newState = {
        ...state.state,
        previousQuotes: hasQuotes
      };
      saveFormState(newState);
      return { state: newState };
    });
  },

  setPriceVsLongTerm: (preference) => {
    set(state => {
      const newState = {
        ...state.state,
        priceVsLongTerm: preference
      };
      saveFormState(newState);
      return { state: newState };
    });
  },

  setSiteChallenges: (challenges) => {
    set(state => {
      const newState = {
        ...state.state,
        siteChallenges: challenges
      };
      saveFormState(newState);
      return { state: newState };
    });
  },

  setProjectSuccessCriteria: (criteria) => {
    set(state => {
      const newState = {
        ...state.state,
        projectSuccessCriteria: criteria
      };
      saveFormState(newState);
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
      saveFormState(newState);
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
      saveFormState(newState);
      return { state: newState };
    });
  },

  resetForm: () => {
    const newState = {
      ...initialState,
      sessionId: generateSessionId()
    };
    set({ state: newState });
    saveFormState(newState);
  }
}));