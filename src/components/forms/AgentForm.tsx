import React, { useState, useEffect, useRef } from 'react';
import { useFormStore } from '../../store/formStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CheckCircle2, Circle, Save, User, DollarSign, FileText, Calendar, Phone, MapPin, Camera } from 'lucide-react';
import { services } from '../../data/services';
import AgentCalendarWidget from '../AgentCalendarWidget';
import FileUpload from '../FileUpload';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

const referralSources = [
  'Cold Calling',
  'Direct Mailer',
  'Door Knocking',
  'Email Cold Outreach',
  'Facebook',
  'Field Crew Referral',
  'Google Ads',
  'Google Organic',
  'Home Show',
  'Inbound Lead',
  'Instagram',
  'Jobsite Sign',
  'LinkedIn',
  'Mercedes Benz Catalog',
  'Referral',
  'Tiktok',
  'Truck Signage',
  'Unknown'
];

interface AgentFormProps {
  sessionId?: string;
}

const AgentForm: React.FC<AgentFormProps> = ({ sessionId }) => {
  const { state, setPersonalInfo, setServices, setBudget, setNotes, setAddress, setMeetingDetails, submitAgentForm, initializeFreshSession, wipeBrowserData } = useFormStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [notes, setNotesLocal] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [leadInputtedBy, setLeadInputtedBy] = useState('');
  // Calendar selection is now handled directly by AgentCalendarWidget via form store
  
  // Google Maps autocomplete refs
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Initialize fresh session on mount (no caching)
  useEffect(() => {
    const initSession = async () => {
      console.log('🆕 Initializing fresh agent form session (no caching)');
      await initializeFreshSession();
      // Set initial address value if it exists in state
      if (state.address) {
        setAddressInput(state.address);
      }
    };
    initSession();
  }, []); // Empty dependency array - only run once on mount

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsGoogleMapsLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 100);
        return;
      }

      // Load the Google Maps API script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Maps API loaded');
        setIsGoogleMapsLoaded(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialize Google Maps autocomplete when API is loaded
  useEffect(() => {
    if (isGoogleMapsLoaded && addressInputRef.current && !autocompleteRef.current) {
      try {
        console.log('🗺️ Initializing Google Maps autocomplete...');
        autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'ca' }, // Restrict to Canada
          fields: ['formatted_address', 'address_components', 'geometry']
        });

        const autocomplete = autocompleteRef.current;
        if (autocomplete) {
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            console.log('📍 Place selected:', place);
            
            if (place && place.formatted_address) {
              const address = place.formatted_address;
              setAddressInput(address);
              
              // Extract postal code from components
              let postalCode = '';
              
              if (place.address_components) {
                const postalCodeComponent = place.address_components.find(
                  (component: any) => component.types.includes('postal_code')
                );
                if (postalCodeComponent) {
                  postalCode = postalCodeComponent.long_name;
                }
              }
              
              console.log('📍 Address from autocomplete:', address);
              if (postalCode) {
                console.log('📮 Postal code found:', postalCode);
              }
              
              // Set address with postal code
              setAddress(address, postalCode, true);
            }
          });
          
          console.log('✅ Google Maps autocomplete initialized');
        }
      } catch (error) {
        console.error('❌ Error initializing Google Maps autocomplete:', error);
      }
    }
  }, [isGoogleMapsLoaded, setAddress]);

  // Update notes in store when local notes change
  useEffect(() => {
    if (setNotes) {
      setNotes(notes);
    }
  }, [notes, setNotes]);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 10) {
      const formatted = formatPhoneNumber(rawValue);
      setPersonalInfo({ phone: formatted });
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    const newServices = state.services.includes(serviceId)
      ? state.services.filter(id => id !== serviceId)
      : [...state.services, serviceId];
    setServices(newServices);
  };

  const handleBudgetChange = (value: string) => {
    const budget = Number(value) || 0;
    setTotalBudget(budget);
    
    // Set budget for all selected services
    state.services.forEach(serviceId => {
      setBudget(serviceId, budget);
    });
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    // Always update address in store when typing
    setAddress(value, '', true);
  };

  const handleSubmit = async () => {
    try {
      // No need to pass calendar data - it's already in the form store
      const success = await submitAgentForm(leadInputtedBy);
      if (success) {
        setIsSubmitted(true);
      } else {
        console.error('Form submission failed');
        alert('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const handleStartNew = async () => {
    console.log('🔄 Starting new agent form...');
    
    // Wipe all browser data first
    wipeBrowserData();
    
    // Reset all local state
    setIsSubmitted(false);
    setTotalBudget(0);
    setNotesLocal('');
    setAddressInput('');
    setLeadInputtedBy('');
    
    // Initialize fresh session (no caching)
    await initializeFreshSession();
    
    console.log('✅ New agent form ready');
  };

  const phoneDigits = state.personalInfo.phone.replace(/\D/g, '');

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Lead Submitted Successfully!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Lead saved successfully.
            </p>

            <div className="space-y-4">
              <Button onClick={handleStartNew} size="lg" className="w-full max-w-md">
                Create Another Lead
              </Button>
              
              <p className="text-sm text-gray-500">
                Session ID: {state.sessionId}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Quick Lead Entry
              </CardTitle>
              <CardDescription>
                Fast lead capture for door-to-door and phone sales
              </CardDescription>
            </div>
            {state.submissionError && (
              <div className="text-red-500 text-sm">
                {state.submissionError}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={state.personalInfo.firstName}
                onChange={(e) => setPersonalInfo({ firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={state.personalInfo.lastName}
                onChange={(e) => setPersonalInfo({ lastName: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={state.personalInfo.email}
              onChange={(e) => setPersonalInfo({ email: e.target.value })}
              placeholder="Enter email address"
              required
            />
            {state.personalInfo.email && !validateEmail(state.personalInfo.email) && (
              <p className="text-sm text-red-600 mt-1">Please enter a valid email address</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={state.personalInfo.phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="address">Property Address *</Label>
            <Input
              ref={addressInputRef}
              id="address"
              value={addressInput}
              onChange={handleAddressInputChange}
              placeholder="Start typing your address..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="referralSource">How did you hear about us?</Label>
            <Select value={state.personalInfo.referralSource || ''} onValueChange={(value) => setPersonalInfo({ referralSource: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select referral source" />
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
          
          <div>
            <Label htmlFor="leadInputtedBy">Lead Inputted By *</Label>
            <Input
              id="leadInputtedBy"
              value={leadInputtedBy}
              onChange={(e) => setLeadInputtedBy(e.target.value)}
              placeholder="Enter staff member name"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Name of the staff member entering this lead
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Services & Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Services & Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Select Services (optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((service) => {
                const isSelected = state.services.includes(service.id);
                
                return (
                  <div
                    key={service.id}
                    onClick={() => handleServiceToggle(service.id)}
                    className={`
                      relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-200 hover:border-yellow-200'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{service.name}</h3>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <Label htmlFor="budget">Total Budget (optional)</Label>
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <Input
                id="budget"
                type="number"
                placeholder="0"
                value={totalBudget || ''}
                onChange={(e) => handleBudgetChange(e.target.value)}
                className="pl-7"
              />
            </div>
            {totalBudget > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Budget: ${totalBudget.toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">Service Details, Jobsite Info, Special Requirements</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional details about the services needed, jobsite challenges, timeline requirements, or other important information..."
              value={notes}
              onChange={(e) => setNotesLocal(e.target.value)}
              className="min-h-[120px] mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              Include any relevant details that will help with the consultation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Property Photos (Optional)
          </CardTitle>
          <CardDescription>
            Upload photos of the property to help with consultation preparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onUpload={(urls) => setPersonalInfo({ uploadedImages: urls })}
            maxFiles={10}
          />
        </CardContent>
      </Card>

      {/* Calendar Booking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Discovery Call (Optional)
          </CardTitle>
          <CardDescription>
            Select a date and time for a 15-minute discovery call. This will be saved when you submit the lead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentCalendarWidget />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleSubmit}
          size="lg"
          className="w-full max-w-md"
          disabled={state.isSubmitting || !state.personalInfo.firstName || !state.personalInfo.lastName || !state.personalInfo.email || !state.personalInfo.phone || !state.address || !leadInputtedBy}
        >
          {state.isSubmitting ? 'Saving Lead...' : 'Save Lead'}
        </Button>
      </div>
    </div>
  );
};

export default AgentForm; 