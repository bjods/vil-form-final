import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { CheckCircle2, Circle } from 'lucide-react';

interface PreviousQuotesProps {
  onValidationChange?: (isValid: boolean) => void;
}

const options = [
  {
    id: 'yes',
    title: 'Yes, I have other quotes',
    description: 'I\'ve received quotes from other companies'
  },
  {
    id: 'no',
    title: 'No, this is my first quote',
    description: 'I haven\'t received any other quotes yet'
  }
];

const PreviousQuotes: React.FC<PreviousQuotesProps> = ({ onValidationChange }) => {
  const { state, setPreviousQuotes } = useFormStore();
  
  useEffect(() => {
    const isValid = state.previousQuotes !== undefined;
    console.log('PreviousQuotes - Selection:', state.previousQuotes);
    console.log('PreviousQuotes - Is valid:', isValid);
    onValidationChange?.(isValid);
  }, [state.previousQuotes, onValidationChange]);
  
  const handleSelect = (value: string) => {
    setPreviousQuotes(value === 'yes');
  };
  
  return (
    <div className="space-y-4">
      {options.map((option) => {
        const isSelected = state.previousQuotes === (option.id === 'yes');
        
        return (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
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

export default PreviousQuotes;