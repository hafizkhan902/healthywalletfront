import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent multiple concurrent auth checks
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  
  // Track if auth has been initialized to prevent multiple checks
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Use ref to prevent rapid successive calls
  const lastAuthCheck = useRef(0);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const now = Date.now();
      
      if (isCheckingAuth || authInitialized) {
        console.log('🔄 Auth check already in progress or completed, skipping...');
        return;
      }
      
      // Throttle auth checks to max once per 2 seconds
      if (now - lastAuthCheck.current < 2000) {
        console.log('🔄 Auth check throttled, too soon since last check');
        return;
      }
      
      lastAuthCheck.current = now;
      setIsCheckingAuth(true);
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          try {
            // Verify token with backend
            const response = await authAPI.getMe();
            if (response.success) {
              setIsAuthenticated(true);
              setUser(response.data);
            } else {
              // Token invalid, clear storage
              authAPI.logout();
              setIsAuthenticated(false);
              setUser(null);
            }
          } catch (error) {
            // Token expired or invalid
            console.error('Token validation failed:', error);
            authAPI.logout();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        authAPI.logout();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
        setAuthInitialized(true);
      }
    };

    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Real login function using backend API
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        return { 
          success: false, 
          error: response.message || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Real register function using backend API
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.register({ name, email, password });
      
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        return { 
          success: false, 
          error: response.message || 'Registration failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};