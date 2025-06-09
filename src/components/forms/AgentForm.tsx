import React, { useState, useEffect } from 'react';
import { useFormStore } from '../../store/formStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Save, User, MapPin, DollarSign, Calendar, FileText, Phone, CheckCircle2 } from 'lucide-react';

// Import existing form components
import ServiceSelection from '../ServiceSelection';
import AddressCollection from '../AddressCollection';
import BudgetSection from '../BudgetSection';
import ServiceDetailsSection from '../ServiceDetailsSection';
import ProjectScope from '../ProjectScope';
import StartDeadlineSection from '../StartDeadlineSection';
import PreviousProvider from '../PreviousProvider';
import PreviousQuotes from '../PreviousQuotes';
import PriceVsLongTerm from '../PriceVsLongTerm';
import SiteChallenges from '../SiteChallenges';
import ProjectSuccessCriteria from '../ProjectSuccessCriteria';
import PersonalInformation from '../PersonalInformation';
import CalendlyBooking from '../CalendlyBooking';

interface AgentFormProps {
  sessionId?: string;
}

const AgentForm: React.FC<AgentFormProps> = ({ sessionId }) => {
  const { state, submitForm } = useFormStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await submitForm();
    } catch (error) {
      console.error('Failed to save form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getFormPathBadge = () => {
    if (!state.formPath) return null;
    
    const colors = {
      maintenance: 'bg-blue-100 text-blue-800',
      projects: 'bg-green-100 text-green-800',
      both: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[state.formPath]}>
        {state.formPath.charAt(0).toUpperCase() + state.formPath.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Lead Management Form
                {getFormPathBadge()}
              </CardTitle>
              <CardDescription>
                Internal form for managing leads and capturing detailed information
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Auto-saving enabled</span>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PersonalInformation />
        </CardContent>
      </Card>

      {/* Property & Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Property & Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddressCollection />
        </CardContent>
      </Card>

      {/* Services & Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Services & Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Selected Services</h3>
            <ServiceSelection />
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">Budget Information</h3>
            <BudgetSection />
          </div>
          
          {state.services.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-3">Service Details</h3>
                <ServiceDetailsSection />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Project Details */}
      {(state.formPath === 'projects' || state.formPath === 'both' || state.formPath === 'other') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Project Vision</h3>
              <ProjectScope />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-3">Success Criteria</h3>
              <ProjectSuccessCriteria />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-3">Previous Quotes</h3>
              <PreviousQuotes />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline & Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline & Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Start Dates & Deadlines</h3>
            <StartDeadlineSection />
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">Schedule Consultation</h3>
            <CalendlyBooking />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {(state.formPath === 'maintenance' || state.formPath === 'both') && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Service Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Previous Provider</h3>
              <PreviousProvider />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-3">Service Preferences</h3>
              <PriceVsLongTerm />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="text-lg font-medium mb-3">Site Challenges</h3>
            <SiteChallenges />
          </div>
        </CardContent>
      </Card>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Session ID:</span>
              <p className="text-gray-600 font-mono text-xs">{state.sessionId || 'Not set'}</p>
            </div>
            <div>
              <span className="font-medium">Form Path:</span>
              <p className="text-gray-600">{state.formPath || 'Not determined'}</p>
            </div>
            <div>
              <span className="font-medium">Services Count:</span>
              <p className="text-gray-600">{state.services.length}</p>
            </div>
            <div>
              <span className="font-medium">Form Submitted:</span>
              <p className="text-gray-600">{state.formSubmitted ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentForm; 