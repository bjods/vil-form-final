(function() {
  // Prevent multiple loads
  if (window.VLFormLoaded) {
    return;
  }
  window.VLFormLoaded = true;

  // Configuration
  var CONFIG = {
    SUPABASE_URL: 'https://furekgiahpuetskjtkaj.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1cmVrZ2lhaHB1ZXRza2p0a2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODIzNjUsImV4cCI6MjA2NTA1ODM2NX0.TxL7iNQILqO70yKV-3XNEMGJQFxKPtvgy_WCJoaLG9o',
    GOOGLE_MAPS_API_KEY: 'AIzaSyBaxGwc3uGt97gA_hKji4L3s-QuIuejzYI'
  };

  // Form state matching React app exactly
  var formState = {
    currentStep: 0,
    sessionId: null,
    data: {
      // Personal Info
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        referralSource: ''
      },
      
      // Address
      address: '',
      postalCode: '',
      isInServiceArea: true,
      
      // Services
      services: [],
      serviceDetails: {},
      
      // Project Details
      budgets: {},
      startDeadlines: {},
      projectScope: '',
      projectSuccessCriteria: '',
      
      // Previous Experience
      previousProvider: '',
      previousQuotes: null,
      priceVsLongTerm: null,
      
      // Site Info
      siteChallenges: '',
      
      // Photos
      photos: [],
      textUploadLink: false
    }
  };

  // Service definitions matching React app
  var services = [
    // Project Services
    { id: 'landscape-design-build', name: 'Landscape Design & Build', category: 'project', 
      options: { elements: ['Patio', 'Walkway', 'Retaining Wall', 'Outdoor Kitchen', 'Fire Feature', 'Water Feature', 'Pergola/Pavilion', 'Deck'] }
    },
    { id: 'landscape-enhancement', name: 'Landscape Enhancement', category: 'project',
      options: { types: ['Garden Bed Design', 'Tree/Shrub Installation', 'Mulching', 'Rock Gardens', 'Edging', 'Seasonal Color'] }
    },
    { id: 'lawn-renovation', name: 'Lawn Renovation & Installation', category: 'project' },
    { id: 'outdoor-lighting', name: 'Outdoor Lighting', category: 'project' },
    { id: 'irrigation-install', name: 'Irrigation System Installation', category: 'project' },
    
    // Maintenance Services
    { id: 'lawn-maintenance', name: 'Lawn Maintenance Program', category: 'maintenance',
      options: { types: ['Full Service (Weekly)', 'Bi-Weekly Service', 'Basic (Mow & Go)', 'Custom Schedule'] }
    },
    { id: 'snow-management', name: 'Snow & Ice Management', category: 'maintenance',
      options: { propertySizes: ['Small Residential (1-4 cars)', 'Large Residential (5-8 cars)', 'Small Commercial', 'Large Commercial'] }
    },
    { id: 'garden-maintenance', name: 'Garden & Bed Maintenance', category: 'maintenance' },
    { id: 'irrigation-maintenance', name: 'Irrigation Maintenance', category: 'maintenance' },
    
    // Other
    { id: 'other', name: 'Other/Custom Service', category: 'other' }
  ];

  // Referral sources
  var referralSources = ['Cold Calling', 'Direct Mailer', 'Door Knocking', 'Email Cold Outreach', 'Facebook', 'Field Crew Referral', 'Google Ads', 'Google Organic', 'Home Show', 'Inbound Lead', 'Instagram', 'Jobsite Sign', 'LinkedIn', 'Mercedes Benz Catalog', 'Referral', 'Tiktok', 'Truck Signage', 'Unknown'];

  // Inject all styles
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '/* Form Container */
.vl-form-wrapper {
  position: relative !important;
  width: 600px !important;
  height: 775px !important;
  max-height: 90vh !important;
  margin: 2rem auto !important;
  box-sizing: border-box !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  color: #333333 !important;
}

.vl-form-card {
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

/* Header */
.vl-form-header {
  padding: 1.25rem 1.75rem !important;
  border-bottom: 1px solid #e5e7eb !important;
  background: #ffffff !important;
}

.vl-form-title {
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  margin: 0 0 0.5rem 0 !important;
  color: #111827 !important;
}

.vl-form-subtitle {
  font-size: 0.875rem !important;
  color: #6b7280 !important;
  margin: 0 !important;
}

.vl-form-progress {
  margin-top: 1rem !important;
  height: 4px !important;
  background: #e5e7eb !important;
  border-radius: 2px !important;
  overflow: hidden !important;
}

.vl-form-progress-bar {
  height: 100% !important;
  background: #fbbf24 !important;
  transition: width 0.3s ease !important;
}

/* Content */
.vl-form-content {
  flex: 1 !important;
  padding: 1.75rem !important;
  overflow-y: auto !important;
}

/* Footer */
.vl-form-footer {
  padding: 1.25rem 1.75rem !important;
  border-top: 1px solid #e5e7eb !important;
  background: #ffffff !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

/* Form Elements */
.vl-form-group {
  margin-bottom: 1.5rem !important;
}

.vl-form-label {
  display: block !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: #374151 !important;
  margin-bottom: 0.5rem !important;
}

.vl-form-input,
.vl-form-select {
  width: 100% !important;
  height: 2.5rem !important;
  padding: 0.5rem 0.75rem !important;
  border: 1px solid #d1d5db !important;
  border-radius: 0.375rem !important;
  background: #ffffff !important;
  font-size: 0.875rem !important;
  transition: border-color 0.15s ease-in-out !important;
}

.vl-form-input:focus,
.vl-form-select:focus {
  outline: none !important;
  border-color: #fbbf24 !important;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;
}

.vl-form-textarea {
  width: 100% !important;
  min-height: 6rem !important;
  padding: 0.5rem 0.75rem !important;
  border: 1px solid #d1d5db !important;
  border-radius: 0.375rem !important;
  background: #ffffff !important;
  font-size: 0.875rem !important;
  resize: vertical !important;
  font-family: inherit !important;
}

.vl-form-textarea:focus {
  outline: none !important;
  border-color: #fbbf24 !important;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;
}

/* Buttons */
.vl-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  white-space: nowrap !important;
  border-radius: 0.375rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  transition: all 0.15s ease-in-out !important;
  cursor: pointer !important;
  border: none !important;
  text-decoration: none !important;
  height: 2.5rem !important;
  padding: 0.5rem 1rem !important;
}

.vl-btn-primary {
  background: #fbbf24 !important;
  color: #000000 !important;
  border: 1px solid #f59e0b !important;
}

.vl-btn-primary:hover:not(:disabled) {
  background: #f59e0b !important;
}

.vl-btn-secondary {
  background: #ffffff !important;
  color: #000000 !important;
  border: 1px solid #d1d5db !important;
}

.vl-btn-secondary:hover:not(:disabled) {
  background: #f9fafb !important;
}

.vl-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

/* Services */
.vl-service-grid {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 0.75rem !important;
}

.vl-service-item {
  display: flex !important;
  align-items: center !important;
  padding: 0.75rem !important;
  border: 1px solid #d1d5db !important;
  border-radius: 0.375rem !important;
  background: #ffffff !important;
  cursor: pointer !important;
  transition: all 0.15s ease-in-out !important;
}

.vl-service-item:hover {
  border-color: #fbbf24 !important;
  background: #fffbeb !important;
}

.vl-service-item.selected {
  border-color: #fbbf24 !important;
  background: #fffbeb !important;
}

.vl-service-checkbox {
  margin-right: 0.75rem !important;
  width: 1rem !important;
  height: 1rem !important;
  accent-color: #fbbf24 !important;
}

.vl-service-label {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: #374151 !important;
  margin: 0 !important;
}

/* Radio/Checkbox Groups */
.vl-radio-group,
.vl-checkbox-group {
  display: grid !important;
  gap: 0.75rem !important;
}

.vl-radio-item,
.vl-checkbox-item {
  display: flex !important;
  align-items: center !important;
  padding: 0.75rem !important;
  border: 1px solid #d1d5db !important;
  border-radius: 0.375rem !important;
  background: #ffffff !important;
  cursor: pointer !important;
  transition: all 0.15s ease-in-out !important;
}

.vl-radio-item:hover,
.vl-checkbox-item:hover {
  border-color: #fbbf24 !important;
  background: #fffbeb !important;
}

.vl-radio-item.selected,
.vl-checkbox-item.selected {
  border-color: #fbbf24 !important;
  background: #fffbeb !important;
}

/* Grid Layouts */
.vl-grid-2 {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 1rem !important;
}

.vl-grid-3 {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 0.75rem !important;
}

/* Budget Input */
.vl-input-group {
  position: relative !important;
}

.vl-input-prefix {
  position: absolute !important;
  left: 0.75rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  color: #6b7280 !important;
  pointer-events: none !important;
}

.vl-input-with-prefix {
  padding-left: 2rem !important;
}

/* File Upload */
.vl-upload-area {
  border: 2px dashed #d1d5db !important;
  border-radius: 0.375rem !important;
  padding: 2rem !important;
  text-align: center !important;
  background: #f9fafb !important;
  cursor: pointer !important;
  transition: all 0.15s ease-in-out !important;
}

.vl-upload-area:hover {
  border-color: #fbbf24 !important;
  background: #fffbeb !important;
}

.vl-upload-area.dragover {
  border-color: #fbbf24 !important;
  background: #fef3c7 !important;
}

.vl-uploaded-images {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 0.5rem !important;
  margin-top: 1rem !important;
}

.vl-uploaded-image {
  position: relative !important;
  width: 100px !important;
  height: 100px !important;
}

.vl-uploaded-image img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 0.375rem !important;
}

.vl-uploaded-image button {
  position: absolute !important;
  top: -0.5rem !important;
  right: -0.5rem !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  border-radius: 50% !important;
  background: #dc2626 !important;
  color: white !important;
  border: none !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 0.75rem !important;
}

/* Errors */
.vl-form-error {
  color: #dc2626 !important;
  font-size: 0.75rem !important;
  margin-top: 0.25rem !important;
}

.vl-form-input.error,
.vl-form-textarea.error {
  border-color: #dc2626 !important;
}

/* Loading */
.vl-spinner {
  border: 2px solid #f3f4f6 !important;
  border-top: 2px solid #fbbf24 !important;
  border-radius: 50% !important;
  width: 1rem !important;
  height: 1rem !important;
  animation: vl-spin 1s linear infinite !important;
  margin-right: 0.5rem !important;
  display: inline-block !important;
}

@keyframes vl-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Auto-save indicator */
.vl-autosave {
  font-size: 0.75rem !important;
  color: #6b7280 !important;
  display: flex !important;
  align-items: center !important;
}

.vl-autosave.saving {
  color: #fbbf24 !important;
}

.vl-autosave.saved {
  color: #059669 !important;
}

/* Section Headers */
.vl-section-header {
  padding: 1rem !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 0.375rem !important;
  background: #fafafa !important;
  margin-bottom: 1rem !important;
}

.vl-section-title {
  font-size: 1rem !important;
  font-weight: 500 !important;
  margin-bottom: 0.5rem !important;
}

/* Helper Text */
.vl-helper-text {
  font-size: 0.875rem !important;
  color: #6b7280 !important;
  margin-bottom: 1rem !important;
}

/* Warning Messages */
.vl-warning {
  background: #fef3c7 !important;
  border: 1px solid #fbbf24 !important;
  color: #92400e !important;
  padding: 0.75rem !important;
  border-radius: 0.375rem !important;
  font-size: 0.875rem !important;
  margin-bottom: 1rem !important;
}

/* Success Messages */
.vl-success {
  background: #d1fae5 !important;
  border: 1px solid #34d399 !important;
  color: #065f46 !important;
  padding: 0.75rem !important;
  border-radius: 0.375rem !important;
  font-size: 0.875rem !important;
  margin-bottom: 1rem !important;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .vl-form-wrapper {
    width: 100% !important;
    height: 100vh !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }
  
  .vl-form-card {
    border-radius: 0 !important;
  }
  
  .vl-form-header {
    padding: 1rem 1.5rem !important;
  }
  
  .vl-form-content {
    padding: 1.5rem !important;
  }
  
  .vl-form-footer {
    padding: 1rem 1.5rem !important;
  }
  
  .vl-service-grid {
    grid-template-columns: 1fr !important;
  }
  
  .vl-grid-2,
  .vl-grid-3 {
    grid-template-columns: 1fr !important;
  }
}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Create form wrapper HTML
  function createFormHTML() {
    return [
      '<form class="vl-form-wrapper" data-vl-form="true" id="vl-landscape-form" name="landscape_quote_form" method="post" action="#" onsubmit="return handleFormSubmit(event);">',
      '  <!-- Hidden fields for form tracking -->',
      '  <input type="hidden" name="form_type" value="landscape_quote" />',
      '  <input type="hidden" name="form_version" value="2.0" />',
      '  <input type="hidden" name="session_id" id="hidden-session-id" value="" />',
      '  <input type="hidden" name="services" id="hidden-services" value="" />',
      '  <input type="hidden" name="firstName" id="hidden-firstName" value="" />',
      '  <input type="hidden" name="lastName" id="hidden-lastName" value="" />',
      '  <input type="hidden" name="email" id="hidden-email" value="" />',
      '  <input type="hidden" name="phone" id="hidden-phone" value="" />',
      '  <input type="hidden" name="address" id="hidden-address" value="" />',
      '  <input type="hidden" name="total_budget" id="hidden-total-budget" value="" />',
      '  ',
      '  <div class="vl-form-card">',
      '    <div class="vl-form-header">',
      '      <h2 class="vl-form-title" id="vl-step-title">Get Your Landscape Quote</h2>',
      '      <p class="vl-form-subtitle" id="vl-step-subtitle">Tell us about your project</p>',
      '      <div class="vl-form-progress">',
      '        <div class="vl-form-progress-bar" id="vl-progress-bar" style="width: 0%"></div>',
      '      </div>',
      '    </div>',
      '    <div class="vl-form-content" id="vl-form-content">',
      '      <!-- Form content will be inserted here -->',
      '    </div>',
      '    <div class="vl-form-footer">',
      '      <div class="vl-autosave" id="vl-autosave-status"></div>',
      '      <div>',
      '        <button type="button" class="vl-btn vl-btn-secondary" id="vl-btn-back" style="display: none;">Back</button>',
      '        <button type="submit" class="vl-btn vl-btn-primary" id="vl-btn-next" style="margin-left: 0.5rem;">Next</button>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</form>'
    ].join('');
  }

  // Generate dynamic steps based on service selection
  function generateSteps() {
    var steps = [
      { id: 'personal-info', title: 'Contact Information', subtitle: 'Tell us how to reach you' },
      { id: 'address', title: 'Property Address', subtitle: 'Where is the project located?' },
      { id: 'services', title: 'Service Selection', subtitle: 'What services do you need?' }
    ];
    
    var selectedServices = formState.data.services;
    if (selectedServices.length === 0) return steps;
    
    // Check service categories
    var hasProjectServices = selectedServices.some(function(id) {
      var service = services.find(function(s) { return s.id === id; });
      return service && service.category === 'project';
    });
    
    var hasMaintenanceServices = selectedServices.some(function(id) {
      var service = services.find(function(s) { return s.id === id; });
      return service && service.category === 'maintenance';
    });
    
    var hasOther = selectedServices.includes('other');
    
    // Add conditional steps based on services
    if (hasProjectServices || hasOther) {
      // Project-specific steps
      steps.push({ id: 'budget', title: 'Budget Range', subtitle: 'Help us understand your investment level' });
      
      if (selectedServices.includes('landscape-design-build') || selectedServices.includes('landscape-enhancement')) {
        steps.push({ id: 'service-details', title: 'Service Details', subtitle: 'Select specific features you want' });
      }
      
      steps.push({ id: 'project-scope', title: 'Project Description', subtitle: 'Describe your vision' });
      steps.push({ id: 'timeline', title: 'Project Timeline', subtitle: 'When do you want to start?' });
      steps.push({ id: 'previous-provider', title: 'Previous Experience', subtitle: 'Have you worked with a landscaper before?' });
      steps.push({ id: 'previous-quotes', title: 'Quote Comparison', subtitle: 'Are you getting multiple quotes?' });
      steps.push({ id: 'price-vs-longterm', title: 'Your Priorities', subtitle: 'What matters most to you?' });
      steps.push({ id: 'site-challenges', title: 'Site Information', subtitle: 'Any special considerations?' });
      steps.push({ id: 'success-criteria', title: 'Success Criteria', subtitle: 'How will you measure success?' });
    }
    
    if (hasMaintenanceServices && !hasProjectServices) {
      // Maintenance-only steps
      steps.push({ id: 'budget', title: 'Budget Range', subtitle: 'Your maintenance budget' });
      
      if (selectedServices.includes('lawn-maintenance') || selectedServices.includes('snow-management')) {
        steps.push({ id: 'service-details', title: 'Service Details', subtitle: 'Select your service preferences' });
      }
      
      steps.push({ id: 'timeline', title: 'Start Date', subtitle: 'When do you need service to begin?' });
      steps.push({ id: 'site-challenges', title: 'Property Details', subtitle: 'Tell us about your property' });
    }
    
    // Upload step is always last (optional)
    steps.push({ id: 'upload', title: 'Property Photos', subtitle: 'Share photos of your property (optional)' });
    
    return steps;
  }

  // Step Renderers
  var stepRenderers = {
    'personal-info': function() {
      var info = formState.data.personalInfo;
      return [
        '<div class="vl-grid-2">',
        '  <div class="vl-form-group">',
        '    <label class="vl-form-label" for="firstName">First Name *</label>',
        '    <input type="text" class="vl-form-input" id="firstName" name="firstName" value="' + (info.firstName || '') + '" required>',
        '  </div>',
        '  <div class="vl-form-group">',
        '    <label class="vl-form-label" for="lastName">Last Name *</label>',
        '    <input type="text" class="vl-form-input" id="lastName" name="lastName" value="' + (info.lastName || '') + '" required>',
        '  </div>',
        '</div>',
        '<div class="vl-form-group">',
        '  <label class="vl-form-label" for="email">Email Address *</label>',
        '  <input type="email" class="vl-form-input" id="email" name="email" value="' + (info.email || '') + '" required>',
        '</div>',
        '<div class="vl-form-group">',
        '  <label class="vl-form-label" for="phone">Phone Number *</label>',
        '  <input type="tel" class="vl-form-input" id="phone" name="phone" value="' + (info.phone || '') + '" placeholder="(555) 123-4567" required>',
        '</div>',
        '<div class="vl-form-group">',
        '  <label class="vl-form-label" for="referralSource">How did you find us?</label>',
        '  <select class="vl-form-select" id="referralSource" name="referralSource">',
        '    <option value="">Select...</option>',
        referralSources.map(function(source) {
          return '<option value="' + source + '"' + (info.referralSource === source ? ' selected' : '') + '>' + source + '</option>';
        }).join(''),
        '  </select>',
        '</div>'
      ].join('');
    },
    
    'address': function() {
      return [
        '<div class="vl-form-group">',
        '  <label class="vl-form-label" for="address">Property Address *</label>',
        '  <input type="text" class="vl-form-input" id="address" name="address" value="' + formState.data.address + '" placeholder="123 Main Street, City, Province" required>',
        '</div>',
        '<div class="vl-form-group">',
        '  <label class="vl-form-label" for="postalCode">Postal Code *</label>',
        '  <input type="text" class="vl-form-input" id="postalCode" name="postalCode" value="' + formState.data.postalCode + '" placeholder="A1A 1A1" required>',
        '</div>',
        !formState.data.isInServiceArea ? '<div class="vl-warning">⚠️ This address may be outside our service area. We\'ll confirm availability when we contact you.</div>' : ''
      ].join('');
    },
    
    'services': function() {
      var categories = [
        { name: 'Project Services', items: services.filter(function(s) { return s.category === 'project'; }) },
        { name: 'Maintenance Services', items: services.filter(function(s) { return s.category === 'maintenance'; }) },
        { name: 'Other', items: services.filter(function(s) { return s.category === 'other'; }) }
      ];
      
      return [
        '<div class="vl-form-group">',
        categories.map(function(category) {
          if (category.items.length === 0) return '';
          
          return [
            '<div style="margin-bottom: 1.5rem;">',
            '  <h3 style="font-size: 1rem; font-weight: 500; margin-bottom: 0.75rem; color: #374151;">' + category.name + '</h3>',
            '  <div class="vl-service-grid">',
            category.items.map(function(service) {
              var isSelected = formState.data.services.indexOf(service.id) > -1;
              return [
                '<div class="vl-service-item' + (isSelected ? ' selected' : '') + '" data-service-id="' + service.id + '">',
                '  <input type="checkbox" class="vl-service-checkbox" id="service-' + service.id + '"' + (isSelected ? ' checked' : '') + '>',
                '  <label class="vl-service-label" for="service-' + service.id + '">' + service.name + '</label>',
                '</div>'
              ].join('');
            }).join(''),
            '  </div>',
            '</div>'
          ].join('');
        }).join(''),
        '</div>'
      ].join('');
    },
    
    'budget': function() {
      var selectedServices = formState.data.services;
      var html = ['<div class="vl-form-group">'];
      
      selectedServices.forEach(function(serviceId) {
        var service = services.find(function(s) { return s.id === serviceId; });
        if (!service) return;
        
        var budget = formState.data.budgets[serviceId] || '';
        
        html.push([
          '<div class="vl-section-header">',
          '  <h3 class="vl-section-title">' + service.name + ' Budget</h3>',
          '  <div class="vl-input-group">',
          '    <span class="vl-input-prefix">$</span>',
          '    <input type="number" class="vl-form-input vl-input-with-prefix" id="budget-' + serviceId + '" data-service-id="' + serviceId + '" value="' + budget + '" placeholder="0" min="0">',
          '  </div>',
          budget ? '<p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">Your budget: $' + Number(budget).toLocaleString() + '</p>' : '',
          '</div>'
        ].join(''));
      });
      
      html.push('</div>');
      return html.join('');
    },
    
    'service-details': function() {
      var selectedServices = formState.data.services;
      var html = [];
      
      selectedServices.forEach(function(serviceId) {
        var service = services.find(function(s) { return s.id === serviceId; });
        if (!service || !service.options) return;
        
        var details = formState.data.serviceDetails[serviceId] || [];
        
        html.push('<div class="vl-section-header">');
        html.push('<h3 class="vl-section-title">' + service.name + ' Details</h3>');
        
        if (serviceId === 'landscape-design-build' && service.options.elements) {
          html.push('<p class="vl-helper-text">Select design elements (select all that apply):</p>');
          html.push('<div class="vl-grid-2">');
          
          service.options.elements.forEach(function(element) {
            var isChecked = Array.isArray(details) && details.indexOf(element) > -1;
            html.push([
              '<div class="vl-checkbox-item' + (isChecked ? ' selected' : '') + '" data-service-id="' + serviceId + '" data-option="' + element + '">',
              '  <input type="checkbox" id="option-' + serviceId + '-' + element + '"' + (isChecked ? ' checked' : '') + '>',
              '  <label for="option-' + serviceId + '-' + element + '" style="margin-left: 0.5rem; cursor: pointer;">' + element + '</label>',
              '</div>'
            ].join(''));
          });
          
          html.push('</div>');
        }
        
        if (serviceId === 'landscape-enhancement' && service.options.types) {
          html.push('<p class="vl-helper-text">Select enhancement types (select all that apply):</p>');
          html.push('<div class="vl-grid-2">');
          
          service.options.types.forEach(function(type) {
            var isChecked = Array.isArray(details) && details.indexOf(type) > -1;
            html.push([
              '<div class="vl-checkbox-item' + (isChecked ? ' selected' : '') + '" data-service-id="' + serviceId + '" data-option="' + type + '">',
              '  <input type="checkbox" id="option-' + serviceId + '-' + type + '"' + (isChecked ? ' checked' : '') + '>',
              '  <label for="option-' + serviceId + '-' + type + '" style="margin-left: 0.5rem; cursor: pointer;">' + type + '</label>',
              '</div>'
            ].join(''));
          });
          
          html.push('</div>');
        }
        
        if (serviceId === 'lawn-maintenance' && service.options.types) {
          html.push('<p class="vl-helper-text">Select service type:</p>');
          html.push('<div class="vl-radio-group">');
          
          service.options.types.forEach(function(type) {
            var isChecked = details === type;
            html.push([
              '<div class="vl-radio-item' + (isChecked ? ' selected' : '') + '" data-service-id="' + serviceId + '" data-option="' + type + '">',
              '  <input type="radio" name="maintenance-type-' + serviceId + '" id="option-' + serviceId + '-' + type + '"' + (isChecked ? ' checked' : '') + '>',
              '  <label for="option-' + serviceId + '-' + type + '" style="margin-left: 0.5rem; cursor: pointer;">' + type + '</label>',
              '</div>'
            ].join(''));
          });
          
          html.push('</div>');
        }
        
        if (serviceId === 'snow-management' && service.options.propertySizes) {
          html.push('<p class="vl-helper-text">Select property size:</p>');
          html.push('<select class="vl-form-select" id="property-size-' + serviceId + '" data-service-id="' + serviceId + '">');
          html.push('<option value="">Select property size...</option>');
          
          service.options.propertySizes.forEach(function(size) {
            html.push('<option value="' + size + '"' + (details === size ? ' selected' : '') + '>' + size + '</option>');
          });
          
          html.push('</select>');
        }
        
        html.push('</div>');
      });
      
      return html.join('');
    },
    
    'project-scope': function() {
      return [
        '<div class="vl-form-group">',
        '  <label class="vl-form-label" for="projectScope">Describe Your Project *</label>',
        '  <p class="vl-helper-text">Tell us about your vision, goals, and any specific requirements.</p>',
        '  <textarea class="vl-form-textarea" id="projectScope" name="projectScope" rows="6" placeholder="Describe what you want to achieve with this project...">' + formState.data.projectScope + '</textarea>',
        '</div>'
      ].join('');
    },
    
    'timeline': function() {
      var selectedServices = formState.data.services;
      var html = ['<div class="vl-form-group">'];
      
      selectedServices.forEach(function(serviceId) {
        var service = services.find(function(s) { return s.id === serviceId; });
        if (!service) return;
        
        var dates = formState.data.startDeadlines[serviceId] || { startDate: '', deadline: '' };
        var today = new Date().toISOString().split('T')[0];
        
        html.push([
          '<div class="vl-section-header">',
          '  <h3 class="vl-section-title">' + service.name + ' Timeline</h3>',
          '  <div class="vl-grid-2">',
          '    <div>',
          '      <label class="vl-form-label" for="start-date-' + serviceId + '">Desired Start Date *</label>',
          '      <input type="date" class="vl-form-input" id="start-date-' + serviceId + '" data-service-id="' + serviceId + '" value="' + dates.startDate + '" min="' + today + '">',
          '    </div>',
          '    <div>',
          '      <label class="vl-form-label" for="deadline-' + serviceId + '">Completion Deadline</label>',
          '      <input type="date" class="vl-form-input" id="deadline-' + serviceId + '" data-service-id="' + serviceId + '" value="' + dates.deadline + '" min="' + (dates.startDate || today) + '">',
          '    </div>',
          '  </div>',
          '</div>'
        ].join(''));
      });
      
      html.push('</div>');
      return html.join('');
    },
    
    'previous-provider': function() {
      return [
        '<div class="vl-form-group">',
        '  <label class="vl-form-label" for="previousProvider">Previous Landscape Provider *</label>',
        '  <p class="vl-helper-text">Have you worked with a landscape company before? Please share your experience.</p>',
        '  <textarea class="vl-form-textarea" id="previousProvider" name="previousProvider" rows="4" placeholder="Tell us about your previous landscape provider or enter \'None\' if this is your first time...">' + formState.data.previousProvider + '</textarea>',
        '</div>'
      ].join('');
    },
    
    'previous-quotes': function() {
      var hasQuotes = formState.data.previousQuotes;
      return [
        '<div class="vl-form-group">',
        '  <label class="vl-form-label">Have you received quotes from other companies? *</label>',
        '  <div class="vl-radio-group">',
        '    <div class="vl-radio-item' + (hasQuotes === true ? ' selected' : '') + '" data-value="true">',
        '      <input type="radio" name="previousQuotes" id="quotes-yes"' + (hasQuotes === true ? ' checked' : '') + '>',
        '      <label for="quotes-yes" style="margin-left: 0.5rem; cursor: pointer;">Yes, I have received quotes from other companies</label>',
        '    </div>',
        '    <div class="vl-radio-item' + (hasQuotes === false ? ' selected' : '') + '" data-value="false">',
        '      <input type="radio" name="previousQuotes" id="quotes-no"' + (hasQuotes === false ? ' checked' : '') + '>',
        '      <label for="quotes-no" style="margin-left: 0.5rem; cursor: pointer;">No, this is my first quote</label>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    },
    
    'price-vs-longterm': function() {
      var priority = formState.data.priceVsLongTerm;
      return [
        '<div class="vl-form-group">',
        '  <label class="vl-form-label">What\'s more important to you? *</label>',
        '  <div class="vl-radio-group">',
        '    <div class="vl-radio-item' + (priority === 'price' ? ' selected' : '') + '" data-value="price">',
        '      <input type="radio" name="priceVsLongTerm" id="priority-price"' + (priority === 'price' ? ' checked' : '') + '>',
        '      <label for="priority-price" style="margin-left: 0.5rem; cursor: pointer;">Getting the lowest price possible</label>',
        '    </div>',
        '    <div class="vl-radio-item' + (priority === 'longterm' ? ' selected' : '') + '" data-value="longterm">',
        '      <input type="radio" name="priceVsLongTerm" id="priority-longterm"' + (priority === 'longterm' ? ' checked' : '') + '>',
        '      <label for="priority-longterm" style="margin-left: 0.5rem; cursor: pointer;">Long-term value and quality</label>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    },
    
    'site-challenges': function() {
      return [
        '<div class="vl-form-group">',
        '  <label class="vl-form-label" for="siteChallenges">Site Challenges or Special Considerations *</label>',
        '  <p class="vl-helper-text">Are there any challenges with your property we should know about? (slopes, access issues, existing features, etc.)</p>',
        '  <textarea class="vl-form-textarea" id="siteChallenges" name="siteChallenges" rows="4" placeholder="Describe any site challenges, access issues, or special considerations...">' + formState.data.siteChallenges + '</textarea>',
        '</div>'
      ].join('');
    },
    
    'success-criteria': function() {
      return [
        '<div class="vl-form-group">',
        '  <label class="vl-form-label" for="projectSuccessCriteria">Project Success Criteria *</label>',
        '  <p class="vl-helper-text">How will you know this project was successful? What are your main goals?</p>',
        '  <textarea class="vl-form-textarea" id="projectSuccessCriteria" name="projectSuccessCriteria" rows="4" placeholder="Describe what success looks like for this project...">' + formState.data.projectSuccessCriteria + '</textarea>',
        '</div>'
      ].join('');
    },
    
    'upload': function() {
      var uploadedCount = formState.data.photos.length;
      return [
        '<div class="vl-form-group">',
        '  <label class="vl-form-label">Upload Property Photos (Optional)</label>',
        '  <p class="vl-helper-text">Share photos of your property to help us provide a more accurate quote.</p>',
        '  <div class="vl-upload-area" id="upload-area">',
        '    <input type="file" id="photo-upload" multiple accept="image/*" style="display: none;">',
        '    <svg style="width: 3rem; height: 3rem; margin: 0 auto 1rem; display: block; color: #9ca3af;" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
        '      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>',
        '    </svg>',
        '    <button type="button" class="vl-btn vl-btn-secondary" onclick="document.getElementById(\'photo-upload\').click();">Choose Files</button>',
        '    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">or drag and drop images here</p>',
        '  </div>',
        uploadedCount > 0 ? '<div class="vl-success">✓ ' + uploadedCount + ' photo' + (uploadedCount > 1 ? 's' : '') + ' uploaded successfully</div>' : '',
        '  <div class="vl-uploaded-images" id="uploaded-images"></div>',
        '</div>',
        '<div class="vl-form-group">',
        '  <div class="vl-checkbox-item' + (formState.data.textUploadLink ? ' selected' : '') + '" id="text-upload-option">',
        '    <input type="checkbox" id="textUploadLink"' + (formState.data.textUploadLink ? ' checked' : '') + '>',
        '    <label for="textUploadLink" style="margin-left: 0.5rem; cursor: pointer;">',
        '      <strong>Text me the upload link</strong><br>',
        '      <span style="font-size: 0.875rem; color: #6b7280;">Don\'t have photos on your device? We\'ll send you a link to upload them later.</span>',
        '    </label>',
        '  </div>',
        '</div>'
      ].join('');
    }
  };

  // Render current step
  function renderCurrentStep() {
    var content = document.getElementById('vl-form-content');
    var title = document.getElementById('vl-step-title');
    var subtitle = document.getElementById('vl-step-subtitle');
    
    if (!content) return;
    
    var steps = generateSteps();
    var currentStep = steps[formState.currentStep];
    
    if (!currentStep) {
      renderThankYou();
      return;
    }
    
    // Update header
    if (title) title.textContent = currentStep.title;
    if (subtitle) subtitle.textContent = currentStep.subtitle;
    
    // Render step content
    var renderer = stepRenderers[currentStep.id];
    if (renderer) {
      content.innerHTML = renderer();
      setupStepHandlers(currentStep.id);
    } else {
      content.innerHTML = '<div class="vl-warning">Step content not found: ' + currentStep.id + '</div>';
    }
    
    updateProgressBar();
    updateNavigationButtons();
  }

  // Thank you page
  function renderThankYou() {
    var content = document.getElementById('vl-form-content');
    var footer = document.querySelector('.vl-form-footer');
    var title = document.getElementById('vl-step-title');
    var subtitle = document.getElementById('vl-step-subtitle');
    
    if (title) title.textContent = 'Thank You!';
    if (subtitle) subtitle.textContent = 'Your request has been submitted';
    if (footer) footer.style.display = 'none';
    
    content.innerHTML = [
      '<div style="text-align: center; padding: 2rem;">',
      '  <div style="width: 4rem; height: 4rem; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">',
      '    <svg style="width: 2rem; height: 2rem; color: #f59e0b;" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
      '      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>',
      '    </svg>',
      '  </div>',
      '  <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Your request has been submitted successfully!</h2>',
      '  <p style="color: #6b7280; margin-bottom: 2rem;">We\'ll review your information and contact you within 24 hours.</p>',
      '  <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 0.375rem; padding: 1.5rem; text-align: left;">',
      '    <h3 style="font-weight: 600; margin-bottom: 1rem;">What happens next?</h3>',
      '    <ol style="list-style: decimal; margin-left: 1.5rem; space-y: 0.5rem;">',
      '      <li>Check your email for a confirmation message</li>',
      '      <li>We\'ll review your project details and prepare a custom quote</li>',
      '      <li>A team member will contact you within 24 hours to discuss your project</li>',
      '    </ol>',
      '  </div>',
      '</div>'
    ].join('');
  }

  // Setup event handlers for each step
  function setupStepHandlers(stepId) {
    switch (stepId) {
      case 'personal-info':
        ['firstName', 'lastName', 'email', 'phone'].forEach(function(field) {
          var input = document.getElementById(field);
          if (input) {
            input.addEventListener('input', function(e) {
              formState.data.personalInfo[field] = e.target.value;
              debouncedAutoSave();
            });
          }
        });
        
        var referralSelect = document.getElementById('referralSource');
        if (referralSelect) {
          referralSelect.addEventListener('change', function(e) {
            formState.data.personalInfo.referralSource = e.target.value;
            debouncedAutoSave();
          });
        }
        
        // Phone number formatting
        var phoneInput = document.getElementById('phone');
        if (phoneInput) {
          phoneInput.addEventListener('input', function(e) {
            var value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
              if (value.length <= 3) {
                e.target.value = '(' + value;
              } else if (value.length <= 6) {
                e.target.value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
              } else {
                e.target.value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6, 10);
              }
            }
            formState.data.personalInfo.phone = e.target.value;
          });
        }
        break;
      
      case 'address':
        ['address', 'postalCode'].forEach(function(field) {
          var input = document.getElementById(field);
          if (input) {
            input.addEventListener('input', function(e) {
              formState.data[field] = e.target.value;
              debouncedAutoSave();
            });
          }
        });
        
        // Setup Google Maps autocomplete
        setupGoogleMapsAutocomplete();
        break;
      
      case 'services':
        var serviceItems = document.querySelectorAll('.vl-service-item');
        serviceItems.forEach(function(item) {
          item.addEventListener('click', function() {
            var serviceId = this.dataset.serviceId;
            var checkbox = this.querySelector('input[type="checkbox"]');
            var index = formState.data.services.indexOf(serviceId);
            
            if (index > -1) {
              formState.data.services.splice(index, 1);
              checkbox.checked = false;
              this.classList.remove('selected');
            } else {
              formState.data.services.push(serviceId);
              checkbox.checked = true;
              this.classList.add('selected');
            }
            
            debouncedAutoSave();
          });
        });
        break;
      
      case 'budget':
        var budgetInputs = document.querySelectorAll('input[id^="budget-"]');
        budgetInputs.forEach(function(input) {
          input.addEventListener('input', function(e) {
            var serviceId = this.dataset.serviceId;
            formState.data.budgets[serviceId] = Number(e.target.value);
            debouncedAutoSave();
          });
        });
        break;
      
      case 'service-details':
        // Checkbox options
        var checkboxItems = document.querySelectorAll('.vl-checkbox-item[data-option]');
        checkboxItems.forEach(function(item) {
          item.addEventListener('click', function() {
            var serviceId = this.dataset.serviceId;
            var option = this.dataset.option;
            var checkbox = this.querySelector('input[type="checkbox"]');
            
            if (!formState.data.serviceDetails[serviceId]) {
              formState.data.serviceDetails[serviceId] = [];
            }
            
            var details = formState.data.serviceDetails[serviceId];
            var index = Array.isArray(details) ? details.indexOf(option) : -1;
            
            if (index > -1) {
              details.splice(index, 1);
              checkbox.checked = false;
              this.classList.remove('selected');
            } else {
              if (Array.isArray(details)) {
                details.push(option);
              }
              checkbox.checked = true;
              this.classList.add('selected');
            }
            
            debouncedAutoSave();
          });
        });
        
        // Radio options
        var radioItems = document.querySelectorAll('.vl-radio-item[data-option]');
        radioItems.forEach(function(item) {
          item.addEventListener('click', function() {
            var serviceId = this.dataset.serviceId;
            var option = this.dataset.option;
            var radio = this.querySelector('input[type="radio"]');
            
            // Clear other selections
            document.querySelectorAll('.vl-radio-item[data-service-id="' + serviceId + '"]').forEach(function(other) {
              other.classList.remove('selected');
            });
            
            this.classList.add('selected');
            radio.checked = true;
            formState.data.serviceDetails[serviceId] = option;
            
            debouncedAutoSave();
          });
        });
        
        // Select options
        var selectInputs = document.querySelectorAll('select[id^="property-size-"]');
        selectInputs.forEach(function(select) {
          select.addEventListener('change', function(e) {
            var serviceId = this.dataset.serviceId;
            formState.data.serviceDetails[serviceId] = e.target.value;
            debouncedAutoSave();
          });
        });
        break;
      
      case 'project-scope':
        var scopeInput = document.getElementById('projectScope');
        if (scopeInput) {
          scopeInput.addEventListener('input', function(e) {
            formState.data.projectScope = e.target.value;
            debouncedAutoSave();
          });
        }
        break;
      
      case 'timeline':
        var startInputs = document.querySelectorAll('input[id^="start-date-"]');
        var deadlineInputs = document.querySelectorAll('input[id^="deadline-"]');
        
        startInputs.forEach(function(input) {
          input.addEventListener('change', function(e) {
            var serviceId = this.dataset.serviceId;
            if (!formState.data.startDeadlines[serviceId]) {
              formState.data.startDeadlines[serviceId] = {};
            }
            formState.data.startDeadlines[serviceId].startDate = e.target.value;
            
            // Update deadline min date
            var deadlineInput = document.getElementById('deadline-' + serviceId);
            if (deadlineInput) {
              deadlineInput.min = e.target.value;
            }
            
            debouncedAutoSave();
          });
        });
        
        deadlineInputs.forEach(function(input) {
          input.addEventListener('change', function(e) {
            var serviceId = this.dataset.serviceId;
            if (!formState.data.startDeadlines[serviceId]) {
              formState.data.startDeadlines[serviceId] = {};
            }
            formState.data.startDeadlines[serviceId].deadline = e.target.value;
            debouncedAutoSave();
          });
        });
        break;
      
      case 'previous-provider':
        var providerInput = document.getElementById('previousProvider');
        if (providerInput) {
          providerInput.addEventListener('input', function(e) {
            formState.data.previousProvider = e.target.value;
            debouncedAutoSave();
          });
        }
        break;
      
      case 'previous-quotes':
        var quoteItems = document.querySelectorAll('.vl-radio-item[data-value]');
        quoteItems.forEach(function(item) {
          item.addEventListener('click', function() {
            var value = this.dataset.value === 'true';
            var radio = this.querySelector('input[type="radio"]');
            
            document.querySelectorAll('.vl-radio-item').forEach(function(other) {
              other.classList.remove('selected');
            });
            
            this.classList.add('selected');
            radio.checked = true;
            formState.data.previousQuotes = value;
            
            debouncedAutoSave();
          });
        });
        break;
      
      case 'price-vs-longterm':
        var priorityItems = document.querySelectorAll('.vl-radio-item[data-value]');
        priorityItems.forEach(function(item) {
          item.addEventListener('click', function() {
            var value = this.dataset.value;
            var radio = this.querySelector('input[type="radio"]');
            
            document.querySelectorAll('.vl-radio-item').forEach(function(other) {
              other.classList.remove('selected');
            });
            
            this.classList.add('selected');
            radio.checked = true;
            formState.data.priceVsLongTerm = value;
            
            debouncedAutoSave();
          });
        });
        break;
      
      case 'site-challenges':
        var challengesInput = document.getElementById('siteChallenges');
        if (challengesInput) {
          challengesInput.addEventListener('input', function(e) {
            formState.data.siteChallenges = e.target.value;
            debouncedAutoSave();
          });
        }
        break;
      
      case 'success-criteria':
        var criteriaInput = document.getElementById('projectSuccessCriteria');
        if (criteriaInput) {
          criteriaInput.addEventListener('input', function(e) {
            formState.data.projectSuccessCriteria = e.target.value;
            debouncedAutoSave();
          });
        }
        break;
      
      case 'upload':
        setupUploadHandlers();
        
        var textOption = document.getElementById('text-upload-option');
        if (textOption) {
          textOption.addEventListener('click', function() {
            var checkbox = this.querySelector('input[type="checkbox"]');
            formState.data.textUploadLink = !formState.data.textUploadLink;
            checkbox.checked = formState.data.textUploadLink;
            this.classList.toggle('selected');
            debouncedAutoSave();
          });
        }
        break;
    }
  }

  // Upload handlers
  function setupUploadHandlers() {
    var uploadArea = document.getElementById('upload-area');
    var fileInput = document.getElementById('photo-upload');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', function() {
      fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
      handleFiles(e.target.files);
    });
  }

  function handleFiles(files) {
    var uploadedDiv = document.getElementById('uploaded-images');
    if (!uploadedDiv) return;
    
    Array.from(files).forEach(function(file) {
      if (!file.type.startsWith('image/')) return;
      
      var reader = new FileReader();
      reader.onload = function(e) {
        // Add to state
        formState.data.photos.push({
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target.result
        });
        
        // Display thumbnail
        var wrapper = document.createElement('div');
        wrapper.className = 'vl-uploaded-image';
        wrapper.innerHTML = [
          '<img src="' + e.target.result + '" alt="' + file.name + '">',
          '<button type="button" data-index="' + (formState.data.photos.length - 1) + '">×</button>'
        ].join('');
        
        wrapper.querySelector('button').addEventListener('click', function() {
          var index = parseInt(this.dataset.index);
          formState.data.photos.splice(index, 1);
          wrapper.remove();
          debouncedAutoSave();
          renderCurrentStep(); // Re-render to update count
        });
        
        uploadedDiv.appendChild(wrapper);
        debouncedAutoSave();
        renderCurrentStep(); // Re-render to update count
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Google Maps autocomplete
  function setupGoogleMapsAutocomplete() {
    if (!CONFIG.GOOGLE_MAPS_API_KEY) return;
    
    var addressInput = document.getElementById('address');
    if (!addressInput) return;
    
    // Load Google Maps if not loaded
    if (!window.google || !window.google.maps) {
      var script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + CONFIG.GOOGLE_MAPS_API_KEY + '&libraries=places&callback=initGoogleMaps';
      script.async = true;
      window.initGoogleMaps = function() {
        setupAutocompleteInstance();
      };
      document.head.appendChild(script);
    } else {
      setupAutocompleteInstance();
    }
    
    function setupAutocompleteInstance() {
      if (!window.google || !window.google.maps || !window.google.maps.places) return;
      
      var autocomplete = new google.maps.places.Autocomplete(addressInput, {
        types: ['address'],
        componentRestrictions: { country: 'ca' },
        fields: ['address_components', 'formatted_address', 'geometry']
      });
      
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (place.formatted_address) {
          formState.data.address = place.formatted_address;
          
          // Extract postal code
          if (place.address_components) {
            for (var i = 0; i < place.address_components.length; i++) {
              var component = place.address_components[i];
              if (component.types.indexOf('postal_code') > -1) {
                formState.data.postalCode = component.long_name;
                var postalInput = document.getElementById('postalCode');
                if (postalInput) postalInput.value = component.long_name;
                break;
              }
            }
          }
          
          // Check service area
          checkServiceArea(place.geometry);
        }
      });
    }
  }

  // Check if address is in service area
  function checkServiceArea(geometry) {
    // Simple check - in real app this would check against actual service boundaries
    formState.data.isInServiceArea = true; // Default to true for now
  }

  // Progress bar
  function updateProgressBar() {
    var steps = generateSteps();
    var progress = ((formState.currentStep + 1) / steps.length) * 100;
    var progressBar = document.getElementById('vl-progress-bar');
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
  }

  // Navigation buttons
  function updateNavigationButtons() {
    var backBtn = document.getElementById('vl-btn-back');
    var nextBtn = document.getElementById('vl-btn-next');
    var steps = generateSteps();
    
    if (backBtn) {
      backBtn.style.display = formState.currentStep > 0 ? 'inline-flex' : 'none';
    }
    
    if (nextBtn) {
      nextBtn.textContent = formState.currentStep === steps.length - 1 ? 'Submit' : 'Next';
      nextBtn.disabled = !validateCurrentStep();
    }
  }

  // Validation for each step
  function validateCurrentStep() {
    var steps = generateSteps();
    var currentStep = steps[formState.currentStep];
    
    if (!currentStep) return false;
    
    switch (currentStep.id) {
      case 'personal-info':
        var info = formState.data.personalInfo;
        return info.firstName.trim() !== '' &&
               info.lastName.trim() !== '' &&
               info.email.trim() !== '' &&
               isValidEmail(info.email) &&
               info.phone.replace(/\D/g, '').length === 10;
      
      case 'address':
        return formState.data.address.trim() !== '' &&
               formState.data.postalCode.trim() !== '';
      
      case 'services':
        return formState.data.services.length > 0;
      
      case 'budget':
        return formState.data.services.every(function(serviceId) {
          return formState.data.budgets[serviceId] > 0;
        });
      
      case 'service-details':
        // Optional step - always valid
        return true;
      
      case 'project-scope':
        return formState.data.projectScope.trim() !== '';
      
      case 'timeline':
        return formState.data.services.every(function(serviceId) {
          var dates = formState.data.startDeadlines[serviceId];
          return dates && dates.startDate;
        });
      
      case 'previous-provider':
        return formState.data.previousProvider.trim() !== '';
      
      case 'previous-quotes':
        return formState.data.previousQuotes !== null;
      
      case 'price-vs-longterm':
        return formState.data.priceVsLongTerm !== null;
      
      case 'site-challenges':
        return formState.data.siteChallenges.trim() !== '';
      
      case 'success-criteria':
        return formState.data.projectSuccessCriteria.trim() !== '';
      
      case 'upload':
        // Optional step
        return true;
      
      default:
        return true;
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Navigation
  function goToNextStep() {
    if (validateCurrentStep()) {
      var steps = generateSteps();
      if (formState.currentStep < steps.length - 1) {
        formState.currentStep++;
        renderCurrentStep();
      } else {
        submitForm();
      }
    }
  }

  function goToPreviousStep() {
    if (formState.currentStep > 0) {
      formState.currentStep--;
      renderCurrentStep();
    }
  }

  // Supabase client
  function createSupabaseClient() {
    var baseUrl = CONFIG.SUPABASE_URL + '/rest/v1';
    var headers = {
      'apikey': CONFIG.SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    
    return {
      insert: function(table, data) {
        return fetch(baseUrl + '/' + table, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data)
        }).then(function(response) {
          if (!response.ok) throw new Error('Insert failed');
          return response.json();
        });
      },
      
      update: function(table, data, match) {
        var params = new URLSearchParams();
        Object.keys(match).forEach(function(key) {
          params.append(key, 'eq.' + match[key]);
        });
        
        return fetch(baseUrl + '/' + table + '?' + params.toString(), {
          method: 'PATCH',
          headers: headers,
          body: JSON.stringify(data)
        }).then(function(response) {
          if (!response.ok) throw new Error('Update failed');
          return response.json();
        });
      }
    };
  }

  // Initialize session
  function initializeSession() {
    if (formState.sessionId) return Promise.resolve();
    
    var supabase = createSupabaseClient();
    var sessionData = {
      form_data: formState.data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      form_type: 'initial',
      source_url: window.location.href,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      status: 'in_progress',
      // Track URL parameters
      utm_source: getUrlParam('utm_source'),
      utm_medium: getUrlParam('utm_medium'),
      utm_campaign: getUrlParam('utm_campaign')
    };
    
    return supabase.insert('form_sessions', sessionData).then(function(result) {
      if (result && result[0]) {
        formState.sessionId = result[0].id;
        console.log('Session initialized:', formState.sessionId);
      }
    }).catch(function(error) {
      console.error('Failed to initialize session:', error);
    });
  }

  function getUrlParam(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || '';
  }

  // Auto-save
  var autoSaveTimeout;
  function debouncedAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(autoSave, 1000);
    
    var status = document.getElementById('vl-autosave-status');
    if (status) {
      status.innerHTML = '<span class="vl-spinner"></span>Saving...';
      status.className = 'vl-autosave saving';
    }
  }

  function autoSave() {
    if (!formState.sessionId) {
      initializeSession().then(function() {
        if (formState.sessionId) {
          performAutoSave();
        }
      });
    } else {
      performAutoSave();
    }
  }

  function performAutoSave() {
    var supabase = createSupabaseClient();
    supabase.update('form_sessions', {
      form_data: formState.data,
      updated_at: new Date().toISOString(),
      current_step: formState.currentStep
    }, { id: formState.sessionId }).then(function() {
      var status = document.getElementById('vl-autosave-status');
      if (status) {
        status.textContent = '✓ Saved';
        status.className = 'vl-autosave saved';
        setTimeout(function() {
          status.textContent = '';
          status.className = 'vl-autosave';
        }, 2000);
      }
    }).catch(function(error) {
      console.error('Auto-save failed:', error);
      var status = document.getElementById('vl-autosave-status');
      if (status) {
        status.textContent = 'Save failed';
        status.className = 'vl-autosave';
      }
    });
  }

  // WhatConverts tracking
  function fireTrackingEvent(eventName, eventData) {
    try {
      // WhatConverts
      if (window.whatconverts && window.whatconverts.track) {
        window.whatconverts.track(eventName, Object.assign({
          form_type: 'vl_landscape_quote',
          form_version: '2.0'
        }, eventData));
      }
      
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', eventName, Object.assign({
          event_category: 'VL Form',
          event_label: 'Landscape Quote'
        }, eventData));
      }
      
      // Facebook Pixel
      if (window.fbq) {
        window.fbq('track', 'Lead', eventData);
      }
      
      console.log('Tracking event:', eventName, eventData);
    } catch (error) {
      console.error('Tracking failed:', error);
    }
  }

  // Handle form submission for tracking
  function handleFormSubmit(event) {
    var steps = generateSteps();
    var isLastStep = formState.currentStep === steps.length - 1;
    
    // If not on last step, prevent submission and continue to next step
    if (!isLastStep) {
      event.preventDefault();
      goToNextStep();
      return false;
    }
    
    // Last step - prepare for submission but let form submit naturally for tracking
    event.preventDefault(); // We'll trigger it manually after prep
    
    var nextBtn = document.getElementById('vl-btn-next');
    if (nextBtn) {
      nextBtn.innerHTML = '<span class="vl-spinner"></span>Submitting...';
      nextBtn.disabled = true;
    }
    
    // Update hidden fields for tracking
    updateHiddenFields();
    
    // Save to Supabase first
    if (formState.sessionId) {
      var supabase = createSupabaseClient();
      supabase.update('form_sessions', {
        form_data: formState.data,
        updated_at: new Date().toISOString(),
        status: 'completed',
        completed_at: new Date().toISOString()
      }, { id: formState.sessionId }).then(function() {
        // Fire tracking events
        fireTrackingEvent('form_submitted', {
          services: formState.data.services.join(','),
          has_photos: formState.data.photos.length > 0,
          total_steps: generateSteps().length,
          session_id: formState.sessionId
        });
        
        // Trigger real form submission for tracking
        triggerFormSubmissionEvent();
        
        // Show thank you after short delay
        setTimeout(function() {
          renderThankYou();
        }, 100);
        
      }).catch(function(error) {
        console.error('Submission failed:', error);
        alert('Failed to submit form. Please try again.');
        
        if (nextBtn) {
          nextBtn.textContent = 'Submit';
          nextBtn.disabled = false;
        }
      });
    } else {
      // Fallback - trigger tracking and show thank you
      triggerFormSubmissionEvent();
      setTimeout(function() {
        renderThankYou();
      }, 100);
    }
    
    return false;
  }
  
  // Update hidden fields with current form data
  function updateHiddenFields() {
    var hiddenFields = {
      'hidden-session-id': formState.sessionId || '',
      'hidden-services': formState.data.services.join(','),
      'hidden-firstName': formState.data.personalInfo.firstName || '',
      'hidden-lastName': formState.data.personalInfo.lastName || '',
      'hidden-email': formState.data.personalInfo.email || '',
      'hidden-phone': formState.data.personalInfo.phone || '',
      'hidden-address': formState.data.address || '',
      'hidden-total-budget': Object.values(formState.data.budgets).reduce(function(sum, budget) { return sum + (budget || 0); }, 0)
    };
    
    Object.keys(hiddenFields).forEach(function(id) {
      var field = document.getElementById(id);
      if (field) {
        field.value = hiddenFields[id];
      }
    });
  }
  
  // Trigger form submission event for tracking tools
  function triggerFormSubmissionEvent() {
    var form = document.getElementById('vl-landscape-form');
    if (form) {
      // Create and dispatch a submit event for tracking tools to capture
      var submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
      });
      
      // Temporarily remove our handler to avoid recursion
      form.onsubmit = null;
      
      // Dispatch the event for tracking tools
      form.dispatchEvent(submitEvent);
      
      // Restore our handler
      setTimeout(function() {
        form.onsubmit = handleFormSubmit;
      }, 100);
    }
  }
  
  // Legacy submit function (keeping for compatibility)
  function submitForm() {
    // This now triggers the form submission process
    var form = document.getElementById('vl-landscape-form');
    if (form) {
      var submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
      });
      form.dispatchEvent(submitEvent);
    }
  }

  // Initialize form
  function initializeForm() {
    injectStyles();
    
    var containers = document.querySelectorAll('.vl-form-embed');
    
    // If no containers found, check for legacy ID
    if (containers.length === 0) {
      var legacyContainer = document.getElementById('vl-form-container');
      if (legacyContainer) {
        containers = [legacyContainer];
      }
    }
    
    containers.forEach(function(container, index) {
      // Create unique ID if not present
      if (!container.id) {
        container.id = 'vl-form-embed-' + index;
      }
      
      // Insert form HTML
      container.innerHTML = createFormHTML();
      
      // Setup navigation handlers
      var backBtn = document.getElementById('vl-btn-back');
      var nextBtn = document.getElementById('vl-btn-next');
      
      if (backBtn) {
        backBtn.addEventListener('click', goToPreviousStep);
      }
      
      if (nextBtn) {
        // Remove click handler since we're using form submission
        // The form's onsubmit handler will take care of navigation and submission
      }
      
      // Initialize session early
      initializeSession();
      
      // Render first step
      renderCurrentStep();
      
      // Track form start
      fireTrackingEvent('form_started', {
        source_url: window.location.href,
        referrer: document.referrer
      });
      
      console.log('VL Form initialized successfully');
    });
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForm);
  } else {
    initializeForm();
  }
})();