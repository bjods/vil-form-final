import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { validateBudget } from '../lib/validation';
import { getServiceById } from '../data/services';
import { formatCurrency } from '../lib/utils';

interface BudgetSectionProps {
  onValidationChange?: (isValid: boolean) => void;
}

const BudgetSection: React.FC<BudgetSectionProps> = ({ onValidationChange }) => {
  const { state, setBudget } = useFormStore();
  const { services: selectedServices, budgets } = state;
  
  useEffect(() => {
    // Check if all selected services have a budget > 0
    const isValid = validateBudget(state);
    
    console.log('BudgetSection - Budgets:', budgets);
    console.log('BudgetSection - Is valid:', isValid);
    onValidationChange?.(isValid);
  }, [selectedServices, budgets, onValidationChange]);
  
  return (
    <div className="space-y-6">
      {selectedServices.map(serviceId => {
        const service = getServiceById(serviceId);
        if (!service) return null;
        
        const budget = budgets[serviceId] || 0;
        
        return (
          <div key={serviceId} className="p-3 border border-gray-200 rounded-md animate-fade-in">
            <h3 className="text-base font-medium mb-2">{service.name} Budget</h3>
            
            <div>
              <Label htmlFor={`budget-${serviceId}`}>Estimated Budget</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  id={`budget-${serviceId}`}
                  type="number"
                  placeholder="0"
                  value={budget || ''}
                  onChange={(e) => setBudget(serviceId, Number(e.target.value))}
                  className="pl-7"
                />
              </div>
              
              {budget > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Your budget for {service.name} is {formatCurrency(budget)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetSection;