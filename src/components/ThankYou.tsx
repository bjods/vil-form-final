import React from 'react';
import { CheckCircle2, Copy, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import FormCard from './FormCard';
import { useFormStore } from '../store/formStore';
import { useState } from 'react';

interface ThankYouProps {
  onStartOver: () => void;
}

const ThankYou: React.FC<ThankYouProps> = ({ onStartOver }) => {
  const { state } = useFormStore();
  const [showCopied, setShowCopied] = useState(false);
  
  const handleCopyLink = () => {
    const link = `${window.location.origin}/upload/${state.sessionId}`;
    navigator.clipboard.writeText(link);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <FormCard
      title="Thank You!"
      description="Your consultation has been scheduled successfully."
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        
        <div className="space-y-4">
          <p className="text-lg text-gray-600">
            We've sent you an email with:
          </p>
          <ul className="text-gray-600 space-y-2">
            <li>• Meeting details and calendar invite</li>
            <li>• Next steps and what to expect</li>
            <li>• Information to help you prepare</li>
          </ul>
        </div>
        
        {state.personalInfo.textUploadLink && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              📸 Upload Your Photos
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              You requested a link to upload property photos. You can upload them now or use this link later:
            </p>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/upload/${state.sessionId}`}
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {showCopied ? (
                  'Copied!'
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              This link has been texted to {state.personalInfo.phone}
            </p>
            <a
              href={`/upload/${state.sessionId}`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Upload photos now <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        )}
        
        <div className="pt-6">
          <Button 
            onClick={onStartOver}
            size="lg"
          >
            Start New Form
          </Button>
        </div>
      </div>
    </FormCard>
  );
};

export default ThankYou;