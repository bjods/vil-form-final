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

  // Form state
  var formState = {
    currentStep: 0,
    sessionId: null,
    data: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      services: [],
      budgets: {},
      startDeadlines: {},
      projectScope: '',
      previousProvider: '',
      previousQuotes: null,
      priceVsLongTerm: null,
      siteChallenges: '',
      projectSuccessCriteria: '',
      photos: []
    }
  };

  // Service definitions
  var services = [
    { id: 'landscape-design', name: 'Landscape Design', category: 'project' },
    { id: 'landscape-installation', name: 'Landscape Installation', category: 'project' },
    { id: 'hardscape-patios', name: 'Hardscape & Patios', category: 'project' },
    { id: 'outdoor-lighting', name: 'Outdoor Lighting', category: 'project' },
    { id: 'irrigation-systems', name: 'Irrigation Systems', category: 'project' },
    { id: 'lawn-installation', name: 'Lawn Installation', category: 'project' },
    { id: 'tree-removal', name: 'Tree Removal', category: 'project' },
    { id: 'yard-cleanup', name: 'Yard Cleanup', category: 'project' },
    { id: 'lawn-maintenance', name: 'Lawn Maintenance', category: 'maintenance' },
    { id: 'garden-maintenance', name: 'Garden Maintenance', category: 'maintenance' },
    { id: 'snow-removal', name: 'Snow Removal', category: 'maintenance' },
    { id: 'leaf-cleanup', name: 'Leaf Cleanup', category: 'maintenance' }
  ];

  // Inject CSS styles
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.vl-form-wrapper {',
      '  position: relative !important;',
      '  width: 600px !important;',
      '  height: 775px !important;',
      '  max-height: 90vh !important;',
      '  margin: 2rem auto !important;',
      '  box-sizing: border-box !important;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif !important;',
      '  font-size: 16px !important;',
      '  line-height: 1.5 !important;',
      '  color: #333333 !important;',
      '}',
      '.vl-form-card {',
      '  background: rgba(255, 255, 255, 0.95) !important;',
      '  border-radius: 8px !important;',
      '  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;',
      '  width: 100% !important;',
      '  height: 100% !important;',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  overflow: hidden !important;',
      '}',
      '.vl-form-header {',
      '  padding: 1.25rem 1.75rem !important;',
      '  border-bottom: 1px solid #e5e7eb !important;',
      '  background: #ffffff !important;',
      '}',
      '.vl-form-title {',
      '  font-size: 1.5rem !important;',
      '  font-weight: 600 !important;',
      '  margin: 0 !important;',
      '  color: #111827 !important;',
      '}',
      '.vl-form-progress {',
      '  margin-top: 0.5rem !important;',
      '  height: 4px !important;',
      '  background: #e5e7eb !important;',
      '  border-radius: 2px !important;',
      '  overflow: hidden !important;',
      '}',
      '.vl-form-progress-bar {',
      '  height: 100% !important;',
      '  background: #fbbf24 !important;',
      '  transition: width 0.3s ease !important;',
      '}',
      '.vl-form-content {',
      '  flex: 1 !important;',
      '  padding: 1.75rem !important;',
      '  overflow-y: auto !important;',
      '}',
      '.vl-form-footer {',
      '  padding: 1.25rem 1.75rem !important;',
      '  border-top: 1px solid #e5e7eb !important;',
      '  background: #ffffff !important;',
      '  display: flex !important;',
      '  justify-content: space-between !important;',
      '  align-items: center !important;',
      '}',
      '.vl-form-group {',
      '  margin-bottom: 1.5rem !important;',
      '}',
      '.vl-form-label {',
      '  display: block !important;',
      '  font-size: 0.875rem !important;',
      '  font-weight: 500 !important;',
      '  color: #374151 !important;',
      '  margin-bottom: 0.5rem !important;',
      '}',
      '.vl-form-input {',
      '  width: 100% !important;',
      '  height: 2.5rem !important;',
      '  padding: 0.5rem 0.75rem !important;',
      '  border: 1px solid #d1d5db !important;',
      '  border-radius: 0.375rem !important;',
      '  background: #ffffff !important;',
      '  font-size: 0.875rem !important;',
      '  transition: border-color 0.15s ease-in-out !important;',
      '}',
      '.vl-form-input:focus {',
      '  outline: none !important;',
      '  border-color: #fbbf24 !important;',
      '  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;',
      '}',
      '.vl-form-textarea {',
      '  width: 100% !important;',
      '  min-height: 6rem !important;',
      '  padding: 0.5rem 0.75rem !important;',
      '  border: 1px solid #d1d5db !important;',
      '  border-radius: 0.375rem !important;',
      '  background: #ffffff !important;',
      '  font-size: 0.875rem !important;',
      '  resize: vertical !important;',
      '  font-family: inherit !important;',
      '}',
      '.vl-form-textarea:focus {',
      '  outline: none !important;',
      '  border-color: #fbbf24 !important;',
      '  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;',
      '}',
      '.vl-btn {',
      '  display: inline-flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  white-space: nowrap !important;',
      '  border-radius: 0.375rem !important;',
      '  font-size: 0.875rem !important;',
      '  font-weight: 500 !important;',
      '  transition: all 0.15s ease-in-out !important;',
      '  cursor: pointer !important;',
      '  border: none !important;',
      '  text-decoration: none !important;',
      '  height: 2.5rem !important;',
      '  padding: 0.5rem 1rem !important;',
      '}',
      '.vl-btn-primary {',
      '  background: #fbbf24 !important;',
      '  color: #000000 !important;',
      '  border: 1px solid #f59e0b !important;',
      '}',
      '.vl-btn-primary:hover {',
      '  background: #f59e0b !important;',
      '}',
      '.vl-btn-secondary {',
      '  background: #ffffff !important;',
      '  color: #000000 !important;',
      '  border: 1px solid #d1d5db !important;',
      '}',
      '.vl-btn-secondary:hover {',
      '  background: #f9fafb !important;',
      '}',
      '.vl-btn:disabled {',
      '  opacity: 0.5 !important;',
      '  cursor: not-allowed !important;',
      '  pointer-events: none !important;',
      '}',
      '.vl-service-grid {',
      '  display: grid !important;',
      '  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;',
      '  gap: 0.75rem !important;',
      '}',
      '.vl-service-item {',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  padding: 0.75rem !important;',
      '  border: 1px solid #d1d5db !important;',
      '  border-radius: 0.375rem !important;',
      '  background: #ffffff !important;',
      '  cursor: pointer !important;',
      '  transition: all 0.15s ease-in-out !important;',
      '}',
      '.vl-service-item:hover {',
      '  border-color: #fbbf24 !important;',
      '  background: #fffbeb !important;',
      '}',
      '.vl-service-item.selected {',
      '  border-color: #fbbf24 !important;',
      '  background: #fffbeb !important;',
      '}',
      '.vl-service-checkbox {',
      '  margin-right: 0.75rem !important;',
      '  width: 1rem !important;',
      '  height: 1rem !important;',
      '}',
      '.vl-service-label {',
      '  font-size: 0.875rem !important;',
      '  font-weight: 500 !important;',
      '  color: #374151 !important;',
      '  margin: 0 !important;',
      '}',
      '.vl-form-error {',
      '  color: #dc2626 !important;',
      '  font-size: 0.75rem !important;',
      '  margin-top: 0.25rem !important;',
      '}',
      '.vl-form-input.error {',
      '  border-color: #dc2626 !important;',
      '}',
      '@media (max-width: 640px) {',
      '  .vl-form-wrapper {',
      '    width: 100% !important;',
      '    height: 100vh !important;',
      '    margin: 0 !important;',
      '    border-radius: 0 !important;',
      '  }',
      '  .vl-form-header {',
      '    padding: 1rem 1.5rem !important;',
      '  }',
      '  .vl-form-content {',
      '    padding: 1.5rem !important;',
      '  }',
      '  .vl-form-footer {',
      '    padding: 1rem 1.5rem !important;',
      '  }',
      '  .vl-service-grid {',
      '    grid-template-columns: 1fr !important;',
      '  }',
      '}',
      '.vl-spinner {',
      '  border: 2px solid #f3f4f6 !important;',
      '  border-top: 2px solid #fbbf24 !important;',
      '  border-radius: 50% !important;',
      '  width: 1rem !important;',
      '  height: 1rem !important;',
      '  animation: vl-spin 1s linear infinite !important;',
      '  margin-right: 0.5rem !important;',
      '}',
      '@keyframes vl-spin {',
      '  0% { transform: rotate(0deg); }',
      '  100% { transform: rotate(360deg); }',
      '}',
      '.vl-autosave {',
      '  font-size: 0.75rem !important;',
      '  color: #6b7280 !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '}',
      '.vl-autosave.saving {',
      '  color: #fbbf24 !important;',
      '}',
      '.vl-autosave.saved {',
      '  color: #059669 !important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Create form HTML structure
  function createFormHTML() {
    var html = [
      '<div class="vl-form-wrapper" data-vl-form="true">',
      '  <div class="vl-form-card">',
      '    <div class="vl-form-header">',
      '      <h2 class="vl-form-title">Get Your Landscape Quote</h2>',
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
      '        <button type="button" class="vl-btn vl-btn-primary" id="vl-btn-next" style="margin-left: 0.5rem;">Next</button>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
    return html;
  }

  // Render step: Contact Information
  function renderContactStep() {
    var html = [
      '<div class="vl-form-group">',
      '  <label class="vl-form-label">First Name *</label>',
      '  <input type="text" class="vl-form-input" id="firstName" value="' + formState.data.firstName + '" required>',
      '</div>',
      '<div class="vl-form-group">',
      '  <label class="vl-form-label">Last Name *</label>',
      '  <input type="text" class="vl-form-input" id="lastName" value="' + formState.data.lastName + '" required>',
      '</div>',
      '<div class="vl-form-group">',
      '  <label class="vl-form-label">Email Address *</label>',
      '  <input type="email" class="vl-form-input" id="email" value="' + formState.data.email + '" required>',
      '</div>',
      '<div class="vl-form-group">',
      '  <label class="vl-form-label">Phone Number *</label>',
      '  <input type="tel" class="vl-form-input" id="phone" value="' + formState.data.phone + '" required>',
      '</div>'
    ].join('');
    return html;
  }

  // Render step: Address
  function renderAddressStep() {
    var html = [
      '<div class="vl-form-group">',
      '  <label class="vl-form-label">Property Address *</label>',
      '  <input type="text" class="vl-form-input" id="address" value="' + formState.data.address + '" placeholder="123 Main Street, City, Province" required>',
      '</div>',
      '<div class="vl-form-group">',
      '  <label class="vl-form-label">Postal Code *</label>',
      '  <input type="text" class="vl-form-input" id="postalCode" value="' + formState.data.postalCode + '" placeholder="A1A 1A1" required>',
      '</div>'
    ].join('');
    return html;
  }

  // Render step: Services
  function renderServicesStep() {
    var serviceItems = services.map(function(service) {
      var isSelected = formState.data.services.indexOf(service.id) !== -1;
      return [
        '<div class="vl-service-item' + (isSelected ? ' selected' : '') + '" data-service-id="' + service.id + '">',
        '  <input type="checkbox" class="vl-service-checkbox" id="service-' + service.id + '"' + (isSelected ? ' checked' : '') + '>',
        '  <label class="vl-service-label" for="service-' + service.id + '">' + service.name + '</label>',
        '</div>'
      ].join('');
    }).join('');

    var html = [
      '<div class="vl-form-group">',
      '  <label class="vl-form-label">Select Services Needed *</label>',
      '  <div class="vl-service-grid">',
      serviceItems,
      '  </div>',
      '</div>'
    ].join('');
    return html;
  }

  // Render current step
  function renderCurrentStep() {
    var content = document.getElementById('vl-form-content');
    if (!content) return;

    var steps = ['contact', 'address', 'services'];
    var currentStepName = steps[formState.currentStep];
    var html = '';

    switch (currentStepName) {
      case 'contact':
        html = renderContactStep();
        break;
      case 'address':
        html = renderAddressStep();
        break;
      case 'services':
        html = renderServicesStep();
        break;
    }

    content.innerHTML = html;
    setupStepHandlers(currentStepName);
    updateProgressBar();
    updateNavigationButtons();
  }

  // Setup event handlers for current step
  function setupStepHandlers(stepName) {
    switch (stepName) {
      case 'contact':
        document.getElementById('firstName').addEventListener('input', function(e) {
          formState.data.firstName = e.target.value;
        });
        document.getElementById('lastName').addEventListener('input', function(e) {
          formState.data.lastName = e.target.value;
        });
        document.getElementById('email').addEventListener('input', function(e) {
          formState.data.email = e.target.value;
        });
        document.getElementById('phone').addEventListener('input', function(e) {
          formState.data.phone = e.target.value;
        });
        break;

      case 'address':
        document.getElementById('address').addEventListener('input', function(e) {
          formState.data.address = e.target.value;
        });
        document.getElementById('postalCode').addEventListener('input', function(e) {
          formState.data.postalCode = e.target.value;
        });
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
          });
        });
        break;
    }
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
        fields: ['address_components', 'formatted_address']
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
                document.getElementById('postalCode').value = component.long_name;
                break;
              }
            }
          }
        }
      });
    }
  }

  // Update progress bar
  function updateProgressBar() {
    var totalSteps = 3;
    var progress = ((formState.currentStep + 1) / totalSteps) * 100;
    var progressBar = document.getElementById('vl-progress-bar');
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
  }

  // Update navigation buttons
  function updateNavigationButtons() {
    var backBtn = document.getElementById('vl-btn-back');
    var nextBtn = document.getElementById('vl-btn-next');
    
    if (backBtn) {
      backBtn.style.display = formState.currentStep > 0 ? 'inline-flex' : 'none';
    }
    
    if (nextBtn) {
      nextBtn.textContent = formState.currentStep === 2 ? 'Submit' : 'Next';
    }
  }

  // Validation
  function validateCurrentStep() {
    var steps = ['contact', 'address', 'services'];
    var currentStepName = steps[formState.currentStep];

    switch (currentStepName) {
      case 'contact':
        return formState.data.firstName.trim() !== '' &&
               formState.data.lastName.trim() !== '' &&
               formState.data.email.trim() !== '' &&
               formState.data.phone.trim() !== '';
      
      case 'address':
        return formState.data.address.trim() !== '' &&
               formState.data.postalCode.trim() !== '';
      
      case 'services':
        return formState.data.services.length > 0;
      
      default:
        return false;
    }
  }

  // Navigation
  function goToNextStep() {
    if (validateCurrentStep()) {
      if (formState.currentStep < 2) {
        formState.currentStep++;
        renderCurrentStep();
      } else {
        submitForm();
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }

  function goToPreviousStep() {
    if (formState.currentStep > 0) {
      formState.currentStep--;
      renderCurrentStep();
    }
  }

  // Submit form
  function submitForm() {
    console.log('Submitting form:', formState.data);
    alert('Form submitted successfully! We will contact you soon.');
  }

  // Initialize form
  function initializeForm() {
    injectStyles();
    
    var containers = document.querySelectorAll('.vl-form-embed');
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
        nextBtn.addEventListener('click', goToNextStep);
      }
      
      // Render first step
      renderCurrentStep();
      
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