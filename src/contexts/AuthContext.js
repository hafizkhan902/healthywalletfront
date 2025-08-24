import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authData = localStorage.getItem('healthywallet-auth');
        if (authData) {
          const { isLoggedIn, userData, timestamp } = JSON.parse(authData);
          
          // Check if session is valid (24 hours)
          const currentTime = new Date().getTime();
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          
          if (isLoggedIn && (currentTime - timestamp) < sessionDuration) {
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            // Session expired, clear storage
            localStorage.removeItem('healthywallet-auth');
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('healthywallet-auth');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Dummy login function
  const login = async (email, password) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy validation - accept any email with password "demo123"
      if (password === 'demo123' && email.includes('@')) {
        const userData = {
          id: 1,
          email: email,
          name: email.split('@')[0].replace(/[^a-zA-Z]/g, ''),
          joinDate: new Date().toISOString()
        };

        const authData = {
          isLoggedIn: true,
          userData: userData,
          timestamp: new Date().getTime()
        };

        localStorage.setItem('healthywallet-auth', JSON.stringify(authData));
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          error: 'Invalid credentials. Use any email with password: demo123' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('healthywallet-auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Register function (dummy)
  const register = async (name, email, password) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy validation
      if (email.includes('@') && password.length >= 6) {
        const userData = {
          id: Date.now(),
          email: email,
          name: name,
          joinDate: new Date().toISOString()
        };

        const authData = {
          isLoggedIn: true,
          userData: userData,
          timestamp: new Date().getTime()
        };

        localStorage.setItem('healthywallet-auth', JSON.stringify(authData));
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          error: 'Please provide a valid email and password (min 6 characters)' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      };
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