import React, { useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ProjectScopeProps {
  onValidationChange?: (isValid: boolean) => void;
}

const ProjectScope: React.FC<ProjectScopeProps> = ({ onValidationChange }) => {
  const { state, setProjectScope } = useFormStore();
  
  useEffect(() => {
    const isValid = state.projectScope.trim().length > 0;
    console.log('ProjectScope - Text length:', state.projectScope.length);
    console.log('ProjectScope - Is valid:', isValid);
    onValidationChange?.(isValid);
  }, [state.projectScope, onValidationChange]);
  
  return (
    <div className="space-y-4">
      <Label htmlFor="project-scope" className="text-base">
        Describe the scope of your project:
      </Label>
      <Textarea
        id="project-scope"
        placeholder="I want a patio with an outdoor kitchen and a new garden..."
        value={state.projectScope}
        onChange={(e) => setProjectScope(e.target.value)}
        className="min-h-[120px]"
      />
      <p className="text-sm text-gray-500">
        Please provide details about what you're looking to achieve with this project.
        The more information you provide, the better we can understand your needs.
      </p>
    </div>
  );
};

export default ProjectScope;