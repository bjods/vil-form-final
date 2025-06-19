import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FormState } from "../types/form";
import { services } from '../data/services';

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

// Service name normalization helpers
const SERVICE_NAME_MAP: Record<string, string> = {
  'Landscape Design & Build': 'landscape-design-build',
  'Landscape Enhancement': 'landscape-enhancement',
  'Routine Lawn Maintenance': 'lawn-maintenance',
  'Snow Management': 'snow-management',
  'Other': 'other'
};

export function normalizeServiceName(serviceName: string): string {
  // If it's already a service ID, return it
  if (services.some(s => s.id === serviceName)) {
    return serviceName;
  }
  
  // If it's a display name, convert to ID
  if (SERVICE_NAME_MAP[serviceName]) {
    return SERVICE_NAME_MAP[serviceName];
  }
  
  // Return as-is if no mapping found
  return serviceName;
}

export function normalizeServices(serviceList: string[]): string[] {
  return serviceList.map(normalizeServiceName);
}

export function isMaintenanceService(serviceName: string): boolean {
  const normalized = normalizeServiceName(serviceName);
  return ['lawn-maintenance', 'snow-management'].includes(normalized);
}

export function isProjectService(serviceName: string): boolean {
  const normalized = normalizeServiceName(serviceName);
  return ['landscape-design-build', 'landscape-enhancement'].includes(normalized);
}