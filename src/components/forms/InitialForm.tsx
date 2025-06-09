import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormStore } from '../../store/formStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Import existing components
import StartPage from '../StartPage';
import AddressCollection from '../AddressCollection';
import ServiceSelection from '../ServiceSelection';
import ServiceDetailsSection from '../ServiceDetailsSection';
import ProjectScope from '../ProjectScope';
import BudgetSection from '../BudgetSection';
import SiteChallenges from '../SiteChallenges';
import StartDeadlineSection from '../StartDeadlineSection';
import FileUpload from '../FileUpload';
import { getServiceById } from '../../data/services';

const referralSources = [
  'Direct Mail',
  'Facebook',
  'Organic Search',
  'Google Ads',
  'Home Show',
  'Instagram',
  'TikTok',
  'Truck Signage',
  'Linkedin',
  'Mercedes Benz Catalog',
  'Jobsite Sign',
  'Other'
];

interface InitialFormProps {
  onComplete?: () => void;
}

// Simplified Contact Info Component (without photo upload and text link)
const ContactInfoStep: React.FC = () => {
  const { state, setPersonalInfo } = useFormStore();
  const { personalInfo } = state;

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 10) {
      const formatted = formatPhoneNumber(rawValue);
      setPersonalInfo({ phone: formatted });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            value={personalInfo.firstName}
            onChange={(e) => setPersonalInfo({ firstName: e.target.value })}
            placeholder="John"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            value={personalInfo.lastName}
            onChange={(e) => setPersonalInfo({ lastName: e.target.value })}
            placeholder="Doe"
            className="mt-1"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={personalInfo.email}
          onChange={(e) => setPersonalInfo({ email: e.target.value })}
          placeholder="john.doe@example.com"
          className="mt-1"
        />
        {personalInfo.email && !validateEmail(personalInfo.email) && (
          <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={personalInfo.phone}
          onChange={handlePhoneChange}
          placeholder="(555) 123-4567"
          className="mt-1"
        />
        {personalInfo.phone && personalInfo.phone.replace(/\D/g, '').length > 0 && personalInfo.phone.replace(/\D/g, '').length < 10 && (
          <p className="text-red-500 text-sm mt-1">Phone number must be 10 digits</p>
        )}
      </div>

      <div>
        <Label htmlFor="referral-source">How did you find us?</Label>
        <Select
          value={personalInfo.referralSource || ''}
          onValueChange={(value) => setPersonalInfo({ referralSource: value })}
        >
          <SelectTrigger id="referral-source" className="mt-1">
            <SelectValue placeholder="Select how you found us" />
          </SelectTrigger>
          <SelectContent>
            {referralSources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const InitialForm: React.FC<InitialFormProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { state, setPersonalInfo, submitForm } = useFormStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [textUploadRequested, setTextUploadRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if user selected project services (design-build or enhancement)
  const hasProjectServices = state.services.some(service => 
    ['landscape-design-build', 'landscape-enhancement'].includes(service)
  );

  // Determine if user selected maintenance services (lawn or snow)
  const hasMaintenanceServices = state.services.some(service => 
    ['lawn-maintenance', 'snow-management'].includes(service)
  );

  // Define the step flow based on selected services
  const getSteps = () => {
    const baseSteps = [
      { id: 'start', title: 'Welcome', component: 'start' },
      { id: 'contact', title: 'Contact Information', component: 'contact' },
      { id: 'address', title: 'Property Address', component: 'address' },
      { id: 'services', title: 'Service Selection', component: 'services' }
    ];

    const conditionalSteps = [];
    
    // Add project details page if project services selected
    if (hasProjectServices) {
      conditionalSteps.push({
        id: 'project-details',
        title: 'Project Details',
        component: 'project-details'
      });
    }

    // Add maintenance details page if maintenance services selected
    if (hasMaintenanceServices) {
      conditionalSteps.push({
        id: 'maintenance-details',
        title: 'Maintenance Details',
        component: 'maintenance-details'
      });
    }

    // Always end with upload page
    conditionalSteps.push({
      id: 'upload',
      title: 'Upload Photos',
      component: 'upload'
    });

    return [...baseSteps, ...conditionalSteps];
  };

  const steps = getSteps();
  const currentStepData = steps[currentStep];

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validation logic for each step
  useEffect(() => {
    let valid = false;
    
    switch (currentStepData?.id) {
      case 'start':
        valid = isStarted;
        break;
      case 'contact':
        const phoneDigits = state.personalInfo.phone.replace(/\D/g, '');
        valid = !!(state.personalInfo.firstName && 
                  state.personalInfo.lastName && 
                  validateEmail(state.personalInfo.email) && 
                  phoneDigits.length === 10);
        break;
      case 'address':
        valid = !!(state.address && state.postalCode);
        break;
      case 'services':
        valid = state.services.length > 0;
        break;
      case 'project-details':
        // Validate project scope, budget for project services, and timeline
        const hasProjectScope = !!state.projectScope;
        const hasProjectBudgets = state.services
          .filter(s => ['landscape-design-build', 'landscape-enhancement'].includes(s))
          .every(serviceId => state.budgets[serviceId] > 0);
        const hasProjectTimeline = state.services
          .filter(s => ['landscape-design-build', 'landscape-enhancement'].includes(s))
          .every(serviceId => state.startDeadlines[serviceId]?.startDate);
        valid = hasProjectScope && hasProjectBudgets && hasProjectTimeline;
        break;
      case 'maintenance-details':
        // Validate site challenges and start dates for maintenance services
        const hasSiteChallenges = !!state.siteChallenges;
        const hasMaintenanceStartDates = state.services
          .filter(s => ['lawn-maintenance', 'snow-management'].includes(s))
          .every(serviceId => state.startDeadlines[serviceId]?.startDate);
        valid = hasSiteChallenges && hasMaintenanceStartDates;
        break;
      case 'upload':
        valid = uploadedImages.length > 0 || textUploadRequested;
        break;
      default:
        valid = false;
    }
    
    setIsValid(valid);
  }, [currentStepData, state, isStarted, uploadedImages, textUploadRequested]);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    setCurrentStep(1); // Move to contact info
  };

  const handleUpload = (urls: string[]) => {
    setUploadedImages(prev => [...prev, ...urls]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Update personal info with text upload preference and mark form as completed
      setPersonalInfo({ 
        textUploadLink: textUploadRequested,
        uploadedImages: uploadedImages
      });
      
      // Submit the form and mark as completed
      await submitForm();
      
      // Navigate to completion or call onComplete
      if (onComplete) {
        onComplete();
      } else {
        // Show success message or navigate
        alert('Form submitted successfully!');
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStepData?.component) {
      case 'start':
        return <StartPage onStart={handleStart} />;
      
      case 'contact':
        return <ContactInfoStep />;
      
      case 'address':
        return <AddressCollection />;
      
      case 'services':
        return <ServiceSelection />;
      
      case 'project-details':
        return (
          <div className="space-y-6">
            {/* Service Details for Project Services */}
            <div>
              <h3 className="text-lg font-medium mb-3">Service Details</h3>
              <ServiceDetailsSection />
            </div>
            
            {/* Project Vision */}
            <div>
              <h3 className="text-lg font-medium mb-3">Describe Your Vision</h3>
              <ProjectScope />
            </div>
            
            {/* Budget for Project Services Only */}
            <div>
              <h3 className="text-lg font-medium mb-3">Budget</h3>
              <div className="space-y-4">
                {state.services
                  .filter(serviceId => ['landscape-design-build', 'landscape-enhancement'].includes(serviceId))
                  .map(serviceId => {
                    const service = getServiceById(serviceId);
                    if (!service) return null;
                    
                    return (
                      <div key={serviceId} className="p-3 border border-gray-200 rounded-md">
                        <Label htmlFor={`budget-${serviceId}`}>{service.name} Budget</Label>
                        <div className="relative mt-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            id={`budget-${serviceId}`}
                            type="number"
                            placeholder="0"
                            value={state.budgets[serviceId] || ''}
                            onChange={(e) => {
                              const { setBudget } = useFormStore.getState();
                              setBudget(serviceId, Number(e.target.value));
                            }}
                            className="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            
            {/* Timeline - When would you like to start */}
            <div>
              <h3 className="text-lg font-medium mb-3">When would you like to start?</h3>
              <div className="space-y-3">
                {['this month', '1-3 months', '3-6 months', 'next year'].map(option => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="project-timeline"
                      value={option}
                      checked={state.startDeadlines[state.services.find(s => ['landscape-design-build', 'landscape-enhancement'].includes(s)) || '']?.startDate === option}
                      onChange={(e) => {
                        const projectService = state.services.find(s => ['landscape-design-build', 'landscape-enhancement'].includes(s));
                        if (projectService) {
                          const { setStartDeadline } = useFormStore.getState();
                          setStartDeadline(projectService, e.target.value, '');
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'maintenance-details':
        return (
          <div className="space-y-6">
            {/* Service Details for Maintenance Services */}
            <div>
              <h3 className="text-lg font-medium mb-3">Service Details</h3>
              <ServiceDetailsSection />
            </div>
            
            {/* Site Challenges */}
            <div>
              <h3 className="text-lg font-medium mb-3">Site Challenges</h3>
              <SiteChallenges />
            </div>
            
            {/* Start Date Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3">Desired Start Dates</h3>
              <StartDeadlineSection />
            </div>
          </div>
        );
      
      case 'upload':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Upload Property Photos</h3>
              <FileUpload
                onUpload={handleUpload}
                maxFiles={10}
                maxSize={10 * 1024 * 1024}
              />
              {uploadedImages.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  {uploadedImages.length} {uploadedImages.length === 1 ? 'image' : 'images'} uploaded
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="text-upload-link"
                checked={textUploadRequested}
                onCheckedChange={(checked) => setTextUploadRequested(!!checked)}
              />
              <Label htmlFor="text-upload-link" className="text-sm">
                Text me the upload link (if you don't have photos on your device, we can send you a link to upload them later)
              </Label>
            </div>
          </div>
        );
      
      default:
        return <div>Step not found</div>;
    }
  };

  const renderNavigation = () => {
    if (currentStepData?.id === 'start') {
      return null; // Start page handles its own navigation
    }

    return (
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isValid || isSubmitting}
        >
          {currentStep === steps.length - 1 ? (
            isSubmitting ? 'Submitting...' : 'Submit'
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    );
  };

  // Fixed container size for embedding
  return (
    <div className="w-full max-w-2xl mx-auto" style={{ height: '600px', overflow: 'auto' }}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{currentStepData?.title}</CardTitle>
          {currentStepData?.id !== 'start' && (
            <CardDescription>
              Step {currentStep} of {steps.length - 1}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {renderStepContent()}
          {renderNavigation()}
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialForm; 