import React from 'react';
import { useFormStore } from '../store/formStore';
import BudgetSection from './BudgetSection';
import ServiceDetailsSection from './ServiceDetailsSection';
import ProjectScope from './ProjectScope';
import StartDeadlineSection from './StartDeadlineSection';
import PreviousQuotes from './PreviousQuotes';
import ProjectSuccessCriteria from './ProjectSuccessCriteria';
import PersonalInformation from './PersonalInformation';
import CalendlyBooking from './CalendlyBooking';

const subSteps = [
  { 
    title: 'What is your budget?', 
    description: 'Help us understand your investment range',
    component: BudgetSection 
  },
  { 
    title: 'What would you like to include in your project?', 
    description: 'Select the features you\'re interested in',
    component: ServiceDetailsSection 
  },
  { 
    title: 'What is your vision for this project?', 
    description: 'Describe what you\'d like to achieve',
    component: ProjectScope 
  },
  { 
    title: 'When would you like to start?', 
    description: 'Let us know your preferred timeline',
    component: StartDeadlineSection 
  },
  { 
    title: 'Have you received other quotes?', 
    description: 'Tell us about other proposals you\'ve received',
    component: PreviousQuotes 
  },
  { 
    title: 'What would make this project successful?', 
    description: 'Help us understand your goals',
    component: ProjectSuccessCriteria 
  },
  { 
    title: 'How can we contact you?', 
    description: 'Share your contact information',
    component: PersonalInformation 
  },
  { 
    title: 'Schedule a Consultation', 
    description: 'Choose a time to discuss your project',
    component: CalendlyBooking 
  }
];

interface ProjectsFormProps {
  onValidationChange?: (isValid: boolean) => void;
}

const ProjectsForm: React.FC<ProjectsFormProps> = ({ onValidationChange }) => {
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

ProjectsForm.subSteps = subSteps;

export default ProjectsForm;