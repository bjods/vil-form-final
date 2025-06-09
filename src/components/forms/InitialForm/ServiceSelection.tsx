import React from 'react'
import { InitialFormData } from '../../../types/forms'

interface ServiceSelectionProps {
  data: InitialFormData
  onChange: (field: keyof InitialFormData, value: any) => void
  sessionId?: string
}

const SERVICE_OPTIONS = [
  {
    id: 'lawn-maintenance',
    name: 'Lawn Maintenance',
    description: 'Regular mowing, edging, and lawn care',
    icon: '🌱'
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    description: 'Garden design, planting, and landscape installation',
    icon: '🌿'
  },
  {
    id: 'snow-removal',
    name: 'Snow Removal',
    description: 'Winter snow clearing and ice management',
    icon: '❄️'
  },
  {
    id: 'irrigation',
    name: 'Irrigation',
    description: 'Sprinkler systems and watering solutions',
    icon: '💧'
  },
  {
    id: 'tree-care',
    name: 'Tree Care',
    description: 'Pruning, trimming, and tree maintenance',
    icon: '🌳'
  },
  {
    id: 'hardscaping',
    name: 'Hardscaping',
    description: 'Patios, walkways, retaining walls',
    icon: '🧱'
  },
  {
    id: 'garden-design',
    name: 'Garden Design',
    description: 'Custom garden planning and installation',
    icon: '🌺'
  },
  {
    id: 'other',
    name: 'Other Services',
    description: 'Tell us what you need',
    icon: '🔧'
  }
]

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  data,
  onChange,
  sessionId
}) => {
  const handleServiceToggle = (serviceId: string) => {
    const currentServices = data.services || []
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter(s => s !== serviceId)
      : [...currentServices, serviceId]
    
    onChange('services', newServices)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">What services do you need?</h2>
        <p className="text-gray-600 mb-6">
          Select all services you're interested in. You can choose multiple options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICE_OPTIONS.map((service) => {
          const isSelected = data.services.includes(service.id)
          
          return (
            <div
              key={service.id}
              onClick={() => handleServiceToggle(service.id)}
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{service.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleServiceToggle(service.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {data.services.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Selected Services:</h4>
          <div className="flex flex-wrap gap-2">
            {data.services.map((serviceId) => {
              const service = SERVICE_OPTIONS.find(s => s.id === serviceId)
              return (
                <span
                  key={serviceId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {service?.icon} {service?.name}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 