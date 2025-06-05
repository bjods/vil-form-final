import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import FormCard from './FormCard';

const UploadComplete: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <FormCard
        title="Upload Complete"
        description="Your photos have been submitted successfully"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
          </div>
          
          <p className="text-lg text-gray-600">
            Thank you for uploading your property photos. Our team will review them along with your submission.
          </p>
          
          <p className="text-sm text-gray-500">
            You can now close this window.
          </p>
        </div>
      </FormCard>
    </div>
  );
};

export default UploadComplete;