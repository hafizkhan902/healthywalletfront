import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingInline } from './GlobalLoading';
import './LoginPage.css';

const LoginPage = ({ onBack }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    
    if (!isLogin) {
      if (!formData.name.trim()) {
        setError('Name is required');
        return false;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }
      
      if (!result.success) {
        // Handle rate limiting specifically
        if (result.error && result.error.includes('Too many requests')) {
          setError(result.error + ' The server is protecting against too many login attempts.');
        } else {
          setError(result.error);
        }
      }
      // If successful, the AuthContext will handle the redirect
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="login-container">
          <button className="back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 19-7-7 7-7"></path>
              <path d="m19 12H5"></path>
            </svg>
            <span>Back</span>
          </button>
          
          <div className="brand-section">
            <div className="brand-info">
            <img src="../logo.svg" alt="HealthyWallet Logo" />
              <span className="app-subtitle">Financial Management</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-container">
          <div className="login-content">
            <div className="login-form-container">
              <div className="form-header">
                <h1 className="form-title">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="form-subtitle">
                  {isLogin 
                    ? 'Sign in to access your financial dashboard' 
                    : 'Join HealthyWallet to start managing your finances'
                  }
                </p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    disabled={loading}
                  />
                </div>

                {!isLogin && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Confirm your password"
                      disabled={loading}
                    />
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingInline showMessage={false} />
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </>
                  )}
                </button>

                <div className="form-footer">
                  <p className="switch-mode">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                      type="button" 
                      className="switch-btn" 
                      onClick={switchMode}
                      disabled={loading}
                    >
                      {isLogin ? 'Create Account' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </form>

              {/* Demo Credentials */}
              <div className="demo-info">
                <div className="demo-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="m12 8 .01 0"></path>
                  </svg>
                  <span>Demo Credentials</span>
                </div>
                <p className="demo-text">
                  Use any email with password: <strong>demo123</strong>
                </p>
              </div>
            </div>

            <div className="login-visual">
              <div className="visual-content">
                <div className="feature-highlight">
                  <div className="highlight-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 12l10 10 10-10-10-10z"></path>
                      <path d="M12 6l-4 4 4 4 4-4-4-4z"></path>
                    </svg>
                  </div>
                  <h3 className="highlight-title">AI-Powered Insights</h3>
                  <p className="highlight-description">
                    Get personalized financial recommendations and insights based on your spending patterns and goals.
                  </p>
                </div>

                <div className="feature-list">
                  <div className="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11H1v3h8v3l3-4-3-4v2z"></path>
                      <path d="M22 12h-7v3h7v-3z"></path>
                    </svg>
                    <span>Smart expense categorization</span>
                  </div>
                  <div className="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                    </svg>
                    <span>Goal achievement tracking</span>
                  </div>
                  <div className="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    <span>Detailed financial reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;