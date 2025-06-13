import React, { useState, useEffect } from 'react';
import { useFormStore } from '../../store/formStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { CheckCircle2, Circle, Save, User, DollarSign, FileText, Calendar, Phone } from 'lucide-react';
import { services } from '../../data/services';
import CalendlyBooking from '../CalendlyBooking';
import { AutoSaveIndicator } from '../shared/AutoSaveIndicator';

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
  const { state, setPersonalInfo, setServices, setBudget, setNotes, submitForm, initializeSession } = useFormStore();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [notes, setNotesLocal] = useState('');

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
  }, [state.personalInfo, state.services, totalBudget, notes, state.sessionId]);

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

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await submitForm();
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

  // Validation
  const phoneDigits = state.personalInfo.phone.replace(/\D/g, '');
  const isValid = !!(
    state.personalInfo.firstName &&
    state.personalInfo.lastName &&
    validateEmail(state.personalInfo.email) &&
    phoneDigits.length === 10 &&
    state.services.length > 0 &&
    totalBudget > 0
  );

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
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
              <Button onClick={handleStartNew} size="lg" className="w-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
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
                  <p className="text-red-500 text-sm mt-1">Phone number must be 10 digits</p>
                )}
              </div>

              <div>
                <Label htmlFor="referral-source">How did they find us?</Label>
                <Select
                  value={state.personalInfo.referralSource || ''}
                  onValueChange={(value) => setPersonalInfo({ referralSource: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
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
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">Select Services</Label>
                <div className="grid grid-cols-1 gap-3">
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
                <Label htmlFor="budget">Total Budget</Label>
                <div className="relative">
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

          {/* Submit Button */}
          <Card>
            <CardContent className="p-6">
              <Button 
                onClick={handleSubmit}
                disabled={!isValid || isSaving}
                size="lg"
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Submit Lead'}
              </Button>
              {!isValid && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Please fill in all required fields to submit
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Calendly */}
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Discovery Call
              </CardTitle>
              <CardDescription>
                Book a consultation call for this lead
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendlyBooking />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentForm; 