import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { getServiceById } from '../data/services';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ServiceDetailsSectionProps {
  onValidationChange?: (isValid: boolean) => void;
}

const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = ({ onValidationChange }) => {
  const { state, setServiceDetails } = useFormStore();
  const { services: selectedServices, serviceDetails } = state;
  
  useEffect(() => {
    // Validate that each service has at least one option selected
    const isValid = selectedServices.every(serviceId => {
      const details = serviceDetails[serviceId];
      if (!details) return false;
      
      // For array-based selections (checkboxes)
      if (Array.isArray(details)) {
        return details.length > 0;
      }
      
      // For single value selections (radio, select)
      return !!details;
    });
    
    console.log('ServiceDetails - Details:', serviceDetails);
    console.log('ServiceDetails - Is valid:', isValid);
    onValidationChange?.(isValid);
  }, [selectedServices, serviceDetails, onValidationChange]);

  const handleCheckboxChange = (serviceId: string, option: string) => {
    const currentDetails = serviceDetails[serviceId] || [];
    
    if (Array.isArray(currentDetails)) {
      if (currentDetails.includes(option)) {
        setServiceDetails(
          serviceId, 
          currentDetails.filter(item => item !== option)
        );
      } else {
        setServiceDetails(serviceId, [...currentDetails, option]);
      }
    } else {
      setServiceDetails(serviceId, [option]);
    }
  };
  
  const handleRadioChange = (serviceId: string, value: string) => {
    setServiceDetails(serviceId, value);
  };
  
  const handleSelectChange = (serviceId: string, value: string) => {
    setServiceDetails(serviceId, value);
  };
  
  return (
    <div className="space-y-6">
      {selectedServices.map(serviceId => {
        const service = getServiceById(serviceId);
        if (!service) return null;
        
        let content;
        
        switch (serviceId) {
          case 'landscape-design-build':
            content = (
              <div className="space-y-3">
                <Label className="block mb-2">Select design elements (select all that apply):</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {service.options?.elements.map(element => {
                    const currentDetails = serviceDetails[serviceId] || [];
                    const isChecked = Array.isArray(currentDetails) && currentDetails.includes(element);
                    
                    return (
                      <div key={element} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`element-${element}`}
                          checked={isChecked}
                          onCheckedChange={() => handleCheckboxChange(serviceId, element)}
                        />
                        <Label 
                          htmlFor={`element-${element}`}
                          className="text-sm cursor-pointer"
                        >
                          {element}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            break;
            
          case 'landscape-enhancement':
            content = (
              <div className="space-y-3">
                <Label className="block mb-2">Select enhancement types (select all that apply):</Label>
                <div className="grid grid-cols-2 gap-2">
                  {service.options?.types.map(type => {
                    const currentDetails = serviceDetails[serviceId] || [];
                    const isChecked = Array.isArray(currentDetails) && currentDetails.includes(type);
                    
                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`}
                          checked={isChecked}
                          onCheckedChange={() => handleCheckboxChange(serviceId, type)}
                        />
                        <Label 
                          htmlFor={`type-${type}`}
                          className="text-sm cursor-pointer"
                        >
                          {type}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            break;
            
          case 'lawn-maintenance':
            content = (
              <div className="space-y-3">
                <Label className="block mb-2">Select service type:</Label>
                <RadioGroup 
                  value={serviceDetails[serviceId] || ''}
                  onValueChange={(value) => handleRadioChange(serviceId, value)}
                >
                  {service.options?.types.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`type-${type}`} />
                      <Label 
                        htmlFor={`type-${type}`}
                        className="text-sm cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            );
            break;
            
          case 'snow-management':
            content = (
              <div className="space-y-3">
                <Label htmlFor={`property-size-${serviceId}`} className="block mb-2">
                  Select property size:
                </Label>
                <Select
                  value={serviceDetails[serviceId] || ''}
                  onValueChange={(value) => handleSelectChange(serviceId, value)}
                >
                  <SelectTrigger id={`property-size-${serviceId}`}>
                    <SelectValue placeholder="Select property size" />
                  </SelectTrigger>
                  <SelectContent>
                    {service.options?.propertySizes.map(size => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
            break;
            
          case 'other':
            // No specific details for "Other" service
            content = null;
            break;
            
          default:
            content = null;
        }
        
        if (!content) return null;
        
        return (
          <div key={serviceId} className="p-4 border border-gray-200 rounded-md animate-fade-in">
            <h3 className="text-lg font-medium mb-3">{service.name} Details</h3>
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default ServiceDetailsSection;