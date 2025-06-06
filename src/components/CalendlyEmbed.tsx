import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  onEventScheduled?: () => void;
}

const CalendlyEmbed: React.FC<CalendlyEmbedProps> = ({ 
  url, 
  prefill = {}, 
  onEventScheduled 
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializationAttempted = useRef(false);

  // Handle Calendly events
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Only process messages from Calendly
      if (!e.origin || !e.origin.includes('calendly.com')) {
        return;
      }
      
      console.log('Calendly message received:', e.data);
      
      // Check for various Calendly event formats
      if (e.data?.event === 'calendly.event_scheduled' ||
          e.data?.event === 'calendly.scheduling_successful' ||
          e.data?.calendly?.event === 'event_scheduled' ||
          e.data?.type === 'calendly.event_scheduled') {
        console.log('Calendly event detected:', e.data);
        onEventScheduled?.();
      }
      
      // Handle height changes
      if (e.data?.event === 'calendly.height_changed' && containerRef.current) {
        const height = e.data.height;
        if (height && height > 0) {
          containerRef.current.style.height = `${height}px`;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEventScheduled]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initializeCalendly = () => {
      console.log('Attempting to initialize Calendly...');
      
      if (!containerRef.current) {
        console.log('Container ref not ready');
        return false;
      }

      // Check if Calendly is available
      if (!window.Calendly) {
        console.log('Calendly not loaded');
        return false;
      }

      if (!window.Calendly.initInlineWidget) {
        console.log('Calendly widget not ready');
        return false;
      }

      try {
        console.log('Initializing Calendly widget with URL:', url);
        
        // Clear any existing content
        containerRef.current.innerHTML = '';
        
        // Create prefill object
        const prefillData: Record<string, string> = {};
        if (prefill.name && prefill.name.trim()) {
          prefillData.name = prefill.name.trim();
        }
        if (prefill.email && prefill.email.trim()) {
          prefillData.email = prefill.email.trim();
        }
        
        console.log('Prefill data:', prefillData);
        
        // Initialize Calendly widget
        window.Calendly.initInlineWidget({
          url: url,
          parentElement: containerRef.current,
          prefill: Object.keys(prefillData).length > 0 ? prefillData : undefined
        });
        
        setIsLoading(false);
        setError(null);
        return true;
        
      } catch (error) {
        console.error('Calendly initialization error:', error);
        setError('Failed to load Calendly widget. Please refresh the page.');
        setIsLoading(false);
        return false;
      }
    };

    const loadCalendlyScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="calendly.com"]');
        if (existingScript) {
          if (window.Calendly) {
            resolve();
          } else {
            // Script exists but not loaded yet
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', reject);
          }
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Calendly script loaded successfully');
          resolve();
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Calendly script:', error);
          reject(error);
        };
        
        document.head.appendChild(script);
      });
    };

    const initialize = async () => {
      if (initializationAttempted.current) {
        return;
      }
      
      initializationAttempted.current = true;
      
      try {
        if (!window.Calendly) {
          console.log('Loading Calendly script...');
          await loadCalendlyScript();
        }
        
        // Wait a bit for Calendly to fully initialize
        timeoutId = setTimeout(() => {
          const success = initializeCalendly();
          if (!success) {
            // Retry once after a delay
            setTimeout(() => {
              initializeCalendly();
            }, 1000);
          }
        }, 100);
        
      } catch (error) {
        console.error('Error loading Calendly:', error);
        setError('Unable to load Calendly. Please check your internet connection and try again.');
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [url, prefill]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              initializationAttempted.current = false;
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading Calendly...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="calendly-inline-widget"
        style={{
          width: '100%',
          minWidth: '320px',
          height: '700px',
          minHeight: '700px'
        }}
      />
    </div>
  );
};

export default CalendlyEmbed;