import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormStore } from '../../store/formStore';
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
import CalendarWidget from '../CalendarWidget';
import FileUpload from '../FileUpload';

// Interface for form pages
interface FormPage {
  id: string;
  title: string;
  components: {
    title: string;
    component: React.ComponentType<any>;
    key: string;
  }[];
}

const FollowUpForm: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { state, submitForm, setMeetingBooked, setPersonalInfo, initializeSession } = useFormStore();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [validationStates, setValidationStates] = useState<Record<string, boolean>>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialHasPhotos, setInitialHasPhotos] = useState<boolean | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        console.error('No session ID provided to FollowUpForm');
        navigate('/');
        return;
      }

      try {
        console.log('Loading session:', sessionId);
        await initializeSession(sessionId);
        console.log('Session loaded successfully');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load session:', error);
        navigate('/');
      }
    };

    loadSession();
  }, [sessionId, initializeSession, navigate]);

  // Reset meeting booked status when follow-up form loads
  useEffect(() => {
    if (state.meetingBooked) {
      console.log('Resetting meetingBooked to false for follow-up form');
      setMeetingBooked(false);
    }
  }, [state.meetingBooked, setMeetingBooked]);

  // Check if user has photos uploaded
  const hasPhotos = state.personalInfo.uploadedImages.length > 0;

  // Set initial photos state once when session is loaded
  useEffect(() => {
    if (!isLoading && initialHasPhotos === null) {
      setInitialHasPhotos(hasPhotos);
      console.log('Initial photos state set:', hasPhotos);
    }
  }, [isLoading, hasPhotos, initialHasPhotos]);

  // Determine which services are selected - BULLETPROOF detection for Gravity Forms
  const hasMaintenanceServices = useMemo(() => {
    return state.services.some(service => {
      // Handle both service IDs and display names from Gravity Forms
      const maintenanceIds = ['lawn-maintenance', 'snow-management', 'garden-maintenance', 'irrigation-maintenance'];
      const maintenanceNames = [
        'Lawn Maintenance Program', 
        'Routine Lawn Maintenance', 
        'Lawn Maintenance',
        'Snow & Ice Management', 
        'Snow Management',
        'Garden & Bed Maintenance',
        'Irrigation Maintenance'
      ];
      
      // Also check for partial matches (case-insensitive)
      const serviceLower = service.toLowerCase();
      const maintenanceKeywords = ['maintenance', 'snow', 'ice', 'garden', 'bed'];
      
      return maintenanceIds.includes(service) || 
             maintenanceNames.includes(service) ||
             maintenanceKeywords.some(keyword => serviceLower.includes(keyword));
    });
  }, [state.services]);
  
  const hasProjectServices = useMemo(() => {
    return state.services.some(service => {
      // Handle both service IDs and display names from Gravity Forms
      const projectIds = [
        'landscape-design-build', 
        'landscape-enhancement', 
        'lawn-renovation', 
        'outdoor-lighting', 
        'irrigation-install'
      ];
      const projectNames = [
        'Landscape Design & Build',
        'Landscape Enhancement', 
        'Lawn Renovation & Installation',
        'Outdoor Lighting',
        'Irrigation System Installation'
      ];
      
      // Also check for partial matches (case-insensitive)
      const serviceLower = service.toLowerCase();
      const projectKeywords = [
        'design', 'build', 'enhancement', 'renovation', 'lighting', 
        'irrigation', 'install', 'landscape', 'outdoor', 'patio', 
        'walkway', 'retaining', 'kitchen', 'fire', 'water', 'pergola'
      ];
      
      return projectIds.includes(service) || 
             projectNames.includes(service) ||
             projectKeywords.some(keyword => serviceLower.includes(keyword));
    });
  }, [state.services]);

  // Photo Upload Component
  const PhotoUploadComponent: React.FC<{ onValidationChange: (isValid: boolean) => void }> = ({ onValidationChange }) => {
    const { state: formState, setPersonalInfo } = useFormStore();
    
    const handleUpload = async (urls: string[]) => {
      console.log('Photos uploaded:', urls);
      // Append new URLs to existing ones
      const existingImages = formState.personalInfo.uploadedImages || [];
      const combinedImages = [...existingImages, ...urls];
      
      // Update the form store with the combined photo URLs
      setPersonalInfo({ uploadedImages: combinedImages });
      
      // Update validation - photos are optional, so always valid
      onValidationChange(true);
      
      // Also update the session in the database immediately
      if (formState.sessionId) {
        try {
          await supabase
            .from('form_sessions')
            .update({
              photo_urls: combinedImages,
              photos_uploaded: combinedImages.length > 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', formState.sessionId);
          console.log('Photos updated in database');
        } catch (error) {
          console.error('Error updating photos in database:', error);
        }
      }
    };

    // Photos are optional, so always mark as valid
    useEffect(() => {
      onValidationChange(true);
    }, [onValidationChange]);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Property Photos</h3>
          <p className="text-gray-600 mb-4">
            Upload photos of your property to help us prepare for your consultation.
          </p>
        </div>
        <FileUpload
          onUpload={handleUpload}
          maxFiles={10}
        />
      </div>
    );
  };

  // Generate pages based on services - ORIGINAL 4-PAGE STRUCTURE
  const pages = useMemo(() => {
    const pageList: FormPage[] = [];
    
    console.log('Generating pages...', { 
      hasMaintenanceServices, 
      hasProjectServices, 
      hasPhotos,
      servicesCount: state.services.length,
      services: state.services 
    });

    // Add photo upload page if user doesn't have photos (use initial state to prevent page from disappearing)
    if (!initialHasPhotos) {
      pageList.push({
        id: 'photo-upload',
        title: 'Property Photos',
        components: [
          {
            title: 'Upload Photos',
            component: PhotoUploadComponent,
            key: 'photoUpload'
          }
        ]
      });
    }

    // Add maintenance details page if maintenance services are selected
    if (hasMaintenanceServices) {
      pageList.push({
        id: 'maintenance-details',
        title: 'Maintenance Details',
        components: [
          {
            title: 'Previous Provider',
            component: PreviousProvider,
            key: 'previousProvider'
          },
          {
            title: 'Service Preference',
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

    // Always add booking page - this is essential
    pageList.push({
      id: 'booking',
      title: 'Schedule Consultation',
      components: [
        {
          title: '',
          component: CalendarWidget,
          key: 'booking'
        }
      ]
    });

    console.log('Pages generated:', pageList.map(p => p.id));

    return pageList;
  }, [hasMaintenanceServices, hasProjectServices, initialHasPhotos, state.services]);

  // Validate services and provide helpful feedback - NO REDIRECTS
  useEffect(() => {
    console.log('🔍 FollowUpForm: Checking services...', {
      services: state.services,
      hasMaintenanceServices,
      hasProjectServices
    });
    
    // Only show error if we have services but none are valid
    if (state.services.length > 0 && !hasMaintenanceServices && !hasProjectServices) {
      console.warn('⚠️ FollowUpForm: Services detected but none are recognized:', state.services);
      // Don't redirect - just log for debugging
    } else if (hasMaintenanceServices || hasProjectServices) {
      console.log('✅ FollowUpForm: Valid services found, proceeding with form');
    } else {
      console.log('🔄 FollowUpForm: No services loaded yet or empty services array');
    }
  }, [hasMaintenanceServices, hasProjectServices, state.services]);

  const handleValidationChange = (pageIndex: number, componentKey: string, isValid: boolean) => {
    setValidationStates(prev => ({
      ...prev,
      [`${pageIndex}-${componentKey}`]: isValid
    }));
  };

  const isPageValid = (pageIndex: number) => {
    const page = pages[pageIndex];
    
    // Special handling for booking page - always allow proceeding since Calendly handles its own validation
    if (page.id === 'booking') {
      return true;
    }
    
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

        // Cancel the follow-up email sequence
        try {
          const { data, error: cancelError } = await supabase.functions.invoke('cancel-follow-up-sequence', {
            body: { session_id: state.sessionId }
          });
          
          if (cancelError) {
            console.error('Error cancelling follow-up sequence:', cancelError);
          } else {
            console.log('Follow-up email sequence cancelled successfully');
          }
        } catch (cancelError) {
          console.error('Failed to cancel follow-up sequence:', cancelError);
          // Don't fail the entire process if this fails
        }
      }
      
      // Also call the regular submit form to update other fields
      await submitForm();
      
      // Navigate to thank you page
      setShowThankYou(true);
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

  // Show loading if session is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  // Thank you page - only show when meeting is booked and form is completed
  if (showThankYou) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
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
                Your consultation has been scheduled. We'll be in touch soon.
              </p>

              {!hasPhotos && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    Upload Property Photos
                  </h3>
                  <p className="text-orange-700 mb-4">
                    Help us prepare for your consultation.
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
                onClick={() => window.location.href = 'https://villandscaping.ca'}
                variant="outline"
                className="mt-4"
              >
                Visit Our Website
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading if no pages are available yet or initial photos state not set
  if (pages.length === 0 || initialHasPhotos === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto p-4 py-8">
          {/* Current page content */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>{currentPageData.title}</CardTitle>
              <CardDescription>
                Step {currentPage + 1} of {pages.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-6">
              <div className="flex-1 overflow-y-auto px-1">
                <div className="pb-4 space-y-8">
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
                </div>
              </div>
              
              {/* Navigation buttons */}
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

                  {/* Show Next button only if not on booking page and not on last page */}
                  {currentPageData.id !== 'booking' && currentPage < pages.length - 1 && (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FollowUpForm; 