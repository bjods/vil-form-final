import React, { useState, useEffect } from 'react';
import { useFormStore } from '../../store/formStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

// Import existing components
import PreviousProvider from '../PreviousProvider';
import PriceVsLongTerm from '../PriceVsLongTerm';
import ProjectSuccessCriteria from '../ProjectSuccessCriteria';
import PreviousQuotes from '../PreviousQuotes';
import CalendlyBooking from '../CalendlyBooking';

interface FollowUpFormProps {
  sessionId?: string;
}

const FollowUpForm: React.FC<FollowUpFormProps> = ({ sessionId }) => {
  const { state, submitForm } = useFormStore();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [validationStates, setValidationStates] = useState<Record<string, boolean>>({});

  // Check if user has photos uploaded
  const hasPhotos = state.personalInfo.uploadedImages.length > 0;

  const pages = [
    {
      id: 'maintenance-details',
      title: 'Maintenance Details',
      description: 'Tell us about your maintenance service preferences',
      components: [
        {
          title: 'Previous Provider Experience',
          component: PreviousProvider,
          key: 'previousProvider'
        },
        {
          title: 'Service Preferences',
          component: PriceVsLongTerm,
          key: 'priceVsLongTerm'
        }
      ]
    },
    {
      id: 'project-details',
      title: 'Project Details',
      description: 'Help us understand your project goals and requirements',
      components: [
        {
          title: 'Success Criteria',
          component: ProjectSuccessCriteria,
          key: 'projectSuccessCriteria'
        },
        {
          title: 'Previous Quotes',
          component: PreviousQuotes,
          key: 'previousQuotes'
        }
      ]
    },
    {
      id: 'booking',
      title: 'Schedule Your Consultation',
      description: 'Choose a time that works best for you',
      components: [
        {
          title: 'Book Your Meeting',
          component: CalendlyBooking,
          key: 'booking'
        }
      ]
    }
  ];

  const handleValidationChange = (pageIndex: number, componentKey: string, isValid: boolean) => {
    setValidationStates(prev => ({
      ...prev,
      [`${pageIndex}-${componentKey}`]: isValid
    }));
  };

  const isPageValid = (pageIndex: number) => {
    const page = pages[pageIndex];
    return page.components.every(comp => 
      validationStates[`${pageIndex}-${comp.key}`] === true
    );
  };

  const canProceed = () => {
    return isPageValid(currentPage);
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFormComplete = async () => {
    try {
      await submitForm();
      // Navigate to thank you page
      setCurrentPage(pages.length); // This will show the thank you page
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Listen for meeting booked event to trigger form completion
  useEffect(() => {
    if (state.meetingBooked && currentPage === pages.length - 1) {
      handleFormComplete();
    }
  }, [state.meetingBooked, currentPage]);

  // Thank you page
  if (currentPage >= pages.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You!
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Your consultation has been scheduled successfully. We'll be in touch soon to discuss your project.
            </p>

            {!hasPhotos && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Upload Property Photos
                </h3>
                <p className="text-yellow-700 mb-4">
                  Help us prepare for your consultation by uploading photos of your property.
                </p>
                <Button
                  onClick={() => navigate(`/upload/${state.sessionId}`)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Upload Photos
                </Button>
              </div>
            )}

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="mt-4"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`flex items-center ${index < pages.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentPage
                      ? 'bg-green-500 text-white'
                      : index === currentPage
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentPage ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < pages.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      index < currentPage ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-sm font-medium text-gray-500">
              Step {currentPage + 1} of {pages.length}
            </h2>
          </div>
        </div>

        {/* Current page content */}
        <Card>
          <CardHeader>
            <CardTitle>{currentPageData.title}</CardTitle>
            <CardDescription>{currentPageData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {currentPageData.components.map((comp, index) => {
              const Component = comp.component;
              return (
                <div key={comp.key}>
                  {comp.title && (
                    <h3 className="text-lg font-semibold mb-4">{comp.title}</h3>
                  )}
                  <Component
                    onValidationChange={(isValid: boolean) =>
                      handleValidationChange(currentPage, comp.key, isValid)
                    }
                  />
                  {index < currentPageData.components.length - 1 && (
                    <div className="border-t border-gray-200 my-8" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        {currentPage < pages.length - 1 && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentPage === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpForm; 