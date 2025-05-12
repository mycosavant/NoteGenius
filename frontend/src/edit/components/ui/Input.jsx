// src/components/ui/Input.jsx
import React from 'react';
import './Input.css';

export function Input({ className = '', ...props }) {
  return (
    <input className={`input ${className}`} {...props} />
  );
}