import React from 'react';
import './LoadingAnimation.css';
import logo from '../logo.svg';

const LoadingAnimation = ({ 
  type = 'pulse', 
  message = 'Loading...', 
  size = 'medium',
  showLogo = true,
  showMessage = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium', 
    large: 'loading-large'
  };

  const renderLogoAnimation = () => {
    switch (type) {
      case 'pulse':
        return (
          <div className="loading-logo-container pulse-animation">
            <img src={logo} alt="HealthyWallet" className="loading-logo" />
            <div className="pulse-ring"></div>
            <div className="pulse-ring pulse-ring-delay-1"></div>
            <div className="pulse-ring pulse-ring-delay-2"></div>
          </div>
        );
      
      case 'spin':
        return (
          <div className="loading-logo-container spin-animation">
            <img src={logo} alt="HealthyWallet" className="loading-logo spinning" />
            <div className="spin-border"></div>
          </div>
        );
      
      case 'bounce':
        return (
          <div className="loading-logo-container bounce-animation">
            <img src={logo} alt="HealthyWallet" className="loading-logo bouncing" />
            <div className="bounce-shadow"></div>
          </div>
        );
      
      case 'wave':
        return (
          <div className="loading-logo-container wave-animation">
            <img src={logo} alt="HealthyWallet" className="loading-logo waving" />
            <div className="wave-line">
              <div className="wave-dot"></div>
              <div className="wave-dot"></div>
              <div className="wave-dot"></div>
              <div className="wave-dot"></div>
              <div className="wave-dot"></div>
            </div>
          </div>
        );
      
      case 'glow':
        return (
          <div className="loading-logo-container glow-animation">
            <img src={logo} alt="HealthyWallet" className="loading-logo glowing" />
            <div className="glow-ring"></div>
            <div className="glow-particles">
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
              <div className="particle particle-4"></div>
              <div className="particle particle-5"></div>
              <div className="particle particle-6"></div>
            </div>
          </div>
        );
      
      case 'flip':
        return (
          <div className="loading-logo-container flip-animation">
            <div className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <img src={logo} alt="HealthyWallet" className="loading-logo" />
                </div>
                <div className="flip-card-back">
                  <img src={logo} alt="HealthyWallet" className="loading-logo" />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'morph':
        return (
          <div className="loading-logo-container morph-animation">
            <img src={logo} alt="HealthyWallet" className="loading-logo morphing" />
            <div className="morph-background"></div>
          </div>
        );
      
      default:
        return (
          <div className="loading-logo-container pulse-animation">
            <img src={logo} alt="HealthyWallet" className="loading-logo" />
            <div className="pulse-ring"></div>
          </div>
        );
    }
  };

  const renderSpinner = () => {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
      </div>
    );
  };

  const renderProgressBar = () => {
    return (
      <div className="loading-progress-container">
        <div className="loading-progress-bar">
          <div className="loading-progress-fill"></div>
        </div>
        <div className="loading-progress-dots">
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
    );
  };

  return (
    <div className={`loading-animation-wrapper ${sizeClasses[size]} ${className}`}>
      <div className="loading-content">
        {showLogo && renderLogoAnimation()}
        
        {type === 'spinner' && renderSpinner()}
        {type === 'progress' && renderProgressBar()}
        
        {showMessage && (
          <div className="loading-message">
            <p className="loading-text">{message}</p>
            <div className="loading-dots">
              <span className="dot dot-1">.</span>
              <span className="dot dot-2">.</span>
              <span className="dot dot-3">.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Preset loading components for common use cases
export const LoadingScreen = ({ message = 'Loading HealthyWallet...' }) => (
  <div className="loading-screen-overlay">
    <LoadingAnimation 
      type="glow" 
      message={message} 
      size="large"
      className="loading-screen"
    />
  </div>
);

export const LoadingCard = ({ message = 'Loading...' }) => (
  <div className="loading-card">
    <LoadingAnimation 
      type="pulse" 
      message={message} 
      size="medium"
      showLogo={false}
    />
  </div>
);

export const LoadingButton = ({ message = 'Processing...' }) => (
  <LoadingAnimation 
    type="spin" 
    message={message} 
    size="small"
    showLogo={false}
  />
);

export const LoadingInline = ({ message = 'Loading...' }) => (
  <LoadingAnimation 
    type="wave" 
    message={message} 
    size="small"
    showLogo={false}
    className="loading-inline"
  />
);

export default LoadingAnimation;
