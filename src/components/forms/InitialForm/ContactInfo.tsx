import React from 'react'
import { FormField } from '../../shared/FormField'
import { InitialFormData } from '../../../types/forms'

interface ContactInfoProps {
  data: InitialFormData
  onChange: (field: keyof InitialFormData, value: any) => void
  sessionId?: string
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  data,
  onChange,
  sessionId
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h2>
        <p className="text-gray-600 mb-6">
          Let us know how to reach you for your free quote.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          name="first_name"
          value={data.first_name}
          onChange={(value) => onChange('first_name', value)}
          required
          sessionId={sessionId}
          placeholder="Enter your first name"
        />
        
        <FormField
          label="Last Name"
          name="last_name"
          value={data.last_name}
          onChange={(value) => onChange('last_name', value)}
          required
          sessionId={sessionId}
          placeholder="Enter your last name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={data.email}
          onChange={(value) => onChange('email', value)}
          required
          sessionId={sessionId}
          placeholder="your.email@example.com"
        />
        
        <FormField
          label="Phone Number"
          name="phone"
          type="tel"
          value={data.phone}
          onChange={(value) => onChange('phone', value)}
          required
          sessionId={sessionId}
          placeholder="(555) 123-4567"
        />
      </div>

      <FormField
        label="Property Address"
        name="address"
        value={data.address}
        onChange={(value) => onChange('address', value)}
        sessionId={sessionId}
        placeholder="123 Main Street, City, Province"
        description="Where will the work be performed?"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Postal Code"
          name="postal_code"
          value={data.postal_code}
          onChange={(value) => onChange('postal_code', value)}
          sessionId={sessionId}
          placeholder="A1A 1A1"
        />
      </div>
    </div>
  )
} 