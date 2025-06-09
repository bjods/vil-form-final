import React, { useEffect, useState } from 'react'
import { useAutoSave } from '../../hooks/useAutoSave'

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number'
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  required?: boolean
  error?: string
  options?: { value: string; label: string }[]
  rows?: number
  sessionId?: string
  autoSave?: boolean
  className?: string
  description?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options,
  rows = 3,
  sessionId,
  autoSave = true,
  className = '',
  description
}) => {
  const { autoSave: saveField } = useAutoSave(sessionId || null)
  const [localValue, setLocalValue] = useState(value)

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string | number) => {
    setLocalValue(newValue)
    onChange(newValue)
    
    // Auto-save if enabled and sessionId provided
    if (autoSave && sessionId) {
      saveField(name, newValue)
    }
  }

  const baseInputClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${className}
  `.trim()

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className={baseInputClasses}
          />
        )
      
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            required={required}
            className={baseInputClasses}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={localValue}
            onChange={(e) => handleChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={placeholder}
            required={required}
            className={baseInputClasses}
          />
        )
    }
  }

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      {renderInput()}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 