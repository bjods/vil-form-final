import React, { useEffect, useMemo } from 'react';
import { useFormStore } from '../store/formStore';
import CalendlyEmbed from './CalendlyEmbed';

const CALENDLY_URL = 'https://calendly.com/brad-cazno/discovery-call';

const CalendlyBooking: React.FC = () => {
  const { state, setMeetingBooked, submitForm } = useFormStore();
  const { personalInfo, formSubmitted } = state;
  
  const handleEventScheduled = async () => {
    try {
      console.log('Meeting scheduled, attempting form submission...');

      // Submit form if not already submitted
      if (!formSubmitted) {
        const success = await submitForm();
        console.log('Form submission result:', success);
      }
      
      // Force state update with a slight delay to ensure proper rendering
      setTimeout(() => {
        console.log('Setting meeting booked to true');
        setMeetingBooked(true);
      }, 100);

    } catch (error) {
      console.error('Error handling meeting booking:', error);
      setMeetingBooked(true);
    }
  };
  
  const prefillData = useMemo(() => ({
    name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
    email: personalInfo.email
  }), [personalInfo]);

  return (
    <div className="w-full h-full">
      <CalendlyEmbed
        url={CALENDLY_URL}
        prefill={prefillData}
        onEventScheduled={handleEventScheduled}
      />
    </div>
  );
};

export default CalendlyBooking;