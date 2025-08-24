import React from 'react';
import './Header.css';

const Header = ({ currentPage, onNavigate, user, onLogout }) => {
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      )
    },
    { 
      id: 'income', 
      label: 'Income', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      )
    },
    { 
      id: 'expense', 
      label: 'Expenses', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
          <polyline points="17 18 23 18 23 12"></polyline>
        </svg>
      )
    },
    { 
      id: 'goal', 
      label: 'Goals', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
        </svg>
      )
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    }
  ];

  return (
    <header className="app-header">
      {/* Top Header Bar */}
      <div className="header-bar">
        <div className="header-container">
          {/* Brand Section */}
          <div className="brand-section">
            <div className="app-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <path d="m16 8 2 2-4 4-2-2"></path>
                <path d="m21 15-3-3 3-3"></path>
              </svg>
            </div>
            <div className="brand-info">
              <h1 className="app-title">HealthyWallet</h1>
              <span className="app-subtitle">Financial Management</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" role="navigation">
            <ul className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                    aria-current={currentPage === item.id ? 'page' : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="user-section">
            <button
              className={`settings-btn ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => onNavigate('settings')}
              aria-label="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="m12 1 1.5 1.5L16 2l1 1-0.5 2.5L18 7l-1 1-2.5-0.5L13 10l-1-1 0.5-2.5L11 5l1-1 2.5 0.5L16 2l-1-1-2.5 0.5L11 3l1 1-0.5 2.5z"></path>
                <path d="m19.14 14.14 2.86-2.86"></path>
                <path d="m16.86 19.14 2.86-2.86"></path>
                <path d="m19.14 19.14-2.86-2.86"></path>
                <path d="m16.86 14.14-2.86 2.86"></path>
              </svg>
            </button>
            
            {/* User Info and Logout */}
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <button 
                className="logout-btn"
                onClick={onLogout}
                aria-label="Logout"
                title="Logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
            
            <div className="user-avatar">
              <div className="avatar-placeholder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="mobile-nav" role="navigation">
        <ul className="mobile-nav-list">
          {navigationItems.map((item) => (
            <li key={item.id} className="mobile-nav-item">
              <button
                className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
                aria-label={item.label}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            </li>
          ))}
          <li className="mobile-nav-item">
            <button
              className={`mobile-nav-link ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => onNavigate('settings')}
              aria-current={currentPage === 'settings' ? 'page' : undefined}
              aria-label="Settings"
            >
              <span className="mobile-nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="m12 1 1.5 1.5L16 2l1 1-0.5 2.5L18 7l-1 1-2.5-0.5L13 10l-1-1 0.5-2.5L11 5l1-1 2.5 0.5L16 2l-1-1-2.5 0.5L11 3l1 1-0.5 2.5z"></path>
                </svg>
              </span>
              <span className="mobile-nav-label">Settings</span>
            </button>
          </li>
          <li className="mobile-nav-item">
            <button
              className="mobile-nav-link logout-mobile"
              onClick={onLogout}
              aria-label="Logout"
            >
              <span className="mobile-nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="mobile-nav-label">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;