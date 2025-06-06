import React from 'react';

interface FormCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  footerContent?: React.ReactNode;
}

const FormCard: React.FC<FormCardProps> = ({ 
  children, 
  title, 
  description,
  footerContent
}) => {
  return (
    <div 
      className="form-card animate-fade-in flex flex-col transition-all duration-300"
      style={{
        width: 'var(--widget-width)',
        margin: 'var(--widget-margin)',
        height: 'var(--widget-height)',
        maxHeight: 'var(--widget-max-height)',
        background: 'var(--widget-background)',
        borderRadius: 'var(--widget-border-radius)',
        backdropFilter: 'var(--widget-backdrop-filter)',
        boxShadow: 'var(--widget-shadow)'
      }}
    >
      {/* Header */}
      <div 
        className="border-b border-gray-100 flex-shrink-0"
        style={{ padding: 'var(--widget-header-padding)' }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h2>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Scrollable Content */}
        <div 
          className="form-content flex-1 overflow-y-auto"
          style={{ padding: 'var(--widget-content-padding)' }}
        >
          {children}
        </div>
        
        {/* Footer */}
        {footerContent && (
          <div 
            className="flex-shrink-0 border-t border-gray-100"
            style={{ padding: 'var(--widget-footer-padding)' }}
          >
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormCard;