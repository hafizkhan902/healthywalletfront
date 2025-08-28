import React from 'react';
import './GlobalLoading.css';
import logo from '../logo.svg';

const GlobalLoading = ({ 
  size = 'medium',
  overlay = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'global-loading-small',
    medium: 'global-loading-medium',
    large: 'global-loading-large'
  };

  const containerClass = overlay ? 'global-loading-overlay' : 'global-loading-container';

  return (
    <div className={`${containerClass} ${sizeClasses[size]} ${className}`}>
      <div className="global-loading-content">
        {/* Logo with subtle breathing animation */}
        <div className="logo-container">
          <img 
            src={logo} 
            alt="HealthyWallet" 
            className="loading-logo"
          />
          {/* Subtle rotating ring around logo */}
          <div className="loading-ring"></div>
          {/* Soft pulsing backdrop */}
          <div className="loading-backdrop"></div>
        </div>
      </div>
    </div>
  );
};

// Preset components for different use cases
export const LoadingOverlay = ({ size = 'large' }) => (
  <GlobalLoading size={size} overlay={true} />
);

export const LoadingInline = ({ size = 'small' }) => (
  <GlobalLoading size={size} className="inline-loading" />
);

export const LoadingCard = ({ size = 'medium' }) => (
  <div className="loading-card-wrapper">
    <GlobalLoading size={size} />
  </div>
);

export default GlobalLoading;
