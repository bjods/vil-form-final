import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useFormStore } from './store/formStore';
import { FormState } from './types/form';
import FormCard from './components/FormCard';
import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ServiceSelection from './components/ServiceSelection';
import AddressCollection from './components/AddressCollection';
import MaintenanceForm from './components/MaintenanceForm';
import ProjectsForm from './components/ProjectsForm';
import BothForm from './components/BothForm';
import OtherForm from './components/OtherForm';
import OutOfServiceArea from './components/OutOfServiceArea';
import StartPage from './components/StartPage';
import ThankYou from './components/ThankYou';
import SubmissionLoading from './components/SubmissionLoading';
import UploadPage from './components/UploadPage';
import UploadComplete from './components/UploadComplete';
import { formSteps } from './data/formSteps';
import { getServiceSpecificTitle } from './components/BothForm';
import './index.css';

interface FormFlowProps {
  state: FormState;
  isStarted: boolean;
  isCurrentStepValid: boolean;
  setIsStarted: (started: boolean) => void;
  setIsCurrentStepValid: (valid: boolean) => void;
  handleBackToStart: () => void;
}

const FormFlow: React.FC<FormFlowProps> = ({
  state,
  isStarted,
  isCurrentStepValid,
  setIsStarted,
  setIsCurrentStepValid,
  handleBackToStart
}) => {
  const { setStep, setSubStep } = useFormStore();
  
  const handleValidationChange = (isValid: boolean) => {
    console.log('FormFlow received validation change:', isValid);
    setIsCurrentStepValid(isValid);
  };
  
  // Determine which component to render based on the current step
  let StepComponent: React.ComponentType<any> | null = null;
  let currentSubSteps: any[] | undefined;
  
  if (state.step === 0) {
    StepComponent = ServiceSelection;
  } else if (state.step === 1) {
    StepComponent = AddressCollection;
  } else if (!state.insideServiceArea && state.formPath === 'maintenance') {
    StepComponent = OutOfServiceArea;
  } else {
    switch (state.formPath) {
      case 'maintenance':
        StepComponent = MaintenanceForm;
        currentSubSteps = (MaintenanceForm as any).subSteps;
        break;
      case 'projects':
        StepComponent = ProjectsForm;
        currentSubSteps = (ProjectsForm as any).subSteps;
        break;
      case 'both':
        StepComponent = BothForm;
        currentSubSteps = (BothForm as any).subSteps;
        break;
      case 'other':
        StepComponent = OtherForm;
        currentSubSteps = (OtherForm as any).subSteps;
        break;
      default:
        StepComponent = null;
    }
  }
  
  const handleNext = () => {
    if (state.step === 2 && currentSubSteps) {
      if (state.currentSubStep < currentSubSteps.length - 1) {
        setSubStep(state.currentSubStep + 1);
        setIsCurrentStepValid(false);
      }
    } else {
      setStep(state.step + 1);
      setIsCurrentStepValid(false);
    }
  };

  const handleBack = () => {
    if (state.step === 2 && state.currentSubStep > 0) {
      setSubStep(state.currentSubStep - 1);
      setIsCurrentStepValid(false);
    } else if (state.step === 0) {
      handleBackToStart();
    } else {
      setStep(state.step - 1);
    }
  };
  
  // Handle Enter key for page advancement - MUST be before any conditional returns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Enter key is pressed
      if (e.key === 'Enter') {
        // Don't advance if we're in a select dropdown or if validation fails
        const activeElement = document.activeElement as HTMLElement;
        const isSelectOpen = activeElement?.tagName === 'SELECT';
        
        if (!isSelectOpen && isCurrentStepValid) {
          // Check if we're at the last substep (Calendly booking)
          if (state.step === 2 && currentSubSteps && state.currentSubStep === currentSubSteps.length - 1) {
            // Don't advance if at the Calendly booking step
            return;
          }
          
          handleNext();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCurrentStepValid, state.step, state.currentSubStep, currentSubSteps, handleNext]);
  
  // Show loading screen while submitting
  if (state.meetingBooked && !state.formSubmitted) {
    return (
      <div className="flex items-center justify-center p-4">
        <SubmissionLoading />
    </div>
    );
  }
  
  // Show thank you page if form is submitted and meeting is booked
  if (state.meetingBooked && state.formSubmitted) {
    return (
      <div className="flex items-center justify-center p-4">
        <ThankYou onStartOver={handleBackToStart} />
  </div>
    );
  }
  
  // Find the current step
  const currentStep = formSteps.find((_, index) => index === state.step);
  
  if (!isStarted) {
    return (
      <div className="flex items-center justify-center p-4">
        <StartPage onStart={() => setIsStarted(true)} />
    </div>
    );
  }
  
  if (!currentStep || !StepComponent) {
    return null;
  }
  

  const renderNavigation = () => {
    if (state.step === 2 && currentSubSteps && state.currentSubStep === currentSubSteps.length - 1) {
      return null;
    }

    return (
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isCurrentStepValid}
        >
          Continue
        </Button>
  </div>
    );
  };
  
  // Get the current title and description
  let title = currentStep.title;
  let description = currentStep.description;

  if (state.step === 2 && currentSubSteps) {
    const currentSubStep = currentSubSteps[state.currentSubStep];
    if (currentSubStep) {
      if (state.formPath === 'both') {
        title = getServiceSpecificTitle(
          currentSubStep.title,
          state.services,
          currentSubStep.type || null
        );
      } else {
        title = currentSubStep.title;
      }
      description = currentSubStep.description;
    }
  }

  return (
    <div className="flex items-center justify-center p-4">
      <FormCard title={title} description={description}>
        <StepComponent onValidationChange={handleValidationChange} />
        {renderNavigation()}
      </FormCard>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const { state, resetForm, initializeSession } = useFormStore();
  const [isStarted, setIsStarted] = useState(false);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing session...');
        // Initialize the session when the app loads
        await initializeSession();
        console.log('Session initialized successfully');
        setIsInitialized(true);
        
        // Check if we're on the upload page
        if (location.pathname.startsWith('/upload')) {
          // Extract session ID from URL
          const sessionId = location.pathname.split('/upload/')[1];
          if (sessionId) {
            // Load session data for upload page
            console.log('Loading session for upload:', sessionId);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialized(true); // Still allow the app to load
      }
    };

    init();
  }, [initializeSession]);

  const handleBackToStart = () => {
    setIsStarted(false);
    setIsCurrentStepValid(false);
    resetForm();
  };

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <FormFlow 
            state={state}
            isStarted={isStarted}
            isCurrentStepValid={isCurrentStepValid}
            setIsStarted={setIsStarted}
            setIsCurrentStepValid={setIsCurrentStepValid}
            handleBackToStart={handleBackToStart}
          />
        } 
      />
      <Route 
        path="/upload/:sessionId" 
        element={<UploadPage />} 
      />
    </Routes>
  );
}

export default App 