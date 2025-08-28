import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import PageAIInsight from './PageAIInsight';
import GlobalLoading from './GlobalLoading';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import { useAPI } from '../hooks/useAPI';
import { reportsAPI } from '../services/api';

const Dashboard = ({ onNavigate }) => {
  // Currency formatter hook
  const { format: formatCurrency } = useCurrencyFormatter();
  
  // State declarations first
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0,
    savingsRate: 0,
    lastMonthBalance: 0
  });

  const [currentGoal, setCurrentGoal] = useState({
    name: "No Active Goal",
    targetAmount: 0,
    savedAmount: 0,
    monthlyTarget: 0,
    daysRemaining: 0
  });

  const [realExpenses, setRealExpenses] = useState([]);
  const [realIncomes, setRealIncomes] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState({
    income: [],
    expenses: []
  });
  const [financialHealthData, setFinancialHealthData] = useState({
    score: 0,
    status: { level: 'Good', message: 'Your finances are on track!' }
  });

  // Memoized callback to prevent re-renders
  const handleDashboardSuccess = useCallback((data) => {
    console.log('✅ Dashboard API Response:', data);
    if (data.success && data.data) {
      // Map API response to component state
      const apiData = data.data;
      // Calculate savings rate if not provided by API
      const monthlyIncome = apiData.monthlyOverview?.income || 0;
      const monthlyExpenses = apiData.monthlyOverview?.expenses || 0;
      const monthlySavings = apiData.monthlyOverview?.savings || (monthlyIncome - monthlyExpenses);
      const calculatedSavingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100) : 0;
      
      setFinancialData({
        totalIncome: apiData.yearlyOverview?.income || 0,
        totalExpenses: apiData.yearlyOverview?.expenses || 0,
        balance: (apiData.yearlyOverview?.income || 0) - (apiData.yearlyOverview?.expenses || 0),
        monthlyIncome: monthlyIncome,
        monthlyExpenses: monthlyExpenses,
        monthlySavings: monthlySavings,
        savingsRate: apiData.monthlyOverview?.savingsRate ? parseFloat(apiData.monthlyOverview.savingsRate) : calculatedSavingsRate,
        lastMonthBalance: apiData.previousMonthOverview?.balance || 0
      });
      
      // Set active goals from API
      if (apiData.activeGoals && apiData.activeGoals.length > 0) {
        const firstGoal = apiData.activeGoals[0];
        setCurrentGoal({
          name: firstGoal.name || "No Active Goal",
          targetAmount: firstGoal.targetAmount || 0,
          savedAmount: firstGoal.currentAmount || 0,
          monthlyTarget: Math.round((firstGoal.remainingAmount || 0) / ((firstGoal.daysRemaining || 30) / 30)),
          daysRemaining: firstGoal.daysRemaining || 0
        });
      }
      
      // Set real transaction data
      if (apiData.recentTransactions) {
        setRealIncomes(apiData.recentTransactions.income || []);
        setRealExpenses(apiData.recentTransactions.expenses || []);
      }
      
      // Set category breakdown
      if (apiData.categoryBreakdown) {
        setCategoryBreakdown(apiData.categoryBreakdown);
      }
      
      // Set financial health data
      if (apiData.financialHealth) {
        setFinancialHealthData(apiData.financialHealth);
      }
    }
  }, []);

  const handleDashboardError = useCallback((error) => {
    console.error('Failed to fetch dashboard data:', error);
  }, []);

  // Fetch real-time dashboard data from backend
  const { 
    data: dashboardApiData, 
    loading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useAPI(reportsAPI.getDashboard, [], {
    onSuccess: handleDashboardSuccess,
    onError: handleDashboardError
  });

  // Memoized trend analysis callback
  const handleTrendSuccess = useCallback((data) => {
    console.log('✅ Trend Analysis API Response:', data);
    if (data.success && data.data && data.data.length >= 2) {
      // const currentMonth = data.data[1]; // Most recent month (unused for now)
      const previousMonth = data.data[0]; // Previous month
      
      // Update previous month data with real API data
      setPreviousMonthData({
        income: previousMonth.income || 0,
        expenses: previousMonth.expenses || 0,
        goalProgress: previousMonth.goalProgress || 0,
        savingsRate: previousMonth.savingsRate || 0,
        expenseCategories: previousMonth.expenseCategories || {}
      });
    }
  }, []);

  const handleTrendError = useCallback((error) => {
    console.error('Failed to fetch trend analysis:', error);
  }, []);

  // Fetch trend analysis for month-over-month comparisons
  const { 
    // data: trendApiData // Unused - data is processed in handleTrendSuccess callback
  } = useAPI(reportsAPI.getTrendAnalysis, [2], {
    onSuccess: handleTrendSuccess,
    onError: handleTrendError
  });

  // AI insights disabled to prevent excessive requests

  // Mock income data removed - now using real API data (realIncomes)

  // Enhanced state for animations and user experience
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeOfDay] = useState(getTimeOfDay());
  const [dailyStreak, setDailyStreak] = useState(() => {
    const savedStreak = localStorage.getItem('healthywallet-daily-streak');
    return savedStreak ? parseInt(savedStreak) : 0;
  });
  
  // Visualization state
  const [selectedChart, setSelectedChart] = useState('comparison');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Previous month data for comparison (updated from API)
  const [previousMonthData, setPreviousMonthData] = useState({
    income: 0,
    expenses: 0,
    goalProgress: 0,
    savingsRate: 0,
    expenseCategories: {}
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
  }, [dailyStreak]);

  // Calculate enhanced statistics with safety checks
  const goalProgress = currentGoal.targetAmount > 0 
    ? ((currentGoal.savedAmount || 0) / currentGoal.targetAmount * 100)
    : 0;
  const balanceChange = financialData.lastMonthBalance > 0 
    ? ((financialData.balance - financialData.lastMonthBalance) / financialData.lastMonthBalance * 100)
    : 0;
  // Use real expense data from API or fallback to category breakdown
  const expensesByCategory = categoryBreakdown.expenses.length > 0 
    ? categoryBreakdown.expenses.reduce((acc, category) => {
        acc[category._id] = category.total;
        return acc;
      }, {})
    : realExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});
  
  const topExpenseCategory = Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0];
  
  // Use real financial health score from API or calculate fallback
  const healthScore = financialHealthData.score || (() => {
    const savingsScore = Math.min(50, (financialData.savingsRate / 20) * 50);
    const goalScore = Math.min(30, (goalProgress / 100) * 30);
    const balanceScore = Math.min(20, (balanceChange > 0 ? 20 : 10));
    return Math.round(savingsScore + goalScore + balanceScore);
  })();

  // Currency formatting is now handled by useCurrencyFormatter hook

  // Format percentage with null/undefined safety
  const formatPercentage = (value, decimals = 1) => {
    const numericValue = Number(value);
    if (isNaN(numericValue) || !isFinite(numericValue)) {
      return '0.0';
    }
    return numericValue.toFixed(decimals);
  };

  // Helper function for greeting
  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  // Chart options for dropdown
  const chartOptions = [
    { value: 'comparison', label: 'Income vs Expenses', icon: '📊' },
    { value: 'expenses', label: 'Expense Breakdown', icon: '🥧' },
    { value: 'trends', label: 'Monthly Trends', icon: '📈' },
    { value: 'goals', label: 'Goal Progress', icon: '🎯' }
  ];

  // Calculate comparison percentages with safety checks
  const incomeChange = previousMonthData.income > 0 
    ? ((financialData.monthlyIncome - previousMonthData.income) / previousMonthData.income * 100)
    : 0;
  const expenseChange = previousMonthData.expenses > 0 
    ? ((financialData.monthlyExpenses - previousMonthData.expenses) / previousMonthData.expenses * 100)
    : 0;
  const goalProgressChange = (goalProgress - previousMonthData.goalProgress);
  const savingsRateChange = (financialData.savingsRate - previousMonthData.savingsRate);

  // Render comparison bar chart with safety checks
  const renderComparisonChart = () => {
    const maxValue = Math.max(
      financialData.monthlyIncome || 0, 
      previousMonthData.income || 0, 
      financialData.monthlyExpenses || 0, 
      previousMonthData.expenses || 0,
      1 // Prevent division by zero
    );
    const incomeCurrentHeight = ((financialData.monthlyIncome || 0) / maxValue) * 200;
    const incomePreviousHeight = ((previousMonthData.income || 0) / maxValue) * 200;
    const expenseCurrentHeight = ((financialData.monthlyExpenses || 0) / maxValue) * 200;
    const expensePreviousHeight = ((previousMonthData.expenses || 0) / maxValue) * 200;

    return (
      <div className="chart-container">
        <div className="chart-header">
          <h4>Income vs Expenses Comparison</h4>
          <p>Current month vs Previous month</p>
        </div>
        <div className="bar-chart">
          <div className="chart-group">
            <div className="chart-label">Income</div>
            <div className="bar-group">
              <div className="bar-item">
                <div className="bar income-bar" style={{ height: `${incomeCurrentHeight}px` }}>
                  <span className="bar-value">{formatCurrency(financialData.monthlyIncome)}</span>
                </div>
                <div className="bar-label">Current</div>
              </div>
              <div className="bar-item">
                <div className="bar income-bar-light" style={{ height: `${incomePreviousHeight}px` }}>
                  <span className="bar-value">{formatCurrency(previousMonthData.income)}</span>
                </div>
                <div className="bar-label">Previous</div>
              </div>
            </div>
            <div className={`change-indicator ${incomeChange >= 0 ? 'positive' : 'negative'}`}>
              {incomeChange >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(incomeChange))}%
            </div>
          </div>
          <div className="chart-group">
            <div className="chart-label">Expenses</div>
            <div className="bar-group">
              <div className="bar-item">
                <div className="bar expense-bar" style={{ height: `${expenseCurrentHeight}px` }}>
                  <span className="bar-value">{formatCurrency(financialData.monthlyExpenses)}</span>
                </div>
                <div className="bar-label">Current</div>
              </div>
              <div className="bar-item">
                <div className="bar expense-bar-light" style={{ height: `${expensePreviousHeight}px` }}>
                  <span className="bar-value">{formatCurrency(previousMonthData.expenses)}</span>
                </div>
                <div className="bar-label">Previous</div>
              </div>
            </div>
            <div className={`change-indicator ${expenseChange <= 0 ? 'positive' : 'negative'}`}>
              {expenseChange >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(expenseChange))}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render expense pie chart
  const renderExpensePieChart = () => {
    const total = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
    let cumulativePercentage = 0;
    
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h4>Expense Breakdown</h4>
          <p>Current month category distribution</p>
        </div>
        <div className="pie-chart-container">
          <div className="pie-chart">
            <svg viewBox="0 0 200 200" width="200" height="200">
              {Object.entries(expensesByCategory).map(([category, amount], index) => {
                const percentage = total > 0 ? (amount / total) * 100 : 0;
                const startAngle = (cumulativePercentage / 100) * 360;
                const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                
                const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArcFlag = percentage > 50 ? 1 : 0;
                
                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                cumulativePercentage += percentage;
                
                const colors = {
                  'Food': '#e53e3e',
                  'Bills': '#d53f8c',
                  'Transport': '#9f7aea',
                  'Entertainment': '#667eea',
                  'Other': '#4299e1'
                };
                
                return (
                  <path
                    key={category}
                    d={pathData}
                    fill={colors[category] || '#9ca3af'}
                    stroke="white"
                    strokeWidth="2"
                    className="pie-slice"
                  />
                );
              })}
            </svg>
          </div>
          <div className="pie-legend">
            {Object.entries(expensesByCategory).map(([category, amount]) => {
              const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
              const colors = {
                'Food': '#e53e3e',
                'Bills': '#d53f8c',
                'Transport': '#9f7aea',
                'Entertainment': '#667eea',
                'Other': '#4299e1'
              };
              
              return (
                <div key={category} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: colors[category] || '#9ca3af' }}
                  ></div>
                  <span className="legend-label">{category}</span>
                  <span className="legend-value">{formatCurrency(amount)} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render trends chart
  const renderTrendsChart = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const incomeData = [3200, 3500, 3800, 4000, 4200, 4200];
    const expenseData = [2800, 2900, 2950, 3100, 2850, 2851];
    const maxValue = Math.max(...incomeData, ...expenseData);
    
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h4>6-Month Financial Trends</h4>
          <p>Income and expense patterns over time</p>
        </div>
        <div className="line-chart">
          <svg viewBox="0 0 400 250" width="100%" height="250">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="50"
                y1={50 + i * 40}
                x2="370"
                y2={50 + i * 40}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            ))}
            
            {/* Income line */}
            <polyline
              fill="none"
              stroke="#38a169"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={incomeData.map((value, index) => {
                const x = 50 + (index * 55);
                const y = 210 - ((value / maxValue) * 160);
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Expense line */}
            <polyline
              fill="none"
              stroke="#e53e3e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={expenseData.map((value, index) => {
                const x = 50 + (index * 55);
                const y = 210 - ((value / maxValue) * 160);
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {incomeData.map((value, index) => {
              const x = 50 + (index * 55);
              const y = 210 - ((value / maxValue) * 160);
              return (
                <circle
                  key={`income-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#38a169"
                  className="data-point"
                />
              );
            })}
            
            {expenseData.map((value, index) => {
              const x = 50 + (index * 55);
              const y = 210 - ((value / maxValue) * 160);
              return (
                <circle
                  key={`expense-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#e53e3e"
                  className="data-point"
                />
              );
            })}
            
            {/* Month labels */}
            {months.map((month, index) => (
              <text
                key={month}
                x={50 + (index * 55)}
                y={235}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {month}
              </text>
            ))}
          </svg>
          <div className="chart-legend-horizontal">
            <div className="legend-item-horizontal">
              <div className="legend-line income"></div>
              <span>Income</span>
            </div>
            <div className="legend-item-horizontal">
              <div className="legend-line expense"></div>
              <span>Expenses</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render goal progress chart
  const renderGoalChart = () => {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h4>Goal Progress Comparison</h4>
          <p>Current vs previous month progress</p>
        </div>
        <div className="goal-progress-chart">
          <div className="progress-comparison">
            <div className="progress-item">
              <div className="progress-label">Current Month</div>
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large current" 
                  style={{ width: `${Math.min(goalProgress, 100)}%` }}
                >
                  <span className="progress-text">{formatPercentage(goalProgress)}%</span>
                </div>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">Previous Month</div>
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large previous" 
                  style={{ width: `${Math.min(previousMonthData.goalProgress, 100)}%` }}
                >
                  <span className="progress-text">{formatPercentage(previousMonthData.goalProgress)}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="goal-stats">
            <div className="goal-stat-item">
              <span className="stat-label">Progress Change</span>
              <span className={`stat-value ${goalProgressChange >= 0 ? 'positive' : 'negative'}`}>
                {goalProgressChange >= 0 ? '+' : ''}{formatPercentage(goalProgressChange)}%
              </span>
            </div>
            <div className="goal-stat-item">
              <span className="stat-label">Remaining</span>
              <span className="stat-value">{formatCurrency(currentGoal.targetAmount - currentGoal.savedAmount)}</span>
            </div>
            <div className="goal-stat-item">
              <span className="stat-label">Est. Completion</span>
              <span className="stat-value">{Math.ceil(currentGoal.daysRemaining / 30)} months</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render selected chart
  const renderChart = () => {
    switch (selectedChart) {
      case 'comparison':
        return renderComparisonChart();
      case 'expenses':
        return renderExpensePieChart();
      case 'trends':
        return renderTrendsChart();
      case 'goals':
        return renderGoalChart();
      default:
        return renderComparisonChart();
    }
  };

  // Loading state
  if (dashboardLoading && !dashboardApiData) {
    return (
      <div className="dashboard-module">
        <div className="loading-container">
          <GlobalLoading size="large" />
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="dashboard-module">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Dashboard</h3>
          <p>{dashboardError}</p>
          <button onClick={refetchDashboard} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
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
                <span>{balanceChange >= 0 ? '+' : ''}{formatPercentage(balanceChange)}% from last month</span>
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
              <div className="card-value">{formatPercentage(financialData.savingsRate)}%</div>
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
              {financialHealthData.status?.level || (healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Improvement')}
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
            <div className="stat-value">{formatPercentage(goalProgress)}%</div>
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
          income: realIncomes,
          expenses: realExpenses,
          goals: [currentGoal],
          balance: financialData.balance,
          healthScore: healthScore,
          categoryBreakdown: categoryBreakdown,
          financialHealth: financialHealthData
        }} 
      />

      {/* Statistical Visualization Section */}
      <section className="visualization-section">
        <div className="visualization-header">
          <h2 className="section-title">Financial Analytics</h2>
          <div className="chart-selector">
            <div className="dropdown-container">
              <button 
                className="dropdown-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="selected-option">
                  {chartOptions.find(option => option.value === selectedChart)?.icon} {chartOptions.find(option => option.value === selectedChart)?.label}
                </span>
                <svg 
                  className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  {chartOptions.map(option => (
                    <button
                      key={option.value}
                      className={`dropdown-item ${selectedChart === option.value ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedChart(option.value);
                        setShowDropdown(false);
                      }}
                    >
                      <span className="option-icon">{option.icon}</span>
                      <span className="option-label">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="chart-wrapper">
          {renderChart()}
        </div>
        
        {/* Comparison Summary Cards */}
        <div className="comparison-summary">
          <div className="summary-card-mini income-change">
            <div className="summary-icon">
              {incomeChange >= 0 ? '↗️' : '↘️'}
            </div>
            <div className="summary-content">
              <div className="summary-label">Income Change</div>
              <div className={`summary-value ${incomeChange >= 0 ? 'positive' : 'negative'}`}>
                {incomeChange >= 0 ? '+' : ''}{formatPercentage(incomeChange)}%
              </div>
              <div className="summary-detail">
                {formatCurrency(Math.abs(financialData.monthlyIncome - previousMonthData.income))} vs last month
              </div>
            </div>
          </div>
          
          <div className="summary-card-mini expense-change">
            <div className="summary-icon">
              {expenseChange <= 0 ? '↘️' : '↗️'}
            </div>
            <div className="summary-content">
              <div className="summary-label">Expense Change</div>
              <div className={`summary-value ${expenseChange <= 0 ? 'positive' : 'negative'}`}>
                {expenseChange >= 0 ? '+' : ''}{formatPercentage(expenseChange)}%
              </div>
              <div className="summary-detail">
                {formatCurrency(Math.abs(financialData.monthlyExpenses - previousMonthData.expenses))} vs last month
              </div>
            </div>
          </div>
          
          <div className="summary-card-mini goal-change">
            <div className="summary-icon">
              {goalProgressChange >= 0 ? '🚀' : '🐢'}
            </div>
            <div className="summary-content">
              <div className="summary-label">Goal Progress</div>
              <div className={`summary-value ${goalProgressChange >= 0 ? 'positive' : 'negative'}`}>
                {goalProgressChange >= 0 ? '+' : ''}{formatPercentage(goalProgressChange)}%
              </div>
              <div className="summary-detail">
                {formatPercentage(Math.abs(goalProgressChange))}% vs last month
              </div>
            </div>
          </div>
          
          <div className="summary-card-mini savings-rate">
            <div className="summary-icon">
              {savingsRateChange >= 0 ? '📈' : '📉'}
            </div>
            <div className="summary-content">
              <div className="summary-label">Savings Rate</div>
              <div className={`summary-value ${savingsRateChange >= 0 ? 'positive' : 'negative'}`}>
                {formatPercentage(financialData.savingsRate)}%
              </div>
              <div className="summary-detail">
                {savingsRateChange >= 0 ? '+' : ''}{formatPercentage(savingsRateChange)}% vs last month
              </div>
            </div>
          </div>
        </div>
      </section>

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
            {financialHealthData.status?.message || 
            (healthScore >= 80 
              ? "Excellent financial health! Consider diversifying your investments or increasing your emergency fund target."
              : healthScore >= 60 
              ? "Good progress! Try to increase your savings rate by 5% to improve your financial health score."
              : "Focus on tracking expenses and setting a monthly budget. Small improvements lead to big results!"
            )}
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