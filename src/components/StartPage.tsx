import React from 'react';
import { useFormStore } from '../store/formStore';
import { Button } from './ui/button';
import FormCard from './FormCard';

interface StartPageProps {
  onStart: () => void;
}

const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  const { initializeSession } = useFormStore();
  
  const handleStart = async () => {
    await initializeSession();
    onStart();
  };
  
  return (
    <FormCard>
      <div className="h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-6">
          Book a Free Consultation
        </h1>
        
        <p className="text-gray-600 max-w-md mb-8">
          This form will help us understand your project and provide the best service possible.
        </p>
        
        <Button onClick={handleStart} size="lg" className="text-lg font-medium">
          Get Started
        </Button>
      </div>
    </FormCard>
  );
};

export default StartPage;