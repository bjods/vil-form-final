export type ServiceCategory = 'maintenance' | 'projects' | 'both' | 'other';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  icon: string;
  options?: Record<string, any>;
}

export interface FormSession {
  id: string;
  status: 'in_progress' | 'abandoned' | 'completed' | 'meeting_booked';
  selected_services: string[] | null;
  inside_service_area: boolean | null;
  personal_information: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    preferred_contact_method?: string;
    text_upload_link?: boolean;
    referral_source?: string;
  } | null;
  responses: {
    question: string;
    response: any;
    service?: string;
  }[] | null;
  upload_link_requested: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export type ValidationResult = Record<string, string>;

export interface FormState {
  sessionId: string | null;
  step: number;
  currentSubStep: number;
  services: string[];
  address: string;
  postalCode: string;
  insideServiceArea: boolean;
  formPath: ServiceCategory | null;
  budgets: Record<string, number>;
  serviceDetails: Record<string, any>;
  projectScope: string;
  startDeadlines: Record<string, { startDate: string; deadline?: string }>;
  previousProvider?: string;
  previousQuotes?: boolean;
  priceVsLongTerm?: 'price' | 'long-term';
  siteChallenges?: string;
  projectSuccessCriteria?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    textUploadLink: boolean;
    referralSource?: string;
    uploadedImages: string[];
  };
  uploadLinkGenerated: boolean;
  formSubmitted: boolean;
  meetingBooked: boolean;
  isSubmitting: boolean;
  submissionError: string | null;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface FormSubmissionPayload {
  session_id: string | null;
  selected_services: string[];
  personal_information: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
  };
  form_path: ServiceCategory | null;
  budgets: Record<string, number>;
  service_details: Record<string, any>;
  project_scope: string;
  start_deadlines: Record<string, { startDate: string; deadline?: string }>;
  previous_provider?: string;
  previous_quotes?: boolean;
  price_vs_long_term?: 'price' | 'long-term';
  site_challenges?: string;
  project_success_criteria?: string;
  uploaded_images: string[];
  inside_service_area: boolean;
  upload_link: string | null;
  text_upload_link_requested: boolean;
  submitted_at: string;
}

export interface FileUploadPayload {
  session_id: string;
  uploaded_images: string[];
  submitted_at: string;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  isComplete: (state: FormState) => boolean;
  isAvailable: (state: FormState) => boolean;
  validate: (state: FormState) => ValidationResult;
  component: React.ComponentType & {
    subSteps?: Array<{
      title: string;
      description?: string;
      component: React.ComponentType;
    }>;
  };
}