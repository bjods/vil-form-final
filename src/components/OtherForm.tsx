import React from 'react';
import { useFormStore } from '../store/formStore';
import BudgetSection from './BudgetSection';
import ProjectScope from './ProjectScope';
import StartDeadlineSection from './StartDeadlineSection';
import PersonalInformation from './PersonalInformation';
import CalendlyBooking from './CalendlyBooking';

const subSteps = [
  { 
    title: 'What is your budget?', 
    description: 'Help us understand your investment range',
    component: BudgetSection 
  },
  { 
    title: 'What service are you looking for?', 
    description: 'Describe what you need',
    component: ProjectScope 
  },
  { 
    title: 'When would you like to start?', 
    description: 'Let us know your preferred timeline',
    component: StartDeadlineSection 
  },
  { 
    title: 'How can we contact you?', 
    description: 'Share your contact information',
    component: PersonalInformation 
  },
  { 
    title: 'Schedule a Consultation', 
    description: 'Choose a time to discuss your needs',
    component: CalendlyBooking 
  }
];

interface OtherFormProps {
  onValidationChange?: (isValid: boolean) => void;
}

const OtherForm: React.FC<OtherFormProps> = ({ onValidationChange }) => {
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

OtherForm.subSteps = subSteps;

export default OtherForm;