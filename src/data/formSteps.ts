import { FormStep } from '../types/form';
import ServiceSelection from '../components/ServiceSelection';
import AddressCollection from '../components/AddressCollection';
import MaintenanceForm from '../components/MaintenanceForm';
import ProjectsForm from '../components/ProjectsForm';
import BothForm from '../components/BothForm';
import OtherForm from '../components/OtherForm';
import { validateServices, validateAddress } from '../lib/validation';

export const formSteps: FormStep[] = [
  {
    id: 'service-selection',
    title: 'Service Selection',
    description: 'Select the services you\'re interested in',
    isComplete: (state) => state.services.length > 0,
    isAvailable: () => true,
    component: ServiceSelection
  },
  {
    id: 'address-collection',
    title: 'Address',
    description: 'Provide your location information',
    isComplete: (state) => !!state.address,
    isAvailable: (state) => state.services.length > 0,
    component: AddressCollection
  },
  {
    id: 'maintenance-form',
    title: 'Maintenance Details',
    description: 'Tell us about your maintenance needs',
    isComplete: () => false,
    isAvailable: (state) => 
      state.formPath === 'maintenance' && 
      state.address.length > 0,
    component: MaintenanceForm
  },
  {
    id: 'projects-form',
    title: 'Project Details',
    description: 'Tell us about your project',
    isComplete: () => false,
    isAvailable: (state) => 
      state.formPath === 'projects' && 
      state.address.length > 0,
    validate: (state) => {
      const errors = {};
      const currentStep = ProjectsForm.subSteps[state.currentSubStep];
      
      switch (state.currentSubStep) {
        case 0:
          Object.assign(errors, validateBudget(state));
          break;
        case 2:
          Object.assign(errors, validateProjectScope(state));
          break;
        case 3:
          Object.assign(errors, validateStartDeadline(state));
          break;
        case 4:
          Object.assign(errors, validatePreviousQuotes(state));
          break;
        case 5:
          Object.assign(errors, validateProjectSuccessCriteria(state));
          break;
        case 6:
          Object.assign(errors, validatePersonalInfo(state));
          break;
      }
      
      return errors;
    },
    component: ProjectsForm
  },
  {
    id: 'both-form',
    title: 'Service Details',
    description: 'Tell us about your maintenance and project needs',
    isComplete: () => false,
    isAvailable: (state) => 
      state.formPath === 'both' && 
      state.address.length > 0,
    validate: (state) => {
      const errors = {};
      const currentStep = BothForm.subSteps[state.currentSubStep];
      
      switch (state.currentSubStep) {
        case 0:
          Object.assign(errors, validateBudget(state));
          break;
        case 2:
          Object.assign(errors, validateProjectScope(state));
          break;
        case 3:
          Object.assign(errors, validateStartDeadline(state));
          break;
        case 4:
          Object.assign(errors, validatePreviousProvider(state));
          break;
        case 5:
          Object.assign(errors, validatePreviousQuotes(state));
          break;
        case 6:
          Object.assign(errors, validatePriceVsLongTerm(state));
          break;
        case 7:
          Object.assign(errors, validateSiteChallenges(state));
          break;
        case 8:
          Object.assign(errors, validateProjectSuccessCriteria(state));
          break;
        case 9:
          Object.assign(errors, validatePersonalInfo(state));
          break;
      }
      
      return errors;
    },
    component: BothForm
  },
  {
    id: 'other-form',
    title: 'Other Service',
    description: 'Tell us about your needs',
    isComplete: () => false,
    isAvailable: (state) => 
      state.formPath === 'other' && 
      state.address.length > 0,
    validate: (state) => {
      const errors = {};
      const currentStep = OtherForm.subSteps[state.currentSubStep];
      
      switch (state.currentSubStep) {
        case 0:
          Object.assign(errors, validateBudget(state));
          break;
        case 1:
          Object.assign(errors, validateProjectScope(state));
          break;
        case 2:
          Object.assign(errors, validateStartDeadline(state));
          break;
        case 3:
          Object.assign(errors, validatePersonalInfo(state));
          break;
      }
      
      return errors;
    },
    component: OtherForm
  }
];