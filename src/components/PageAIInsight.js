import React, { useState, useEffect } from 'react';
import './PageAIInsight.css';

const PageAIInsight = ({ page, data = [] }) => {
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    const generatePageInsight = () => {
      switch (page) {
        case 'income':
          return generateIncomeInsight(data);
        case 'expense':
          return generateExpenseInsight(data);
        case 'goal':
          return generateGoalInsight(data);
        case 'reports':
          return generateReportsInsight(data);
        case 'settings':
          return generateSettingsInsight();
        default:
          return null;
      }
    };

    setInsight(generatePageInsight());
  }, [page, data]);

  const generateIncomeInsight = (incomeData) => {
    if (!incomeData || incomeData.length === 0) {
      return {
        type: 'tip',
        message: 'Start by adding your primary income source to track your earning patterns.',
        suggestion: 'Regular income tracking helps with budgeting and financial planning.'
      };
    }

    const totalIncome = incomeData.reduce((sum, income) => sum + income.amount, 0);
    const avgIncome = totalIncome / incomeData.length;
    
    if (incomeData.length >= 3) {
      return {
        type: 'insight',
        message: `Your average income per entry is $${avgIncome.toFixed(2)}.`,
        suggestion: 'Consider setting up automatic savings for 20% of each income deposit.'
      };
    }

    return {
      type: 'tip',
      message: 'Track multiple income sources to get a complete financial picture.',
      suggestion: 'Include side hustles, investments, and any other income streams.'
    };
  };

  const generateExpenseInsight = (expenseData) => {
    if (!expenseData || expenseData.length === 0) {
      return {
        type: 'tip',
        message: 'Record your daily expenses to identify spending patterns.',
        suggestion: 'Even small purchases add up - track everything for better awareness.'
      };
    }

    const categoryTotals = expenseData.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
      const percentage = ((topCategory[1] / totalExpenses) * 100).toFixed(1);
      
      return {
        type: 'warning',
        message: `${topCategory[0]} accounts for ${percentage}% of your expenses.`,
        suggestion: percentage > 40 ? 'Consider setting a budget limit for this category.' : 'Your spending is well distributed across categories.'
      };
    }

    return {
      type: 'insight',
      message: 'You\'re building good expense tracking habits.',
      suggestion: 'Continue recording expenses to identify optimization opportunities.'
    };
  };

  const generateGoalInsight = (goalData) => {
    if (!goalData || goalData.length === 0) {
      return {
        type: 'tip',
        message: 'Set specific, measurable financial goals to stay motivated.',
        suggestion: 'Start with an emergency fund of 3-6 months of expenses.'
      };
    }

    const goal = goalData[0];
    const progress = (goal.savedAmount / goal.targetAmount) * 100;
    
    if (progress < 25) {
      return {
        type: 'motivation',
        message: 'Every dollar saved brings you closer to your goal.',
        suggestion: 'Consider automating small weekly transfers to build momentum.'
      };
    } else if (progress > 75) {
      return {
        type: 'success',
        message: 'Excellent progress on your savings goal!',
        suggestion: 'You\'re in the final stretch - maintain your saving discipline.'
      };
    }

    return {
      type: 'insight',
      message: `You're ${progress.toFixed(1)}% of the way to your goal.`,
      suggestion: 'Stay consistent with your savings plan to reach your target.'
    };
  };

  const generateReportsInsight = (reportData) => {
    return {
      type: 'insight',
      message: 'Visual data helps identify trends you might miss in raw numbers.',
      suggestion: 'Review your reports monthly to adjust your financial strategy.'
    };
  };

  const generateSettingsInsight = () => {
    return {
      type: 'tip',
      message: 'Customize notifications to stay on top of your financial goals.',
      suggestion: 'Enable budget alerts and goal reminders for better financial discipline.'
    };
  };

  if (!insight) return null;

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <path d="M12 9v4"></path>
            <path d="m12 17 .01 0"></path>
          </svg>
        );
      case 'success':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        );
      case 'motivation':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        );
      case 'insight':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="m12 8 .01 0"></path>
          </svg>
        );
    }
  };

  return (
    <div className={`page-ai-insight ${insight.type}`}>
      <div className="insight-compact-content">
        <div className={`insight-compact-icon ${insight.type}`}>
          {getInsightIcon(insight.type)}
        </div>
        <div className="insight-compact-text">
          <p className="insight-compact-message">{insight.message}</p>
          <p className="insight-compact-suggestion">{insight.suggestion}</p>
        </div>
      </div>
    </div>
  );
};

export default PageAIInsight;