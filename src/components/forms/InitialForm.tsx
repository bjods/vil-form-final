import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormStore } from '../../store/formStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { CheckCircle, ArrowRight, Upload, Calendar } from 'lucide-react';

// Import existing components
import ServiceSelection from '../ServiceSelection';
import AddressCollection from '../AddressCollection';
import PersonalInformation from '../PersonalInformation';
import BudgetSection from '../BudgetSection';

interface InitialFormProps {
  onComplete?: () => void;
}

const InitialForm: React.FC<InitialFormProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { state, setStep } = useFormStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isValid, setIsValid] = useState(false);

  const steps = [
    {
      id: 'services',
      title: 'What services do you need?',
      description: 'Select the landscaping services you\'re interested in',
      component: ServiceSelection,
      validation: () => state.services.length > 0
    },
    {
      id: 'address',
      title: 'Where is your property?',
      description: 'Help us confirm we service your area',
      component: AddressCollection,
      validation: () => state.address.length > 0 && state.postalCode.length > 0
    },
    {
      id: 'budget',
      title: 'What\'s your budget range?',
      description: 'This helps us provide accurate recommendations',
      component: BudgetSection,
      validation: () => state.services.every(serviceId => state.budgets[serviceId] > 0)
    },
    {
      id: 'contact',
      title: 'How can we reach you?',
      description: 'We\'ll send you a personalized quote',
      component: PersonalInformation,
      validation: () => state.personalInfo.firstName && state.personalInfo.lastName && state.personalInfo.email
    }
  ];

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    const validationResult = currentStepData.validation();
    setIsValid(Boolean(validationResult));
  }, [state, currentStep, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark initial form as completed
    setStep(99); // Special step to indicate initial form completion
    onComplete?.();
  };

  const handleContinueDetailed = () => {
    if (state.sessionId) {
      navigate(`/follow-up/${state.sessionId}`);
    }
  };

  const handleUploadPhotos = () => {
    if (state.sessionId) {
      navigate(`/upload/${state.sessionId}`);
    }
  };

  const handleScheduleMeeting = () => {
    // For now, just show the Calendly component from the existing form
    // Later this will be replaced with the custom calendar widget
    setStep(2); // Go to the existing form's calendar step
  };

  // Show completion options after all steps are done
  if (currentStep >= steps.length) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Thank you for your interest!</CardTitle>
            <CardDescription>
              We've received your basic information. What would you like to do next?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleContinueDetailed}
              className="w-full h-12 text-left justify-start"
              variant="outline"
            >
              <ArrowRight className="w-5 h-5 mr-3" />
              <div>
                <div className="font-medium">Provide More Details</div>
                <div className="text-sm text-gray-500">Complete a detailed form for a more accurate quote</div>
              </div>
            </Button>
            
            <Button 
              onClick={handleUploadPhotos}
              className="w-full h-12 text-left justify-start"
              variant="outline"
            >
              <Upload className="w-5 h-5 mr-3" />
              <div>
                <div className="font-medium">Upload Property Photos</div>
                <div className="text-sm text-gray-500">Help us provide a more accurate estimate</div>
              </div>
            </Button>
            
            <Button 
              onClick={handleScheduleMeeting}
              className="w-full h-12 text-left justify-start"
            >
              <Calendar className="w-5 h-5 mr-3" />
              <div>
                <div className="font-medium">Schedule a Consultation</div>
                <div className="text-sm text-gray-500">Book a time to discuss your project in detail</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
          <CardTitle>{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <StepComponent onValidationChange={setIsValid} />
            
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!isValid}
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialForm; 