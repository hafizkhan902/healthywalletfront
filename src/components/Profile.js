import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Profile.css';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import PageAIInsight from './PageAIInsight';
import GlobalLoading from './GlobalLoading';
import { debounce } from '../utils/debounce';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import { useAchievements } from '../hooks/useAchievements';

// Debug utility for development
const debugPersonalizationData = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 Personalization Data Debug');
    
    // Check localStorage
    console.log('📱 LocalStorage Data:');
    const localData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('healthywallet-')) {
        localData[key] = localStorage.getItem(key);
      }
    }
    console.table(localData);
    
    // Check sessionStorage migration flags
    console.log('🔄 Migration Status:');
    console.log({
      attempted: sessionStorage.getItem('healthywallet-migration-attempted'),
      failed: sessionStorage.getItem('healthywallet-migration-failed'),
      successful: sessionStorage.getItem('healthywallet-migration-successful')
    });
    
    console.groupEnd();
  }
};

// Make debug function available in development console
if (process.env.NODE_ENV === 'development') {
  window.debugPersonalizationData = debugPersonalizationData;
}

const Profile = () => {
  const { user } = useAuth();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { 
    achievements, 
    stats, 
    loading: achievementsLoading, 
    error: achievementsError,
    checkNewAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    newAchievements,
    showNotification,
    dismissNotification
  } = useAchievements();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [achievementFilter, setAchievementFilter] = useState('all'); // 'all', 'points', 'completed'
  
  // User profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Financial User',
    email: user?.email || 'user@healthywallet.com',
    joinDate: user?.joinDate || new Date().toISOString(),
    profilePicture: null,
    bio: 'Building a healthy financial future with smart money management.',
    location: 'Global',
    occupation: 'Professional',
    financialGoals: 'Emergency Fund, Investment Growth, Debt Freedom'
  });

  // Financial summary data
  const [financialSummary] = useState({
    totalBalance: 2179.50,
    totalIncome: 5420.00,
    totalExpenses: 3240.50,
    monthlySavings: 1349.25,
    savingsRate: 32.1,
    activeBudgets: 4,
    completedGoals: 2,
    activeGoals: 3,
    longestStreak: 45,
    currentStreak: 12
  });

  // Account activity data
  const [accountActivity] = useState([
    { id: 1, type: 'income', amount: 3500.00, description: 'Salary Payment', date: '2024-01-15', category: 'Salary' },
    { id: 2, type: 'expense', amount: 450.50, description: 'Grocery Shopping', date: '2024-01-14', category: 'Food' },
    { id: 3, type: 'goal', amount: 500.00, description: 'Emergency Fund Contribution', date: '2024-01-13', category: 'Savings' },
    { id: 4, type: 'expense', amount: 85.00, description: 'Gas Station', date: '2024-01-12', category: 'Transport' },
    { id: 5, type: 'income', amount: 920.00, description: 'Freelance Project', date: '2024-01-10', category: 'Freelance' }
  ]);

  // Achievements data is now loaded from useAchievements hook

  // Helper function to load personalization data from localStorage immediately
  const loadPersonalizationDataFromStorage = useCallback(() => {
    return {
      financialGoals: localStorage.getItem('healthywallet-financial-goals') || '',
      riskTolerance: localStorage.getItem('healthywallet-risk-tolerance') || 'moderate',
      investmentExperience: localStorage.getItem('healthywallet-investment-experience') || 'beginner',
      savingsRate: localStorage.getItem('healthywallet-savings-rate') || '',
      debtAmount: localStorage.getItem('healthywallet-debt-amount') || '',
      emergencyFund: localStorage.getItem('healthywallet-emergency-fund') || '',
      retirementAge: localStorage.getItem('healthywallet-retirement-age') || '',
      dependents: localStorage.getItem('healthywallet-dependents') || '0',
      housingStatus: localStorage.getItem('healthywallet-housing-status') || 'rent',
      employmentStatus: localStorage.getItem('healthywallet-employment-status') || 'employed',
      // Employment-specific fields
      officeDaysPerWeek: localStorage.getItem('healthywallet-office-days') || '5',
      transportationCostToOffice: localStorage.getItem('healthywallet-transport-office') || '',
      workFromHomeFrequency: localStorage.getItem('healthywallet-wfh-frequency') || 'never',
      // Student-specific fields
      educationLevel: localStorage.getItem('healthywallet-education-level') || 'undergraduate',
      transportationCostToSchool: localStorage.getItem('healthywallet-transport-school') || '',
      studentType: localStorage.getItem('healthywallet-student-type') || 'full-time',
      // Lifestyle and spending habits
      foodPreference: localStorage.getItem('healthywallet-food-preference') || 'mixed',
      diningOutFrequency: localStorage.getItem('healthywallet-dining-frequency') || 'weekly',
      impulsiveBuyingHabit: localStorage.getItem('healthywallet-impulsive-buying') || 'low',
      estimatedImpulsiveSpend: localStorage.getItem('healthywallet-impulsive-spend') || '',
      shoppingFrequency: localStorage.getItem('healthywallet-shopping-frequency') || 'monthly',
      entertainmentBudget: localStorage.getItem('healthywallet-entertainment-budget') || '',
      fitnessHealthSpend: localStorage.getItem('healthywallet-fitness-spend') || '',
      subscriptionServices: localStorage.getItem('healthywallet-subscriptions') || '',
      travelFrequency: localStorage.getItem('healthywallet-travel-frequency') || 'rarely',
      socialSpendingHabit: localStorage.getItem('healthywallet-social-spending') || 'moderate'
    };
  }, []);

  // Personalization state - Initialize immediately from localStorage for fast UI
  const [personalizationData, setPersonalizationData] = useState(() => {
    console.log('🚀 Initializing personalization data from localStorage for instant UI');
    return loadPersonalizationDataFromStorage();
  });

  // Component load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup migration flags when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Clear migration flags on component unmount to allow fresh attempts in new sessions
      const migrationSuccessful = sessionStorage.getItem('healthywallet-migration-successful');
      if (migrationSuccessful) {
        // Only clear if migration was successful, keep failed flags to prevent infinite loops
        sessionStorage.removeItem('healthywallet-migration-attempted');
        sessionStorage.removeItem('healthywallet-migration-successful');
      }
    };
  }, []);

  // Use settings hook for backend integration
  const { settings, updateSettings } = useSettings();
  
  // Ref to track pending updates
  const pendingUpdatesRef = useRef(new Map());

  // Sync personalization data with loaded settings from backend (only if significantly different)
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      console.log('🔄 Checking if backend settings should override localStorage data');
      
      // Map backend field names back to frontend field names
      const frontendFieldMap = {
        'financialGoals': 'financialGoals',
        'riskTolerance': 'riskTolerance',
        'investmentExperience': 'investmentExperience',
        'savingsRate': 'savingsRate',
        'debtAmount': 'debtAmount',
        'emergencyFund': 'emergencyFund',
        'retirementAge': 'retirementAge',
        'dependents': 'dependents',
        'housingStatus': 'housingStatus',
        'employmentStatus': 'employmentStatus',
        'officeDays': 'officeDaysPerWeek',
        'transportOffice': 'transportationCostToOffice',
        'wfhFrequency': 'workFromHomeFrequency',
        'educationLevel': 'educationLevel',
        'transportSchool': 'transportationCostToSchool',
        'studentType': 'studentType',
        'foodPreference': 'foodPreference',
        'diningFrequency': 'diningOutFrequency',
        'impulsiveBuying': 'impulsiveBuyingHabit',
        'impulsiveSpend': 'estimatedImpulsiveSpend',
        'shoppingFrequency': 'shoppingFrequency',
        'entertainmentBudget': 'entertainmentBudget',
        'fitnessSpend': 'fitnessHealthSpend',
        'subscriptions': 'subscriptionServices',
        'travelFrequency': 'travelFrequency',
        'socialSpending': 'socialSpendingHabit'
      };

      // Only update if backend has newer/different data
      const updatedPersonalizationData = { ...personalizationData };
      let hasSignificantChanges = false;
      let changesCount = 0;

      Object.entries(frontendFieldMap).forEach(([backendField, frontendField]) => {
        if (settings[backendField] !== undefined && settings[backendField] !== null) {
          const settingsValue = settings[backendField].toString();
          const currentValue = updatedPersonalizationData[frontendField] || '';
          
          // Only update if the values are significantly different (not just empty vs default)
          if (settingsValue !== currentValue && settingsValue.trim() !== '') {
            updatedPersonalizationData[frontendField] = settingsValue;
            hasSignificantChanges = true;
            changesCount++;
          }
        }
      });

      // Only apply changes if there are meaningful differences
      if (hasSignificantChanges && changesCount > 2) {
        console.log(`✅ Applying ${changesCount} backend updates to personalization data`);
        setPersonalizationData(updatedPersonalizationData);
      } else if (hasSignificantChanges) {
        console.log(`📝 Minor backend changes (${changesCount}) detected, keeping localStorage values`);
      }
    }
  }, [settings]); // Only depend on settings

  // Debounced backend update function with better error handling
  const debouncedBackendUpdate = useCallback(
    debounce(async (updates) => {
      // Skip if no updates to process
      if (!updates || Object.keys(updates).length === 0) {
        return;
      }

      try {
        console.log('🔄 Batch updating settings:', updates);
        await updateSettings(updates);
        console.log('✅ Settings batch updated successfully');
      } catch (error) {
        // Check if it's a network error (backend offline)
        const isNetworkError = error.message.includes('Failed to fetch') || 
                              error.message.includes('Cannot connect') ||
                              error.message.includes('Network Error');
        
        if (isNetworkError) {
          console.log('📱 Backend offline - data already saved to localStorage');
          // Data is already in localStorage from the immediate save, so this is fine
        } else {
          console.error('❌ Settings update failed with non-network error:', error);
          // For non-network errors, ensure localStorage backup
          Object.entries(updates).forEach(([backendField, value]) => {
            try {
              const localStorageKey = `healthywallet-${backendField.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
              localStorage.setItem(localStorageKey, value);
            } catch (storageError) {
              console.error('Failed to save to localStorage:', storageError);
            }
          });
        }
      }
    }, 2000), // Increased to 2 seconds to reduce API calls
    [updateSettings]
  );

  // Helper function to update personalization data with debouncing
  const updatePersonalizationData = useCallback(async (field, value) => {
    // Update local state immediately for responsive UI
    setPersonalizationData(prev => ({ ...prev, [field]: value }));
    
    // Map frontend form field names to backend field names (matching your backend response)
    const backendFieldMap = {
      financialGoals: 'financialGoals',
      riskTolerance: 'riskTolerance',
      investmentExperience: 'investmentExperience',
      savingsRate: 'savingsRate',
      debtAmount: 'debtAmount',
      emergencyFund: 'emergencyFund',
      retirementAge: 'retirementAge',
      dependents: 'dependents',
      housingStatus: 'housingStatus',
      employmentStatus: 'employmentStatus',
      officeDaysPerWeek: 'officeDays',
      transportationCostToOffice: 'transportOffice',
      workFromHomeFrequency: 'wfhFrequency',
      educationLevel: 'educationLevel',
      transportationCostToSchool: 'transportSchool',
      studentType: 'studentType',
      foodPreference: 'foodPreference',
      diningOutFrequency: 'diningFrequency',
      impulsiveBuyingHabit: 'impulsiveBuying',
      estimatedImpulsiveSpend: 'impulsiveSpend',
      shoppingFrequency: 'shoppingFrequency',
      entertainmentBudget: 'entertainmentBudget',
      fitnessHealthSpend: 'fitnessSpend',
      subscriptionServices: 'subscriptions',
      travelFrequency: 'travelFrequency',
      socialSpendingHabit: 'socialSpending'
    };

    const backendField = backendFieldMap[field] || field;
    
    // Add to pending updates for batch processing
    pendingUpdatesRef.current.set(backendField, value);
    
    // Create a copy of current pending updates for the debounced function
    const currentUpdates = Object.fromEntries(pendingUpdatesRef.current);
    
    // Clear pending updates since we're about to process them
    pendingUpdatesRef.current.clear();
    
    // Call debounced update
    debouncedBackendUpdate(currentUpdates);
    
    // Immediate localStorage backup
    try {
      const localStorageKey = `healthywallet-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      localStorage.setItem(localStorageKey, value);
    } catch (error) {
      console.error(`Failed to save ${field} to localStorage:`, error);
    }
  }, [debouncedBackendUpdate]);

  // Currency formatting is now handled by useCurrencyFormatter hook

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate membership duration
  const getMembershipDuration = () => {
    const joinDate = new Date(profileData.joinDate);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            {/* Financial Overview Cards */}
            <div className="overview-grid">
              <div className="overview-card balance-summary">
                <div className="card-header">
                  <div className="card-icon balance">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="M2 17l10 5 10-5"></path>
                      <path d="M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                  <h3>Financial Health</h3>
                </div>
                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Balance</span>
                    <span className="stat-value">{formatCurrency(financialSummary.totalBalance)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Savings Rate</span>
                    <span className="stat-value">{financialSummary.savingsRate}%</span>
                  </div>
                </div>
              </div>

              <div className="overview-card activity-summary">
                <div className="card-header">
                  <div className="card-icon activity">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  </div>
                  <h3>Activity Stats</h3>
                </div>
                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Current Streak</span>
                    <span className="stat-value">{financialSummary.currentStreak} days</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Active Goals</span>
                    <span className="stat-value">{financialSummary.activeGoals}</span>
                  </div>
                </div>
              </div>

              <div className="overview-card goals-summary">
                <div className="card-header">
                  <div className="card-icon goals">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                    </svg>
                  </div>
                  <h3>Goals Progress</h3>
                </div>
                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value">{financialSummary.completedGoals}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">In Progress</span>
                    <span className="stat-value">{financialSummary.activeGoals}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
              <h3 className="section-title">Recent Activity</h3>
              <div className="activity-list">
                {accountActivity.slice(0, 5).map(activity => (
                  <div key={activity.id} className={`activity-item ${activity.type}`}>
                    <div className="activity-icon">
                      {activity.type === 'income' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      )}
                      {activity.type === 'expense' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      )}
                      {activity.type === 'goal' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                        </svg>
                      )}
                    </div>
                    <div className="activity-details">
                      <div className="activity-description">{activity.description}</div>
                      <div className="activity-meta">
                        <span className="activity-category">{activity.category}</span>
                        <span className="activity-date">{formatDate(activity.date)}</span>
                      </div>
                    </div>
                    <div className={`activity-amount ${activity.type}`}>
                      {activity.type === 'expense' ? '-' : '+'}{formatCurrency(activity.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="tab-content">
            {achievementsLoading ? (
              <div className="loading-state">
                <GlobalLoading size="medium" />
              </div>
            ) : achievementsError ? (
              <div className="error-state">
                <p>❌ Failed to load achievements: {achievementsError}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Achievement Stats - Clickable Filter Tabs */}
                <div className="achievement-stats">
                  <div 
                    className={`stat-card clickable ${achievementFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setAchievementFilter('all')}
                  >
                    <span className="stat-number">{stats.unlockedCount}</span>
                    <span className="stat-label">Unlocked</span>
                  </div>
                  <div 
                    className={`stat-card clickable ${achievementFilter === 'points' ? 'active' : ''}`}
                    onClick={() => setAchievementFilter('points')}
                  >
                    <span className="stat-number">{stats.totalPoints}</span>
                    <span className="stat-label">Total Points</span>
                  </div>
                  <div 
                    className={`stat-card clickable ${achievementFilter === 'completed' ? 'active' : ''}`}
                    onClick={() => setAchievementFilter('completed')}
                  >
                    <span className="stat-number">{stats.completionPercentage?.toFixed(0) || 0}%</span>
                    <span className="stat-label">Complete</span>
                  </div>
                  <button 
                    onClick={checkNewAchievements} 
                    className="check-achievements-btn"
                    title="Check for new achievements"
                  >
                    🔍 Check Progress
                  </button>
                </div>

                {/* Filtered Content Based on Selected Tab */}
                {achievementFilter === 'points' && (
                  <div className="points-breakdown-section">
                    <h4 className="section-subtitle">Points by Category</h4>
                    <div className="points-grid">
                      <div className="points-category-card">
                        <div className="category-header">
                          <span className="category-icon">🎯</span>
                          <span className="category-name">Goals</span>
                        </div>
                        <div className="category-points">
                          {achievements.filter(a => a.category === 'goals' && a.unlocked).reduce((sum, a) => sum + a.points, 0)} pts
                        </div>
                        <div className="category-achievements">
                          {achievements.filter(a => a.category === 'goals' && a.unlocked).map(achievement => (
                            <div key={achievement.id} className="mini-achievement">
                              <span>{achievement.icon} {achievement.name}</span>
                              <span>{achievement.points}pts</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="points-category-card">
                        <div className="category-header">
                          <span className="category-icon">📈</span>
                          <span className="category-name">Savings</span>
                        </div>
                        <div className="category-points">
                          {achievements.filter(a => a.category === 'savings' && a.unlocked).reduce((sum, a) => sum + a.points, 0)} pts
                        </div>
                        <div className="category-achievements">
                          {achievements.filter(a => a.category === 'savings' && a.unlocked).map(achievement => (
                            <div key={achievement.id} className="mini-achievement">
                              <span>{achievement.icon} {achievement.name}</span>
                              <span>{achievement.points}pts</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="points-category-card">
                        <div className="category-header">
                          <span className="category-icon">📊</span>
                          <span className="category-name">Consistency</span>
                        </div>
                        <div className="category-points">
                          {achievements.filter(a => a.category === 'consistency' && a.unlocked).reduce((sum, a) => sum + a.points, 0)} pts
                        </div>
                        <div className="category-achievements">
                          {achievements.filter(a => a.category === 'consistency' && a.unlocked).map(achievement => (
                            <div key={achievement.id} className="mini-achievement">
                              <span>{achievement.icon} {achievement.name}</span>
                              <span>{achievement.points}pts</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="points-category-card">
                        <div className="category-header">
                          <span className="category-icon">🛡️</span>
                          <span className="category-name">Milestones</span>
                        </div>
                        <div className="category-points">
                          {achievements.filter(a => a.category === 'milestones' && a.unlocked).reduce((sum, a) => sum + a.points, 0)} pts
                        </div>
                        <div className="category-achievements">
                          {achievements.filter(a => a.category === 'milestones' && a.unlocked).map(achievement => (
                            <div key={achievement.id} className="mini-achievement">
                              <span>{achievement.icon} {achievement.name}</span>
                              <span>{achievement.points}pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {achievementFilter === 'completed' && (
                  <div className="completed-section">
                    <h4 className="section-subtitle">Completed Achievements ({stats.unlockedCount})</h4>
                    <div className="completed-achievements-detailed">
                      {achievements.filter(a => a.unlocked).map(achievement => (
                        <div key={achievement.id} className="completed-achievement-card">
                          <div className="achievement-header">
                            <span className="achievement-icon-large">{achievement.icon}</span>
                            <div className="achievement-info">
                              <h5 className="achievement-name">{achievement.name}</h5>
                              <p className="achievement-description">{achievement.description}</p>
                            </div>
                            <div className="achievement-points-badge">{achievement.points} pts</div>
                          </div>
                          <div className="achievement-footer">
                            <span className="achievement-category-tag">{achievement.category}</span>
                            <span className="achievement-date">
                              Earned: {formatDate(achievement.earnedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {achievements.filter(a => a.unlocked).length === 0 && (
                        <div className="no-completed-message">
                          <div className="empty-state">
                            <span className="empty-icon">🏆</span>
                            <h5>No achievements unlocked yet</h5>
                            <p>Complete financial actions to earn your first achievement!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Achievement Grid */}
                <div className="achievements-grid">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                      <div className="achievement-icon">
                        {achievement.unlocked ? achievement.icon : '🔒'}
                      </div>
                      <div className="achievement-content">
                        <h4 className="achievement-title">{achievement.name}</h4>
                        <p className="achievement-description">{achievement.description}</p>
                        <div className="achievement-meta">
                          <span className="achievement-category">{achievement.category}</span>
                          <span className="achievement-points">{achievement.points} pts</span>
                        </div>
                        {achievement.unlocked && achievement.earnedAt && (
                          <div className="achievement-date">
                            Unlocked on {formatDate(achievement.earnedAt)}
                          </div>
                        )}
                        {!achievement.unlocked && achievement.progress !== undefined && (
                          <div className="achievement-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${achievement.progress}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">{achievement.progress}% complete</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'personalization':
        return (
          <div className="tab-content">
            <div className="personalization-intro">
              <h3 className="section-title">Get More Personalized</h3>
              <p className="section-description">
                Help us provide better financial insights by sharing more details about your financial situation. 
                This information will help us give you more personalized recommendations and insights.
              </p>
              {settings && Object.keys(settings).length > 0 ? (
                <div className="data-sync-status">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: '16px', height: '16px', color: '#38a169'}}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span style={{color: '#38a169', fontSize: '14px', marginLeft: '8px'}}>
                    Your personalization data is synced and will be automatically saved as you make changes.
                  </span>
                </div>
              ) : (
                <div className="data-sync-status" style={{background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: '16px', height: '16px', color: '#f59e0b'}}>
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span style={{color: '#f59e0b', fontSize: '14px', marginLeft: '8px'}}>
                    Working offline - your data is saved locally and will sync when connection is restored.
                  </span>
                </div>
              )}
            </div>

            <div className="personalization-form">
              <div className="form-section">
                <h4 className="form-section-title">Personal Information</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Employment Status</label>
                    <select
                      className="form-select"
                      value={personalizationData.employmentStatus}
                      onChange={(e) => updatePersonalizationData('employmentStatus', e.target.value)}
                    >
                      <option value="employed">Full-time Employed</option>
                      <option value="part-time">Part-time Employed</option>
                      <option value="self-employed">Self-employed</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="student">Student</option>
                      <option value="retired">Retired</option>
                      <option value="unemployed">Unemployed</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Housing Status</label>
                    <select
                      className="form-select"
                      value={personalizationData.housingStatus}
                      onChange={(e) => updatePersonalizationData('housingStatus', e.target.value)}
                    >
                      <option value="rent">Renting</option>
                      <option value="own-mortgage">Own with Mortgage</option>
                      <option value="own-outright">Own Outright</option>
                      <option value="living-with-family">Living with Family</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Number of Dependents</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      min="0"
                      max="20"
                      value={personalizationData.dependents}
                      onChange={(e) => updatePersonalizationData('dependents', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Employment-Specific Fields */}
              {(personalizationData.employmentStatus === 'employed' || 
                personalizationData.employmentStatus === 'part-time' || 
                personalizationData.employmentStatus === 'self-employed') && (
                <div className="form-section">
                  <h4 className="form-section-title">Work & Transportation</h4>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Office Days Per Week</label>
                      <select
                        className="form-select"
                        value={personalizationData.officeDaysPerWeek}
                        onChange={(e) => updatePersonalizationData('officeDaysPerWeek', e.target.value)}
                      >
                        <option value="0">Remote Work (0 days)</option>
                        <option value="1">1 day</option>
                        <option value="2">2 days</option>
                        <option value="3">3 days</option>
                        <option value="4">4 days</option>
                        <option value="5">5 days</option>
                        <option value="6">6 days</option>
                        <option value="7">7 days</option>
                      </select>
                    </div>
                    {parseInt(personalizationData.officeDaysPerWeek) > 0 && (
                      <div className="form-field">
                        <label className="form-label">Daily Transportation Cost to Office</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Round trip cost per day"
                          value={personalizationData.transportationCostToOffice}
                          onChange={(e) => updatePersonalizationData('transportationCostToOffice', e.target.value)}
                        />
                      </div>
                    )}
                    <div className="form-field">
                      <label className="form-label">Work From Home Frequency</label>
                      <select
                        className="form-select"
                        value={personalizationData.workFromHomeFrequency}
                        onChange={(e) => updatePersonalizationData('workFromHomeFrequency', e.target.value)}
                      >
                        <option value="never">Never</option>
                        <option value="rarely">Rarely (1-2 days/month)</option>
                        <option value="sometimes">Sometimes (1-2 days/week)</option>
                        <option value="often">Often (3-4 days/week)</option>
                        <option value="always">Always (Full remote)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Student-Specific Fields */}
              {personalizationData.employmentStatus === 'student' && (
                <div className="form-section">
                  <h4 className="form-section-title">Education & Transportation</h4>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Education Level</label>
                      <select
                        className="form-select"
                        value={personalizationData.educationLevel}
                        onChange={(e) => updatePersonalizationData('educationLevel', e.target.value)}
                      >
                        <option value="high-school">High School</option>
                        <option value="undergraduate">Undergraduate</option>
                        <option value="graduate">Graduate</option>
                        <option value="postgraduate">Postgraduate</option>
                        <option value="vocational">Vocational Training</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Student Type</label>
                      <select
                        className="form-select"
                        value={personalizationData.studentType}
                        onChange={(e) => updatePersonalizationData('studentType', e.target.value)}
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="online">Online</option>
                        <option value="evening">Evening Classes</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Daily Transportation Cost to School/College</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Round trip cost per day"
                        value={personalizationData.transportationCostToSchool}
                        onChange={(e) => updatePersonalizationData('transportationCostToSchool', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-section">
                <h4 className="form-section-title">Food & Dining Preferences</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Food Preference</label>
                    <select
                      className="form-select"
                      value={personalizationData.foodPreference}
                      onChange={(e) => updatePersonalizationData('foodPreference', e.target.value)}
                    >
                      <option value="home-cooked">Mostly Home-cooked</option>
                      <option value="mixed">Mixed (Home + Dining out)</option>
                      <option value="dining-out">Prefer Dining Out</option>
                      <option value="fast-food">Fast Food Regular</option>
                      <option value="organic-healthy">Organic/Healthy Focus</option>
                      <option value="budget-conscious">Budget-conscious</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Dining Out Frequency</label>
                    <select
                      className="form-select"
                      value={personalizationData.diningOutFrequency}
                      onChange={(e) => updatePersonalizationData('diningOutFrequency', e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="few-times-week">Few times a week</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="rarely">Rarely</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Shopping & Spending Habits</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Impulsive Buying Habit</label>
                    <select
                      className="form-select"
                      value={personalizationData.impulsiveBuyingHabit}
                      onChange={(e) => updatePersonalizationData('impulsiveBuyingHabit', e.target.value)}
                    >
                      <option value="very-low">Very Low - I plan all purchases</option>
                      <option value="low">Low - Rarely buy unplanned items</option>
                      <option value="moderate">Moderate - Sometimes buy on impulse</option>
                      <option value="high">High - Often buy things I don't need</option>
                      <option value="very-high">Very High - Struggle with impulse control</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Estimated Monthly Impulsive Spending</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Amount spent on unplanned purchases"
                      value={personalizationData.estimatedImpulsiveSpend}
                      onChange={(e) => updatePersonalizationData('estimatedImpulsiveSpend', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Shopping Frequency</label>
                  <select 
                      className="form-select"
                      value={personalizationData.shoppingFrequency}
                      onChange={(e) => updatePersonalizationData('shoppingFrequency', e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="few-times-week">Few times a week</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="rarely">Rarely</option>
                  </select>
                  </div>
                </div>
                </div>

              <div className="form-section">
                <h4 className="form-section-title">Lifestyle & Entertainment</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Monthly Entertainment Budget</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Movies, games, events, etc."
                      value={personalizationData.entertainmentBudget}
                      onChange={(e) => updatePersonalizationData('entertainmentBudget', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Monthly Fitness & Health Spending</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Gym, supplements, healthcare, etc."
                      value={personalizationData.fitnessHealthSpend}
                      onChange={(e) => updatePersonalizationData('fitnessHealthSpend', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Monthly Subscription Services</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Netflix, Spotify, apps, etc."
                      value={personalizationData.subscriptionServices}
                      onChange={(e) => updatePersonalizationData('subscriptionServices', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Travel Frequency</label>
                    <select
                      className="form-select"
                      value={personalizationData.travelFrequency}
                      onChange={(e) => updatePersonalizationData('travelFrequency', e.target.value)}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="bi-annually">Twice a year</option>
                      <option value="annually">Once a year</option>
                      <option value="rarely">Rarely</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Social Spending Habit</label>
                    <select
                      className="form-select"
                      value={personalizationData.socialSpendingHabit}
                      onChange={(e) => updatePersonalizationData('socialSpendingHabit', e.target.value)}
                    >
                      <option value="very-low">Very Low - Prefer free activities</option>
                      <option value="low">Low - Occasional social spending</option>
                      <option value="moderate">Moderate - Regular social activities</option>
                      <option value="high">High - Love going out with friends</option>
                      <option value="very-high">Very High - Social life is priority</option>
                    </select>
                  </div>
                </div>
                </div>

              <div className="form-section">
                <h4 className="form-section-title">Financial Goals & Planning</h4>
                <div className="form-grid">
                  <div className="form-field full-width">
                    <label className="form-label">Primary Financial Goals</label>
                    <textarea
                      className="form-textarea"
                      placeholder="e.g., Emergency fund, House down payment, Retirement savings..."
                      rows="3"
                      value={personalizationData.financialGoals}
                      onChange={(e) => updatePersonalizationData('financialGoals', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Target Retirement Age</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g., 65"
                      min="30"
                      max="100"
                      value={personalizationData.retirementAge}
                      onChange={(e) => updatePersonalizationData('retirementAge', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Target Savings Rate (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g., 20"
                      min="0"
                      max="100"
                      value={personalizationData.savingsRate}
                      onChange={(e) => updatePersonalizationData('savingsRate', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Emergency Fund Target</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter target amount"
                      value={personalizationData.emergencyFund}
                      onChange={(e) => updatePersonalizationData('emergencyFund', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Investment & Risk Profile</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">Risk Tolerance</label>
                    <select
                      className="form-select"
                      value={personalizationData.riskTolerance}
                      onChange={(e) => updatePersonalizationData('riskTolerance', e.target.value)}
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                      <option value="very-aggressive">Very Aggressive</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Investment Experience</label>
                    <select
                      className="form-select"
                      value={personalizationData.investmentExperience}
                      onChange={(e) => updatePersonalizationData('investmentExperience', e.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Current Debt Amount</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Total outstanding debt"
                      value={personalizationData.debtAmount}
                      onChange={(e) => updatePersonalizationData('debtAmount', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="save-personalization-btn"
                  onClick={async () => {
                    try {
                      // Force save all current personalization data
                      console.log('💾 Manually saving all personalization data...');
                      
                      // Create batch update with all current data
                      const backendFieldMap = {
                        financialGoals: 'financialGoals',
                        riskTolerance: 'riskTolerance',
                        investmentExperience: 'investmentExperience',
                        savingsRate: 'savingsRate',
                        debtAmount: 'debtAmount',
                        emergencyFund: 'emergencyFund',
                        retirementAge: 'retirementAge',
                        dependents: 'dependents',
                        housingStatus: 'housingStatus',
                        employmentStatus: 'employmentStatus',
                        officeDaysPerWeek: 'officeDays',
                        transportationCostToOffice: 'transportOffice',
                        workFromHomeFrequency: 'wfhFrequency',
                        educationLevel: 'educationLevel',
                        transportationCostToSchool: 'transportSchool',
                        studentType: 'studentType',
                        foodPreference: 'foodPreference',
                        diningOutFrequency: 'diningFrequency',
                        impulsiveBuyingHabit: 'impulsiveBuying',
                        estimatedImpulsiveSpend: 'impulsiveSpend',
                        shoppingFrequency: 'shoppingFrequency',
                        entertainmentBudget: 'entertainmentBudget',
                        fitnessHealthSpend: 'fitnessSpend',
                        subscriptionServices: 'subscriptions',
                        travelFrequency: 'travelFrequency',
                        socialSpendingHabit: 'socialSpending'
                      };

                      // Build complete update object
                      const completeUpdate = {};
                      Object.entries(backendFieldMap).forEach(([frontendField, backendField]) => {
                        const value = personalizationData[frontendField];
                        if (value !== undefined && value !== null && value !== '') {
                          completeUpdate[backendField] = value;
                        }
                      });

                      // Save to backend
                      await updateSettings(completeUpdate);
                      
                      // Also ensure localStorage is up to date
                      Object.entries(personalizationData).forEach(([field, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                          const localStorageKey = `healthywallet-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                          localStorage.setItem(localStorageKey, value);
                        }
                      });

                      // Show success message
                      alert('✅ Personalization data saved successfully! Our AI will now provide more tailored insights based on your financial profile.');
                      console.log('✅ All personalization data saved successfully');
                      
                    } catch (error) {
                      console.error('❌ Failed to save personalization data:', error);
                      alert('⚠️ Settings saved locally but could not sync to server. Your data is safe and will sync when connection is restored.');
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  Save Personalization Settings
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`profile-module ${isLoaded ? 'loaded' : ''}`}>
      {/* Achievement Notification */}
      {showNotification && newAchievements.length > 0 && (
        <div className="achievement-notification">
          <div className="notification-content">
            <div className="notification-header">
              <h3>🎉 Achievement Unlocked!</h3>
              <button 
                className="notification-close"
                onClick={dismissNotification}
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
            <div className="notification-achievements">
              {newAchievements.map(achievement => (
                <div key={achievement.id} className="notification-achievement">
                  <span className="notification-icon">{achievement.icon}</span>
                  <div className="notification-details">
                    <strong>{achievement.name}</strong>
                    <p>{achievement.description}</p>
                    <span className="notification-points">+{achievement.points} points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <section className="profile-header">
        <div className="profile-banner">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="avatar-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-email">{profileData.email}</p>
            <div className="profile-meta">
              <span className="member-since">Member since {formatDate(profileData.joinDate)}</span>
              <span className="member-duration">{getMembershipDuration()} journey</span>
            </div>
            <p className="profile-bio">{profileData.bio}</p>
          </div>
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-number">{financialSummary.longestStreak}</div>
              <div className="stat-label">Best Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{achievements.filter(a => a.unlocked).length}</div>
              <div className="stat-label">Achievements</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{financialSummary.completedGoals}</div>
              <div className="stat-label">Goals Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="profile-navigation">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            aria-label="View profile overview"
            title="Overview"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            <span>Overview</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
            aria-label="View achievements"
            title="Achievements"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
            <span>Achievements</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'personalization' ? 'active' : ''}`}
            onClick={() => setActiveTab('personalization')}
            aria-label="Get more personalized"
            title="Get More Personalized"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              <path d="M8 3.13a4 4 0 0 0 0 7.75"></path>
            </svg>
            <span>Get Personalized</span>
          </button>
        </div>
      </section>

      {/* Tab Content */}
      <section className="profile-content">
        {renderTabContent()}
      </section>

      {/* AI Insights */}
      <PageAIInsight 
        page="profile" 
        data={{
          user: profileData,
          financial: financialSummary,
          achievements: achievements.filter(a => a.unlocked),
          activity: accountActivity
        }} 
      />
    </div>
  );
};

export default Profile;