(function() {
  // Prevent multiple loads
  if (window.VLFormLoaded) {
    return;
  }
  window.VLFormLoaded = true;

  // Configuration - will be replaced with environment variables
  const CONFIG = {
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key',
    GOOGLE_MAPS_API_KEY: 'your-google-maps-key'
  };

  // Service definitions
  const SERVICES = {
    'landscape-design-build': {
      name: 'Landscape Design & Build',
      category: 'projects',
      options: {
        elements: [
          'Driveway', 'Walkway', 'Patio', 'Front/back entrance', 'Pergola',
          'Fire Feature', 'Water Feature', 'Kitchen', 'Dining', 'Fence/gates',
          'Pool', 'Shed/pool house', 'Lighting', 'Decorative Stone', 'Sports Area',
          'Playground', 'Fitness Area', 'Sod/Lawn', 'Irrigation'
        ]
      }
    },
    'landscape-enhancement': {
      name: 'Landscape Enhancement',
      category: 'projects',
      options: {
        types: ['Sod', 'Overseeding', 'Mulch', 'Spring/fall cleanup']
      }
    },
    'lawn-maintenance': {
      name: 'Routine Lawn Maintenance',
      category: 'maintenance',
      options: {
        types: ['Basic', 'Premium (includes mowing service + garden maintenance)']
      }
    },
    'snow-management': {
      name: 'Snow Management',
      category: 'maintenance',
      options: {
        propertySizes: [
          'Single car', 'Two car', 'Three car', 'Four car',
          'Irregular driveway size', 'Commercial lot'
        ]
      }
    },
    'other': {
      name: 'Other',
      category: 'other'
    }
  };

  // HTML template for the form
  const FORM_HTML = `
    <style>
      /* Reset and base styles */
      .vl-form-embed {
        box-sizing: border-box !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        color: #333333 !important;
        text-align: left !important;
        background: transparent !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 600px !important;
        height: 775px !important;
      }

      .vl-form-embed *,
      .vl-form-embed *::before,
      .vl-form-embed *::after {
        box-sizing: border-box !important;
      }

      /* Card container */
      .vl-form-card {
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
        height: 100% !important;
        display: flex !important;
        flex-direction: column !important;
      }

      /* Header */
      .vl-form-header {
        padding: 1.25rem 1.75rem !important;
        border-bottom: 1px solid #e5e7eb !important;
        flex-shrink: 0 !important;
      }

      .vl-form-title {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        color: #111827 !important;
        margin: 0 0 0.5rem 0 !important;
      }

      .vl-form-description {
        font-size: 0.875rem !important;
        color: #6b7280 !important;
        margin: 0 !important;
      }

      /* Content area */
      .vl-form-content {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 0 !important;
        padding: 1.75rem !important;
      }

      .vl-form-scroll {
        flex: 1 !important;
        overflow-y: auto !important;
        padding-right: 4px !important;
      }

      /* Form sections */
      .vl-form-step {
        display: none !important;
      }

      .vl-form-step.active {
        display: block !important;
      }

      .vl-form-section {
        margin-bottom: 1.5rem !important;
      }

      .vl-form-section:last-child {
        margin-bottom: 0 !important;
      }

      /* Labels and inputs */
      .vl-form-label {
        display: block !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        color: #374151 !important;
        margin-bottom: 0.5rem !important;
      }

      .vl-form-input {
        width: 100% !important;
        padding: 0.5rem 0.75rem !important;
        border: 1px solid #d1d5db !important;
        border-radius: 6px !important;
        font-size: 0.875rem !important;
        color: #111827 !important;
        background-color: white !important;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
      }

      .vl-form-input:focus {
        outline: none !important;
        border-color: #d97706 !important;
        box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1) !important;
      }

      .vl-form-textarea {
        width: 100% !important;
        padding: 0.5rem 0.75rem !important;
        border: 1px solid #d1d5db !important;
        border-radius: 6px !important;
        font-size: 0.875rem !important;
        color: #111827 !important;
        background-color: white !important;
        resize: vertical !important;
        min-height: 80px !important;
      }

      .vl-form-textarea:focus {
        outline: none !important;
        border-color: #d97706 !important;
        box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1) !important;
      }

      .vl-form-select {
        width: 100% !important;
        padding: 0.5rem 0.75rem !important;
        border: 1px solid #d1d5db !important;
        border-radius: 6px !important;
        font-size: 0.875rem !important;
        color: #111827 !important;
        background-color: white !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
        background-position: right 0.5rem center !important;
        background-repeat: no-repeat !important;
        background-size: 1.5em 1.5em !important;
        padding-right: 2.5rem !important;
      }

      .vl-form-select:focus {
        outline: none !important;
        border-color: #d97706 !important;
        box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1) !important;
      }

      /* Grid layouts */
      .vl-form-grid-2 {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 1rem !important;
      }

      .vl-form-grid-3 {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 0.5rem !important;
      }

      @media (max-width: 640px) {
        .vl-form-grid-2 {
          grid-template-columns: 1fr !important;
        }
        .vl-form-grid-3 {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }

      /* Checkboxes and radio buttons */
      .vl-form-checkbox-group {
        display: flex !important;
        align-items: flex-start !important;
        gap: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      .vl-form-checkbox {
        width: 1rem !important;
        height: 1rem !important;
        margin-top: 0.125rem !important;
        accent-color: #d97706 !important;
      }

      .vl-form-radio {
        width: 1rem !important;
        height: 1rem !important;
        margin-top: 0.125rem !important;
        accent-color: #d97706 !important;
      }

      .vl-form-checkbox-label,
      .vl-form-radio-label {
        font-size: 0.875rem !important;
        color: #374151 !important;
        cursor: pointer !important;
        line-height: 1.25 !important;
      }

      /* Service cards */
      .vl-service-card {
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        padding: 1rem !important;
        margin-bottom: 1rem !important;
        background: #f9fafb !important;
      }

      .vl-service-card h3 {
        font-size: 1.125rem !important;
        font-weight: 600 !important;
        color: #111827 !important;
        margin: 0 0 0.75rem 0 !important;
      }

      /* Timeline radio buttons */
      .vl-timeline-option {
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        padding: 0.75rem !important;
        border: 1px solid #d1d5db !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        transition: all 0.15s ease-in-out !important;
      }

      .vl-timeline-option:hover {
        background-color: #fef3c7 !important;
        border-color: #f59e0b !important;
      }

      .vl-timeline-option.selected {
        background-color: #fef3c7 !important;
        border-color: #d97706 !important;
      }

      /* Buttons */
      .vl-form-footer {
        flex-shrink: 0 !important;
        border-top: 1px solid #e5e7eb !important;
        padding: 1.25rem 1.75rem !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }

      .vl-form-button {
        display: inline-flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        padding: 0.5rem 1rem !important;
        border-radius: 6px !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.15s ease-in-out !important;
        border: 1px solid transparent !important;
      }

      .vl-form-button-primary {
        background-color: #d97706 !important;
        color: white !important;
      }

      .vl-form-button-primary:hover:not(:disabled) {
        background-color: #b45309 !important;
      }

      .vl-form-button-primary:disabled {
        background-color: #9ca3af !important;
        cursor: not-allowed !important;
      }

      .vl-form-button-secondary {
        background-color: white !important;
        color: #374151 !important;
        border-color: #d1d5db !important;
      }

      .vl-form-button-secondary:hover {
        background-color: #f9fafb !important;
      }

      /* Error messages */
      .vl-form-error {
        color: #dc2626 !important;
        font-size: 0.75rem !important;
        margin-top: 0.25rem !important;
      }

      /* File upload */
      .vl-upload-area {
        border: 2px dashed #d1d5db !important;
        border-radius: 8px !important;
        padding: 2rem !important;
        text-align: center !important;
        cursor: pointer !important;
        transition: border-color 0.15s ease-in-out !important;
      }

      .vl-upload-area:hover {
        border-color: #9ca3af !important;
      }

      .vl-upload-area.dragover {
        border-color: #d97706 !important;
        background-color: #fef3c7 !important;
      }

      /* Thank you page */
      .vl-thank-you {
        text-align: center !important;
        padding: 2rem 0 !important;
      }

      .vl-thank-you-icon {
        width: 4rem !important;
        height: 4rem !important;
        background-color: #fef3c7 !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 auto 1.5rem auto !important;
      }

      .vl-thank-you-content {
        background-color: #fef3c7 !important;
        border: 1px solid #f59e0b !important;
        border-radius: 8px !important;
        padding: 1.5rem !important;
        margin: 1.5rem 0 !important;
        text-align: left !important;
      }

      /* Budget input with dollar sign */
      .vl-budget-input-container {
        position: relative !important;
      }

      .vl-budget-input-container::before {
        content: '$' !important;
        position: absolute !important;
        left: 0.75rem !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        color: #6b7280 !important;
        pointer-events: none !important;
      }

      .vl-budget-input {
        padding-left: 1.75rem !important;
      }

      /* Loading states */
      .vl-loading {
        opacity: 0.6 !important;
        pointer-events: none !important;
      }

      .vl-spinner {
        display: inline-block !important;
        width: 1rem !important;
        height: 1rem !important;
        border: 2px solid #f3f4f6 !important;
        border-top: 2px solid #d97706 !important;
        border-radius: 50% !important;
        animation: vl-spin 1s linear infinite !important;
      }

      @keyframes vl-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
    
    <div class="vl-form-card">
      <!-- Header -->
      <div class="vl-form-header">
        <h2 class="vl-form-title" id="vl-step-title">Contact Information</h2>
        <p class="vl-form-description" id="vl-step-description">Step 1 of 6</p>
      </div>

      <!-- Content -->
      <div class="vl-form-content">
        <div class="vl-form-scroll">
          <!-- Steps will be dynamically generated here -->
          <div id="vl-form-steps"></div>
        </div>

        <!-- Footer with navigation -->
        <div class="vl-form-footer" id="form-footer">
          <div>
            <button type="button" id="back-button" class="vl-form-button vl-form-button-secondary" style="display: none;">
              <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </button>
          </div>
          <div>
            <button type="button" id="next-button" class="vl-form-button vl-form-button-primary" disabled>
              <span id="next-button-text">Next</span>
              <svg id="next-button-icon" style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
              <div id="submit-spinner" class="vl-spinner" style="display: none;"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Form implementation class
  class VLForm {
    constructor(containerId) {
      this.containerId = containerId;
      this.container = document.getElementById(containerId);
      this.formData = {
        sessionId: null,
        currentStep: 0,
        sessionInitialized: false,
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          referralSource: ''
        },
        address: '',
        services: [],
        serviceDetails: {},
        projectScope: '',
        siteChallenges: '',
        budgets: {},
        startDeadlines: {},
        uploadedImages: [],
        textUploadRequested: false,
        isSubmitting: false
      };

      this.steps = [
        { id: 'contact', title: 'Contact Information', required: true },
        { id: 'address', title: 'Property Address', required: true },
        { id: 'services', title: 'Service Selection', required: true },
        { id: 'project-details', title: 'Project Details', required: false, condition: () => this.hasProjectServices() },
        { id: 'maintenance-details', title: 'Maintenance Details', required: false, condition: () => this.hasMaintenanceServices() },
        { id: 'upload', title: 'Upload Photos', required: true }
      ];

      this.init();
    }

    init() {
      if (!this.container) {
        console.error('VL Form: Container not found');
        return;
      }

      // Add embed class
      this.container.classList.add('vl-form-embed');
      
      // Inject form HTML
      this.container.innerHTML = FORM_HTML;

      // Capture embed data
      this.captureEmbedData();

      // Initialize form
      this.setupEventListeners();
      this.initializeGoogleMaps();
      this.initializeFileUpload();
      this.generateSteps();
      this.updateStepDisplay();

      // Initialize session
      this.formData.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      this.formData.sessionInitialized = true;

      // Dispatch load event
      window.dispatchEvent(new CustomEvent('vl-form-loaded', {
        detail: {
          containerId: this.containerId,
          formType: 'vl-landscape-quote',
          timestamp: new Date().toISOString()
        },
        bubbles: true,
        cancelable: false
      }));

      console.log('VL Form initialized successfully');
    }

    captureEmbedData() {
      window.VL_EMBED_DATA = {
        sourceUrl: window.location.href,
        referrer: document.referrer,
        urlParams: window.location.search,
        embedContainer: this.containerId
      };
    }

    hasProjectServices() {
      return this.formData.services.some(service => 
        ['landscape-design-build', 'landscape-enhancement'].includes(service)
      );
    }

    hasMaintenanceServices() {
      return this.formData.services.some(service => 
        ['lawn-maintenance', 'snow-management'].includes(service)
      );
    }

    getActiveSteps() {
      return this.steps.filter(step => step.required || (step.condition && step.condition()));
    }

    // Continue with the rest of the implementation...
    // This would include all the methods from the HTML version
    // I'll add the key methods here for brevity

    generateSteps() {
      const stepsContainer = this.container.querySelector('#vl-form-steps');
      stepsContainer.innerHTML = this.generateStepsHTML();
    }

    generateStepsHTML() {
      // Generate all step HTML dynamically
      // This would be a large method that creates all the step content
      return `
        <!-- Contact Step -->
        <div class="vl-form-step active" id="step-contact">
          <!-- Contact form content -->
        </div>
        <!-- Other steps... -->
      `;
    }

    setupEventListeners() {
      // Set up all event listeners
      const nextButton = this.container.querySelector('#next-button');
      const backButton = this.container.querySelector('#back-button');
      
      nextButton.addEventListener('click', () => this.goToNextStep());
      backButton.addEventListener('click', () => this.goToPrevStep());
      
      // Add other event listeners...
    }

    updateStepDisplay() {
      // Update step display logic
      const activeSteps = this.getActiveSteps();
      const currentStepData = activeSteps[this.formData.currentStep];
      
      // Update header
      this.container.querySelector('#vl-step-title').textContent = 
        currentStepData ? currentStepData.title : 'Complete!';
      this.container.querySelector('#vl-step-description').textContent = 
        currentStepData ? `Step ${this.formData.currentStep + 1} of ${activeSteps.length}` : 'Your request has been submitted';

      // Show/hide appropriate step
      this.container.querySelectorAll('.vl-form-step').forEach(step => {
        step.classList.remove('active');
      });

      if (currentStepData) {
        const stepElement = this.container.querySelector(`#step-${currentStepData.id}`);
        if (stepElement) {
          stepElement.classList.add('active');
        }
      }

      this.updateButtonValidation();
    }

    updateButtonValidation() {
      const nextButton = this.container.querySelector('#next-button');
      const isValid = this.validateCurrentStep();
      nextButton.disabled = !isValid || this.formData.isSubmitting;
    }

    validateCurrentStep() {
      // Validation logic for current step
      return true; // Simplified for brevity
    }

    goToNextStep() {
      if (this.formData.isSubmitting) return;

      const activeSteps = this.getActiveSteps();
      
      if (this.formData.currentStep < activeSteps.length - 1) {
        this.formData.currentStep++;
        this.updateStepDisplay();
      } else {
        this.submitForm();
      }
    }

    goToPrevStep() {
      if (this.formData.currentStep > 0) {
        this.formData.currentStep--;
        this.updateStepDisplay();
      }
    }

    async submitForm() {
      if (this.formData.isSubmitting) return;

      this.formData.isSubmitting = true;
      this.updateStepDisplay();

      try {
        // Fire tracking events
        this.fireTrackingEvents();

        // Show thank you page
        this.formData.currentStep = this.getActiveSteps().length;
        this.updateStepDisplay();

      } catch (error) {
        console.error('Form submission error:', error);
        alert('There was an error submitting your form. Please try again.');
        this.formData.isSubmitting = false;
        this.updateStepDisplay();
      }
    }

    fireTrackingEvents() {
      const trackingData = {
        formId: 'vl-landscape-form',
        sessionId: this.formData.sessionId,
        firstName: this.formData.personalInfo.firstName,
        lastName: this.formData.personalInfo.lastName,
        email: this.formData.personalInfo.email,
        phone: this.formData.personalInfo.phone,
        address: this.formData.address,
        services: this.formData.services.join(', '),
        referralSource: this.formData.personalInfo.referralSource,
        timestamp: new Date().toISOString(),
        sourceUrl: window.location.href,
        referrer: document.referrer,
        urlParams: window.location.search
      };

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('vl-form-submitted', {
        detail: trackingData,
        bubbles: true,
        cancelable: false
      }));

      // Create hidden form for WhatConverts
      const hiddenForm = document.createElement('form');
      hiddenForm.id = 'vl-tracking-form';
      hiddenForm.style.display = 'none';
      hiddenForm.method = 'POST';
      hiddenForm.action = '#';

      Object.entries(trackingData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value || '');
        hiddenForm.appendChild(input);
      });

      document.body.appendChild(hiddenForm);

      // Fire submit event
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
      });
      hiddenForm.dispatchEvent(submitEvent);

      // Remove form after delay
      setTimeout(() => {
        if (document.body.contains(hiddenForm)) {
          document.body.removeChild(hiddenForm);
        }
      }, 100);
    }

    initializeGoogleMaps() {
      // Google Maps initialization
      if (CONFIG.GOOGLE_MAPS_API_KEY && CONFIG.GOOGLE_MAPS_API_KEY !== 'your-google-maps-key') {
        // Load and initialize Google Maps
        // Implementation would go here
      }
    }

    initializeFileUpload() {
      // File upload initialization
      // Implementation would go here
    }
  }

  // Mount function
  function mountForm(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`VL Form: Container with ID "${containerId}" not found`);
      return;
    }

    // Add data attributes for tracking
    container.setAttribute('data-form-type', 'vl-landscape-quote');
    container.setAttribute('data-form-version', '1.0');
    container.setAttribute('data-form-loaded', new Date().toISOString());

    // Create form instance
    new VLForm(containerId);
  }

  // Expose mounting function globally
  window.VLForm = {
    mount: mountForm,
    mounted: true
  };

  // Auto-mount to any existing .vl-form-embed containers
  document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('.vl-form-embed');
    containers.forEach((container, index) => {
      if (!container.id) {
        container.id = `vl-form-embed-${index}`;
      }
      mountForm(container.id);
    });
  });

  // If DOM is already ready, mount immediately
  if (document.readyState !== 'loading') {
    const containers = document.querySelectorAll('.vl-form-embed');
    containers.forEach((container, index) => {
      if (!container.id) {
        container.id = `vl-form-embed-${index}`;
      }
      mountForm(container.id);
    });
  }

})();