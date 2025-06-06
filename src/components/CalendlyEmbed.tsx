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

  // Validate Calendly URL format
  const isValidCalendlyUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'calendly.com' && urlObj.pathname.length > 1;
    } catch {
      return false;
    }
  };

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
    let retryCount = 0;
    const maxRetries = 10;
    
    // Validate URL first
    if (!isValidCalendlyUrl(url)) {
      setError('Invalid Calendly URL format. Please check the URL.');
      setIsLoading(false);
      return;
    }
    
    const waitForCalendly = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const checkCalendly = () => {
          if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
            console.log('Calendly is ready!');
            resolve();
          } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Waiting for Calendly... attempt ${retryCount}/${maxRetries}`);
            setTimeout(checkCalendly, 200);
          } else {
            reject(new Error('Calendly failed to load after multiple attempts'));
          }
        };
        checkCalendly();
      });
    };
    
    const initializeCalendly = async () => {
      console.log('Attempting to initialize Calendly...');
      
      if (!containerRef.current) {
        console.log('Container ref not ready');
        throw new Error('Container not ready');
      }

      try {
        // Wait for Calendly to be fully ready
        await waitForCalendly();
        
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
        
        console.log('Calendly widget initialized successfully');
        setIsLoading(false);
        setError(null);
        
      } catch (error) {
        console.error('Calendly initialization error:', error);
        setError('Failed to load Calendly widget. Please refresh the page.');
        setIsLoading(false);
        throw error;
      }
    };

    const loadCalendlyScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="calendly.com"]');
        if (existingScript) {
          console.log('Calendly script already exists');
          // Give it more time to initialize
          setTimeout(() => resolve(), 500);
          return;
        }

        console.log('Loading Calendly script...');
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Calendly script loaded successfully');
          // Give Calendly time to initialize its global object
          setTimeout(() => resolve(), 1000);
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
        await loadCalendlyScript();
        await initializeCalendly();
        
      } catch (error) {
        console.error('Error initializing Calendly:', error);
        setError('Unable to load Calendly. Please check your internet connection and try again.');
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      // Cleanup if needed
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
              // Remove existing script to force reload
              const existingScript = document.querySelector('script[src*="calendly.com"]');
              if (existingScript) {
                existingScript.remove();
              }
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