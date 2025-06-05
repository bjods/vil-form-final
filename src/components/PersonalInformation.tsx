import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import FileUpload from './FileUpload';
import { Copy } from 'lucide-react';
import { useState } from 'react';

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

interface PersonalInformationProps {
  onValidationChange?: (isValid: boolean) => void;
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({ onValidationChange }) => {
  const { state, setPersonalInfo } = useFormStore();
  const { personalInfo } = state;
  
  useEffect(() => {
    const hasUploadOption = personalInfo.textUploadLink || (personalInfo.uploadedImages && personalInfo.uploadedImages.length > 0);
    const isValid = personalInfo.firstName.trim().length > 0 &&
      personalInfo.lastName.trim().length > 0 &&
      personalInfo.email.trim().length > 0 &&
      personalInfo.phone.trim().length > 0 &&
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
            value={personalInfo.firstName}
            onChange={(e) => setPersonalInfo({ firstName: e.target.value })}
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
            value={personalInfo.lastName}
            onChange={(e) => setPersonalInfo({ lastName: e.target.value })}
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
          value={personalInfo.email}
          onChange={(e) => setPersonalInfo({ email: e.target.value })}
          className="mt-1"
        />
        {state.errors.email && (
          <p className="text-red-500 text-sm mt-1">{state.errors.email}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={personalInfo.phone}
          onChange={(e) => setPersonalInfo({ phone: e.target.value })}
          className="mt-1"
        />
        {state.errors.phone && (
          <p className="text-red-500 text-sm mt-1">{state.errors.phone}</p>
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