import React, { useState } from 'react'
import { useSession } from '../../../hooks/useSession'
import { FormField } from '../../shared/FormField'
import { ProgressIndicator } from '../../shared/ProgressIndicator'
import { AutoSaveIndicator } from '../../shared/AutoSaveIndicator'
import { LoadingSpinner } from '../../shared/LoadingSpinner'
import { useAutoSave } from '../../../hooks/useAutoSave'
import { InitialFormData } from '../../../types/forms'
import { ContactInfo } from './ContactInfo'
import { ServiceSelection } from './ServiceSelection'
import { QuickBudget } from './QuickBudget'
import { PhotoOption } from './PhotoOption'

const FORM_STEPS = [
  'Contact Info',
  'Services',
  'Budget',
  'Photos'
]

export const InitialForm: React.FC = () => {
  const { session, loading, error, createSession, updateSession } = useSession({
    autoCreate: true,
    initialData: { form_source: 'website' }
  })
  
  const { state: autoSaveState, clearError } = useAutoSave(session?.id || null)
  
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<InitialFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    services: [],
    budgets: {},
    upload_link_requested: false
  })

  const handleFieldChange = (field: keyof InitialFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!session) return

    try {
      await updateSession({
        ...formData,
        initial_form_completed: true
      })
      
      // Redirect to thank you page or show success message
      alert('Thank you! We\'ll be in touch soon with next steps.')
      
      // You could redirect to a thank you page here
      // window.location.href = '/thank-you'
      
    } catch (error) {
      console.error('Failed to submit form:', error)
      alert('There was an error submitting your form. Please try again.')
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Contact Info
        return formData.first_name && formData.last_name && formData.email && formData.phone
      case 1: // Services
        return formData.services.length > 0
      case 2: // Budget
        return formData.services.every(service => formData.budgets[service] > 0)
      case 3: // Photos
        return true // Photo step is always valid (optional)
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading form..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Form</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ContactInfo
            data={formData}
            onChange={handleFieldChange}
            sessionId={session?.id}
          />
        )
      case 1:
        return (
          <ServiceSelection
            data={formData}
            onChange={handleFieldChange}
            sessionId={session?.id}
          />
        )
      case 2:
        return (
          <QuickBudget
            data={formData}
            onChange={handleFieldChange}
            sessionId={session?.id}
          />
        )
      case 3:
        return (
          <PhotoOption
            data={formData}
            onChange={handleFieldChange}
            sessionId={session?.id}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Your Free Quote
          </h1>
          <p className="text-gray-600">
            Tell us about your landscaping needs and we'll provide a custom quote
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={FORM_STEPS.length}
            steps={FORM_STEPS}
          />
        </div>

        {/* Auto-save Indicator */}
        <div className="mb-6 flex justify-center">
          <AutoSaveIndicator
            isSaving={autoSaveState.isSaving}
            lastSaved={autoSaveState.lastSaved}
            error={autoSaveState.error}
            onClearError={clearError}
          />
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          {currentStep === FORM_STEPS.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit Request
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Continue
            </button>
          )}
        </div>

        {/* Session Info (for debugging) */}
        {session && (
          <div className="mt-4 text-center text-xs text-gray-400">
            Session: {session.id}
          </div>
        )}
      </div>
    </div>
  )
} 