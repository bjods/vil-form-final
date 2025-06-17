import React, { useState, useEffect, useRef } from 'react';
import { useFormStore } from '../../store/formStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { CheckCircle2, Circle, Save, User, DollarSign, FileText, Calendar, Phone, MapPin } from 'lucide-react';
import { services } from '../../data/services';
import CalendarWidget from '../CalendarWidget';
import { AutoSaveIndicator } from '../shared/AutoSaveIndicator';

// Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBaxGwc3uGt97gA_hKji4L3s-QuIuejzYI';

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
  'Door to Door',
  'Phone Call',
  'Referral',
  'Other'
];

interface AgentFormProps {
  sessionId?: string;
}

const AgentForm: React.FC<AgentFormProps> = ({ sessionId }) => {
  const { state, setPersonalInfo, setServices, setBudget, setNotes, setAddress, submitAgentForm, initializeSession } = useFormStore();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [notes, setNotesLocal] = useState('');
  const [addressInput, setAddressInput] = useState(state.address || '');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scriptLoadingRef = useRef(false);

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      try {
        if (sessionId) {
          await initializeSession(sessionId);
        } else {
          await initializeSession();
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };
    init();
  }, [sessionId]);

  // Sync address input with store
  useEffect(() => {
    setAddressInput(state.address || '');
  }, [state.address]);

  // Load Google Maps script and setup autocomplete
  const loadGoogleMapsScript = () => {
    if (scriptLoadingRef.current) return;
    
    if (document.getElementById('google-maps-script') || window.google?.maps) {
      setIsScriptLoaded(true);
      setupAutocomplete();
      return;
    }

    scriptLoadingRef.current = true;
    
    const callbackName = `initGoogleMaps_${Date.now()}`;
    
    (window as any)[callbackName] = () => {
      setIsScriptLoaded(true);
      setupAutocomplete();
      delete (window as any)[callbackName];
    };
    
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      scriptLoadingRef.current = false;
      console.error('Failed to load Google Maps script');
    };
    script.onload = () => {
      scriptLoadingRef.current = false;
    };
    document.head.appendChild(script);
  };
  
  useEffect(() => {
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      setupAutocomplete();
      return;
    }
    
    loadGoogleMapsScript();
    
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
      scriptLoadingRef.current = false;
    };
  }, []);
  
  const setupAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places || autocompleteRef.current) return;
    
    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'ca' },
        fields: ['address_components', 'formatted_address']
      });
      
      autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
    } catch (error) {
      console.error('Error setting up autocomplete:', error);
    }
  };
  
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place?.address_components) {
      return;
    }
    
    const fullAddress = place.formatted_address;
    setAddressInput(fullAddress);
    
    let extractedPostalCode = '';
    for (const component of place.address_components as any[]) {
      if (component.types && component.types.includes('postal_code')) {
        extractedPostalCode = component.short_name || '';
        break;
      }
    }
    
    // Save to form store - assuming service area is valid for agent form
    setAddress(fullAddress, extractedPostalCode, true);
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    // For manual input, save without postal code
    setAddress(value, '', true);
  };

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (!state.sessionId) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsSaving(true);
        setSaveError(null);
        
        // Update the form store which will trigger auto-save
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setLastSaved(new Date());
      } catch (error) {
        setSaveError('Failed to save');
        console.error('Auto-save error:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state.personalInfo, state.services, totalBudget, notes, state.address, state.sessionId]);

  // Update notes in store when local notes change
  useEffect(() => {
    if (setNotes) {
      setNotes(notes);
    }
  }, [notes, setNotes]);

  // Email validation (kept for display purposes but not required)
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

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await submitAgentForm();
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit form:', error);
      setSaveError('Failed to submit form');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartNew = () => {
    setIsSubmitted(false);
    // Reset form state
    window.location.reload();
  };

  // No validation required - form can always be submitted
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
              The lead has been saved to the system and is ready for follow-up.
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
            <AutoSaveIndicator 
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={saveError}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                value={state.personalInfo.firstName}
                onChange={(e) => setPersonalInfo({ firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                value={state.personalInfo.lastName}
                onChange={(e) => setPersonalInfo({ lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={state.personalInfo.email}
                onChange={(e) => setPersonalInfo({ email: e.target.value })}
                placeholder="john.doe@example.com"
              />
              {state.personalInfo.email && !validateEmail(state.personalInfo.email) && (
                <p className="text-amber-500 text-sm mt-1">Email format doesn't look quite right</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={state.personalInfo.phone}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
              />
              {state.personalInfo.phone && phoneDigits.length > 0 && phoneDigits.length < 10 && (
                <p className="text-amber-500 text-sm mt-1">Phone number seems incomplete</p>
              )}
            </div>
          </div>

          {/* Address Field */}
          <div>
            <Label htmlFor="address">Property Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
              <Input
                ref={inputRef}
                id="address"
                value={addressInput}
                onChange={handleAddressInputChange}
                placeholder="Start typing address..."
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Start typing and select from dropdown for best results
            </p>
          </div>

          <div>
            <Label htmlFor="referral-source">How did they find us?</Label>
            <Select
              value={state.personalInfo.referralSource || ''}
              onValueChange={(value) => setPersonalInfo({ referralSource: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source (optional)" />
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

      {/* Calendar Booking */}
      <CalendarWidget 
        onMeetingBooked={(date, time) => {
          console.log('Meeting booked:', date, time);
        }}
      />

      {/* Submit Button - Always at the bottom */}
      <Card>
        <CardContent className="p-6">
          <Button 
            onClick={handleSubmit}
            disabled={isSaving}
            size="lg"
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Submit Lead'}
          </Button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            No fields are required - submit anytime to save the lead
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentForm; 