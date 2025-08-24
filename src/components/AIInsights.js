import React, { useState, useEffect } from 'react';
import './AIInsights.css';

const AIInsights = ({ financialData, expenses = [], income = [], goals = [] }) => {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [insights, setInsights] = useState([]);

  // Generate smart insights based on financial data
  useEffect(() => {
    const generateInsights = () => {
      const generatedInsights = [];
      
      // Calculate spending patterns
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
      // Expense category analysis
      const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});
      
      const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];
      
      // Generate insights based on data
      if (savingsRate < 10) {
        generatedInsights.push({
          type: 'warning',
          title: 'Low Savings Rate Alert',
          message: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income.`,
          suggestion: 'Consider reviewing your expense categories to identify areas for reduction.',
          actionText: 'Review Expenses',
          priority: 'high'
        });
      } else if (savingsRate > 30) {
        generatedInsights.push({
          type: 'success',
          title: 'Excellent Savings Performance',
          message: `Outstanding! You're saving ${savingsRate.toFixed(1)}% of your income.`,
          suggestion: 'Consider investing your surplus funds to accelerate wealth building.',
          actionText: 'Explore Goals',
          priority: 'medium'
        });
      }
      
      if (topCategory && totalExpenses > 0) {
        const categoryPercentage = (topCategory[1] / totalExpenses) * 100;
        if (categoryPercentage > 40) {
          generatedInsights.push({
            type: 'insight',
            title: 'Spending Pattern Analysis',
            message: `${topCategory[0]} represents ${categoryPercentage.toFixed(1)}% of your total expenses.`,
            suggestion: 'This category dominates your spending. Consider setting a specific budget limit.',
            actionText: 'Set Budget',
            priority: 'medium'
          });
        }
      }
      
      // Goal-related insights
      if (goals.length > 0) {
        const activeGoal = goals[0];
        const monthsToGoal = 12; // Simplified calculation
        const monthlyTarget = (activeGoal.targetAmount - activeGoal.savedAmount) / monthsToGoal;
        const currentMonthlySavings = savingsRate * totalIncome / 100;
        
        if (monthlyTarget > currentMonthlySavings) {
          generatedInsights.push({
            type: 'goal',
            title: 'Goal Achievement Forecast',
            message: `To reach your ${activeGoal.name} goal, you need to save $${monthlyTarget.toFixed(2)}/month.`,
            suggestion: `Increase monthly savings by $${(monthlyTarget - currentMonthlySavings).toFixed(2)} to stay on track.`,
            actionText: 'Adjust Goal',
            priority: 'high'
          });
        }
      }
      
      // Default insights if no data-driven insights
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          type: 'tip',
          title: 'Smart Financial Tip',
          message: 'Start tracking your daily expenses to identify spending patterns.',
          suggestion: 'Even small expenses add up. Recording everything helps build awareness.',
          actionText: 'Add Expense',
          priority: 'low'
        });
      }
      
      return generatedInsights;
    };
    
    setInsights(generateInsights());
  }, [financialData, expenses, income, goals]);

  // Rotate insights every 15 seconds
  useEffect(() => {
    if (insights.length > 1) {
      const interval = setInterval(() => {
        setCurrentInsight((prev) => (prev + 1) % insights.length);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [insights]);

  if (insights.length === 0) return null;

  const insight = insights[currentInsight];

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <path d="M12 9v4"></path>
            <path d="m12 17 .01 0"></path>
          </svg>
        );
      case 'success':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        );
      case 'goal':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
          </svg>
        );
      case 'insight':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11H1v3h8v3l3-4-3-4v2z"></path>
            <path d="M22 12h-7v3h7v-3z"></path>
            <circle cx="19" cy="10.5" r="2.5"></circle>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="m12 8 .01 0"></path>
          </svg>
        );
    }
  };

  return (
    <section className="ai-insights-section">
      <div className="ai-insights-header">
        <div className="ai-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 12l10 10 10-10-10-10z"></path>
            <path d="M12 6l-4 4 4 4 4-4-4-4z"></path>
          </svg>
          <span>AI Insights</span>
        </div>
        {insights.length > 1 && (
          <div className="insight-indicators">
            {insights.map((_, index) => (
              <div 
                key={index} 
                className={`indicator ${index === currentInsight ? 'active' : ''}`}
                onClick={() => setCurrentInsight(index)}
              ></div>
            ))}
          </div>
        )}
      </div>
      
      <div className={`ai-insights-card ${insight.type}`}>
        <div className="insight-content">
          <div className="insight-header">
            <div className={`insight-icon ${insight.type}`}>
              {getInsightIcon(insight.type)}
            </div>
            <div className="insight-text">
              <h3 className="insight-title">{insight.title}</h3>
              <p className="insight-message">{insight.message}</p>
            </div>
          </div>
          
          <div className="insight-suggestion">
            <p className="suggestion-text">{insight.suggestion}</p>
            <button className={`insight-action-btn ${insight.type}`}>
              {insight.actionText}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIInsights;