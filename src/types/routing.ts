export type FormType = 'initial' | 'follow-up' | 'agent' | 'upload';

export interface RouteConfig {
  path: string;
  component: string;
  title: string;
  description: string;
  requiresSession?: boolean;
}

export const ROUTES: Record<FormType, RouteConfig> = {
  initial: {
    path: '/',
    component: 'InitialForm',
    title: 'Get Your Quote',
    description: 'Quick form to get started with your landscaping project'
  },
  'follow-up': {
    path: '/follow-up/:sessionId',
    component: 'FollowUpForm', 
    title: 'Complete Your Project Details',
    description: 'Provide additional details about your landscaping needs',
    requiresSession: true
  },
  agent: {
    path: '/internal',
    component: 'AgentForm',
    title: 'Lead Management Form',
    description: 'Internal form for agents to manage leads and bookings'
  },
  upload: {
    path: '/upload/:sessionId',
    component: 'UploadForm',
    title: 'Upload Property Photos',
    description: 'Upload photos to help us provide an accurate quote',
    requiresSession: true
  }
};

export interface FormStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isRequired: boolean;
  validation?: (data: any) => boolean;
}

export interface FormConfig {
  type: FormType;
  steps: FormStep[];
  showProgress: boolean;
  allowNavigation: boolean;
  autoSave: boolean;
} 