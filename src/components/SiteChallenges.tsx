import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface SiteChallengesProps {
  onValidationChange?: (isValid: boolean) => void;
}

const SiteChallenges: React.FC<SiteChallengesProps> = ({ onValidationChange }) => {
  const { state, setSiteChallenges } = useFormStore();
  
  useEffect(() => {
    const isValid = state.siteChallenges?.trim().length > 0;
    console.log('SiteChallenges - Text length:', state.siteChallenges?.length);
    console.log('SiteChallenges - Is valid:', isValid);
    onValidationChange?.(isValid);
  }, [state.siteChallenges, onValidationChange]);
  
  return (
    <div className="space-y-4">
      <Label htmlFor="site-challenges" className="text-base">
        List any specific site challenges:
      </Label>
      <Textarea
        id="site-challenges"
        placeholder="Dog, steep hill, muddy area, etc."
        value={state.siteChallenges || ''}
        onChange={(e) => setSiteChallenges(e.target.value)}
        className="min-h-[100px]"
      />
      <p className="text-sm text-gray-500">
        Let us know about any obstacles or unique aspects of your property that may affect service.
      </p>
    </div>
  );
};

export default SiteChallenges;