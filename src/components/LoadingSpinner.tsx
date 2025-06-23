import React from 'react';
import { Loader2, Leaf } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'branded' | 'minimal';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'branded') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="relative">
          <div className="h-16 w-16 rounded-full gradient-bg-primary flex items-center justify-center animate-pulse">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
        </div>
        {text && (
          <p className="text-gray-600 font-medium animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className={`${sizeClasses[size]} animate-spin text-green-600`} />
        {text && (
          <span className={`${textSizeClasses[size]} text-gray-600`}>{text}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-green-200 border-t-green-600 rounded-full animate-spin`}></div>
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
