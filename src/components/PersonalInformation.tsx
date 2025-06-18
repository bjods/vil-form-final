import React, { useEffect, useRef } from 'react';
import { useFormStore } from '../store/formStore';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import FileUpload from './FileUpload';

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

interface PersonalInformationProps {
  onValidationChange?: (isValid: boolean) => void;
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({ onValidationChange }) => {
  const { state, setPersonalInfo } = useFormStore();
  const { personalInfo } = state;
  
  // Refs for field navigation
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const referralSourceRef = useRef<HTMLButtonElement>(null);
  
  // Email validation regex
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (xxx) xxx-xxxx
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

  // Handle Enter key navigation between fields
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextRef: React.RefObject<any>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.focus();
      // For Select component, open the dropdown
      if (nextRef === referralSourceRef) {
        nextRef.current?.click();
      }
    }
  };
  
  useEffect(() => {
    const hasUploadOption = personalInfo.textUploadLink || (personalInfo.uploadedImages && personalInfo.uploadedImages.length > 0);
    const phoneDigits = personalInfo.phone.replace(/\D/g, '');
    const isValid = personalInfo.firstName.trim().length > 0 &&
      personalInfo.lastName.trim().length > 0 &&
      validateEmail(personalInfo.email) &&
      phoneDigits.length === 10 &&
      hasUploadOption;
    
    console.log('PersonalInfo - Fields:', {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      textUploadLink: personalInfo.textUploadLink,
      uploadedImages: personalInfo.uploadedImages
    });
    console.log('PersonalInfo - Is valid:', isValid);
    onValidationChange?.(isValid);
  }, [personalInfo.firstName, personalInfo.lastName, personalInfo.email, personalInfo.phone, 
      personalInfo.textUploadLink, personalInfo.uploadedImages, onValidationChange]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            ref={firstNameRef}
            value={personalInfo.firstName}
            onChange={(e) => setPersonalInfo({ firstName: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, lastNameRef)}
            placeholder="John"
            className="mt-1"
          />
          {state.errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{state.errors.firstName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            ref={lastNameRef}
            value={personalInfo.lastName}
            onChange={(e) => setPersonalInfo({ lastName: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, emailRef)}
            placeholder="Doe"
            className="mt-1"
          />
          {state.errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{state.errors.lastName}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          ref={emailRef}
          value={personalInfo.email}
          onChange={(e) => setPersonalInfo({ email: e.target.value })}
          onKeyDown={(e) => handleKeyDown(e, phoneRef)}
          placeholder="john.doe@example.com"
          className="mt-1"
        />
        {state.errors.email && (
          <p className="text-red-500 text-sm mt-1">{state.errors.email}</p>
        )}
        {personalInfo.email && !validateEmail(personalInfo.email) && (
          <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          ref={phoneRef}
          value={personalInfo.phone}
          onChange={handlePhoneChange}
          onKeyDown={(e) => handleKeyDown(e, referralSourceRef)}
          placeholder="(555) 123-4567"
          className="mt-1"
        />
        {state.errors.phone && (
          <p className="text-red-500 text-sm mt-1">{state.errors.phone}</p>
        )}
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
          <SelectTrigger id="referral-source" ref={referralSourceRef} className="mt-1">
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
      
      <div className="flex items-start space-x-2 pt-2">
        <Checkbox
          id="text-upload-link"
          checked={personalInfo.textUploadLink}
          onCheckedChange={(checked) => {
            setPersonalInfo({ textUploadLink: !!checked });
          }}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="text-upload-link"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Text me a link to upload photos/files
          </Label>
          <p className="text-sm text-gray-500">
            We'll send a text message with a link to upload photos or documents related to your project.
          </p>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-500 bg-white">OR</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label>Upload Property Photos</Label>
        <FileUpload
          onUpload={(urls) => {
            setPersonalInfo({
              uploadedImages: [...(personalInfo.uploadedImages || []), ...urls]
            });
          }}
          maxFiles={10}
          maxSize={10 * 1024 * 1024}
        />
        <p className="text-sm text-gray-500">
          Add photos of your property to help us provide an accurate quote
        </p>
      </div>
      
      <p className="text-sm text-gray-500 pt-2">
        Your information will only be used to contact you regarding this inquiry.
      </p>
    </div>
  );
};

export default PersonalInformation;