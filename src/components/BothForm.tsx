import React from 'react';
import { useFormStore } from '../store/formStore';
import BudgetSection from './BudgetSection';
import ServiceDetailsSection from './ServiceDetailsSection';
import ProjectScope from './ProjectScope';
import StartDeadlineSection from './StartDeadlineSection';
import PreviousProvider from './PreviousProvider';
import PreviousQuotes from './PreviousQuotes';
import PriceVsLongTerm from './PriceVsLongTerm';
import SiteChallenges from './SiteChallenges';
import ProjectSuccessCriteria from './ProjectSuccessCriteria';
import PersonalInformation from './PersonalInformation';
import CalendlyBooking from './CalendlyBooking';
import { getServiceById } from '../data/services';

export const getServiceSpecificTitle = (title: string, services: string[], questionType: 'maintenance' | 'project' | 'both' | null) => {
  if (!questionType) return title;

  const maintenanceServices = services
    .filter(id => ['lawn-maintenance', 'snow-management'].includes(id))
    .map(id => getServiceById(id)?.name)
    .filter(Boolean);

  const projectServices = services
    .filter(id => ['landscape-design-build', 'landscape-enhancement'].includes(id))
    .map(id => getServiceById(id)?.name)
    .filter(Boolean);

  switch (questionType) {
    case 'maintenance':
      return `${title} (for ${maintenanceServices.join(' & ')})`;
    case 'project':
      return `${title} (for ${projectServices.join(' & ')})`;
    case 'both':
      return title;
    default:
      return title;
  }
};

const subSteps = [
  { 
    title: 'Budget',
    description: 'Help us understand your investment range for each service',
    component: BudgetSection,
    type: 'both'
  },
  { 
    title: 'Service Details',
    description: 'Select the specific features and options for each service',
    component: ServiceDetailsSection,
    type: 'both'
  },
  { 
    title: 'Project Vision',
    description: 'Tell us about your landscape project goals',
    component: ProjectScope,
    type: 'project'
  },
  { 
    title: 'Timeline',
    description: 'When would you like each service to begin?',
    component: StartDeadlineSection,
    type: 'both'
  },
  { 
    title: 'Previous Maintenance Provider',
    description: 'Tell us about your experience with previous providers',
    component: PreviousProvider,
    type: 'maintenance'
  },
  { 
    title: 'Previous Project Quotes',
    description: 'Have you received other quotes for your project?',
    component: PreviousQuotes,
    type: 'project'
  },
  { 
    title: 'Service Preference',
    description: 'Help us understand your maintenance service priorities',
    component: PriceVsLongTerm,
    type: 'maintenance'
  },
  { 
    title: 'Site Challenges',
    description: 'Tell us about any property-specific considerations',
    component: SiteChallenges,
    type: 'both'
  },
  { 
    title: 'Project Success Criteria',
    description: 'What would make your landscape project successful?',
    component: ProjectSuccessCriteria,
    type: 'project'
  },
  { 
    title: 'Contact Information',
    description: 'How can we reach you?',
    component: PersonalInformation,
    type: null
  },
  { 
    title: 'Schedule Consultation',
    description: 'Choose a time to discuss your needs',
    component: CalendlyBooking,
    type: null
  }
];

interface BothFormProps {
  onValidationChange?: (isValid: boolean) => void;
}

const BothForm: React.FC<BothFormProps> = ({ onValidationChange }) => {
  const { state } = useFormStore();
  
  const currentStep = subSteps[state.currentSubStep];
  
  if (!currentStep) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <currentStep.component onValidationChange={onValidationChange} />
      </div>
    </div>
  );
};

BothForm.subSteps = subSteps;

export default BothForm;