// src/components/ui/Button.jsx
import React from 'react';
import './Button.css';

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  ...props 
}) {
  const variantClasses = {
    default: 'btn-default',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    destructive: 'btn-destructive',
  };

  const sizeClasses = {
    default: 'btn-md',
    sm: 'btn-sm',
    lg: 'btn-lg',
    icon: 'btn-icon',
  };

  const buttonClass = `btn ${variantClasses[variant] || ''} ${sizeClasses[size] || ''} ${className}`;

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
}