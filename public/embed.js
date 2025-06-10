(function() {
  // Prevent multiple loads
  if (window.VLFormLoaded) {
    return;
  }
  window.VLFormLoaded = true;

  // Configuration - will be replaced with actual production URL
  const PRODUCTION_URL = window.VL_FORM_CONFIG?.baseUrl || 'https://vil-form-final.vercel.app';
  
  // Function to load CSS
  function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = function() {
      console.log('VL Form CSS loaded');
    };
    link.onerror = function() {
      console.error('Failed to load VL Form CSS');
    };
    document.head.appendChild(link);
  }

  // Function to load JavaScript
  function loadJS(src, callback) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = src;
    script.onload = function() {
      console.log('VL Form JS loaded');
      if (callback) callback();
    };
    script.onerror = function() {
      console.error('Failed to load VL Form JS');
    };
    document.body.appendChild(script);
  }

  // Function to initialize the form
  function initializeForm() {
    // Wait for the VLForm object to be available
    const checkForVLForm = setInterval(function() {
      if (window.VLForm && window.VLForm.mount) {
        clearInterval(checkForVLForm);
        
        // Find all embed containers and mount forms
        const containers = document.querySelectorAll('.vl-form-embed');
        containers.forEach(function(container, index) {
          // Create unique ID if not present
          if (!container.id) {
            container.id = 'vl-form-embed-' + index;
          }
          
          // Mount the form
          window.VLForm.mount(container.id);
        });
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(function() {
      clearInterval(checkForVLForm);
      if (!window.VLForm) {
        console.error('VL Form failed to load within 10 seconds');
      }
    }, 10000);
  }

  // Load Calendly CSS (required for the form)
  loadCSS('https://assets.calendly.com/assets/external/widget.css');
  
  // Load form CSS
  loadCSS(PRODUCTION_URL + '/assets/index-DQ-Hcp3-.css');
  
  // Load form JavaScript
  loadJS(PRODUCTION_URL + '/assets/index-BQz2Q8ng.js', initializeForm);
})(); 