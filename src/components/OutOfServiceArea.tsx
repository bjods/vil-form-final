import React from 'react';
import { useFormStore } from '../store/formStore';
import { Button } from './ui/button';
import { ArrowLeft, MapPin, Hammer, Scissors } from 'lucide-react';

const OutOfServiceArea: React.FC = () => {
  const { setStep } = useFormStore();
  
  const handleBack = () => {
    setStep(1); // Go back to address collection
  };
  
  return (
    <div className="text-center space-y-8">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <MapPin className="w-8 h-8 text-amber-600" />
      </div>
      
      <h2 className="text-2xl font-bold">Outside Maintenance Service Area</h2>
      
      <p className="text-gray-600 max-w-lg mx-auto">
        Your location is outside our maintenance service area. We maintain a focused service area for regular maintenance to ensure consistent, high-quality service.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div className="p-6 bg-amber-50 rounded-lg text-left">
          <div className="flex items-center gap-3 mb-4">
            <Scissors className="w-6 h-6 text-amber-600" />
            <h3 className="font-semibold">Maintenance Services</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Available only in select areas to maintain service quality:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Lawn maintenance</li>
            <li>• Snow removal</li>
            <li>• Regular property care</li>
          </ul>
        </div>
        
        <div className="p-6 bg-green-50 rounded-lg text-left">
          <div className="flex items-center gap-3 mb-4">
            <Hammer className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold">Project Services</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Available in a much wider area:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Landscape design & build</li>
            <li>• Property enhancements</li>
            <li>• One-time projects</li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Try a Different Address
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          Consider our project services or try an address within our maintenance service area.
        </p>
      </div>
    </div>
  );
};

export default OutOfServiceArea;