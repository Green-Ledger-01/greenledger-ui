import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MobileInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
  disabled?: boolean;
  required?: boolean;
  error?: string;
  icon?: LucideIcon;
  className?: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  autoComplete?: string;
  maxLength?: number;
  rows?: number; // For textarea
  multiline?: boolean;
}

/**
 * Mobile-optimized input component with proper touch targets and keyboard handling
 */
const MobileInput: React.FC<MobileInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  required = false,
  error,
  icon: Icon,
  className = '',
  inputMode,
  autoComplete,
  maxLength,
  rows = 3,
  multiline = false,
}) => {
  const baseInputClasses = `
    w-full px-4 xs:px-3 py-4 xs:py-3 border rounded-xl xs:rounded-lg 
    shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 
    transition-colors text-base xs:text-sm touch-target
    ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const inputProps = {
    value,
    onChange: handleChange,
    placeholder,
    disabled,
    required,
    className: baseInputClasses,
    inputMode,
    autoComplete,
    maxLength,
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-base xs:text-sm font-medium text-gray-700">
          {Icon && <Icon className="h-5 w-5 xs:h-4 xs:w-4 inline mr-2 xs:mr-1" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {multiline ? (
          <textarea
            {...inputProps}
            rows={rows}
            className={`${baseInputClasses} resize-none`}
          />
        ) : (
          <input
            {...inputProps}
            type={type}
          />
        )}
        
        {Icon && !label && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm xs:text-xs text-red-600 mt-2 xs:mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default MobileInput;