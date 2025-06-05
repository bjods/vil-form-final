import React from 'react';
import { useFormStore } from '../store/formStore';
import BudgetSection from './BudgetSection';
import ServiceDetailsSection from './ServiceDetailsSection';
import StartDeadlineSection from './StartDeadlineSection';
import PreviousProvider from './PreviousProvider';
import PriceVsLongTerm from './PriceVsLongTerm';
import SiteChallenges from './SiteChallenges';
import PersonalInformation from './PersonalInformation';
import CalendlyBooking from './CalendlyBooking';

const subSteps = [
  { 
    title: 'What is your budget?', 
    description: 'Help us understand your budget expectations',
    component: BudgetSection 
  },
  { 
    title: 'What services do you need?', 
    description: 'Select the specific services you\'re interested in',
    component: ServiceDetailsSection 
  },
  { 
    title: 'When would you like to start?', 
    description: 'Let us know your preferred timeline',
    component: StartDeadlineSection 
  },
  { 
    title: 'Have you worked with a maintenance provider before?', 
    description: 'Tell us about your previous experience',
    component: PreviousProvider 
  },
  { 
    title: 'What matters most to you?', 
    description: 'Help us understand your priorities',
    component: PriceVsLongTerm 
  },
  { 
    title: 'Are there any site challenges we should know about?', 
    description: 'Tell us about any specific property considerations',
    component: SiteChallenges 
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

interface MaintenanceFormProps {
  onValidationChange?: (isValid: boolean) => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ onValidationChange }) => {
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

MaintenanceForm.subSteps = subSteps;

export default MaintenanceForm;