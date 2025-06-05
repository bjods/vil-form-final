import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { CheckCircle2, Circle } from 'lucide-react';

interface PriceVsLongTermProps {
  onValidationChange?: (isValid: boolean) => void;
}

const options = [
  {
    id: 'price',
    title: 'Most Affordable Option',
    description: 'I\'m looking for the best price and value for my budget'
  },
  {
    id: 'long-term',
    title: 'Quality Long-term Service',
    description: 'I want a reliable, high-quality service partner for the long run'
  }
];

const PriceVsLongTerm: React.FC<PriceVsLongTermProps> = ({ onValidationChange }) => {
  const { state, setPriceVsLongTerm } = useFormStore();
  
  useEffect(() => {
    const isValid = state.priceVsLongTerm !== undefined;
    console.log('PriceVsLongTerm - Selection:', state.priceVsLongTerm);
    console.log('PriceVsLongTerm - Is valid:', isValid);
    onValidationChange?.(isValid);
  }, [state.priceVsLongTerm, onValidationChange]);
  
  return (
    <div className="space-y-4">
      {options.map((option) => {
        const isSelected = state.priceVsLongTerm === option.id;
        
        return (
          <div
            key={option.id}
            onClick={() => setPriceVsLongTerm(option.id as 'price' | 'long-term')}
            className={`
              relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'border-yellow-400 bg-yellow-50' 
                : 'border-gray-200 hover:border-yellow-200'}
            `}
          >
            <div className="absolute top-4 right-4">
              {isSelected ? (
                <CheckCircle2 className="w-6 h-6 text-yellow-500" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300" />
              )}
            </div>
            
            <div className="pr-8">
              <h3 className="text-lg font-semibold mb-1">{option.title}</h3>
              <p className="text-gray-600">{option.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceVsLongTerm;