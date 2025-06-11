(function() {
  // Prevent multiple loads
  if (window.VLFormLoaded) {
    return;
  }
  window.VLFormLoaded = true;

  // Configuration for local development
  const DEVELOPMENT_URL = 'http://localhost:5173';
  
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
          
          // Add data attributes for tracking
          container.setAttribute('data-form-type', 'vl-landscape-quote');
          container.setAttribute('data-form-version', '1.0');
          container.setAttribute('data-form-loaded', new Date().toISOString());
          
          // Mount the form
          window.VLForm.mount(container.id);
          
          // Dispatch custom event when form is loaded
          window.dispatchEvent(new CustomEvent('vl-form-loaded', {
            detail: {
              containerId: container.id,
              formType: 'vl-landscape-quote',
              timestamp: new Date().toISOString()
            },
            bubbles: true,
            cancelable: false
          }));
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

  // For development, we'll directly load the Vite dev server modules
  // Load Calendly CSS (required for the form)
  const calendlyLink = document.createElement('link');
  calendlyLink.rel = 'stylesheet';
  calendlyLink.href = 'https://assets.calendly.com/assets/external/widget.css';
  document.head.appendChild(calendlyLink);

  // Create a script to load from Vite dev server
  const viteScript = document.createElement('script');
  viteScript.type = 'module';
  viteScript.innerHTML = `
    import("${DEVELOPMENT_URL}/@vite/client");
    import("${DEVELOPMENT_URL}/src/main.tsx").then(() => {
      console.log('VL Form module loaded from Vite dev server');
    });
  `;
  document.body.appendChild(viteScript);
  
  // Initialize after a short delay
  setTimeout(initializeForm, 1000);
})();