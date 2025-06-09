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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { getServiceById, services } from '../../data/services';
import { Service } from '../../types/form';
import ServiceSelection from '../ServiceSelection';

// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

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

// Project Service Details Component
const ProjectServiceDetailsSection: React.FC = () => {
  const { state, setServiceDetails } = useFormStore();
  const { services: selectedServices, serviceDetails } = state;
  
  const projectServices = selectedServices.filter(serviceId => 
    ['landscape-design-build', 'landscape-enhancement'].includes(serviceId)
  );

  const handleCheckboxChange = (serviceId: string, option: string) => {
    const currentDetails = serviceDetails[serviceId] || [];
    
    if (Array.isArray(currentDetails)) {
      if (currentDetails.includes(option)) {
        setServiceDetails(
          serviceId, 
          currentDetails.filter(item => item !== option)
        );
      } else {
        setServiceDetails(serviceId, [...currentDetails, option]);
      }
    } else {
      setServiceDetails(serviceId, [option]);
    }
  };

  return (
    <div className="space-y-6">
      {projectServices.map(serviceId => {
        const service = getServiceById(serviceId);
        if (!service) return null;
        
        let content;
        
        switch (serviceId) {
          case 'landscape-design-build':
            content = (
              <div className="space-y-3">
                <Label className="block mb-2">Select design elements (select all that apply):</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {service.options?.elements.map((element: string) => {
                    const currentDetails = serviceDetails[serviceId] || [];
                    const isChecked = Array.isArray(currentDetails) && currentDetails.includes(element);
                    
                    return (
                      <div key={element} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`element-${element}`}
                          checked={isChecked}
                          onCheckedChange={() => handleCheckboxChange(serviceId, element)}
                        />
                        <Label 
                          htmlFor={`element-${element}`}
                          className="text-sm cursor-pointer"
                        >
                          {element}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            break;
            
          case 'landscape-enhancement':
            content = (
              <div className="space-y-3">
                <Label className="block mb-2">Select enhancement types (select all that apply):</Label>
                <div className="grid grid-cols-2 gap-2">
                  {service.options?.types.map((type: string) => {
                    const currentDetails = serviceDetails[serviceId] || [];
                    const isChecked = Array.isArray(currentDetails) && currentDetails.includes(type);
                    
                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`}
                          checked={isChecked}
                          onCheckedChange={() => handleCheckboxChange(serviceId, type)}
                        />
                        <Label 
                          htmlFor={`type-${type}`}
                          className="text-sm cursor-pointer"
                        >
                          {type}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            break;
            
          default:
            content = null;
        }
        
        if (!content) return null;
        
        return (
          <div key={serviceId} className="p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-medium mb-3">{service.name} Details</h3>
            {content}
          </div>
        );
      })}
    </div>
  );
};

// Maintenance Service Details Component
const MaintenanceServiceDetailsSection: React.FC = () => {
  const { state, setServiceDetails } = useFormStore();
  const { services: selectedServices, serviceDetails } = state;
  
  const maintenanceServices = selectedServices.filter(serviceId => 
    ['lawn-maintenance', 'snow-management'].includes(serviceId)
  );

  const handleRadioChange = (serviceId: string, value: string) => {
    setServiceDetails(serviceId, value);
  };
  
  const handleSelectChange = (serviceId: string, value: string) => {
    setServiceDetails(serviceId, value);
  };

  return (
    <div className="space-y-6">
      {maintenanceServices.map(serviceId => {
        const service = getServiceById(serviceId);
        if (!service) return null;
        
        let content;
        
        switch (serviceId) {
          case 'lawn-maintenance':
            content = (
              <div className="space-y-3">
                <Label className="block mb-2">Select service type:</Label>
                <RadioGroup 
                  value={serviceDetails[serviceId] || ''}
                  onValueChange={(value) => handleRadioChange(serviceId, value)}
                >
                  {service.options?.types.map((type: string) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`type-${type}`} />
                      <Label 
                        htmlFor={`type-${type}`}
                        className="text-sm cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            );
            break;
            
          case 'snow-management':
            content = (
              <div className="space-y-3">
                <Label htmlFor={`property-size-${serviceId}`} className="block mb-2">
                  Select property size:
                </Label>
                <Select
                  value={serviceDetails[serviceId] || ''}
                  onValueChange={(value) => handleSelectChange(serviceId, value)}
                >
                  <SelectTrigger id={`property-size-${serviceId}`}>
                    <SelectValue placeholder="Select property size" />
                  </SelectTrigger>
                  <SelectContent>
                    {service.options?.propertySizes.map((size: string) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
            break;
            
          default:
            content = null;
        }
        
        if (!content) return null;
        
        return (
          <div key={serviceId} className="p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-medium mb-3">{service.name} Details</h3>
            {content}
          </div>
        );
      })}
    </div>
  );
};

// Contact Info Step Component
const ContactInfoStep: React.FC<{ onInteraction: () => void }> = ({ onInteraction }) => {
  const { state, setPersonalInfo } = useFormStore();
  const { personalInfo } = state;
  const [hasInteracted, setHasInteracted] = useState(false);

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
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteraction();
    }
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 10) {
      const formatted = formatPhoneNumber(rawValue);
      setPersonalInfo({ phone: formatted });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteraction();
    }
    setPersonalInfo({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            value={personalInfo.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="John"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            value={personalInfo.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
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
          onChange={(e) => handleInputChange('email', e.target.value)}
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
          onValueChange={(value) => handleInputChange('referralSource', value)}
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

// Address Step Component with Google Autocomplete
const AddressStep: React.FC = () => {
  const { state, setAddress } = useFormStore();
  const [isInServiceArea, setIsInServiceArea] = useState<boolean | null>(null);
  const [autocompleteInitialized, setAutocompleteInitialized] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const autocompleteRef = React.useRef<any>(null);

  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
      return;
    }

    // Only load script if not already present
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', initializeAutocomplete);
      return;
    }

    // Load Google Places API
    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Address autocomplete will not work.');
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Set up global callback
    (window as any).initGoogleMaps = () => {
      initializeAutocomplete();
    };

    document.head.appendChild(script);

    return () => {
      // Clean up global callback
      delete (window as any).initGoogleMaps;
    };
  }, []);

  const initializeAutocomplete = () => {
    if (autocompleteInitialized || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }
    
    const input = document.getElementById('address-input') as HTMLInputElement;
    if (!input) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'ca' }, // Restrict to Canada
        fields: ['formatted_address', 'address_components', 'geometry']
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (place.formatted_address) {
          setIsManualInput(false);
          
          // Extract postal code from place components
          let postalCode = '';
          if (place.address_components) {
            const postalComponent = place.address_components.find(
              (component: any) => component.types.includes('postal_code')
            );
            postalCode = postalComponent?.long_name || '';
          }

          // Simple service area validation
          const serviceAreaCheck = validateServiceArea(place.formatted_address, postalCode);
          setIsInServiceArea(serviceAreaCheck);
          
          setAddress(place.formatted_address, postalCode, serviceAreaCheck);
        }
      });

      setAutocompleteInitialized(true);
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  };

  const validateServiceArea = (address: string, postalCode: string): boolean => {
    // Simple validation - you can enhance this with actual service area logic
    // For now, assume all areas are serviced
    return true;
  };

  const handleManualAddressChange = (address: string) => {
    setIsManualInput(true);
    // For manual input, assume service area is valid
    setIsInServiceArea(true);
    setAddress(address, '', true);
  };

  const handleInputFocus = () => {
    // Clear any autocomplete selection when user starts typing manually
    if (autocompleteRef.current && isManualInput) {
      autocompleteRef.current.set('place', null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address-input">Property Address</Label>
        <Input
          id="address-input"
          value={state.address}
          onChange={(e) => handleManualAddressChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Start typing your address..."
          className="mt-1"
          autoComplete="off"
        />
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
          <p className="text-amber-600 text-sm mt-1">
            ⚠️ Google Maps API key not configured. Manual address entry only.
          </p>
        )}
        {isInServiceArea === false && (
          <p className="text-red-500 text-sm mt-1">
            This address may be outside our service area. Please contact us to confirm.
          </p>
        )}
      </div>
    </div>
  );
};

// Project Details Step Component
const ProjectDetailsStep: React.FC = () => {
  const { state, setProjectScope, setBudget, setStartDeadline } = useFormStore();
  
  const projectServices = state.services.filter(serviceId => 
    ['landscape-design-build', 'landscape-enhancement'].includes(serviceId)
  );

  return (
    <div className="space-y-6">
      {/* Service Details using project-specific component */}
      <ProjectServiceDetailsSection />
      
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
  const { state, setSiteChallenges, setStartDeadline, setBudget } = useFormStore();
  
  const maintenanceServices = state.services.filter(serviceId => 
    ['lawn-maintenance', 'snow-management'].includes(serviceId)
  );

  return (
    <div className="space-y-6">
      {/* Service Details using maintenance-specific component */}
      <MaintenanceServiceDetailsSection />
      
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

      {/* Budget */}
      <div>
        <Label className="text-base font-medium">Budget Range</Label>
        <p className="text-sm text-gray-600 mb-3">What's your budget for these services?</p>
        <div className="space-y-3">
          {maintenanceServices.map(serviceId => {
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
  const { state, setPersonalInfo, submitForm, initializeSession } = useFormStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
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

  // Handle session initialization when user first interacts
  const handleSessionInitialization = async () => {
    if (!sessionInitialized) {
      await initializeSession();
      setSessionInitialized(true);
    }
  };

  // Validation logic for each step
  useEffect(() => {
    let valid = false;
    
    switch (currentStepData?.id) {
      case 'contact':
        const phoneDigits = state.personalInfo.phone.replace(/\D/g, '');
        valid = !!(state.personalInfo.firstName && 
                  state.personalInfo.lastName && 
                  validateEmail(state.personalInfo.email) && 
                  phoneDigits.length === 10);
        break;
      case 'address':
        valid = !!(state.address);
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
        const hasMaintenanceBudgets = state.services
          .filter(s => ['lawn-maintenance', 'snow-management'].includes(s))
          .every(serviceId => state.budgets[serviceId] > 0);
        const hasMaintenanceStartDates = state.services
          .filter(s => ['lawn-maintenance', 'snow-management'].includes(s))
          .every(serviceId => state.startDeadlines[serviceId]?.startDate);
        valid = hasSiteChallenges && hasMaintenanceBudgets && hasMaintenanceStartDates;
        break;
      case 'upload':
        valid = uploadedImages.length > 0 || textUploadRequested;
        break;
      default:
        valid = false;
    }
    
    setIsValid(valid);
  }, [currentStepData, state, uploadedImages, textUploadRequested]);

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
      case 'contact':
        return <ContactInfoStep onInteraction={handleSessionInitialization} />;
      case 'address':
        return <AddressStep />;
      case 'services':
        return <ServiceSelection />;
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
    return (
      <div className="flex justify-between pt-6 border-t border-gray-200">
        {currentStep === 0 ? (
          <div></div>
        ) : (
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
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
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>{currentStepData?.title}</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto">
            {renderStepContent()}
          </div>
          <div className="flex-shrink-0 mt-auto">
            {renderNavigation()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialForm; 