import React, { useState, useEffect } from 'react';
import './Settings.css';
import PageAIInsight from './PageAIInsight';
import { useSettings } from '../hooks/useSettings';
import { useCurrency } from '../contexts/CurrencyContext';

const Settings = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use backend settings hook
  const { 
    settings, 
    loading, 
    error, 
    saving, 
    updateSetting, 
    updateSettings 
  } = useSettings();

  // Use currency context for dynamic currency management
  const { currency: currentCurrency, updateCurrency, supportedCurrencies, formatCurrency } = useCurrency();

  // Track recent saves to prevent state overrides
  const [recentlySaved, setRecentlySaved] = useState(false);

  // Local state for form management
  const [formData, setFormData] = useState(() => {
    // Initialize with current currency context if available
    return {
      theme: 'light',
      currency: currentCurrency || 'USD',
      notifications: true,
      budgetAlerts: true,
      goalReminders: true
    };
  });

  // Update form data when settings load from backend (but not during or right after saving)
  useEffect(() => {
    if (settings && !saving && !recentlySaved) {
      const newFormData = {
        theme: settings.theme || 'light',
        currency: settings.currency || currentCurrency || 'USD', // Use current currency context as fallback
        notifications: settings.notifications !== false,
        budgetAlerts: settings.budgetAlerts !== false,
        goalReminders: settings.goalReminders !== false
      };
      
      console.log('🔄 Updating form data from backend settings:', newFormData);
      console.log('🔄 Full settings object:', settings);
      console.log('🔄 Current currency context:', currentCurrency);
      setFormData(newFormData);
    } else if (recentlySaved) {
      console.log('⏸️ Skipping form data update - recently saved');
    }
  }, [settings, saving, recentlySaved, currentCurrency]);

  // Also sync form data with currency context when currency changes globally
  useEffect(() => {
    if (currentCurrency && !saving && !recentlySaved) {
      console.log('🔄 Syncing form currency with global currency context:', currentCurrency);
      setFormData(prev => {
        // Only update if the currency is actually different
        if (prev.currency !== currentCurrency) {
          console.log('🔄 Currency mismatch detected. Updating form:', prev.currency, '→', currentCurrency);
          return {
            ...prev,
            currency: currentCurrency
          };
        }
        return prev;
      });
    }
  }, [currentCurrency, saving, recentlySaved]);

  // Initialize form currency when currency context loads for the first time
  useEffect(() => {
    if (currentCurrency && formData.currency === 'USD' && currentCurrency !== 'USD') {
      console.log('🔄 Initial currency sync from context:', currentCurrency);
      setFormData(prev => ({
        ...prev,
        currency: currentCurrency
      }));
    }
  }, [currentCurrency, formData.currency]);

  // Derived state for backward compatibility
  const darkMode = formData.theme === 'dark';
  const notifications = formData.notifications;
  const currency = formData.currency;
  const budgetAlerts = formData.budgetAlerts;
  const goalReminders = formData.goalReminders;

  // Apply theme changes
  useEffect(() => {
    console.log('🎨 Applying theme:', darkMode ? 'dark' : 'light', 'formData.theme:', formData.theme);
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode, formData.theme]);

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle setting changes
  const handleSettingChange = async (key, value) => {
    console.log(`🔧 Changing setting ${key} from "${formData[key]}" to "${value}"`);
    
    // Store the current value before updating
    const previousValue = formData[key];
    
    // Update local form state immediately for responsive UI
    setFormData(prev => {
      const newState = { ...prev, [key]: value };
      console.log(`📝 Updated formData:`, newState);
      return newState;
    });
    
    // Set recently saved flag to prevent state overrides
    setRecentlySaved(true);
    
    // Update backend
    try {
      const result = await updateSetting(key, value);
      console.log(`✅ Setting ${key} updated to:`, value, 'Backend result:', result);
      
      // Clear the recently saved flag after a longer delay to allow backend refresh
      setTimeout(() => {
        console.log('🔓 Clearing recentlySaved flag');
        setRecentlySaved(false);
      }, 3000); // Extended to 3 seconds to allow backend refresh
    } catch (error) {
      console.error(`❌ Failed to update ${key}:`, error);
      // Revert local state to previous value on error
      setFormData(prev => {
        const revertedState = { ...prev, [key]: previousValue };
        console.log(`↩️ Reverted formData:`, revertedState);
        return revertedState;
      });
      // Clear recently saved flag on error too
      setRecentlySaved(false);
    }
  };

  // Helper functions for backward compatibility
  const setDarkMode = (isDark) => {
    handleSettingChange('theme', isDark ? 'dark' : 'light');
  };

  const setNotifications = (enabled) => {
    handleSettingChange('notifications', enabled);
  };

  const setCurrency = async (curr) => {
    console.log('🔄 Setting currency to:', curr);
    console.log('🔄 Current form currency:', formData.currency);
    console.log('🔄 Current global currency:', currentCurrency);
    
    // Update both local settings and global currency context
    handleSettingChange('currency', curr);
    
    // Update global currency context immediately
    await updateCurrency(curr);
    
    console.log('✅ Currency updated globally:', curr);
  };

  const setBudgetAlerts = (enabled) => {
    handleSettingChange('budgetAlerts', enabled);
  };

  const setGoalReminders = (enabled) => {
    handleSettingChange('goalReminders', enabled);
  };

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
    <div className={`settings-module ${isLoaded ? 'loaded' : ''}`}>
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
                <span className="setting-description">
                  Choose your preferred currency
                  {currentCurrency && currentCurrency !== currency && (
                    <span style={{color: '#f59e0b', fontSize: '12px', marginLeft: '8px'}}>
                      (Syncing with {currentCurrency}...)
                    </span>
                  )}
                </span>
              </div>
              <select
                className="setting-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {/* Major Global Currencies */}
                <optgroup label="🌍 Major Global Currencies">
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                  <option value="CHF">CHF (₣) - Swiss Franc</option>
                  <option value="CAD">CAD (C$) - Canadian Dollar</option>
                  <option value="AUD">AUD (A$) - Australian Dollar</option>
                  <option value="CNY">CNY (¥) - Chinese Yuan</option>
                </optgroup>

                {/* North America */}
                <optgroup label="🇺🇸 North America">
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="CAD">CAD (C$) - Canadian Dollar</option>
                  <option value="MXN">MXN ($) - Mexican Peso</option>
                  <option value="GTQ">GTQ (Q) - Guatemalan Quetzal</option>
                  <option value="CRC">CRC (₡) - Costa Rican Colón</option>
                  <option value="HNL">HNL (L) - Honduran Lempira</option>
                  <option value="NIO">NIO (C$) - Nicaraguan Córdoba</option>
                  <option value="PAB">PAB (B/.) - Panamanian Balboa</option>
                </optgroup>

                {/* Europe */}
                <optgroup label="🇪🇺 Europe">
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CHF">CHF (₣) - Swiss Franc</option>
                  <option value="NOK">NOK (kr) - Norwegian Krone</option>
                  <option value="SEK">SEK (kr) - Swedish Krona</option>
                  <option value="DKK">DKK (kr) - Danish Krone</option>
                  <option value="PLN">PLN (zł) - Polish Złoty</option>
                  <option value="CZK">CZK (Kč) - Czech Koruna</option>
                  <option value="HUF">HUF (Ft) - Hungarian Forint</option>
                  <option value="RON">RON (lei) - Romanian Leu</option>
                  <option value="BGN">BGN (лв) - Bulgarian Lev</option>
                  <option value="HRK">HRK (kn) - Croatian Kuna</option>
                  <option value="RUB">RUB (₽) - Russian Ruble</option>
                  <option value="UAH">UAH (₴) - Ukrainian Hryvnia</option>
                  <option value="TRY">TRY (₺) - Turkish Lira</option>
                  <option value="ISK">ISK (kr) - Icelandic Króna</option>
                </optgroup>

                {/* Asia Pacific */}
                <optgroup label="🌏 Asia Pacific">
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                  <option value="CNY">CNY (¥) - Chinese Yuan</option>
                  <option value="KRW">KRW (₩) - South Korean Won</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="AUD">AUD (A$) - Australian Dollar</option>
                  <option value="NZD">NZD (NZ$) - New Zealand Dollar</option>
                  <option value="SGD">SGD (S$) - Singapore Dollar</option>
                  <option value="HKD">HKD (HK$) - Hong Kong Dollar</option>
                  <option value="TWD">TWD (NT$) - Taiwan Dollar</option>
                  <option value="MYR">MYR (RM) - Malaysian Ringgit</option>
                  <option value="THB">THB (฿) - Thai Baht</option>
                  <option value="IDR">IDR (Rp) - Indonesian Rupiah</option>
                  <option value="PHP">PHP (₱) - Philippine Peso</option>
                  <option value="VND">VND (₫) - Vietnamese Dong</option>
                  <option value="PKR">PKR (Rs) - Pakistani Rupee</option>
                  <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                  <option value="LKR">LKR (Rs) - Sri Lankan Rupee</option>
                  <option value="NPR">NPR (Rs) - Nepalese Rupee</option>
                  <option value="MMK">MMK (K) - Myanmar Kyat</option>
                  <option value="KHR">KHR (៛) - Cambodian Riel</option>
                  <option value="LAK">LAK (₭) - Lao Kip</option>
                  <option value="BND">BND (B$) - Brunei Dollar</option>
                </optgroup>

                {/* Middle East & Africa */}
                <optgroup label="🌍 Middle East & Africa">
                  <option value="AED">AED (د.إ) - UAE Dirham</option>
                  <option value="SAR">SAR (﷼) - Saudi Riyal</option>
                  <option value="QAR">QAR (﷼) - Qatari Riyal</option>
                  <option value="KWD">KWD (د.ك) - Kuwaiti Dinar</option>
                  <option value="BHD">BHD (د.ب) - Bahraini Dinar</option>
                  <option value="OMR">OMR (﷼) - Omani Rial</option>
                  <option value="JOD">JOD (د.ا) - Jordanian Dinar</option>
                  <option value="LBP">LBP (£) - Lebanese Pound</option>
                  <option value="SYP">SYP (£) - Syrian Pound</option>
                  <option value="IQD">IQD (د.ع) - Iraqi Dinar</option>
                  <option value="IRR">IRR (﷼) - Iranian Rial</option>
                  <option value="ILS">ILS (₪) - Israeli Shekel</option>
                  <option value="EGP">EGP (£) - Egyptian Pound</option>
                  <option value="ZAR">ZAR (R) - South African Rand</option>
                  <option value="NGN">NGN (₦) - Nigerian Naira</option>
                  <option value="KES">KES (Sh) - Kenyan Shilling</option>
                  <option value="UGX">UGX (Sh) - Ugandan Shilling</option>
                  <option value="TZS">TZS (Sh) - Tanzanian Shilling</option>
                  <option value="ETB">ETB (Br) - Ethiopian Birr</option>
                  <option value="GHS">GHS (₵) - Ghanaian Cedi</option>
                  <option value="XOF">XOF (₣) - West African Franc</option>
                  <option value="XAF">XAF (₣) - Central African Franc</option>
                  <option value="MAD">MAD (د.م.) - Moroccan Dirham</option>
                  <option value="TND">TND (د.ت) - Tunisian Dinar</option>
                  <option value="DZD">DZD (د.ج) - Algerian Dinar</option>
                  <option value="LYD">LYD (ل.د) - Libyan Dinar</option>
                </optgroup>

                {/* South America */}
                <optgroup label="🌎 South America">
                  <option value="BRL">BRL (R$) - Brazilian Real</option>
                  <option value="ARS">ARS ($) - Argentine Peso</option>
                  <option value="CLP">CLP ($) - Chilean Peso</option>
                  <option value="COP">COP ($) - Colombian Peso</option>
                  <option value="PEN">PEN (S/) - Peruvian Sol</option>
                  <option value="UYU">UYU ($U) - Uruguayan Peso</option>
                  <option value="PYG">PYG (₲) - Paraguayan Guaraní</option>
                  <option value="BOB">BOB (Bs.) - Bolivian Boliviano</option>
                  <option value="VES">VES (Bs.S.) - Venezuelan Bolívar</option>
                  <option value="GYD">GYD ($) - Guyanese Dollar</option>
                  <option value="SRD">SRD ($) - Surinamese Dollar</option>
                </optgroup>

                {/* Caribbean */}
                <optgroup label="🏝️ Caribbean">
                  <option value="JMD">JMD (J$) - Jamaican Dollar</option>
                  <option value="TTD">TTD (TT$) - Trinidad & Tobago Dollar</option>
                  <option value="BBD">BBD (Bds$) - Barbadian Dollar</option>
                  <option value="BSD">BSD (B$) - Bahamian Dollar</option>
                  <option value="BZD">BZD (BZ$) - Belize Dollar</option>
                  <option value="XCD">XCD (EC$) - East Caribbean Dollar</option>
                  <option value="CUP">CUP ($) - Cuban Peso</option>
                  <option value="DOP">DOP (RD$) - Dominican Peso</option>
                  <option value="HTG">HTG (G) - Haitian Gourde</option>
                </optgroup>

                {/* Oceania */}
                <optgroup label="🌊 Oceania">
                  <option value="AUD">AUD (A$) - Australian Dollar</option>
                  <option value="NZD">NZD (NZ$) - New Zealand Dollar</option>
                  <option value="FJD">FJD (FJ$) - Fijian Dollar</option>
                  <option value="PGK">PGK (K) - Papua New Guinea Kina</option>
                  <option value="SBD">SBD (SI$) - Solomon Islands Dollar</option>
                  <option value="VUV">VUV (Vt) - Vanuatu Vatu</option>
                  <option value="WST">WST (WS$) - Samoan Tala</option>
                  <option value="TOP">TOP (T$) - Tongan Paʻanga</option>
                </optgroup>

                {/* Digital & Alternative */}
                <optgroup label="₿ Digital Currencies">
                  <option value="BTC">BTC (₿) - Bitcoin</option>
                  <option value="ETH">ETH (Ξ) - Ethereum</option>
                  <option value="USDT">USDT - Tether</option>
                  <option value="USDC">USDC - USD Coin</option>
                </optgroup>
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