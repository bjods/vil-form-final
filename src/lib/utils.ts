import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FormState, FormSubmissionPayload } from "../types/form";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique session ID
export function generateSessionId(): string {
  return crypto.randomUUID();
}

// Save form state to localStorage
export function saveFormState(state: FormState): void {
  localStorage.setItem('formState', JSON.stringify(state));
}

// Load form state from localStorage
export function loadFormState(): FormState | null {
  const saved = localStorage.getItem('formState');
  return saved ? JSON.parse(saved) : null;
}

// Send form data to Zapier webhook
export async function submitToZapier(formData: FormState): Promise<boolean> {
  const payload: FormSubmissionPayload = {
    session_id: formData.sessionId,
    selected_services: formData.services,
    upload_link: formData.personalInfo.textUploadLink 
      ? `${window.location.origin}/upload/${formData.sessionId}` 
      : null,
    text_upload_link_requested: formData.personalInfo.textUploadLink,
    personal_information: {
      first_name: formData.personalInfo.firstName,
      last_name: formData.personalInfo.lastName,
      email: formData.personalInfo.email,
      phone: formData.personalInfo.phone,
      address: formData.address
    },
    form_path: formData.formPath,
    budgets: formData.budgets,
    service_details: formData.serviceDetails,
    project_scope: formData.projectScope,
    start_deadlines: formData.startDeadlines,
    previous_provider: formData.previousProvider,
    previous_quotes: formData.previousQuotes,
    price_vs_long_term: formData.priceVsLongTerm,
    site_challenges: formData.siteChallenges,
    project_success_criteria: formData.projectSuccessCriteria,
    uploaded_images: formData.personalInfo.uploadedImages || [],
    inside_service_area: formData.insideServiceArea,
    submitted_at: new Date().toISOString()
  };

  const maxRetries = 3;
  let attempt = 0;

  console.log('Starting form submission...');
  
  while (attempt < maxRetries) {
    try {
      console.log(`Attempt ${attempt + 1} of ${maxRetries}...`);
      console.log('Payload:', payload);
      
      const response = await fetch('https://eotwpuhp53a1tsu.m.pipedream.net', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is truly successful
      if (response.ok && response.status === 200) {
        try {
          const data = await response.json();
          console.log('Form submitted successfully:', data);
          return true; // Exit on success
        } catch (jsonError) {
          console.log('Response received but not JSON:', jsonError);
          return true; // Still success even if response isn't JSON
        }
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;

      if (attempt === maxRetries) {
        console.warn('Form submission failed after 3 attempts, but proceeding anyway');
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return true;
}

// Send file upload data to Zapier webhook
export async function submitUploadsToZapier(sessionId: string, imageUrls: string[]): Promise<boolean> {
  console.log('Starting upload submission...');
  
  const payload = {
    session_id: sessionId,
    uploaded_images: imageUrls,
    submitted_at: new Date().toISOString()
  };

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      console.log(`Upload attempt ${attempt + 1} of ${maxRetries}...`);
      console.log('Payload:', payload);
      
      const response = await fetch('https://eo9ejhr6tfvoy7o.m.pipedream.net', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      // Check if response is truly successful
      if (response.ok && response.status === 200) {
        try {
          const data = await response.json();
          console.log('Uploads submitted successfully:', data);
          return true; // Exit on success
        } catch (jsonError) {
          console.log('Response received but not JSON:', jsonError);
          return true; // Still success even if response isn't JSON
        }
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error(`Upload attempt ${attempt + 1} failed:`, error);
      attempt++;

      if (attempt === maxRetries) {
        console.warn('Upload submission failed after 3 attempts, but proceeding anyway');
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return true;
}

// Service area validation
export function isInServiceArea(postalCode: string): boolean {
  if (!postalCode) return false;
  
  // Extract first 3 characters (FSA) from postal code
  const fsa = postalCode.substring(0, 3).toUpperCase();
  
  // List of service area FSAs
  const serviceAreaFSAs = [
    'L6J', 'L6K', 'L6L', 'L6M', 'L6H', 
    'L5J', 'L5K', 'L5L', 'L7L', 'L7M'
  ];
  
  return serviceAreaFSAs.includes(fsa);
}

// Format currency for budget inputs
export function formatCurrency(value: number | string): string {
  if (!value) return '$0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0
  }).format(numValue);
}

// Determine form path based on selected services
export function determineFormPath(services: string[]): 'maintenance' | 'projects' | 'both' | 'other' {
  const hasMaintenanceServices = services.some(service => 
    ['lawn-maintenance', 'snow-management'].includes(service)
  );
  
  const hasProjectServices = services.some(service => 
    ['landscape-design-build', 'landscape-enhancement'].includes(service)
  );
  
  const hasOtherServices = services.some(service => service === 'other');
  
  if (hasOtherServices) {
    return 'other';
  } else if (hasMaintenanceServices && hasProjectServices) {
    return 'both';
  } else if (hasMaintenanceServices) {
    return 'maintenance';
  } else if (hasProjectServices) {
    return 'projects';
  } else {
    return 'other'; // Default fallback
  }
}

// Animate elements when they enter viewport
export function animateOnEnter(element: HTMLElement, animationClass: string) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add(animationClass);
        }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(element);
  
  return () => {
    observer.disconnect();
  };
}