import React from 'react';
import { Loader2 } from 'lucide-react';
import FormCard from './FormCard';

const SubmissionLoading: React.FC = () => {
  return (
    <FormCard
      title="Processing Your Request"
      description="Please wait while we submit your information..."
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Finalizing your consultation booking...
          </p>
          <p className="text-sm text-gray-600">
            This will only take a moment
          </p>
        </div>
      </div>
    </FormCard>
  );
};

export default SubmissionLoading;