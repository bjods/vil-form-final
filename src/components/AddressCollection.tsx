import React, { useEffect, useRef, useState } from 'react';
import { useFormStore } from '../store/formStore';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { validateAddress } from '../lib/validation';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { isInServiceArea } from '../lib/utils';

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBaxGwc3uGt97gA_hKji4L3s-QuIuejzYI';
const SCRIPT_ID = 'google-maps-script';

interface AddressCollectionProps {
  onValidationChange?: (isValid: boolean) => void;
}

const AddressCollection: React.FC<AddressCollectionProps> = ({ onValidationChange }) => {
  const { state, setAddress } = useFormStore();
  const [addressInput, setAddressInput] = useState(state.address || '');
  const [postalCode, setPostalCode] = useState(state.postalCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [serviceAreaStatus, setServiceAreaStatus] = useState<boolean | null>(state.insideServiceArea);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scriptLoadingRef = useRef(false);
  
  // Sync local state with store changes
  useEffect(() => {
    setAddressInput(state.address || '');
    setPostalCode(state.postalCode || '');
    setServiceAreaStatus(state.insideServiceArea);
  }, [state.address, state.postalCode, state.insideServiceArea]);

  useEffect(() => {
    const isValid = validateAddress({ ...state, address: addressInput, postalCode });
    onValidationChange?.(isValid);
  }, [addressInput, postalCode, onValidationChange]);
  
  const loadGoogleMapsScript = () => {
    if (scriptLoadingRef.current) return;
    
    if (document.getElementById(SCRIPT_ID) || window.google?.maps) {
      setIsScriptLoaded(true);
      setupAutocomplete();
      return;
    }

    scriptLoadingRef.current = true;
    
    const callbackName = `initGoogleMaps_${Date.now()}`;
    
    window[callbackName] = () => {
      setIsScriptLoaded(true);
      setupAutocomplete();
      delete window[callbackName];
    };
    
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      scriptLoadingRef.current = false;
      if (document.getElementById(SCRIPT_ID)) {
        document.head.removeChild(script);
      }
    };
    script.onload = () => {
      scriptLoadingRef.current = false;
    };
    document.head.appendChild(script);
  };
  
  useEffect(() => {
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      setupAutocomplete();
      return;
    }
    
    loadGoogleMapsScript();
    
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
      scriptLoadingRef.current = false;
    };
  }, []);
  
  const setupAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places || autocompleteRef.current) return;
    
    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'ca' },
        fields: ['address_components', 'formatted_address']
      });
      
      autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
    } catch (error) {
      console.error('Error setting up autocomplete:', error);
    }
  };
  
  const handlePlaceChanged = () => {
    setIsLoading(true);
    
    const place = autocompleteRef.current.getPlace();
    if (!place?.address_components) {
      setIsLoading(false);
      return;
    }
    
    const fullAddress = place.formatted_address;
    setAddressInput(fullAddress);
    
    let extractedPostalCode = '';
    for (const component of place.address_components) {
      if (component.types.includes('postal_code')) {
        extractedPostalCode = component.short_name;
        break;
      }
    }
    
    if (extractedPostalCode) {
      setPostalCode(extractedPostalCode);
      const inServiceArea = isInServiceArea(extractedPostalCode);
      setServiceAreaStatus(inServiceArea);
      setAddress(fullAddress, extractedPostalCode, inServiceArea);
    }
    
    setIsLoading(false);
  };
  
  const isValid = addressInput && postalCode && serviceAreaStatus !== null;
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            ref={inputRef}
            id="address"
            placeholder="Enter your address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Start typing and select your address from the dropdown
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressCollection;