import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseClass = `btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`;
  
  return (
    <button className={baseClass.trim()} {...props}>
      {children}
    </button>
  );
};
