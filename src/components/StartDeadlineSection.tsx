import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { getServiceById } from '../data/services';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface StartDeadlineSectionProps {
  onValidationChange?: (isValid: boolean) => void;
}

const StartDeadlineSection: React.FC<StartDeadlineSectionProps> = ({ onValidationChange }) => {
  const { state, setStartDeadline } = useFormStore();
  const { services: selectedServices, startDeadlines } = state;
  
  useEffect(() => {
    const isValid = selectedServices.every(serviceId => {
      const dates = startDeadlines[serviceId] || {};
      return dates.startDate && dates.startDate.trim().length > 0;
    });
    
    console.log('StartDeadline - Dates:', startDeadlines);
    console.log('StartDeadline - Is valid:', isValid);
    onValidationChange?.(isValid);
  }, [selectedServices, startDeadlines, onValidationChange]);
  
  // Determine which services need deadline inputs
  const needsDeadline = (serviceId: string) => {
    const service = getServiceById(serviceId);
    return service?.category === 'projects' || serviceId === 'other';
  };
  
  return (
    <div className="space-y-6">
      {selectedServices.map(serviceId => {
        const service = getServiceById(serviceId);
        if (!service) return null;
        
        const dates = startDeadlines[serviceId] || { startDate: '', deadline: '' };
        const showDeadline = needsDeadline(serviceId);
        
        return (
          <div key={serviceId} className="p-4 border border-gray-200 rounded-md animate-fade-in">
            <h3 className="text-lg font-medium mb-3">{service.name} Timeline</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`start-date-${serviceId}`}>
                  Desired Start Date
                </Label>
                <Input
                  id={`start-date-${serviceId}`}
                  type="date"
                  value={dates.startDate}
                  onChange={(e) => setStartDeadline(serviceId, e.target.value, dates.deadline)}
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              {showDeadline && (
                <div>
                  <Label htmlFor={`deadline-${serviceId}`}>
                    Project Deadline (if applicable)
                  </Label>
                  <Input
                    id={`deadline-${serviceId}`}
                    type="date"
                    value={dates.deadline || ''}
                    onChange={(e) => setStartDeadline(serviceId, dates.startDate, e.target.value)}
                    className="mt-1"
                    min={dates.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StartDeadlineSection;