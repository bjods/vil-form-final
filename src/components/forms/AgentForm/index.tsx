import React, { useState, useEffect } from 'react'
import { useSession } from '../../../hooks/useSession'
import { useAutoSave } from '../../../hooks/useAutoSave'
import { FormField } from '../../shared/FormField'
import { AutoSaveIndicator } from '../../shared/AutoSaveIndicator'
import { LoadingSpinner } from '../../shared/LoadingSpinner'
import { AgentFormData } from '../../../types/forms'

export const AgentForm: React.FC = () => {
  const { session, loading, error, createSession, updateSession } = useSession({
    autoCreate: true,
    initialData: { form_source: 'agent' }
  })
  
  const { state: autoSaveState, clearError } = useAutoSave(session?.id || null)
  
  const [formData, setFormData] = useState<Partial<AgentFormData>>({
    // Contact Information
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    
    // Services & Budget
    services: [],
    budgets: {},
    
    // Project Details
    project_vision: '',
    timeline: '',
    site_challenges: '',
    success_criteria: '',
    
    // Agent-specific fields
    lead_priority: 'medium',
    agent_notes: '',
    lead_source_details: '',
    referral_source: '',
    estimated_value: 0,
    competition_notes: '',
    
    // Status tracking
    initial_form_completed: false,
    follow_up_email_sent: false,
    photos_uploaded: false,
    meeting_scheduled: false
  })

  // Load session data when available
  useEffect(() => {
    if (session) {
      setFormData(prev => ({
        ...prev,
        ...session
      }))
    }
  }, [session])

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleServiceToggle = (service: string) => {
    const currentServices = formData.services || []
    const newServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service]
    
    handleFieldChange('services', newServices)
  }

  const handleBudgetChange = (service: string, budget: number) => {
    const newBudgets = {
      ...formData.budgets,
      [service]: budget
    }
    handleFieldChange('budgets', newBudgets)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) return
    
    try {
      await updateSession({
        ...formData,
        initial_form_completed: true,
        agent_name: 'Internal Agent' // You can make this dynamic
      })
      
      alert('Lead information saved successfully!')
    } catch (error) {
      console.error('Failed to save lead:', error)
      alert('Failed to save lead information. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading agent form..." />
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

  const serviceOptions = [
    'lawn-maintenance',
    'landscaping',
    'snow-removal',
    'irrigation',
    'tree-care',
    'hardscaping',
    'garden-design',
    'other'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Internal Lead Management</h1>
              <p className="text-gray-600 mt-1">Comprehensive lead capture and management form</p>
              {session && (
                <p className="text-sm text-gray-500 mt-2">Session ID: {session.id}</p>
              )}
            </div>
            <AutoSaveIndicator
              isSaving={autoSaveState.isSaving}
              lastSaved={autoSaveState.lastSaved}
              error={autoSaveState.error}
              onClearError={clearError}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="first_name"
                value={formData.first_name || ''}
                onChange={(value) => handleFieldChange('first_name', value)}
                required
                sessionId={session?.id}
              />
              <FormField
                label="Last Name"
                name="last_name"
                value={formData.last_name || ''}
                onChange={(value) => handleFieldChange('last_name', value)}
                required
                sessionId={session?.id}
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={(value) => handleFieldChange('email', value)}
                required
                sessionId={session?.id}
              />
              <FormField
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(value) => handleFieldChange('phone', value)}
                required
                sessionId={session?.id}
              />
              <FormField
                label="Address"
                name="address"
                value={formData.address || ''}
                onChange={(value) => handleFieldChange('address', value)}
                className="md:col-span-2"
                sessionId={session?.id}
              />
              <FormField
                label="Postal Code"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={(value) => handleFieldChange('postal_code', value)}
                sessionId={session?.id}
              />
            </div>
          </div>

          {/* Lead Management Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Lead Priority"
                name="lead_priority"
                type="select"
                value={formData.lead_priority || 'medium'}
                onChange={(value) => handleFieldChange('lead_priority', value)}
                options={[
                  { value: 'low', label: 'Low Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'urgent', label: 'Urgent' }
                ]}
                sessionId={session?.id}
              />
              <FormField
                label="Referral Source"
                name="referral_source"
                value={formData.referral_source || ''}
                onChange={(value) => handleFieldChange('referral_source', value)}
                placeholder="How did they find us?"
                sessionId={session?.id}
              />
              <FormField
                label="Estimated Value"
                name="estimated_value"
                type="number"
                value={formData.estimated_value || 0}
                onChange={(value) => handleFieldChange('estimated_value', value)}
                placeholder="0"
                sessionId={session?.id}
              />
            </div>
            
            <div className="mt-4">
              <FormField
                label="Lead Source Details"
                name="lead_source_details"
                type="textarea"
                value={formData.lead_source_details || ''}
                onChange={(value) => handleFieldChange('lead_source_details', value)}
                placeholder="Additional details about how this lead was generated..."
                rows={3}
                sessionId={session?.id}
              />
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services Requested</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.services?.includes(service) || false}
                    onChange={() => handleServiceToggle(service)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{service.replace('-', ' ')}</span>
                </label>
              ))}
            </div>

            {/* Budget inputs for selected services */}
            {formData.services && formData.services.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Budget Estimates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.services.map((service) => (
                    <FormField
                      key={service}
                      label={`${service.replace('-', ' ')} Budget`}
                      name={`budget_${service}`}
                      type="number"
                      value={formData.budgets?.[service] || 0}
                      onChange={(value) => handleBudgetChange(service, Number(value))}
                      placeholder="0"
                      sessionId={session?.id}
                      autoSave={false} // Handle budget saves manually
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Details Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
            <div className="space-y-4">
              <FormField
                label="Project Vision"
                name="project_vision"
                type="textarea"
                value={formData.project_vision || ''}
                onChange={(value) => handleFieldChange('project_vision', value)}
                placeholder="Describe the client's vision for their property..."
                rows={4}
                sessionId={session?.id}
              />
              <FormField
                label="Timeline"
                name="timeline"
                value={formData.timeline || ''}
                onChange={(value) => handleFieldChange('timeline', value)}
                placeholder="When does the client want this completed?"
                sessionId={session?.id}
              />
              <FormField
                label="Site Challenges"
                name="site_challenges"
                type="textarea"
                value={formData.site_challenges || ''}
                onChange={(value) => handleFieldChange('site_challenges', value)}
                placeholder="Any access issues, slopes, existing features to work around..."
                rows={3}
                sessionId={session?.id}
              />
              <FormField
                label="Success Criteria"
                name="success_criteria"
                type="textarea"
                value={formData.success_criteria || ''}
                onChange={(value) => handleFieldChange('success_criteria', value)}
                placeholder="What does success look like for this client?"
                rows={3}
                sessionId={session?.id}
              />
            </div>
          </div>

          {/* Agent Notes Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Notes & Competition</h2>
            <div className="space-y-4">
              <FormField
                label="Agent Notes"
                name="agent_notes"
                type="textarea"
                value={formData.agent_notes || ''}
                onChange={(value) => handleFieldChange('agent_notes', value)}
                placeholder="Internal notes, follow-up reminders, client personality, etc..."
                rows={4}
                sessionId={session?.id}
              />
              <FormField
                label="Competition Notes"
                name="competition_notes"
                type="textarea"
                value={formData.competition_notes || ''}
                onChange={(value) => handleFieldChange('competition_notes', value)}
                placeholder="Other companies they're considering, quotes received, etc..."
                rows={3}
                sessionId={session?.id}
              />
            </div>
          </div>

          {/* Status Tracking Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Tracking</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.initial_form_completed || false}
                  onChange={(e) => handleFieldChange('initial_form_completed', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Initial Form Complete</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.follow_up_email_sent || false}
                  onChange={(e) => handleFieldChange('follow_up_email_sent', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Follow-up Sent</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.photos_uploaded || false}
                  onChange={(e) => handleFieldChange('photos_uploaded', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Photos Uploaded</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.meeting_scheduled || false}
                  onChange={(e) => handleFieldChange('meeting_scheduled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Meeting Scheduled</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => window.location.reload()}
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Lead Information
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 