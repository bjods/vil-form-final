import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Calendly: any;
  }
}

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Calendly events
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Log all Calendly messages for debugging
      if (e.origin && e.origin.includes('calendly')) {
        console.log('Calendly message received:', e.data);
      }
      
      // Check various Calendly event formats
      if (e.origin === 'https://calendly.com' && (
        e.data.event === 'calendly.event_scheduled' ||
        e.data.event === 'calendly.scheduling_successful' ||
        (e.data.calendly && e.data.calendly.event === 'event_scheduled')
      )) {
        console.log('Calendly event detected:', e.data);
        onEventScheduled?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEventScheduled]);

  useEffect(() => {
    const initializeCalendly = () => {
      if (!containerRef.current) {
        console.log('Container ref not ready');
        return;
      }

      if (!window.Calendly) {
        console.log('Calendly not loaded');
        return;
      }

      if (!window.Calendly.initInlineWidget) {
        console.log('Calendly widget not ready');
        return;
      }

      try {
        console.log('Initializing Calendly widget');
        window.Calendly.initInlineWidget({
          url: url,
          parentElement: containerRef.current,
          prefill: {
            name: prefill.name,
            email: prefill.email
          },
          utm: {}
        });
        
        // Ensure proper iframe height
        const calendlyFrame = containerRef.current.querySelector('iframe');
        if (calendlyFrame) {
          calendlyFrame.style.height = '700px';
          calendlyFrame.style.minHeight = '700px';
          calendlyFrame.style.width = '100%';
          calendlyFrame.style.border = 'none';
        }

        setIsLoading(false);
        
      } catch (error) {
        setIsLoading(false);
      }
    };

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="calendly.com"]');

    if (window.Calendly) {
      initializeCalendly();
    } else {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      
      script.onload = () => {
        // Give it a moment to initialize
        setTimeout(() => {
          initializeCalendly();
        }, 500);
      };
      
      script.onerror = (error) => {
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    }

    return () => {};
  }, [url, prefill]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50 pointer-events-none">
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
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 160px)',
          minHeight: '600px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default CalendlyEmbed;