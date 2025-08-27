import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Income from './components/Income';
import Expense from './components/Expense';
import Goal from './components/Goal';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import BackendStatus from './components/BackendStatus';

// Import scroll demo for development testing
if (process.env.NODE_ENV === 'development') {
  import('./utils/scrollDemo');
}

// Main App Content Component (Protected)
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, logout } = useAuth();

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'income':
        return <Income />;
      case 'expense':
        return <Expense />;
      case 'goal':
        return <Goal />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {/* Professional Header with Navigation */}
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        user={user}
        onLogout={logout}
      />
      
      {/* Page Content */}
      <main className="page-content">
        {renderPage()}
      </main>
    </div>
  );
};

// Authentication Router Component
const AuthRouter = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'app'

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="App loading-state">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading HealthyWallet...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show main app
  if (isAuthenticated) {
    return <AppContent />;
  }

  // If not authenticated, show landing or login based on current view
  if (currentView === 'login') {
    return (
      <LoginPage 
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  // Default: show landing page
  return (
    <LandingPage 
      onExplore={() => setCurrentView('login')}
    />
  );
};

// Main App Component with Authentication Provider
function App() {
  return (
    <AuthProvider>
      <BackendStatus />
      <AuthRouter />
    </AuthProvider>
  );
}

export default App;
