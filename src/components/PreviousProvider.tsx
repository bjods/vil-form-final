import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface PreviousProviderProps {
  onValidationChange?: (isValid: boolean) => void;
}

const PreviousProvider: React.FC<PreviousProviderProps> = ({ onValidationChange }) => {
  const { state, setPreviousProvider } = useFormStore();
  
  useEffect(() => {
    const isValid = (state.previousProvider?.trim().length || 0) > 0;
    onValidationChange?.(isValid);
  }, [state.previousProvider, onValidationChange]);
  
  return (
    <div className="space-y-4">
      <Label htmlFor="previous-provider" className="text-base">
        Tell us about your previous maintenance service provider:
      </Label>
      <Textarea
        id="previous-provider"
        placeholder="Who provided your services before? What did you like or dislike?"
        value={state.previousProvider || ''}
        onChange={(e) => setPreviousProvider(e.target.value)}
        className="min-h-[100px]"
      />
    </div>
  );
};

export default PreviousProvider;