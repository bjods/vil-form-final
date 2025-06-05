import { Service } from '../types/form';

export const services: Service[] = [
  {
    id: 'landscape-design-build',
    name: 'Landscape Design & Build',
    category: 'projects',
    icon: 'garden',
    options: {
      elements: [
        'Driveway',
        'Walkway',
        'Patio',
        'Front/back entrance',
        'Pergola',
        'Fire Feature',
        'Water Feature',
        'Kitchen',
        'Dining',
        'Fence/gates',
        'Pool',
        'Shed/pool house',
        'Lighting',
        'Decorative Stone',
        'Sports Area',
        'Playground',
        'Fitness Area',
        'Sod/Lawn',
        'Irrigation'
      ]
    }
  },
  {
    id: 'landscape-enhancement',
    name: 'Landscape Enhancement',
    category: 'projects',
    icon: 'tree',
    options: {
      types: [
        'Sod',
        'Overseeding',
        'Mulch',
        'Spring/fall cleanup'
      ]
    }
  },
  {
    id: 'lawn-maintenance',
    name: 'Routine Lawn Maintenance',
    category: 'maintenance',
    icon: 'scissors',
    options: {
      types: [
        'Basic',
        'Premium (includes mowing service + garden maintenance)'
      ]
    }
  },
  {
    id: 'snow-management',
    name: 'Snow Management',
    category: 'maintenance',
    icon: 'cloud-snow',
    options: {
      propertySizes: [
        'Single car',
        'Two car',
        'Three car',
        'Four car',
        'Irregular driveway size',
        'Commercial lot'
      ]
    }
  },
  {
    id: 'other',
    name: 'Other',
    category: 'other',
    icon: 'plus'
  }
];

export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id);
};

export const getServicesByCategory = (category: string): Service[] => {
  return services.filter(service => service.category === category);
};