import React, { useMemo } from 'react';
import { useFormStore } from '../store/formStore';
import CalendlyEmbed from './CalendlyEmbed';

const CALENDLY_URL = 'https://calendly.com/brad-cazno/discovery-call';

const CalendlyBooking: React.FC = () => {
  const { state, setMeetingBooked, submitForm } = useFormStore();
  const { personalInfo, formSubmitted, isSubmitting } = state;
  
  const handleEventScheduled = async () => {
    console.log('Meeting scheduled, marking as booked...');
    
    // First mark meeting as booked to trigger loading screen
    setMeetingBooked(true);
    
    // Then submit form if not already submitted
    if (!formSubmitted && !isSubmitting) {
      try {
        console.log('Submitting form...');
        await submitForm();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };
  
  const prefillData = useMemo(() => {
    const firstName = personalInfo.firstName || '';
    const lastName = personalInfo.lastName || '';
    const email = personalInfo.email || '';
    
    console.log('PersonalInfo for Calendly:', { firstName, lastName, email });
    
    return {
      name: `${firstName} ${lastName}`.trim(),
      email: email
    };
  }, [personalInfo]);

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