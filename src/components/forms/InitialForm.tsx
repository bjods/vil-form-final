import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormStore } from '../../store/formStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { getServiceById, services } from '../../data/services';
import { Service } from '../../types/form';

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

// Simple image upload function - you can enhance this with actual Supabase storage
const uploadImage = async (file: File): Promise<string> => {
  // For now, create a local URL - in production this would upload to Supabase Storage
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

interface InitialFormProps {
  onComplete?: () => void;
}

// Start Page Component
const StartPageStep: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Get Your Free Landscaping Quote</h2>
        <p className="text-gray-600 text-lg">
          Tell us about your project and we'll provide you with a personalized estimate.
        </p>
      </div>
      <Button onClick={onStart} size="lg" className="px-8 py-3">
        Get Started
      </Button>
    </div>
  );
};

// Contact Info Step Component
const ContactInfoStep: React.FC = () => {
  const { state, setPersonalInfo } = useFormStore();
  const { personalInfo } = state;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 10) {
      const formatted = formatPhoneNumber(rawValue);
      setPersonalInfo({ phone: formatted });
    }
  };

  return (
    <div className="space-y-4">
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

// Address Step Component
const AddressStep: React.FC = () => {
  const { state, setAddress } = useFormStore();

  const handleAddressChange = (address: string) => {
    // Simple service area validation - you can enhance this
    const isInServiceArea = true; // For now, assume all areas are serviced
    setAddress(address, state.postalCode, isInServiceArea);
  };

  const handlePostalCodeChange = (postalCode: string) => {
    const isInServiceArea = true; // For now, assume all areas are serviced
    setAddress(state.address, postalCode, isInServiceArea);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Property Address</Label>
        <Input
          id="address"
          value={state.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="123 Main Street"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="postal-code">Postal Code</Label>
        <Input
          id="postal-code"
          value={state.postalCode}
          onChange={(e) => handlePostalCodeChange(e.target.value)}
          placeholder="A1A 1A1"
          className="mt-1"
        />
      </div>

      {state.address && state.postalCode && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">✓ Great! We service your area.</p>
        </div>
      )}
    </div>
  );
};

// Service Selection Step Component
const ServiceSelectionStep: React.FC = () => {
  const { state, setServices } = useFormStore();

  const handleServiceToggle = (serviceId: string) => {
    const newServices = state.services.includes(serviceId)
      ? state.services.filter(id => id !== serviceId)
      : [...state.services, serviceId];
    setServices(newServices);
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600">Select the services you're interested in:</p>
      <div className="grid gap-3">
        {services.map((service: Service) => (
          <div
            key={service.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              state.services.includes(service.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleServiceToggle(service.id)}
          >
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={state.services.includes(service.id)}
                onChange={() => handleServiceToggle(service.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {service.id === 'landscape-design-build' && 'Complete landscape design and construction services'}
                  {service.id === 'landscape-enhancement' && 'Improve your existing landscape with targeted enhancements'}
                  {service.id === 'lawn-maintenance' && 'Regular lawn care and maintenance services'}
                  {service.id === 'snow-management' && 'Winter snow removal and management services'}
                  {service.id === 'other' && 'Tell us about your specific landscaping needs'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Project Details Step Component
const ProjectDetailsStep: React.FC = () => {
  const { state, setServiceDetails, setProjectScope, setBudget, setStartDeadline } = useFormStore();
  
  const projectServices = state.services.filter(serviceId => 
    ['landscape-design-build', 'landscape-enhancement'].includes(serviceId)
  );

  return (
    <div className="space-y-6">
      {/* Service Details */}
      <div>
        <Label className="text-base font-medium">Service Details</Label>
        <p className="text-sm text-gray-600 mb-3">Tell us more about what you're looking for</p>
        <div className="space-y-3">
          {projectServices.map(serviceId => {
            const service = getServiceById(serviceId);
            if (!service) return null;
            
            return (
              <div key={serviceId}>
                <Label htmlFor={`details-${serviceId}`}>{service.name} Details</Label>
                <Textarea
                  id={`details-${serviceId}`}
                  value={state.serviceDetails[serviceId]?.details || ''}
                  onChange={(e) => setServiceDetails(serviceId, { details: e.target.value })}
                  placeholder={`Describe your ${service.name.toLowerCase()} needs...`}
                  className="mt-1"
                  rows={3}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Vision */}
      <div>
        <Label htmlFor="project-vision" className="text-base font-medium">Describe Your Vision</Label>
        <p className="text-sm text-gray-600 mb-3">What's your dream outdoor space?</p>
        <Textarea
          id="project-vision"
          value={state.projectScope}
          onChange={(e) => setProjectScope(e.target.value)}
          placeholder="Describe your ideal outdoor space, style preferences, specific features you want..."
          rows={4}
          className="mt-1"
        />
      </div>

      {/* Budget */}
      <div>
        <Label className="text-base font-medium">Budget Range</Label>
        <p className="text-sm text-gray-600 mb-3">What's your budget for this project?</p>
        <div className="space-y-3">
          {projectServices.map(serviceId => {
            const service = getServiceById(serviceId);
            if (!service) return null;
            
            return (
              <div key={serviceId}>
                <Label htmlFor={`budget-${serviceId}`}>{service.name} Budget</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <Input
                    id={`budget-${serviceId}`}
                    type="number"
                    placeholder="0"
                    value={state.budgets[serviceId] || ''}
                    onChange={(e) => setBudget(serviceId, Number(e.target.value))}
                    className="pl-7"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <Label className="text-base font-medium">When would you like to start?</Label>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {['this month', '1-3 months', '3-6 months', 'next year'].map(option => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="project-timeline"
                value={option}
                checked={projectServices.some(serviceId => 
                  state.startDeadlines[serviceId]?.startDate === option
                )}
                onChange={(e) => {
                  projectServices.forEach(serviceId => {
                    setStartDeadline(serviceId, e.target.value, '');
                  });
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span className="capitalize text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Maintenance Details Step Component
const MaintenanceDetailsStep: React.FC = () => {
  const { state, setServiceDetails, setSiteChallenges, setStartDeadline } = useFormStore();
  
  const maintenanceServices = state.services.filter(serviceId => 
    ['lawn-maintenance', 'snow-management'].includes(serviceId)
  );

  return (
    <div className="space-y-6">
      {/* Service Details */}
      <div>
        <Label className="text-base font-medium">Service Details</Label>
        <p className="text-sm text-gray-600 mb-3">Tell us about your maintenance needs</p>
        <div className="space-y-3">
          {maintenanceServices.map(serviceId => {
            const service = getServiceById(serviceId);
            if (!service) return null;
            
            return (
              <div key={serviceId}>
                <Label htmlFor={`details-${serviceId}`}>{service.name} Details</Label>
                <Textarea
                  id={`details-${serviceId}`}
                  value={state.serviceDetails[serviceId]?.details || ''}
                  onChange={(e) => setServiceDetails(serviceId, { details: e.target.value })}
                  placeholder={`Describe your ${service.name.toLowerCase()} requirements...`}
                  className="mt-1"
                  rows={3}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Site Challenges */}
      <div>
        <Label htmlFor="site-challenges" className="text-base font-medium">Site Challenges</Label>
        <p className="text-sm text-gray-600 mb-3">Any specific challenges or considerations for your property?</p>
        <Textarea
          id="site-challenges"
          value={state.siteChallenges}
          onChange={(e) => setSiteChallenges(e.target.value)}
          placeholder="Steep slopes, narrow access, specific timing requirements, etc."
          rows={3}
          className="mt-1"
        />
      </div>

      {/* Start Dates */}
      <div>
        <Label className="text-base font-medium">Desired Start Dates</Label>
        <p className="text-sm text-gray-600 mb-3">When would you like each service to begin?</p>
        <div className="space-y-3">
          {maintenanceServices.map(serviceId => {
            const service = getServiceById(serviceId);
            if (!service) return null;
            
            return (
              <div key={serviceId}>
                <Label htmlFor={`start-date-${serviceId}`}>{service.name} Start Date</Label>
                <Input
                  id={`start-date-${serviceId}`}
                  type="date"
                  value={state.startDeadlines[serviceId]?.startDate || ''}
                  onChange={(e) => setStartDeadline(serviceId, e.target.value, '')}
                  className="mt-1"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Upload Photos Step Component
const UploadPhotosStep: React.FC<{
  uploadedImages: string[];
  onUpload: (urls: string[]) => void;
  textUploadRequested: boolean;
  onTextUploadChange: (requested: boolean) => void;
}> = ({ uploadedImages, onUpload, textUploadRequested, onTextUploadChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      onUpload(urls);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Upload Property Photos</Label>
        <p className="text-sm text-gray-600 mb-4">
          Help us provide an accurate quote by sharing photos of your property
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                Click to upload
              </label>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
          </div>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {isUploading && (
          <p className="text-sm text-blue-600 mt-2">Uploading images...</p>
        )}

        {uploadedImages.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">
              ✓ {uploadedImages.length} {uploadedImages.length === 1 ? 'image' : 'images'} uploaded successfully
            </p>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-500 bg-white">OR</span>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox
          id="text-upload-link"
          checked={textUploadRequested}
          onCheckedChange={(checked) => onTextUploadChange(!!checked)}
          className="mt-1"
        />
        <div>
          <Label htmlFor="text-upload-link" className="text-sm font-medium cursor-pointer">
            Text me the upload link
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            Don't have photos on your device? We'll send you a link to upload them later.
          </p>
        </div>
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
      { id: 'start', title: 'Get Started', component: 'start' },
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
      // Update personal info with text upload preference and uploaded images
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
        return <StartPageStep onStart={handleStart} />;
      case 'contact':
        return <ContactInfoStep />;
      case 'address':
        return <AddressStep />;
      case 'services':
        return <ServiceSelectionStep />;
      case 'project-details':
        return <ProjectDetailsStep />;
      case 'maintenance-details':
        return <MaintenanceDetailsStep />;
      case 'upload':
        return (
          <UploadPhotosStep
            uploadedImages={uploadedImages}
            onUpload={handleUpload}
            textUploadRequested={textUploadRequested}
            onTextUploadChange={setTextUploadRequested}
          />
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
      <div className="flex justify-between pt-6 border-t border-gray-200">
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