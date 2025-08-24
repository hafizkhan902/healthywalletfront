import React, { useState, useEffect } from 'react';
import './Reports.css';
import PageAIInsight from './PageAIInsight';

const Reports = () => {
  // Mock data - in real app, this would come from API/database
  const [expenseData] = useState([
    { id: 1, amount: 450.50, category: 'Food', date: '2024-01-20', note: 'Groceries and dining' },
    { id: 2, amount: 320.00, category: 'Bills', date: '2024-01-18', note: 'Utilities' },
    { id: 3, amount: 180.00, category: 'Transport', date: '2024-01-17', note: 'Gas and maintenance' },
    { id: 4, amount: 240.00, category: 'Entertainment', date: '2024-01-15', note: 'Movies and subscriptions' },
    { id: 5, amount: 89.99, category: 'Other', date: '2024-01-12', note: 'Miscellaneous' },
    { id: 6, amount: 680.00, category: 'Bills', date: '2024-01-10', note: 'Rent' },
    { id: 7, amount: 120.00, category: 'Food', date: '2024-01-08', note: 'Restaurant' },
    { id: 8, amount: 45.00, category: 'Transport', date: '2024-01-05', note: 'Public transport' },
  ]);

  const [incomeData] = useState([
    { id: 1, amount: 3500.00, source: 'Salary', date: '2024-01-15' },
    { id: 2, amount: 500.00, source: 'Freelance', date: '2024-01-10' },
    { id: 3, amount: 1420.00, source: 'Investment', date: '2024-01-05' },
  ]);

  // Calculate expense categories for pie chart
  const calculateCategoryData = () => {
    const categories = ['Food', 'Bills', 'Transport', 'Entertainment', 'Other'];
    const categoryTotals = categories.map(category => {
      const total = expenseData
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return { category, amount: total };
    }).filter(item => item.amount > 0);

    const totalExpenses = categoryTotals.reduce((sum, item) => sum + item.amount, 0);
    
    return categoryTotals.map(item => ({
      ...item,
      percentage: ((item.amount / totalExpenses) * 100).toFixed(1)
    }));
  };

  // Calculate monthly data for bar chart
  const calculateMonthlyData = () => {
    const months = ['Dec', 'Jan', 'Feb']; // Last 3 months for demo
    const monthlyData = months.map(month => {
      // Mock data for demonstration
      const monthlyIncome = month === 'Jan' ? 5420 : month === 'Dec' ? 4800 : 5200;
      const monthlyExpenses = month === 'Jan' ? 2125 : month === 'Dec' ? 2400 : 1900;
      
      return {
        month,
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings: monthlyIncome - monthlyExpenses
      };
    });

    return monthlyData;
  };

  const categoryData = calculateCategoryData();
  const monthlyData = calculateMonthlyData();
  const totalExpenses = categoryData.reduce((sum, item) => sum + item.amount, 0);

  // Colors for categories
  const categoryColors = {
    'Food': '#e53e3e',
    'Bills': '#3182ce',
    'Transport': '#38a169',
    'Entertainment': '#805ad5',
    'Other': '#d69e2e'
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Generate pie chart SVG
  const generatePieChart = () => {
    if (categoryData.length === 0) return null;

    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    let currentAngle = 0;

    const paths = categoryData.map(item => {
      const percentage = parseFloat(item.percentage);
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
      const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      currentAngle += angle;

      return {
        path: pathData,
        color: categoryColors[item.category],
        category: item.category,
        percentage: item.percentage,
        amount: item.amount
      };
    });

    return paths;
  };

  // Generate bar chart data
  const generateBarChart = () => {
    const maxValue = Math.max(...monthlyData.map(item => Math.max(item.income, item.expenses)));
    const chartHeight = 200;
    const barWidth = 60;
    const spacing = 40;

    return monthlyData.map((item, index) => {
      const incomeHeight = (item.income / maxValue) * chartHeight;
      const expenseHeight = (item.expenses / maxValue) * chartHeight;
      const x = index * (barWidth * 2 + spacing) + 20;

      return {
        ...item,
        incomeHeight,
        expenseHeight,
        incomeX: x,
        expenseX: x + barWidth + 10,
        incomeY: chartHeight - incomeHeight,
        expenseY: chartHeight - expenseHeight
      };
    });
  };

  const pieChartPaths = generatePieChart();
  const barChartData = generateBarChart();

  return (
    <div className="reports-module">
      {/* Header */}
      <header className="module-header">
        <div className="header-content">
          <h1 className="module-title">Reports & Analytics</h1>
          <p className="module-subtitle">Visual insights into your financial data</p>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="summary-section">
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-content">
              <span className="summary-label">Total Expenses</span>
              <span className="summary-value">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="summary-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-content">
              <span className="summary-label">Categories</span>
              <span className="summary-value">{categoryData.length}</span>
            </div>
            <div className="summary-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-content">
              <span className="summary-label">Avg Monthly</span>
              <span className="summary-value">{formatCurrency(monthlyData.reduce((sum, item) => sum + item.expenses, 0) / monthlyData.length)}</span>
            </div>
            <div className="summary-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insight */}
      <PageAIInsight page="reports" data={categoryData} />

      {/* Charts Section */}
      <section className="charts-section">
        <div className="charts-grid">
          {/* Pie Chart - Expense Categories */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Expenses by Category</h2>
              <p>Breakdown of your spending patterns</p>
            </div>
            
            {categoryData.length > 0 ? (
              <div className="pie-chart-container">
                <div className="pie-chart">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {pieChartPaths && pieChartPaths.map((item, index) => (
                      <g key={index}>
                        <path
                          d={item.path}
                          fill={item.color}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="pie-slice"
                        />
                      </g>
                    ))}
                  </svg>
                </div>
                
                <div className="pie-legend">
                  {categoryData.map((item, index) => (
                    <div key={index} className="legend-item">
                      <div 
                        className="legend-color" 
                        style={{ backgroundColor: categoryColors[item.category] }}
                      ></div>
                      <div className="legend-content">
                        <span className="legend-category">{item.category}</span>
                        <span className="legend-amount">{formatCurrency(item.amount)}</span>
                        <span className="legend-percentage">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chart-empty">
                <p>No expense data available</p>
              </div>
            )}
          </div>

          {/* Bar Chart - Income vs Expenses */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Monthly Income vs Expenses</h2>
              <p>Track your financial performance over time</p>
            </div>
            
            <div className="bar-chart-container">
              <div className="bar-chart">
                <svg width="320" height="280" viewBox="0 0 320 280">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="200" fill="url(#grid)" y="20"/>
                  
                  {/* Bars */}
                  {barChartData.map((item, index) => (
                    <g key={index}>
                      {/* Income bar */}
                      <rect
                        x={item.incomeX}
                        y={item.incomeY + 20}
                        width="30"
                        height={item.incomeHeight}
                        fill="#38a169"
                        rx="2"
                        className="bar-income"
                      />
                      {/* Expense bar */}
                      <rect
                        x={item.expenseX}
                        y={item.expenseY + 20}
                        width="30"
                        height={item.expenseHeight}
                        fill="#e53e3e"
                        rx="2"
                        className="bar-expense"
                      />
                      {/* Month label */}
                      <text
                        x={item.incomeX + 35}
                        y={240}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#718096"
                        fontWeight="500"
                      >
                        {item.month}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              <div className="bar-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#38a169' }}></div>
                  <span>Income</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#e53e3e' }}></div>
                  <span>Expenses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Summary Table */}
      <section className="table-section">
        <div className="table-card">
          <div className="table-header">
            <h2>Monthly Summary</h2>
            <p>Detailed breakdown of income, expenses, and savings</p>
          </div>
          
          <div className="table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Savings</th>
                  <th>Savings Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item, index) => (
                  <tr key={index}>
                    <td className="month-cell">{item.month} 2024</td>
                    <td className="income-cell">{formatCurrency(item.income)}</td>
                    <td className="expense-cell">{formatCurrency(item.expenses)}</td>
                    <td className={`savings-cell ${item.savings >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(item.savings)}
                    </td>
                    <td className="rate-cell">
                      {((item.savings / item.income) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;