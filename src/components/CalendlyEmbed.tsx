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

// Global flag to track if Calendly script is being loaded
let calendlyScriptLoading = false;
let calendlyScriptLoaded = false;

const CalendlyEmbed: React.FC<CalendlyEmbedProps> = ({ 
  url, 
  prefill = {}, 
  onEventScheduled 
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInitialized = useRef(false);
  const isMounted = useRef(true);

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
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEventScheduled]);

  useEffect(() => {
    isMounted.current = true;
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      widgetInitialized.current = false;
    };
  }, []);

  useEffect(() => {
    // Validate URL first
    if (!isValidCalendlyUrl(url)) {
      setError('Invalid Calendly URL format. Please check the URL.');
      setIsLoading(false);
      return;
    }

    const initializeWidget = () => {
      if (!containerRef.current || !isMounted.current || widgetInitialized.current) {
        return;
      }

      try {
        console.log('Initializing Calendly widget...');
        
        // Clear container
        containerRef.current.innerHTML = '';
        
        // Create the Calendly iframe directly
        const iframe = document.createElement('iframe');
        iframe.src = `${url}?embed_domain=${encodeURIComponent(window.location.hostname)}&embed_type=Inline${
          prefill.name ? `&name=${encodeURIComponent(prefill.name)}` : ''
        }${
          prefill.email ? `&email=${encodeURIComponent(prefill.email)}` : ''
        }`;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.style.minWidth = '320px';
        iframe.style.height = '700px';
        
        containerRef.current.appendChild(iframe);
        widgetInitialized.current = true;
        setIsLoading(false);
        setError(null);
        
        console.log('Calendly widget initialized successfully');
        
      } catch (error) {
        console.error('Error initializing Calendly:', error);
        setError('Failed to load Calendly widget. Please try again.');
        setIsLoading(false);
      }
    };

    const loadCalendlyWithWidget = async () => {
      // If already initialized, skip
      if (widgetInitialized.current) {
        return;
      }

      // Check if we should use the widget API or iframe directly
      const useWidgetAPI = false; // Set to false to use direct iframe approach
      
      if (useWidgetAPI) {
        // Original widget API approach (currently broken)
        if (!calendlyScriptLoaded && !calendlyScriptLoading) {
          calendlyScriptLoading = true;
          
          const script = document.createElement('script');
          script.src = 'https://assets.calendly.com/assets/external/widget.js';
          script.async = true;
          
          script.onload = () => {
            calendlyScriptLoaded = true;
            calendlyScriptLoading = false;
            console.log('Calendly script loaded');
            
            // Wait for Calendly to initialize
            let attempts = 0;
            const checkCalendly = setInterval(() => {
              attempts++;
              if (window.Calendly && window.Calendly.initInlineWidget) {
                clearInterval(checkCalendly);
                if (containerRef.current && isMounted.current && !widgetInitialized.current) {
                  try {
                    window.Calendly.initInlineWidget({
                      url: url,
                      parentElement: containerRef.current,
                      prefill: prefill
                    });
                    widgetInitialized.current = true;
                    setIsLoading(false);
                  } catch (err) {
                    console.error('Widget init error:', err);
                    setError('Failed to initialize widget');
                    setIsLoading(false);
                  }
                }
              } else if (attempts > 50) { // 10 seconds timeout
                clearInterval(checkCalendly);
                console.error('Calendly failed to initialize');
                // Fallback to iframe approach
                initializeWidget();
              }
            }, 200);
          };
          
          script.onerror = () => {
            calendlyScriptLoading = false;
            console.error('Failed to load Calendly script');
            // Fallback to iframe approach
            initializeWidget();
          };
          
          document.head.appendChild(script);
        } else if (calendlyScriptLoaded && window.Calendly && window.Calendly.initInlineWidget) {
          // Script already loaded, initialize widget
          if (containerRef.current && !widgetInitialized.current) {
            try {
              window.Calendly.initInlineWidget({
                url: url,
                parentElement: containerRef.current,
                prefill: prefill
              });
              widgetInitialized.current = true;
              setIsLoading(false);
            } catch (err) {
              console.error('Widget init error:', err);
              initializeWidget(); // Fallback to iframe
            }
          }
        }
      } else {
        // Direct iframe approach (more reliable)
        initializeWidget();
      }
    };

    // Small delay to ensure container is ready
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        loadCalendlyWithWidget();
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
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
              widgetInitialized.current = false;
              // Try again with iframe approach
              const initializeWidget = () => {
                if (!containerRef.current) return;
                
                containerRef.current.innerHTML = '';
                const iframe = document.createElement('iframe');
                iframe.src = `${url}?embed_domain=${encodeURIComponent(window.location.hostname)}&embed_type=Inline${
                  prefill.name ? `&name=${encodeURIComponent(prefill.name)}` : ''
                }${
                  prefill.email ? `&email=${encodeURIComponent(prefill.email)}` : ''
                }`;
                iframe.width = '100%';
                iframe.height = '100%';
                iframe.frameBorder = '0';
                iframe.style.minWidth = '320px';
                iframe.style.height = '700px';
                
                containerRef.current.appendChild(iframe);
                setIsLoading(false);
              };
              
              setTimeout(initializeWidget, 100);
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
        className="calendly-widget-container"
        style={{
          width: '100%',
          minWidth: '320px',
          height: '700px',
          minHeight: '700px',
          position: 'relative'
        }}
      />
    </div>
  );
};

export default CalendlyEmbed;