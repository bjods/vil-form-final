import React, { useState, useEffect, useMemo } from 'react';
import { useFormStore } from '../../store/formStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getServiceById } from '../../data/services';
import { supabase } from '../../lib/supabase';

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

  // Determine which services are selected
  const hasMaintenanceServices = state.services.some(serviceId => 
    ['lawn-maintenance', 'snow-management'].includes(serviceId)
  );
  
  const hasProjectServices = state.services.some(serviceId => 
    ['landscape-design-build', 'landscape-enhancement'].includes(serviceId)
  );

  // Memoize pages to prevent infinite re-renders
  const pages = useMemo(() => {
    const pageList = [];

    // Add maintenance details page if maintenance services are selected
    if (hasMaintenanceServices) {
      pageList.push({
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
      });
    }

    // Add project details page if project services are selected
    if (hasProjectServices) {
      pageList.push({
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
      });
    }

    // Always add booking page
    pageList.push({
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
    });

    return pageList;
  }, [hasMaintenanceServices, hasProjectServices]);

  // If no relevant services are selected, redirect to home
  useEffect(() => {
    if (!hasMaintenanceServices && !hasProjectServices) {
      navigate('/');
    }
  }, [hasMaintenanceServices, hasProjectServices, navigate]);

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
      // Update the follow-up form completion status in Supabase
      if (state.sessionId) {
        const { error } = await supabase
          .from('form_sessions')
          .update({
            follow_up_form_completed: true,
            meeting_scheduled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', state.sessionId);
          
        if (error) {
          console.error('Error updating follow-up form completion:', error);
          throw error;
        }
      }
      
      // Also call the regular submit form to update other fields
      await submitForm();
      
      // Navigate to thank you page
      setCurrentPage(pages.length); // This will show the thank you page
    } catch (error) {
      console.error('Error completing follow-up form:', error);
    }
  };

  // Listen for meeting booked event to trigger form completion
  useEffect(() => {
    if (state.meetingBooked && currentPage === pages.length - 1) {
      console.log('Meeting booked detected, completing follow-up form...');
      handleFormComplete();
    }
  }, [state.meetingBooked, currentPage]);

  // Thank you page
  if (currentPage >= pages.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <Card className="h-full flex flex-col">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thank You!
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                Your consultation has been scheduled successfully. We'll be in touch soon to discuss your {hasProjectServices && hasMaintenanceServices ? 'project and maintenance needs' : hasProjectServices ? 'project' : 'maintenance needs'}.
              </p>

              {!hasPhotos && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    Upload Property Photos
                  </h3>
                  <p className="text-orange-700 mb-4">
                    Help us prepare for your consultation by uploading photos of your property.
                  </p>
                  <Button
                    onClick={() => navigate(`/upload/${state.sessionId}`)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
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
      </div>
    );
  }

  // Show loading if no pages are available yet
  if (pages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <>
      <style>
        {`
          /* Custom date picker styling */
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.6) sepia(1) saturate(5) hue-rotate(35deg);
          }
          
          input[type="date"]:focus::-webkit-calendar-picker-indicator {
            filter: invert(0.4) sepia(1) saturate(5) hue-rotate(35deg);
          }
          
          /* Date picker popup styling - webkit browsers */
          input[type="date"]::-webkit-datetime-edit-fields-wrapper {
            color: #374151;
          }
          
          input[type="date"]::-webkit-datetime-edit-text {
            color: #6b7280;
          }
          
          input[type="date"]::-webkit-datetime-edit-month-field,
          input[type="date"]::-webkit-datetime-edit-day-field,
          input[type="date"]::-webkit-datetime-edit-year-field {
            color: #374151;
          }
          
          /* Focus styles for date inputs */
          input[type="date"]:focus {
            border-color: #d97706;
            box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-4 py-8">
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
                        ? 'bg-orange-500 text-white'
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
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>{currentPageData.title}</CardTitle>
              <CardDescription>{currentPageData.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-6">
              <div className="flex-1 overflow-y-auto px-1">
                <div className="pb-4 space-y-8">
                  {currentPageData.components.map((comp, index) => {
                    const Component = comp.component;
                    return (
                      <div key={comp.key}>
                        {comp.title && comp.title !== 'Book Your Meeting' && (
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
                </div>
              </div>
              
              {/* Navigation buttons */}
              {currentPage < pages.length - 1 && (
                <div className="flex-shrink-0 border-t border-gray-200 pt-4 mt-4 -mx-1">
                  <div className="flex justify-between">
                    {currentPage === 0 ? (
                      <div></div>
                    ) : (
                      <Button
                        onClick={handlePrevious}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                    )}

                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FollowUpForm; 