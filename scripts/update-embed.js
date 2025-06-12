import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import generateEmbedManifest from './generate-embed-manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');

// Generate asset manifest first
console.log('🔍 Generating asset manifest...');
const manifest = generateEmbedManifest();

// Create the new embed script that uses the standalone embed build
const embedScriptContent = `(function() {
  // Prevent multiple loads
  if (window.VLFormLoaded) {
    return;
  }
  window.VLFormLoaded = true;

  // Configuration
  const PRODUCTION_URL = 'https://vil-form-final.vercel.app';
  
  // Function to load CSS
  function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = function() {
      console.log('VL Form CSS loaded');
    };
    link.onerror = function() {
      console.error('Failed to load VL Form CSS from:', href);
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
      console.error('Failed to load VL Form JS from:', src);
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

  // Load Calendly CSS (required for the form)
  loadCSS('https://assets.calendly.com/assets/external/widget.css');
  
  // Load form CSS
  loadCSS(PRODUCTION_URL + '/${manifest.mainApp.css}');
  
  // Load form JavaScript
  loadJS(PRODUCTION_URL + '/${manifest.mainApp.js}', initializeForm);
})();`;

// Write the updated embed.js to the dist directory
const distEmbedPath = path.join(distDir, 'embed.js');
fs.writeFileSync(distEmbedPath, embedScriptContent);

console.log('✅ Updated embed.js written to dist/embed.js');
console.log('📦 Embed bundle:', manifest.embed.js);
console.log('🔗 WordPress sites can now include: <script src="YOUR_DOMAIN/embed.js"></script>'); 