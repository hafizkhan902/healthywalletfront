import React, { useState, useEffect } from 'react';
import './Settings.css';
import PageAIInsight from './PageAIInsight';

const Settings = () => {
  // Theme settings
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('healthywallet-theme');
    return savedTheme === 'dark';
  });

  // Notification settings
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('healthywallet-notifications');
    return savedNotifications !== null ? JSON.parse(savedNotifications) : true;
  });

  // Currency settings
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('healthywallet-currency');
    return savedCurrency || 'USD';
  });

  // Budget alert settings
  const [budgetAlerts, setBudgetAlerts] = useState(() => {
    const savedAlerts = localStorage.getItem('healthywallet-budget-alerts');
    return savedAlerts !== null ? JSON.parse(savedAlerts) : true;
  });

  // Goal reminder settings
  const [goalReminders, setGoalReminders] = useState(() => {
    const savedReminders = localStorage.getItem('healthywallet-goal-reminders');
    return savedReminders !== null ? JSON.parse(savedReminders) : true;
  });

  // Apply theme changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('healthywallet-theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('healthywallet-theme', 'light');
    }
  }, [darkMode]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('healthywallet-notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('healthywallet-currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('healthywallet-budget-alerts', JSON.stringify(budgetAlerts));
  }, [budgetAlerts]);

  useEffect(() => {
    localStorage.setItem('healthywallet-goal-reminders', JSON.stringify(goalReminders));
  }, [goalReminders]);

  const handleExportData = () => {
    // Mock data export functionality
    const data = {
      income: JSON.parse(localStorage.getItem('healthywallet-income') || '[]'),
      expenses: JSON.parse(localStorage.getItem('healthywallet-expenses') || '[]'),
      goals: JSON.parse(localStorage.getItem('healthywallet-goals') || '[]'),
      settings: {
        darkMode,
        notifications,
        currency,
        budgetAlerts,
        goalReminders
      }
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `healthywallet-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('healthywallet-income');
      localStorage.removeItem('healthywallet-expenses');
      localStorage.removeItem('healthywallet-goals');
      alert('All data has been cleared successfully.');
    }
  };

  return (
    <div className="settings-module">
      {/* Header */}
      <header className="module-header">
        <div className="header-content">
          <h1 className="module-title">Settings</h1>
          <p className="module-subtitle">Customize your app experience</p>
        </div>
      </header>

      {/* AI Insight */}
      <PageAIInsight page="settings" data={[]} />

      {/* Settings Sections */}
      <div className="settings-content">
        
        {/* Appearance Settings */}
        <section className="settings-section">
          <h2 className="section-title">Appearance</h2>
          <div className="settings-group">
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Dark Mode</span>
                <span className="setting-description">Switch between light and dark themes</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Currency</span>
                <span className="setting-description">Choose your preferred currency</span>
              </div>
              <select
                className="setting-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>

          </div>
        </section>

        {/* Notification Settings */}
        <section className="settings-section">
          <h2 className="section-title">Notifications</h2>
          <div className="settings-group">
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">App Notifications</span>
                <span className="setting-description">Receive general app notifications</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Budget Alerts</span>
                <span className="setting-description">Get notified when approaching budget limits</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={budgetAlerts}
                  onChange={(e) => setBudgetAlerts(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Goal Reminders</span>
                <span className="setting-description">Receive reminders about your savings goals</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={goalReminders}
                  onChange={(e) => setGoalReminders(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

          </div>
        </section>

        {/* Data Management */}
        <section className="settings-section">
          <h2 className="section-title">Data Management</h2>
          <div className="settings-group">
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Export Data</span>
                <span className="setting-description">Download your data as JSON file</span>
              </div>
              <button className="setting-button primary" onClick={handleExportData}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Clear All Data</span>
                <span className="setting-description">Remove all stored data (cannot be undone)</span>
              </div>
              <button className="setting-button danger" onClick={handleClearData}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="m19 6-1 14c0 1-1 2-2 2H8c-1 0-2-1-2-2L5 6"></path>
                  <path d="m10 11 0 6"></path>
                  <path d="m14 11 0 6"></path>
                  <path d="M5 6l1-2c0-1 1-1 2-1h8c1 0 2 0 2 1l1 2"></path>
                </svg>
                Clear Data
              </button>
            </div>

          </div>
        </section>

        {/* About Section */}
        <section className="settings-section">
          <h2 className="section-title">About</h2>
          <div className="settings-group">
            
            <div className="about-item">
              <span className="about-label">App Version</span>
              <span className="about-value">1.0.0</span>
            </div>

            <div className="about-item">
              <span className="about-label">Build</span>
              <span className="about-value">Production</span>
            </div>

            <div className="about-item">
              <span className="about-label">Last Updated</span>
              <span className="about-value">{new Date().toLocaleDateString()}</span>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;