import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import EmbedForm from './components/EmbedForm';
import './index.css';

// Function to capture embed data when form loads
function captureEmbedData(containerId?: string) {
  return {
    sourceUrl: window.location.href,
    referrer: document.referrer,
    urlParams: window.location.search,
    embedContainer: containerId
  };
}

// Function to mount the form (used for embedding)
function mountForm(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`VL Form: Container with ID "${containerId}" not found`);
    return;
  }

  // Capture embed data
  const embedData = captureEmbedData(containerId);
  
  // Store embed data globally so the form can access it
  (window as any).VL_EMBED_DATA = embedData;
  
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <div className="vl-form-wrapper" data-vl-form="true">
        <EmbedForm />
      </div>
    </StrictMode>
  );
  
  console.log('VL Form mounted to container:', containerId);
}

// Expose mounting function globally for embed script
(window as any).VLForm = {
  mount: mountForm,
  mounted: true
};

// Auto-mount to any existing .vl-form-embed containers
const containers = document.querySelectorAll('.vl-form-embed');
containers.forEach((container, index) => {
  if (!container.id) {
    container.id = `vl-form-embed-${index}`;
  }
  mountForm(container.id);
});

export default EmbedForm;