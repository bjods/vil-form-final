(function() {
  // Prevent multiple loads
  if (window.VLFormLoaded) {
    return;
  }
  window.VLFormLoaded = true;

  // Configuration
  const CONFIG = {
    SUPABASE_URL: 'https://furekgiahpuetskjtkaj.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1cmVrZ2lhaHB1ZXRza2p0a2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODIzNjUsImV4cCI6MjA2NTA1ODM2NX0.TxL7iNQILqO70yKV-3XNEMGJQFxKPtvgy_WCJoaLG9o',
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
  };

  // Simple Supabase client implementation
  class SupabaseClient {
    constructor(url, key) {
      this.url = url;
      this.key = key;
      this.headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'apikey': key
      };
    }

    async insert(table, data) {
      const response = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...this.headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Insert failed: ${response.statusText}`);
      }
      
      return await response.json();
    }

    async update(table, data, id) {
      const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...this.headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      
      return await response.json();
    }

    async select(table, query = '') {
      const response = await fetch(`${this.url}/rest/v1/${table}${query}`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Select failed: ${response.statusText}`);
      }
      
      return await response.json();
    }
  }

  // Initialize Supabase client
  const supabase = new SupabaseClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

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

  // Form state
  let formData = {
    sessionId: null,
    currentStep: 0,
    sessionInitialized: false,
    lastSaveTime: null,
    autoSaveTimeout: null,
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      referralSource: ''
    },
    address: '',
    postalCode: '',
    insideServiceArea: true,
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

  // Step configuration
  const STEPS = [
    { id: 'contact', title: 'Contact Information', required: true },
    { id: 'address', title: 'Property Address', required: true },
    { id: 'services', title: 'Service Selection', required: true },
    { id: 'project-details', title: 'Project Details', required: false, condition: () => hasProjectServices() },
    { id: 'maintenance-details', title: 'Maintenance Details', required: false, condition: () => hasMaintenanceServices() },
    { id: 'upload', title: 'Upload Photos', required: true }
  ];

  // Utility functions
  function hasProjectServices() {
    return formData.services.some(service => 
      ['landscape-design-build', 'landscape-enhancement'].includes(service)
    );
  }

  function hasMaintenanceServices() {
    return formData.services.some(service => 
      ['lawn-maintenance', 'snow-management'].includes(service)
    );
  }

  function getActiveSteps() {
    return STEPS.filter(step => step.required || (step.condition && step.condition()));
  }

  function formatPhoneNumber(value) {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showError(container, fieldId, message) {
    const errorElement = container.querySelector('#' + fieldId + '-error');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearError(container, fieldId) {
    const errorElement = container.querySelector('#' + fieldId + '-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  function clearAllErrors(container) {
    const errorElements = container.querySelectorAll('.vl-form-error');
    errorElements.forEach(element => element.textContent = '');
  }

  // HTML template for the complete form
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
          
          <!-- Step 1: Contact Information -->
          <div class="vl-form-step active" id="step-contact">
            <div class="vl-form-section">
              <div class="vl-form-grid-2">
                <div>
                  <label class="vl-form-label" for="first-name">First Name</label>
                  <input type="text" id="first-name" class="vl-form-input" placeholder="John" />
                  <div class="vl-form-error" id="first-name-error"></div>
                </div>
                <div>
                  <label class="vl-form-label" for="last-name">Last Name</label>
                  <input type="text" id="last-name" class="vl-form-input" placeholder="Doe" />
                  <div class="vl-form-error" id="last-name-error"></div>
                </div>
              </div>
            </div>

            <div class="vl-form-section">
              <label class="vl-form-label" for="email">Email</label>
              <input type="email" id="email" class="vl-form-input" placeholder="john.doe@example.com" />
              <div class="vl-form-error" id="email-error"></div>
            </div>

            <div class="vl-form-section">
              <label class="vl-form-label" for="phone">Phone Number</label>
              <input type="tel" id="phone" class="vl-form-input" placeholder="(555) 123-4567" />
              <div class="vl-form-error" id="phone-error"></div>
            </div>

            <div class="vl-form-section">
              <label class="vl-form-label" for="referral-source">How did you find us?</label>
              <select id="referral-source" class="vl-form-select">
                <option value="">Select how you found us</option>
                <option value="Direct Mail">Direct Mail</option>
                <option value="Facebook">Facebook</option>
                <option value="Organic Search">Organic Search</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Home Show">Home Show</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Truck Signage">Truck Signage</option>
                <option value="Linkedin">Linkedin</option>
                <option value="Mercedes Benz Catalog">Mercedes Benz Catalog</option>
                <option value="Jobsite Sign">Jobsite Sign</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <!-- Step 2: Property Address -->
          <div class="vl-form-step" id="step-address">
            <div class="vl-form-section">
              <label class="vl-form-label" for="address-input">Property Address</label>
              <input type="text" id="address-input" class="vl-form-input" placeholder="Start typing your address..." autocomplete="off" />
              <div class="vl-form-error" id="address-error"></div>
              <div id="address-warning" style="display: none; color: #f59e0b; font-size: 0.75rem; margin-top: 0.25rem;">
                ⚠️ Google Maps API key not configured. Manual address entry only.
              </div>
            </div>
          </div>

          <!-- Step 3: Service Selection -->
          <div class="vl-form-step" id="step-services">
            <div class="vl-form-section">
              <p style="margin-bottom: 1rem; color: #6b7280; font-size: 0.875rem;">Select the services you're interested in:</p>
              
              <div class="vl-form-checkbox-group">
                <input type="checkbox" id="service-design-build" class="vl-form-checkbox" value="landscape-design-build" />
                <label for="service-design-build" class="vl-form-checkbox-label">Landscape Design & Build</label>
              </div>
              
              <div class="vl-form-checkbox-group">
                <input type="checkbox" id="service-enhancement" class="vl-form-checkbox" value="landscape-enhancement" />
                <label for="service-enhancement" class="vl-form-checkbox-label">Landscape Enhancement</label>
              </div>
              
              <div class="vl-form-checkbox-group">
                <input type="checkbox" id="service-lawn" class="vl-form-checkbox" value="lawn-maintenance" />
                <label for="service-lawn" class="vl-form-checkbox-label">Routine Lawn Maintenance</label>
              </div>
              
              <div class="vl-form-checkbox-group">
                <input type="checkbox" id="service-snow" class="vl-form-checkbox" value="snow-management" />
                <label for="service-snow" class="vl-form-checkbox-label">Snow Management</label>
              </div>
              
              <div class="vl-form-checkbox-group">
                <input type="checkbox" id="service-other" class="vl-form-checkbox" value="other" />
                <label for="service-other" class="vl-form-checkbox-label">Other</label>
              </div>
              
              <div class="vl-form-error" id="services-error"></div>
            </div>
          </div>

          <!-- Step 4: Project Details (conditional) -->
          <div class="vl-form-step" id="step-project-details">
            <!-- Service Details for Project Services -->
            <div id="project-service-details"></div>

            <!-- Project Vision -->
            <div class="vl-form-section">
              <label class="vl-form-label" for="project-vision">Describe Your Vision</label>
              <p style="margin-bottom: 0.75rem; color: #6b7280; font-size: 0.875rem;">What's your dream outdoor space?</p>
              <textarea id="project-vision" class="vl-form-textarea" rows="4" placeholder="Describe your ideal outdoor space, style preferences, specific features you want..."></textarea>
            </div>

            <!-- Budget for Project Services -->
            <div class="vl-form-section">
              <label class="vl-form-label">Budget Range</label>
              <p style="margin-bottom: 0.75rem; color: #6b7280; font-size: 0.875rem;">What's your budget for this project?</p>
              <div id="project-budgets"></div>
            </div>

            <!-- Timeline -->
            <div class="vl-form-section">
              <label class="vl-form-label">When would you like to start?</label>
              <div class="vl-form-grid-2" style="margin-top: 0.75rem;">
                <label class="vl-timeline-option">
                  <input type="radio" name="project-timeline" value="this month" class="vl-form-radio" />
                  <span class="vl-form-radio-label">This month</span>
                </label>
                <label class="vl-timeline-option">
                  <input type="radio" name="project-timeline" value="1-3 months" class="vl-form-radio" />
                  <span class="vl-form-radio-label">1-3 months</span>
                </label>
                <label class="vl-timeline-option">
                  <input type="radio" name="project-timeline" value="3-6 months" class="vl-form-radio" />
                  <span class="vl-form-radio-label">3-6 months</span>
                </label>
                <label class="vl-timeline-option">
                  <input type="radio" name="project-timeline" value="next year" class="vl-form-radio" />
                  <span class="vl-form-radio-label">Next year</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 5: Maintenance Details (conditional) -->
          <div class="vl-form-step" id="step-maintenance-details">
            <!-- Service Details for Maintenance Services -->
            <div id="maintenance-service-details"></div>

            <!-- Site Challenges -->
            <div class="vl-form-section">
              <label class="vl-form-label" for="site-challenges">Site Challenges</label>
              <p style="margin-bottom: 0.75rem; color: #6b7280; font-size: 0.875rem;">Any specific challenges or considerations for your property?</p>
              <textarea id="site-challenges" class="vl-form-textarea" rows="3" placeholder="Steep slopes, narrow access, specific timing requirements, etc."></textarea>
            </div>

            <!-- Budget for Maintenance Services -->
            <div class="vl-form-section">
              <label class="vl-form-label">Budget Range</label>
              <p style="margin-bottom: 0.75rem; color: #6b7280; font-size: 0.875rem;">What's your budget for these services?</p>
              <div id="maintenance-budgets"></div>
            </div>

            <!-- Start Dates -->
            <div class="vl-form-section">
              <label class="vl-form-label">Desired Start Dates</label>
              <p style="margin-bottom: 0.75rem; color: #6b7280; font-size: 0.875rem;">When would you like each service to begin?</p>
              <div id="maintenance-start-dates"></div>
            </div>
          </div>

          <!-- Step 6: Upload Photos -->
          <div class="vl-form-step" id="step-upload">
            <div class="vl-form-section">
              <label class="vl-form-label">Upload Property Photos</label>
              <p style="margin-bottom: 1rem; color: #6b7280; font-size: 0.875rem;">Help us provide an accurate quote by sharing photos of your property</p>
              
              <div class="vl-upload-area" id="upload-area">
                <div style="margin-bottom: 1rem;">
                  <svg style="width: 3rem; height: 3rem; color: #9ca3af; margin: 0 auto; display: block;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <p style="margin-bottom: 0.5rem; color: #6b7280; font-size: 0.875rem;">
                  <span style="color: #d97706; font-weight: 500; cursor: pointer;" id="upload-trigger">Click to upload</span> or drag and drop
                </p>
                <p style="color: #9ca3af; font-size: 0.75rem;">PNG, JPG, GIF up to 10MB each</p>
                <input type="file" id="file-upload" multiple accept="image/*" style="display: none;" />
              </div>

              <div id="upload-status" style="margin-top: 1rem; display: none;"></div>

              <!-- OR divider -->
              <div style="position: relative; margin: 1.5rem 0;">
                <div style="position: absolute; inset: 0; display: flex; align-items: center;">
                  <div style="width: 100%; border-top: 1px solid #e5e7eb;"></div>
                </div>
                <div style="position: relative; display: flex; justify-content: center; font-size: 0.875rem;">
                  <span style="padding: 0 0.5rem; color: #6b7280; background-color: white;">OR</span>
                </div>
              </div>

              <!-- Text upload option -->
              <div class="vl-form-checkbox-group">
                <input type="checkbox" id="text-upload-link" class="vl-form-checkbox" />
                <div>
                  <label for="text-upload-link" class="vl-form-checkbox-label" style="font-weight: 500;">Text me the upload link</label>
                  <p style="color: #9ca3af; font-size: 0.75rem; margin-top: 0.25rem;">Don't have photos on your device? We'll send you a link to upload them later.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Thank You Step -->
          <div class="vl-form-step" id="step-thank-you">
            <div class="vl-thank-you">
              <div class="vl-thank-you-icon">
                <svg style="width: 2rem; height: 2rem; color: #d97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h2 style="font-size: 2rem; font-weight: bold; color: #111827; margin-bottom: 1rem;">Thank You!</h2>
              <p style="font-size: 1.125rem; color: #374151; margin-bottom: 1.5rem;">Your request has been submitted successfully.</p>
              
              <div class="vl-thank-you-content">
                <h3 style="font-weight: 600; color: #111827; margin-bottom: 0.75rem;">What happens next?</h3>
                <div style="color: #374151;">
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <div style="width: 1.5rem; height: 1.5rem; background-color: #d97706; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: bold; flex-shrink: 0; margin-top: 0.125rem;">1</div>
                    <div>
                      <p style="font-weight: 500; color: #111827; margin-bottom: 0.25rem;">Check your email</p>
                      <p style="font-size: 0.875rem; color: #374151;">We'll send you a detailed estimate within 24 hours to <strong id="confirm-email"></strong></p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <div style="width: 1.5rem; height: 1.5rem; background-color: #d97706; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: bold; flex-shrink: 0; margin-top: 0.125rem;">2</div>
                    <div>
                      <p style="font-weight: 500; color: #111827; margin-bottom: 0.25rem;">Book your discovery call</p>
                      <p style="font-size: 0.875rem; color: #374151;">Use the calendar link in your email to schedule a consultation with our team</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <div style="width: 1.5rem; height: 1.5rem; background-color: #d97706; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: bold; flex-shrink: 0; margin-top: 0.125rem;">3</div>
                    <div>
                      <p style="font-weight: 500; color: #111827; margin-bottom: 0.25rem;">Get your custom plan</p>
                      <p style="font-size: 0.875rem; color: #374151;">We'll create a personalized landscaping plan tailored to your vision and budget</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 1rem; margin-top: 1.5rem;">
                <p style="font-size: 0.875rem; color: #374151;">
                  <strong style="color: #111827;">Questions?</strong> Call us at 
                  <a href="tel:+1234567890" style="color: #d97706; text-decoration: none; font-weight: 500;">(123) 456-7890</a> 
                  or email 
                  <a href="mailto:info@villandscaping.com" style="color: #d97706; text-decoration: none; font-weight: 500;">info@villandscaping.com</a>
                </p>
              </div>
            </div>
          </div>

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
      
      if (!this.container) {
        console.error('VL Form: Container not found');
        return;
      }

      this.init();
    }

    init() {
      // Add embed class and inject HTML
      this.container.classList.add('vl-form-embed');
      this.container.innerHTML = FORM_HTML;

      // Capture embed data
      this.captureEmbedData();

      // Initialize form
      this.setupEventListeners();
      this.initializeGoogleMaps();
      this.initializeFileUpload();
      this.updateStepDisplay();

      // Session will be initialized on first user interaction

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

    setupEventListeners() {
      const nextButton = this.container.querySelector('#next-button');
      const backButton = this.container.querySelector('#back-button');
      
      nextButton.addEventListener('click', () => this.goToNextStep());
      backButton.addEventListener('click', () => this.goToPrevStep());

      // Contact form listeners
      this.container.querySelector('#first-name').addEventListener('input', async (e) => {
        // Initialize session on first interaction
        if (!formData.sessionInitialized) {
          await this.initializeSession();
        }
        
        formData.personalInfo.firstName = e.target.value;
        this.updateButtonValidation();
        this.autoSave();
      });

      this.container.querySelector('#last-name').addEventListener('input', (e) => {
        formData.personalInfo.lastName = e.target.value;
        this.updateButtonValidation();
        this.autoSave();
      });

      this.container.querySelector('#email').addEventListener('input', (e) => {
        formData.personalInfo.email = e.target.value;
        this.updateButtonValidation();
        this.autoSave();
      });

      this.container.querySelector('#phone').addEventListener('input', (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        e.target.value = formatted;
        formData.personalInfo.phone = formatted;
        this.updateButtonValidation();
        this.autoSave();
      });

      this.container.querySelector('#referral-source').addEventListener('change', (e) => {
        formData.personalInfo.referralSource = e.target.value;
        this.autoSave();
      });

      // Address listener
      this.container.querySelector('#address-input').addEventListener('input', (e) => {
        formData.address = e.target.value;
        this.updateButtonValidation();
        this.autoSave();
      });

      // Service selection listeners
      this.container.querySelectorAll('#step-services input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            if (!formData.services.includes(e.target.value)) {
              formData.services.push(e.target.value);
            }
          } else {
            formData.services = formData.services.filter(service => service !== e.target.value);
          }
          this.updateButtonValidation();
          this.autoSave();
        });
      });

      // Project details listeners
      this.container.querySelector('#project-vision').addEventListener('input', (e) => {
        formData.projectScope = e.target.value;
        this.updateButtonValidation();
        this.autoSave();
      });

      this.container.querySelectorAll('input[name="project-timeline"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          // Update visual state
          this.container.querySelectorAll('.vl-timeline-option').forEach(option => {
            option.classList.remove('selected');
          });
          e.target.closest('.vl-timeline-option').classList.add('selected');
          
          this.updateButtonValidation();
          this.autoSave();
        });
      });

      // Maintenance details listeners
      this.container.querySelector('#site-challenges').addEventListener('input', (e) => {
        formData.siteChallenges = e.target.value;
        this.updateButtonValidation();
        this.autoSave();
      });

      // Upload listeners
      this.container.querySelector('#text-upload-link').addEventListener('change', (e) => {
        formData.textUploadRequested = e.target.checked;
        this.updateButtonValidation();
        this.autoSave();
      });
    }

    updateStepDisplay() {
      const activeSteps = getActiveSteps();
      const currentStepData = activeSteps[formData.currentStep];
      
      // Update header
      this.container.querySelector('#vl-step-title').textContent = 
        currentStepData ? currentStepData.title : 'Complete!';
      this.container.querySelector('#vl-step-description').textContent = 
        currentStepData ? `Step ${formData.currentStep + 1} of ${activeSteps.length}` : 'Your request has been submitted';

      // Show/hide steps
      this.container.querySelectorAll('.vl-form-step').forEach(step => {
        step.classList.remove('active');
      });

      if (currentStepData) {
        const stepElement = this.container.querySelector(`#step-${currentStepData.id}`);
        if (stepElement) {
          stepElement.classList.add('active');
        }
      } else {
        // Show thank you page
        this.container.querySelector('#step-thank-you').classList.add('active');
        this.container.querySelector('#form-footer').style.display = 'none';
      }

      // Update navigation buttons
      const backButton = this.container.querySelector('#back-button');
      const nextButton = this.container.querySelector('#next-button');
      const nextButtonText = this.container.querySelector('#next-button-text');
      const nextButtonIcon = this.container.querySelector('#next-button-icon');

      // Back button
      if (formData.currentStep === 0) {
        backButton.style.display = 'none';
      } else {
        backButton.style.display = 'inline-flex';
      }

      // Next button
      if (currentStepData) {
        if (formData.currentStep === activeSteps.length - 1) {
          nextButtonText.textContent = formData.isSubmitting ? 'Submitting...' : 'Submit';
          nextButtonIcon.style.display = formData.isSubmitting ? 'none' : 'inline';
        } else {
          nextButtonText.textContent = 'Next';
          nextButtonIcon.style.display = 'inline';
        }
      }

      // Update button validation
      this.updateButtonValidation();
    }

    updateButtonValidation() {
      const nextButton = this.container.querySelector('#next-button');
      const isValid = this.validateCurrentStep();
      nextButton.disabled = !isValid || formData.isSubmitting;
    }

    validateCurrentStep() {
      const activeSteps = getActiveSteps();
      const currentStepData = activeSteps[formData.currentStep];
      
      if (!currentStepData) return false;

      clearAllErrors(this.container);

      switch (currentStepData.id) {
        case 'contact':
          return this.validateContactStep();
        case 'address':
          return this.validateAddressStep();
        case 'services':
          return this.validateServicesStep();
        case 'project-details':
          return this.validateProjectDetailsStep();
        case 'maintenance-details':
          return this.validateMaintenanceDetailsStep();
        case 'upload':
          return this.validateUploadStep();
        default:
          return false;
      }
    }

    validateContactStep() {
      let isValid = true;

      const firstName = this.container.querySelector('#first-name').value.trim();
      const lastName = this.container.querySelector('#last-name').value.trim();
      const email = this.container.querySelector('#email').value.trim();
      const phone = this.container.querySelector('#phone').value.replace(/\D/g, '');

      if (!firstName) {
        showError(this.container, 'first-name', 'First name is required');
        isValid = false;
      }

      if (!lastName) {
        showError(this.container, 'last-name', 'Last name is required');
        isValid = false;
      }

      if (!email) {
        showError(this.container, 'email', 'Email is required');
        isValid = false;
      } else if (!validateEmail(email)) {
        showError(this.container, 'email', 'Please enter a valid email address');
        isValid = false;
      }

      if (!phone) {
        showError(this.container, 'phone', 'Phone number is required');
        isValid = false;
      } else if (phone.length !== 10) {
        showError(this.container, 'phone', 'Phone number must be 10 digits');
        isValid = false;
      }

      return isValid;
    }

    validateAddressStep() {
      const address = this.container.querySelector('#address-input').value.trim();
      if (!address) {
        showError(this.container, 'address', 'Property address is required');
        return false;
      }
      return true;
    }

    validateServicesStep() {
      if (formData.services.length === 0) {
        showError(this.container, 'services', 'Please select at least one service');
        return false;
      }
      return true;
    }

    validateProjectDetailsStep() {
      let isValid = true;

      // Check project vision
      const projectVision = this.container.querySelector('#project-vision').value.trim();
      if (!projectVision) {
        isValid = false;
      }

      // Check budgets for project services
      const projectServices = formData.services.filter(service => 
        ['landscape-design-build', 'landscape-enhancement'].includes(service)
      );
      
      for (const serviceId of projectServices) {
        if (!formData.budgets[serviceId] || formData.budgets[serviceId] <= 0) {
          isValid = false;
          break;
        }
      }

      // Check timeline
      const timeline = this.container.querySelector('input[name="project-timeline"]:checked');
      if (!timeline) {
        isValid = false;
      }

      return isValid;
    }

    validateMaintenanceDetailsStep() {
      let isValid = true;

      // Check site challenges
      const siteChallenges = this.container.querySelector('#site-challenges').value.trim();
      if (!siteChallenges) {
        isValid = false;
      }

      // Check budgets for maintenance services
      const maintenanceServices = formData.services.filter(service => 
        ['lawn-maintenance', 'snow-management'].includes(service)
      );
      
      for (const serviceId of maintenanceServices) {
        if (!formData.budgets[serviceId] || formData.budgets[serviceId] <= 0) {
          isValid = false;
          break;
        }
      }

      // Check start dates
      for (const serviceId of maintenanceServices) {
        if (!formData.startDeadlines[serviceId] || !formData.startDeadlines[serviceId].startDate) {
          isValid = false;
          break;
        }
      }

      return isValid;
    }

    validateUploadStep() {
      return formData.uploadedImages.length > 0 || formData.textUploadRequested;
    }

    goToNextStep() {
      if (formData.isSubmitting) return;

      const activeSteps = getActiveSteps();
      
      if (formData.currentStep < activeSteps.length - 1) {
        formData.currentStep++;
        
        // Render conditional content for new step
        const currentStepData = activeSteps[formData.currentStep];
        if (currentStepData.id === 'project-details') {
          this.renderProjectServiceDetails();
          this.renderProjectBudgets();
        } else if (currentStepData.id === 'maintenance-details') {
          this.renderMaintenanceServiceDetails();
          this.renderMaintenanceBudgets();
          this.renderMaintenanceStartDates();
        }
        
        this.updateStepDisplay();
      } else {
        this.submitForm();
      }
    }

    goToPrevStep() {
      if (formData.currentStep > 0) {
        formData.currentStep--;
        this.updateStepDisplay();
      }
    }

    renderProjectServiceDetails() {
      const container = this.container.querySelector('#project-service-details');
      const projectServices = formData.services.filter(service => 
        ['landscape-design-build', 'landscape-enhancement'].includes(service)
      );

      container.innerHTML = '';

      projectServices.forEach(serviceId => {
        const service = SERVICES[serviceId];
        if (!service) return;

        const serviceCard = document.createElement('div');
        serviceCard.className = 'vl-service-card';
        
        let content = `<h3>${service.name} Details</h3>`;

        if (serviceId === 'landscape-design-build') {
          content += `
            <div class="vl-form-section">
              <label class="vl-form-label">Select design elements (select all that apply):</label>
              <div class="vl-form-grid-3">
                ${service.options.elements.map(element => `
                  <div class="vl-form-checkbox-group">
                    <input type="checkbox" id="element-${element.replace(/\s+/g, '-').toLowerCase()}" 
                           class="vl-form-checkbox" value="${element}"
                           data-service="${serviceId}" data-type="elements" />
                    <label for="element-${element.replace(/\s+/g, '-').toLowerCase()}" class="vl-form-checkbox-label">${element}</label>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } else if (serviceId === 'landscape-enhancement') {
          content += `
            <div class="vl-form-section">
              <label class="vl-form-label">Select enhancement types (select all that apply):</label>
              <div class="vl-form-grid-2">
                ${service.options.types.map(type => `
                  <div class="vl-form-checkbox-group">
                    <input type="checkbox" id="type-${type.replace(/\s+/g, '-').toLowerCase()}" 
                           class="vl-form-checkbox" value="${type}"
                           data-service="${serviceId}" data-type="types" />
                    <label for="type-${type.replace(/\s+/g, '-').toLowerCase()}" class="vl-form-checkbox-label">${type}</label>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        serviceCard.innerHTML = content;
        container.appendChild(serviceCard);
      });

      // Add event listeners for service detail checkboxes
      container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => this.handleServiceDetailChange(e));
      });
    }

    renderMaintenanceServiceDetails() {
      const container = this.container.querySelector('#maintenance-service-details');
      const maintenanceServices = formData.services.filter(service => 
        ['lawn-maintenance', 'snow-management'].includes(service)
      );

      container.innerHTML = '';

      maintenanceServices.forEach(serviceId => {
        const service = SERVICES[serviceId];
        if (!service) return;

        const serviceCard = document.createElement('div');
        serviceCard.className = 'vl-service-card';
        
        let content = `<h3>${service.name} Details</h3>`;

        if (serviceId === 'lawn-maintenance') {
          content += `
            <div class="vl-form-section">
              <label class="vl-form-label">Select service type:</label>
              <div>
                ${service.options.types.map(type => `
                  <div class="vl-form-checkbox-group">
                    <input type="radio" name="lawn-maintenance-type" id="lawn-type-${type.replace(/\s+/g, '-').toLowerCase()}" 
                           class="vl-form-radio" value="${type}"
                           data-service="${serviceId}" />
                    <label for="lawn-type-${type.replace(/\s+/g, '-').toLowerCase()}" class="vl-form-radio-label">${type}</label>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } else if (serviceId === 'snow-management') {
          content += `
            <div class="vl-form-section">
              <label class="vl-form-label" for="snow-property-size">Select property size:</label>
              <select id="snow-property-size" class="vl-form-select" data-service="${serviceId}">
                <option value="">Select property size</option>
                ${service.options.propertySizes.map(size => `
                  <option value="${size}">${size}</option>
                `).join('')}
              </select>
            </div>
          `;
        }

        serviceCard.innerHTML = content;
        container.appendChild(serviceCard);
      });

      // Add event listeners
      container.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => this.handleServiceDetailChange(e));
      });
      container.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', (e) => this.handleServiceDetailChange(e));
      });
    }

    renderProjectBudgets() {
      const container = this.container.querySelector('#project-budgets');
      const projectServices = formData.services.filter(service => 
        ['landscape-design-build', 'landscape-enhancement'].includes(service)
      );

      container.innerHTML = '';

      projectServices.forEach(serviceId => {
        const service = SERVICES[serviceId];
        if (!service) return;

        const budgetDiv = document.createElement('div');
        budgetDiv.className = 'vl-form-section';
        budgetDiv.innerHTML = `
          <label class="vl-form-label" for="budget-${serviceId}">${service.name} Budget</label>
          <div class="vl-budget-input-container">
            <input type="number" id="budget-${serviceId}" class="vl-form-input vl-budget-input" 
                   placeholder="0" data-service="${serviceId}" />
          </div>
        `;

        container.appendChild(budgetDiv);
      });

      // Add event listeners
      container.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', (e) => this.handleBudgetChange(e));
      });
    }

    renderMaintenanceBudgets() {
      const container = this.container.querySelector('#maintenance-budgets');
      const maintenanceServices = formData.services.filter(service => 
        ['lawn-maintenance', 'snow-management'].includes(service)
      );

      container.innerHTML = '';

      maintenanceServices.forEach(serviceId => {
        const service = SERVICES[serviceId];
        if (!service) return;

        const budgetDiv = document.createElement('div');
        budgetDiv.className = 'vl-form-section';
        budgetDiv.innerHTML = `
          <label class="vl-form-label" for="maintenance-budget-${serviceId}">${service.name} Budget</label>
          <div class="vl-budget-input-container">
            <input type="number" id="maintenance-budget-${serviceId}" class="vl-form-input vl-budget-input" 
                   placeholder="0" data-service="${serviceId}" />
          </div>
        `;

        container.appendChild(budgetDiv);
      });

      // Add event listeners
      container.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', (e) => this.handleBudgetChange(e));
      });
    }

    renderMaintenanceStartDates() {
      const container = this.container.querySelector('#maintenance-start-dates');
      const maintenanceServices = formData.services.filter(service => 
        ['lawn-maintenance', 'snow-management'].includes(service)
      );

      container.innerHTML = '';

      maintenanceServices.forEach(serviceId => {
        const service = SERVICES[serviceId];
        if (!service) return;

        const dateDiv = document.createElement('div');
        dateDiv.className = 'vl-form-section';
        dateDiv.innerHTML = `
          <label class="vl-form-label" for="start-date-${serviceId}">${service.name} Start Date</label>
          <input type="date" id="start-date-${serviceId}" class="vl-form-input" data-service="${serviceId}" />
        `;

        container.appendChild(dateDiv);
      });

      // Add event listeners
      container.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('change', (e) => this.handleStartDateChange(e));
      });
    }

    handleServiceDetailChange(event) {
      const serviceId = event.target.dataset.service;
      const value = event.target.value;

      if (event.target.type === 'checkbox') {
        if (!formData.serviceDetails[serviceId]) {
          formData.serviceDetails[serviceId] = [];
        }
        
        if (event.target.checked) {
          if (!formData.serviceDetails[serviceId].includes(value)) {
            formData.serviceDetails[serviceId].push(value);
          }
        } else {
          formData.serviceDetails[serviceId] = formData.serviceDetails[serviceId].filter(item => item !== value);
        }
      } else {
        formData.serviceDetails[serviceId] = value;
      }

      this.updateButtonValidation();
      this.autoSave();
    }

    handleBudgetChange(event) {
      const serviceId = event.target.dataset.service;
      const value = Number(event.target.value);
      
      formData.budgets[serviceId] = value;
      this.updateButtonValidation();
      this.autoSave();
    }

    handleStartDateChange(event) {
      const serviceId = event.target.dataset.service;
      const value = event.target.value;
      
      if (!formData.startDeadlines[serviceId]) {
        formData.startDeadlines[serviceId] = {};
      }
      formData.startDeadlines[serviceId].startDate = value;
      
      this.updateButtonValidation();
      this.autoSave();
    }

    async submitForm() {
      if (formData.isSubmitting) return;

      formData.isSubmitting = true;
      this.updateStepDisplay();

      try {
        // Collect all form data
        const submissionData = {
          ...formData,
          personalInfo: {
            firstName: this.container.querySelector('#first-name').value.trim(),
            lastName: this.container.querySelector('#last-name').value.trim(),
            email: this.container.querySelector('#email').value.trim(),
            phone: this.container.querySelector('#phone').value.trim(),
            referralSource: this.container.querySelector('#referral-source').value
          },
          address: this.container.querySelector('#address-input').value.trim(),
          projectScope: this.container.querySelector('#project-vision').value.trim(),
          siteChallenges: this.container.querySelector('#site-challenges').value.trim(),
          textUploadRequested: this.container.querySelector('#text-upload-link').checked
        };

        // Collect timeline for project services
        const timeline = this.container.querySelector('input[name="project-timeline"]:checked');
        if (timeline) {
          const projectServices = formData.services.filter(service => 
            ['landscape-design-build', 'landscape-enhancement'].includes(service)
          );
          projectServices.forEach(serviceId => {
            if (!submissionData.startDeadlines[serviceId]) {
              submissionData.startDeadlines[serviceId] = {};
            }
            submissionData.startDeadlines[serviceId].startDate = timeline.value;
          });
        }

        // Final save to database with completion status
        if (formData.sessionId) {
          const finalData = this.prepareSaveData();
          finalData.initial_form_completed = true;
          
          try {
            await supabase.update('form_sessions', finalData, formData.sessionId);
            console.log('Form marked as completed in database');
          } catch (error) {
            console.error('Failed to mark form as completed:', error);
          }
        }

        // Fire tracking events
        this.fireTrackingEvents(submissionData);

        // Show thank you page
        formData.currentStep = getActiveSteps().length;
        this.container.querySelector('#confirm-email').textContent = submissionData.personalInfo.email;
        this.updateStepDisplay();

      } catch (error) {
        console.error('Form submission error:', error);
        alert('There was an error submitting your form. Please try again.');
        formData.isSubmitting = false;
        this.updateStepDisplay();
      }
    }

    fireTrackingEvents(data) {
      const trackingData = {
        formId: 'vl-landscape-form',
        sessionId: data.sessionId,
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        address: data.address,
        services: data.services.join(', '),
        referralSource: data.personalInfo.referralSource,
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
      // Google Maps initialization would go here
      // For now, show the warning
      this.container.querySelector('#address-warning').style.display = 'block';
    }

    initializeFileUpload() {
      const uploadArea = this.container.querySelector('#upload-area');
      const fileInput = this.container.querySelector('#file-upload');
      const uploadTrigger = this.container.querySelector('#upload-trigger');
      const uploadStatus = this.container.querySelector('#upload-status');

      uploadTrigger.addEventListener('click', () => {
        fileInput.click();
      });

      uploadArea.addEventListener('click', () => {
        fileInput.click();
      });

      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        this.handleFileUpload(files);
      });

      fileInput.addEventListener('change', (e) => {
        this.handleFileUpload(e.target.files);
      });
    }

    handleFileUpload(files) {
      if (!files || files.length === 0) return;

      const uploadStatus = this.container.querySelector('#upload-status');
      uploadStatus.style.display = 'block';
      uploadStatus.innerHTML = '<p style="color: #d97706; font-size: 0.875rem;">Uploading images...</p>';

      // Simulate upload process
      setTimeout(() => {
        formData.uploadedImages = Array.from(files).map(file => file.name);
        uploadStatus.innerHTML = `
          <div style="padding: 0.75rem; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px;">
            <p style="color: #92400e; font-size: 0.875rem;">
              ✓ ${files.length} ${files.length === 1 ? 'image' : 'images'} uploaded successfully
            </p>
          </div>
        `;
        this.updateButtonValidation();
        this.autoSave();
      }, 1500);
    }

    async autoSave() {
      if (!formData.sessionInitialized || !formData.sessionId) return;
      
      // Debounce auto-save calls
      if (formData.autoSaveTimeout) {
        clearTimeout(formData.autoSaveTimeout);
      }
      
      formData.autoSaveTimeout = setTimeout(async () => {
        try {
          const saveData = this.prepareSaveData();
          
          await supabase.update('form_sessions', saveData, formData.sessionId);
          formData.lastSaveTime = new Date().toISOString();
          
          console.log('Auto-saved successfully');
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 1000); // Save after 1 second of inactivity
    }

    prepareSaveData() {
      return {
        updated_at: new Date().toISOString(),
        first_name: formData.personalInfo.firstName,
        last_name: formData.personalInfo.lastName,
        email: formData.personalInfo.email,
        phone: formData.personalInfo.phone,
        referral_source: formData.personalInfo.referralSource,
        address: formData.address,
        postal_code: formData.postalCode,
        inside_service_area: formData.insideServiceArea,
        services: formData.services,
        service_details: formData.serviceDetails,
        project_vision: formData.projectScope,
        site_challenges: formData.siteChallenges,
        budgets: formData.budgets,
        start_deadlines: formData.startDeadlines,
        upload_link_requested: formData.textUploadRequested,
        photo_urls: formData.uploadedImages,
        form_source: 'website',
        embed_source_url: window.VL_EMBED_DATA?.sourceUrl,
        embed_referrer: window.VL_EMBED_DATA?.referrer,
        embed_url_params: window.VL_EMBED_DATA?.urlParams,
        embed_container_id: window.VL_EMBED_DATA?.embedContainer
      };
    }

    async initializeSession() {
      if (formData.sessionInitialized) return;
      
      try {
        // Generate unique session ID
        formData.sessionId = 'embed_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const initialData = {
          id: formData.sessionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          form_source: 'website',
          embed_source_url: window.VL_EMBED_DATA?.sourceUrl,
          embed_referrer: window.VL_EMBED_DATA?.referrer,
          embed_url_params: window.VL_EMBED_DATA?.urlParams,
          embed_container_id: window.VL_EMBED_DATA?.embedContainer,
          initial_form_completed: false
        };
        
        await supabase.insert('form_sessions', initialData);
        formData.sessionInitialized = true;
        
        console.log('Session initialized:', formData.sessionId);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Continue without database if it fails
        formData.sessionInitialized = true;
      }
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