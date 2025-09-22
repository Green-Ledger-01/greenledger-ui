import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useMobileInteractions } from '../hooks/useMobile';

interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Mobile-optimized button component with proper touch targets and feedback
 */
const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
}) => {
  const { handleTouchFeedback } = useMobileInteractions();

  const baseClasses = `
    touch-target flex items-center justify-center font-medium rounded-xl
    transition-all duration-200 active:scale-98 disabled:opacity-50 
    disabled:cursor-not-allowed focus:outline-none focus:ring-2 
    focus:ring-offset-2 select-none
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 
      hover:to-green-800 text-white shadow-lg hover:shadow-xl 
      focus:ring-green-500
    `,
    secondary: `
      bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl 
      focus:ring-blue-500
    `,
    outline: `
      border-2 border-green-600 text-green-600 hover:bg-green-50 
      active:bg-green-100 focus:ring-green-500
    `,
    ghost: `
      text-gray-700 hover:bg-gray-100 active:bg-gray-200 
      focus:ring-gray-500
    `,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-3',
    lg: 'px-8 py-4 text-lg gap-3',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    handleTouchFeedback(e.currentTarget);
    onClick?.();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClasses}
        ${className}
      `}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}`} />
      )}
      
      <span className="truncate">{children}</span>
      
      {Icon && iconPosition === 'right' && (
        <Icon className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}`} />
      )}
    </button>
  );
};

export default MobileButton;