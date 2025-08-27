import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import PageAIInsight from './PageAIInsight';

const Profile = () => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
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

  // Achievements data
  const [achievements] = useState([
    { id: 1, title: 'First Goal Achieved', description: 'Completed your first savings goal', date: '2024-01-10', icon: '🎯', unlocked: true },
    { id: 2, title: 'Budget Master', description: 'Stayed within budget for 3 months', date: '2024-01-05', icon: '💰', unlocked: true },
    { id: 3, title: 'Streak Champion', description: 'Tracked finances for 30 days straight', date: '2023-12-28', icon: '🔥', unlocked: true },
    { id: 4, title: 'Investment Pioneer', description: 'Made your first investment entry', date: '2023-12-20', icon: '📈', unlocked: true },
    { id: 5, title: 'Savings Superstar', description: 'Saved over $5,000', date: null, icon: '⭐', unlocked: false },
    { id: 6, title: 'Expense Tracker Pro', description: 'Logged 100 expense entries', date: null, icon: '📊', unlocked: false }
  ]);

  // Personalization state for lifestyle and financial details
  const [personalizationData, setPersonalizationData] = useState({
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
  });

  // Component load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Use settings hook for backend integration
  const { settings, updateSettings } = useSettings();

  // Helper function to update personalization data
  const updatePersonalizationData = async (field, value) => {
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
    
    try {
      // Update backend
      await updateSettings({ [backendField]: value });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      // Fallback to localStorage
      localStorage.setItem(`healthywallet-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

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
            <div className="achievements-grid">
              {achievements.map(achievement => (
                <div key={achievement.id} className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="achievement-icon">
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>
                  <div className="achievement-content">
                    <h4 className="achievement-title">{achievement.title}</h4>
                    <p className="achievement-description">{achievement.description}</p>
                    {achievement.unlocked && achievement.date && (
                      <div className="achievement-date">Unlocked on {formatDate(achievement.date)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                  onClick={() => {
                    // Show success message
                    alert('Personalization data saved! Our AI will now provide more tailored insights based on your financial profile.');
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