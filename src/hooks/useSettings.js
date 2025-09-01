import { useState, useEffect, useCallback, useRef } from 'react';
import { settingsAPI } from '../services/api';

// Circuit breaker for backend requests
class CircuitBreaker {
  constructor(failureThreshold = 5, timeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        // Circuit breaker: Moving to HALF_OPEN state
      } else {
        throw new Error('Circuit breaker is OPEN - backend temporarily unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      // Circuit breaker: OPEN after failures
    }
  }
}

// Global circuit breaker instance
const settingsCircuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30 second timeout

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Refs to prevent duplicate requests
  const loadingRef = useRef(false);
  const migrationRef = useRef(false);

  // Load settings from backend
  const loadSettings = useCallback(async () => {
    // Prevent duplicate loading requests
    if (loadingRef.current) {
      // Settings already loading, skipping duplicate request
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    // Loading settings from backend...
    
    // Load from localStorage first for instant UI
    // Loading settings from localStorage for instant UI
    loadSettingsFromLocalStorage();
    
    try {
      const data = await settingsCircuitBreaker.call(() => settingsAPI.getSettings());
      setSettings(data);
      // Settings loaded from backend
    } catch (err) {
      // Backend unavailable, falling back to localStorage
      
      loadSettingsFromLocalStorage();
      
      const hasLocalStorage = localStorage.getItem('healthywallet-theme') || 
                             localStorage.getItem('healthywallet-currency') ||
                             localStorage.getItem('healthywallet-notifications');
      
      if (!hasLocalStorage) {
        setError('No settings found in backend or localStorage');
        // No settings found anywhere
      } else {
        // Using localStorage fallback
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Fallback: Load settings from localStorage
  const loadSettingsFromLocalStorage = () => {
    const localSettings = {};
    
    // Map localStorage keys to backend field names (matching your backend response)
    const mapping = {
      'healthywallet-theme': 'theme',
      'healthywallet-currency': 'currency',
      'healthywallet-notifications': 'notifications',
      'healthywallet-budget-alerts': 'budgetAlerts',
      'healthywallet-goal-reminders': 'goalReminders',
      'healthywallet-financial-goals': 'financialGoals',
      'healthywallet-risk-tolerance': 'riskTolerance',
      'healthywallet-investment-experience': 'investmentExperience',
      'healthywallet-savings-rate': 'savingsRate',
      'healthywallet-debt-amount': 'debtAmount',
      'healthywallet-emergency-fund': 'emergencyFund',
      'healthywallet-retirement-age': 'retirementAge',
      'healthywallet-dependents': 'dependents',
      'healthywallet-housing-status': 'housingStatus',
      'healthywallet-employment-status': 'employmentStatus',
      'healthywallet-office-days': 'officeDays',
      'healthywallet-transport-office': 'transportOffice',
      'healthywallet-wfh-frequency': 'wfhFrequency',
      'healthywallet-education-level': 'educationLevel',
      'healthywallet-transport-school': 'transportSchool',
      'healthywallet-student-type': 'studentType',
      'healthywallet-food-preference': 'foodPreference',
      'healthywallet-dining-frequency': 'diningFrequency',
      'healthywallet-impulsive-buying': 'impulsiveBuying',
      'healthywallet-impulsive-spend': 'impulsiveSpend',
      'healthywallet-shopping-frequency': 'shoppingFrequency',
      'healthywallet-entertainment-budget': 'entertainmentBudget',
      'healthywallet-fitness-spend': 'fitnessSpend',
      'healthywallet-subscriptions': 'subscriptions',
      'healthywallet-travel-frequency': 'travelFrequency',
      'healthywallet-social-spending': 'socialSpending'
    };

    Object.entries(mapping).forEach(([localKey, settingKey]) => {
      const value = localStorage.getItem(localKey);
      if (value !== null) {
        // Parse boolean values
        if (value === 'true') localSettings[settingKey] = true;
        else if (value === 'false') localSettings[settingKey] = false;
        // Parse numeric values
        else if (['savingsRate', 'debtAmount', 'emergencyFund', 'retirementAge', 'dependents', 'officeDays', 'transportOffice', 'transportSchool', 'impulsiveSpend', 'entertainmentBudget', 'fitnessSpend', 'subscriptions'].includes(settingKey)) {
          localSettings[settingKey] = parseFloat(value) || 0;
        }
        else localSettings[settingKey] = value;
      }
    });

    setSettings(localSettings);
    // Settings loaded from localStorage fallback
  };

  // Update settings
  const updateSettings = useCallback(async (updates) => {
    setSaving(true);
    setError(null);
    
    // Updating settings
    
    // Update localStorage immediately for instant UI response
    const currentLocalSettings = JSON.parse(localStorage.getItem('healthywallet-settings') || '{}');
    const updatedLocalSettings = { ...currentLocalSettings, ...updates };
    localStorage.setItem('healthywallet-settings', JSON.stringify(updatedLocalSettings));
    
    // Update state immediately
    const optimisticSettings = { ...settings, ...updates };
    setSettings(optimisticSettings);
    
    // Settings updated in localStorage (optimistic)
    
    try {
      const backendResponse = await settingsCircuitBreaker.call(() => settingsAPI.updateSettings(updates));
      // Backend response received
      
      // Use backend response if it contains the updated settings
      // Otherwise merge with current settings
      let finalSettings;
      if (backendResponse && backendResponse.data) {
        // Backend returned full settings object
        finalSettings = backendResponse.data;
        // Using full backend response
      } else if (backendResponse && typeof backendResponse === 'object') {
        // Backend returned partial/merged settings
        finalSettings = backendResponse;
        // Using backend response directly
      } else {
        // Backend didn't return settings, merge manually
        finalSettings = { ...settings, ...updates };
        // Manually merged settings
      }
      
      setSettings(finalSettings);
      // Settings updated in backend. Final state
      
      // Force refresh settings from backend after update to ensure consistency
      setTimeout(async () => {
        try {
          // Refreshing settings from backend to ensure consistency...
          const refreshedSettings = await settingsAPI.getSettings();
          if (refreshedSettings && refreshedSettings.data) {
            setSettings(refreshedSettings.data);
            // Settings refreshed from backend
          } else if (refreshedSettings) {
            setSettings(refreshedSettings);
            // Settings refreshed from backend
          }
        } catch (refreshError) {
          // Failed to refresh settings, keeping current state
        }
      }, 500); // Small delay to ensure backend has processed the update
      
      return finalSettings;
    } catch (err) {
      // Backend unavailable, saving to localStorage
      
      // Always fallback to localStorage when backend fails
      updateLocalStorageSettings(updates);
      const mergedSettings = { ...settings, ...updates };
      setSettings(mergedSettings);
      // Settings updated in localStorage. Local state
      
      return mergedSettings;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // Fallback: Update localStorage
  const updateLocalStorageSettings = (updates) => {
    // Reverse mapping: backend field names to localStorage keys
    const reverseMapping = {
      'theme': 'healthywallet-theme',
      'currency': 'healthywallet-currency',
      'notifications': 'healthywallet-notifications',
      'budgetAlerts': 'healthywallet-budget-alerts',
      'goalReminders': 'healthywallet-goal-reminders',
      'financialGoals': 'healthywallet-financial-goals',
      'riskTolerance': 'healthywallet-risk-tolerance',
      'investmentExperience': 'healthywallet-investment-experience',
      'savingsRate': 'healthywallet-savings-rate',
      'debtAmount': 'healthywallet-debt-amount',
      'emergencyFund': 'healthywallet-emergency-fund',
      'retirementAge': 'healthywallet-retirement-age',
      'dependents': 'healthywallet-dependents',
      'housingStatus': 'healthywallet-housing-status',
      'employmentStatus': 'healthywallet-employment-status',
      'officeDays': 'healthywallet-office-days',
      'transportOffice': 'healthywallet-transport-office',
      'wfhFrequency': 'healthywallet-wfh-frequency',
      'educationLevel': 'healthywallet-education-level',
      'transportSchool': 'healthywallet-transport-school',
      'studentType': 'healthywallet-student-type',
      'foodPreference': 'healthywallet-food-preference',
      'diningFrequency': 'healthywallet-dining-frequency',
      'impulsiveBuying': 'healthywallet-impulsive-buying',
      'impulsiveSpend': 'healthywallet-impulsive-spend',
      'shoppingFrequency': 'healthywallet-shopping-frequency',
      'entertainmentBudget': 'healthywallet-entertainment-budget',
      'fitnessSpend': 'healthywallet-fitness-spend',
      'subscriptions': 'healthywallet-subscriptions',
      'travelFrequency': 'healthywallet-travel-frequency',
      'socialSpending': 'healthywallet-social-spending'
    };

    Object.entries(updates).forEach(([key, value]) => {
      const localKey = reverseMapping[key];
      if (localKey) {
        localStorage.setItem(localKey, value.toString());
      }
    });
  };

  // Update single setting
  const updateSetting = useCallback(async (key, value) => {
    return updateSettings({ [key]: value });
  }, [updateSettings]);

  // Migrate localStorage settings to backend
  const migrateSettings = useCallback(async () => {
    
    // Prevent duplicate migration requests
    if (migrationRef.current) {
      // Migration already in progress, skipping duplicate request
      return { migratedFields: [], message: 'Migration already in progress' };
    }
    
    migrationRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Collect all localStorage data for migration
      const localStorageData = {};
      
      // Get all healthywallet-related localStorage keys
      const healthyWalletKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('healthywallet-')) {
          healthyWalletKeys.push(key);
        }
      }
      
      // Collect the data
      healthyWalletKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          localStorageData[key] = value;
        }
      });
      
      // Migrating localStorage data
      
      // Only attempt migration if there's data to migrate
      if (Object.keys(localStorageData).length === 0) {
        // No localStorage data to migrate
        return { migratedFields: [], message: 'No data to migrate' };
      }
      
      // Sending localStorage data to backend
      const result = await settingsCircuitBreaker.call(() => settingsAPI.migrateLocalStorageData(localStorageData));
      if (result.settings) {
        setSettings(result.settings);
      }
      return result;
    } catch (err) {
      setError(err.message);
      // console.error('Failed to migrate settings:', err);
      throw err;
    } finally {
      setLoading(false);
      migrationRef.current = false;
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Auto-migrate localStorage settings if they exist and backend is available
  useEffect(() => {
    // Prevent infinite migration attempts by tracking migration state
    const migrationAttempted = sessionStorage.getItem('healthywallet-migration-attempted');
    const migrationFailed = sessionStorage.getItem('healthywallet-migration-failed');
    
    const shouldMigrate = localStorage.getItem('healthywallet-theme') || 
                         localStorage.getItem('healthywallet-currency') ||
                         localStorage.getItem('healthywallet-financial-goals');
    
    // Only attempt migration if:
    // 1. There's localStorage data to migrate
    // 2. Settings loaded successfully from backend (not from localStorage fallback)
    // 3. Not currently loading
    // 4. No errors from backend
    // 5. Migration hasn't been attempted in this session OR it was successful before
    // 6. Migration hasn't failed multiple times in this session
    if (shouldMigrate && settings && !loading && !error && !migrationAttempted && !migrationFailed) {
      // Additional check: ensure we actually got data from backend, not localStorage
      const hasBackendConnection = settings.theme !== undefined || settings.currency !== undefined;
      
      if (hasBackendConnection) {
        // Auto-migrating localStorage settings to backend...
        
        // Mark migration as attempted to prevent infinite loops
        sessionStorage.setItem('healthywallet-migration-attempted', 'true');
        
        migrateSettings().then((result) => {
          if (result.migratedFields && result.migratedFields.length > 0) {
            // Migrated settings to backend
            // Mark migration as successful
            sessionStorage.setItem('healthywallet-migration-successful', 'true');
          }
        }).catch((error) => {
          // console.warn('⚠️ Migration failed, keeping localStorage:', error.message);
          // Mark migration as failed to prevent retries in this session
          sessionStorage.setItem('healthywallet-migration-failed', 'true');
          // Remove the attempted flag so it can be retried in a new session
          sessionStorage.removeItem('healthywallet-migration-attempted');
        });
      }
    }
  }, [settings, loading, error, migrateSettings]);

  return {
    settings,
    loading,
    error,
    saving,
    loadSettings,
    updateSettings,
    updateSetting,
    migrateSettings
  };
};
