import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ProjectSuccessCriteriaProps {
  onValidationChange?: (isValid: boolean) => void;
}

const ProjectSuccessCriteria: React.FC<ProjectSuccessCriteriaProps> = ({ onValidationChange }) => {
  const { state, setProjectSuccessCriteria } = useFormStore();
  
  useEffect(() => {
    const isValid = (state.projectSuccessCriteria?.trim().length || 0) > 0;
    onValidationChange?.(isValid);
  }, [state.projectSuccessCriteria, onValidationChange]);
  
  return (
    <div className="space-y-4">
      <Label htmlFor="success-criteria" className="text-base">
        What would make this project a success?
      </Label>
      <Textarea
        id="success-criteria"
        placeholder="Describe your goals and what a successful outcome looks like"
        value={state.projectSuccessCriteria || ''}
        onChange={(e) => setProjectSuccessCriteria(e.target.value)}
        className="min-h-[120px]"
      />
    </div>
  );
};

export default ProjectSuccessCriteria;