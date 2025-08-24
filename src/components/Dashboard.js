import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import PageAIInsight from './PageAIInsight';

const Dashboard = ({ onNavigate }) => {
  // Enhanced financial data with comprehensive statistics
  const [financialData, setFinancialData] = useState({
    totalIncome: 5420.00,
    totalExpenses: 3240.50,
    balance: 2179.50,
    monthlyIncome: 4200.00,
    monthlyExpenses: 2850.75,
    monthlySavings: 1349.25,
    savingsRate: 32.1,
    lastMonthBalance: 1650.00
  });

  const [currentGoal, setCurrentGoal] = useState({
    name: "Emergency Fund",
    targetAmount: 10000,
    savedAmount: 3500,
    monthlyTarget: 650,
    daysRemaining: 120
  });

  // Enhanced mock data for comprehensive insights
  const [mockExpenses] = useState([
    { id: 1, amount: 450.50, category: 'Food', date: '2024-01-20', note: 'Groceries and dining' },
    { id: 2, amount: 850.00, category: 'Bills', date: '2024-01-18', note: 'Rent and utilities' },
    { id: 3, amount: 180.00, category: 'Transport', date: '2024-01-17', note: 'Gas and maintenance' },
    { id: 4, amount: 240.00, category: 'Entertainment', date: '2024-01-15', note: 'Movies and subscriptions' },
    { id: 5, amount: 320.00, category: 'Other', date: '2024-01-12', note: 'Shopping' },
    { id: 6, amount: 125.75, category: 'Food', date: '2024-01-10', note: 'Restaurant dinner' },
    { id: 7, amount: 95.00, category: 'Bills', date: '2024-01-08', note: 'Phone bill' },
    { id: 8, amount: 75.50, category: 'Transport', date: '2024-01-06', note: 'Public transport' }
  ]);

  const [mockIncome] = useState([
    { id: 1, amount: 3500.00, source: 'Salary', date: '2024-01-15' },
    { id: 2, amount: 920.00, source: 'Freelance', date: '2024-01-10' },
    { id: 3, amount: 1000.00, source: 'Investment', date: '2024-01-05' },
    { id: 4, amount: 250.00, source: 'Side Project', date: '2024-01-03' }
  ]);

  // Enhanced state for animations and user experience
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [dailyStreak, setDailyStreak] = useState(() => {
    const savedStreak = localStorage.getItem('healthywallet-daily-streak');
    return savedStreak ? parseInt(savedStreak) : 0;
  });

  // Component load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Update daily streak
  useEffect(() => {
    const today = new Date().toDateString();
    const lastActivity = localStorage.getItem('healthywallet-last-activity');
    
    if (!lastActivity || lastActivity !== today) {
      const newStreak = lastActivity ? dailyStreak + 1 : 1;
      setDailyStreak(newStreak);
      localStorage.setItem('healthywallet-daily-streak', newStreak.toString());
      localStorage.setItem('healthywallet-last-activity', today);
    }
  }, []);

  // Calculate enhanced statistics
  const goalProgress = ((currentGoal.savedAmount / currentGoal.targetAmount) * 100);
  const balanceChange = ((financialData.balance - financialData.lastMonthBalance) / financialData.lastMonthBalance * 100);
  const expensesByCategory = mockExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  const topExpenseCategory = Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0];
  
  // Financial health score calculation
  const calculateHealthScore = () => {
    const savingsScore = Math.min(50, (financialData.savingsRate / 20) * 50);
    const goalScore = Math.min(30, (goalProgress / 100) * 30);
    const balanceScore = Math.min(20, (balanceChange > 0 ? 20 : 10));
    return Math.round(savingsScore + goalScore + balanceScore);
  };

  const healthScore = calculateHealthScore();

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Helper function for greeting
  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  return (
    <div className={`dashboard-module ${isLoaded ? 'loaded' : ''}`}>
      {/* Revolutionary Hero Header */}
      <section className="hero-header">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="time-emoji">
                {timeOfDay === 'morning' ? '🌅' : timeOfDay === 'afternoon' ? '☀️' : '🌙'}
              </span>
              Good {timeOfDay}!
            </h1>
            <p className="hero-subtitle">Your complete financial overview and insights dashboard</p>
          </div>
          <div className="hero-stats">
            <div className="streak-display">
              <div className="streak-number">{dailyStreak}</div>
              <div className="streak-label">Day Streak</div>
              <div className="streak-icon">🔥</div>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Financial Overview Dashboard */}
      <section className="financial-overview">
        <h2 className="section-title">Financial Overview</h2>
        <div className="overview-grid">
          {/* Total Balance - Featured Card */}
          <div className="overview-card featured balance-card">
            <div className="card-content">
              <div className="card-header">
                <span className="card-label">Total Balance</span>
                <div className="card-icon primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
              </div>
              <div className="card-value">{formatCurrency(financialData.balance)}</div>
              <div className={`card-trend ${balanceChange >= 0 ? 'positive' : 'negative'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {balanceChange >= 0 ? (
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  ) : (
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                  )}
                </svg>
                <span>{balanceChange >= 0 ? '+' : ''}{balanceChange.toFixed(1)}% from last month</span>
              </div>
            </div>
          </div>
          
          {/* Monthly Income */}
          <div className="overview-card income-themed">
            <div className="card-content">
              <div className="card-header">
                <span className="card-label">Monthly Income</span>
                <div className="card-icon income">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
              </div>
              <div className="card-value">{formatCurrency(financialData.monthlyIncome)}</div>
              <div className="card-trend positive">
                <span>Income this month</span>
              </div>
            </div>
          </div>
          
          {/* Monthly Expenses */}
          <div className="overview-card expense-themed">
            <div className="card-content">
              <div className="card-header">
                <span className="card-label">Monthly Expenses</span>
                <div className="card-icon expense">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                    <polyline points="17 18 23 18 23 12"></polyline>
                  </svg>
                </div>
              </div>
              <div className="card-value">{formatCurrency(financialData.monthlyExpenses)}</div>
              <div className="card-trend negative">
                <span>Spent this month</span>
              </div>
            </div>
          </div>
          
          {/* Savings Rate */}
          <div className="overview-card goal-themed">
            <div className="card-content">
              <div className="card-header">
                <span className="card-label">Savings Rate</span>
                <div className="card-icon goal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                  </svg>
                </div>
              </div>
              <div className="card-value">{financialData.savingsRate.toFixed(1)}%</div>
              <div className="card-trend positive">
                <span>Of income saved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Statistics Section */}
      <section className="statistics-overview">
        <h2 className="section-title">Key Statistics</h2>
        <div className="statistics-grid">
          {/* Financial Health Score */}
          <div className="stat-card health-score">
            <div className="stat-header">
              <div className="stat-icon health">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3 className="stat-title">Financial Health</h3>
            </div>
            <div className="stat-value">{healthScore}/100</div>
            <div className="stat-description">
              {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Improvement'}
            </div>
            <div className="progress-bar-stat">
              <div className="progress-fill-stat" style={{ width: `${healthScore}%` }}></div>
            </div>
          </div>
          
          {/* Goal Progress */}
          <div className="stat-card goal-progress">
            <div className="stat-header">
              <div className="stat-icon goal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                </svg>
              </div>
              <h3 className="stat-title">{currentGoal.name}</h3>
            </div>
            <div className="stat-value">{goalProgress.toFixed(1)}%</div>
            <div className="stat-description">
              {formatCurrency(currentGoal.savedAmount)} of {formatCurrency(currentGoal.targetAmount)}
            </div>
            <div className="progress-bar-stat">
              <div className="progress-fill-stat" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
            </div>
          </div>
          
          {/* Top Expense Category */}
          <div className="stat-card expense-category">
            <div className="stat-header">
              <div className="stat-icon expense">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 2h6l3 7H6l3-7z"></path>
                  <path d="M6 9v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9"></path>
                </svg>
              </div>
              <h3 className="stat-title">Top Expense</h3>
            </div>
            <div className="stat-value">{formatCurrency(topExpenseCategory?.[1] || 0)}</div>
            <div className="stat-description">
              {topExpenseCategory?.[0] || 'No expenses'} category
            </div>
          </div>
          
          {/* Monthly Target */}
          <div className="stat-card monthly-target">
            <div className="stat-header">
              <div className="stat-icon target">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <h3 className="stat-title">Monthly Target</h3>
            </div>
            <div className="stat-value">{formatCurrency(currentGoal.monthlyTarget)}</div>
            <div className="stat-description">
              To reach goal in {Math.ceil(currentGoal.daysRemaining / 30)} months
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights */}
      <PageAIInsight 
        page="dashboard" 
        data={{
          income: mockIncome,
          expenses: mockExpenses,
          goals: [currentGoal],
          balance: financialData.balance,
          healthScore: healthScore
        }} 
      />

      {/* Quick Actions Section */}
      <section className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-grid">
          <button className="action-card-modern income-action" onClick={() => onNavigate('income')}>
            <div className="action-icon-modern">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div className="action-content-modern">
              <span className="action-label-modern">Add Income</span>
              <span className="action-description-modern">Record new income source</span>
            </div>
          </button>

          <button className="action-card-modern expense-action" onClick={() => onNavigate('expense')}>
            <div className="action-icon-modern">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            </div>
            <div className="action-content-modern">
              <span className="action-label-modern">Add Expense</span>
              <span className="action-description-modern">Track your spending</span>
            </div>
          </button>

          <button className="action-card-modern goal-action" onClick={() => onNavigate('goal')}>
            <div className="action-icon-modern">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
              </svg>
            </div>
            <div className="action-content-modern">
              <span className="action-label-modern">Manage Goals</span>
              <span className="action-description-modern">Set and track goals</span>
            </div>
          </button>

          <button className="action-card-modern reports-action" onClick={() => onNavigate('reports')}>
            <div className="action-icon-modern">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"></path>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
              </svg>
            </div>
            <div className="action-content-modern">
              <span className="action-label-modern">View Reports</span>
              <span className="action-description-modern">Analyze your trends</span>
            </div>
          </button>
        </div>
      </section>

      {/* Enhanced Financial Tips */}
      <section className="financial-tips-section">
        <div className="tip-card-modern">
          <div className="tip-header-modern">
            <div className="tip-icon-modern">💡</div>
            <h3 className="tip-title-modern">Smart Financial Tip</h3>
          </div>
          <p className="tip-content-modern">
            {healthScore >= 80 
              ? "Excellent financial health! Consider diversifying your investments or increasing your emergency fund target."
              : healthScore >= 60 
              ? "Good progress! Try to increase your savings rate by 5% to improve your financial health score."
              : "Focus on tracking expenses and setting a monthly budget. Small improvements lead to big results!"
            }
          </p>
          <div className="tip-actions">
            <button className="tip-action-btn" onClick={() => onNavigate('reports')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                <path d="M3 3v18h18"></path>
              </svg>
              View Detailed Analysis
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;