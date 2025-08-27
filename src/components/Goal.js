import React, { useState, useEffect, useCallback } from 'react';
import './Goal.css';
import PageAIInsight from './PageAIInsight';
import { usePaginatedAPI, useMutation } from '../hooks/useAPI';
import { goalAPI } from '../services/api';
import { scrollToForm } from '../utils/scrollUtils';

const Goal = () => {
  // Goal categories as per backend validation
  const GOAL_CATEGORIES = [
    { value: 'emergency', label: 'Emergency Fund' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'investment', label: 'Investment' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'other', label: 'Other' }
  ];

  const PRIORITY_LEVELS = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  // State for goals summary
  const [goalsSummary, setGoalsSummary] = useState(null);
  
  // State for forms
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'emergency'
  });

  const [contributionData, setContributionData] = useState({
    amount: '',
    description: ''
  });

  // State for UI
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Memoized callbacks for API hooks
  const handleGoalsSuccess = useCallback((data) => {
    console.log('✅ Goals data loaded:', data);
  }, []);

  const handleGoalsError = useCallback((error) => {
    console.error('Failed to fetch goals:', error);
  }, []);

  // Fetch goals data from backend with pagination
  const {
    data: goals,
    loading: goalsLoading,
    error: goalsError,
    fetchData: refetchGoals
  } = usePaginatedAPI(goalAPI.getGoals, { 
    page: 1, 
    limit: 10,
    sortBy: '-createdAt'
  }, {
    onSuccess: handleGoalsSuccess,
    onError: handleGoalsError
  });

  // Mutation for creating new goal
  const {
    mutate: createGoalAPI
  } = useMutation(goalAPI.createGoal, {
    onSuccess: () => {
      refetchGoals();
      loadGoalsSummary();
      setShowGoalForm(false);
      resetForm();
    }
  });

  // Mutation for updating goal
  const {
    mutate: updateGoalAPI
  } = useMutation(goalAPI.updateGoal, {
    onSuccess: () => {
      refetchGoals();
      loadGoalsSummary();
      setIsEditing(false);
      setEditingId(null);
      setShowGoalForm(false);
      resetForm();
    }
  });

  // Mutation for deleting goal
  const {
    mutate: deleteGoalAPI
  } = useMutation(goalAPI.deleteGoal, {
    onSuccess: () => {
      refetchGoals();
      loadGoalsSummary();
    }
  });

  // Mutation for adding contribution
  const {
    mutate: contributeToGoalAPI
  } = useMutation(goalAPI.contributeToGoal, {
    onSuccess: () => {
      refetchGoals();
      loadGoalsSummary();
      setShowContributionForm(false);
      setSelectedGoalId(null);
      setContributionData({ amount: '', description: '' });
    }
  });

  // Load goals summary
  const loadGoalsSummary = async () => {
    try {
      const response = await goalAPI.getGoalsSummary();
      if (response.success) {
        setGoalsSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch goals summary:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      category: 'emergency'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return '$0.00';
    }
    return `$${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle goal form submission
  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      alert('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.targetAmount) <= 0) {
      alert('Target amount must be greater than 0');
      return;
    }

    try {
      const goalData = {
        title: formData.title,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        targetDate: new Date(formData.targetDate).toISOString(),
        category: formData.category
        // Note: priority is set automatically by backend
      };

      if (isEditing && editingId) {
        await updateGoalAPI(editingId, goalData);
      } else {
        await createGoalAPI(goalData);
      }
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal. Please try again.');
    }
  };

  // Handle contribution submission
  const handleContributionSubmit = async (e) => {
    e.preventDefault();
    
    if (!contributionData.amount || !selectedGoalId) {
      alert('Please enter a contribution amount');
      return;
    }

    if (parseFloat(contributionData.amount) <= 0) {
      alert('Contribution amount must be greater than 0');
      return;
    }

    try {
      const contribution = {
        amount: parseFloat(contributionData.amount),
        description: contributionData.description || 'Goal contribution'
      };

      await contributeToGoalAPI(selectedGoalId, contribution);
    } catch (error) {
      console.error('Failed to add contribution:', error);
      alert('Failed to add contribution. Please try again.');
    }
  };

  // Handle edit
  // Handle edit goal with auto-scroll
  const handleEdit = (goal) => {
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      category: goal.category
    });
    setEditingId(goal._id);
    setIsEditing(true);
    setShowGoalForm(true);
    
    // Scroll to form after state update
    setTimeout(() => {
      scrollToForm('.modal-overlay', {
        block: 'center',
        offset: -50
      });
    }, 100);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoalAPI(id);
      } catch (error) {
        console.error('Failed to delete goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  // Handle contribute
  const handleContribute = (goalId) => {
    setSelectedGoalId(goalId);
    setShowContributionForm(true);
  };

  // Load data on component mount
  useEffect(() => {
    loadGoalsSummary();
  }, []);

  // Safe array handling
  const goalsArray = Array.isArray(goals) ? goals : [];

  return (
    <div className="goal-module">
      <div className="hero-header">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Financial Goals</h1>
            <p className="hero-subtitle">Track your savings goals and make steady progress</p>
          </div>
          
          <div className="hero-actions">
            <button 
              className="primary-action-btn"
              onClick={() => {
                resetForm();
                setIsEditing(false);
                setEditingId(null);
                setShowGoalForm(true);
                
                // Scroll to form after state update
                setTimeout(() => {
                  scrollToForm('.modal-overlay', {
                    block: 'center',
                    offset: -50
                  });
                }, 100);
              }}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Add New Goal
            </button>
          </div>
        </div>
      </div>

      {/* Goals Summary */}
      {goalsSummary && (
        <div className="financial-overview">
          <h2 className="section-title">Goals Overview</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="card-content">
                <div className="card-header">
                  <span className="card-label">Total Goals</span>
                  <div className="card-icon primary">🎯</div>
                </div>
                <div className="card-value">{goalsSummary.totalGoals}</div>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="card-content">
                <div className="card-header">
                  <span className="card-label">Target Amount</span>
                  <div className="card-icon secondary">💰</div>
                </div>
                <div className="card-value">{formatCurrency(goalsSummary.totalTargetAmount)}</div>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="card-content">
                <div className="card-header">
                  <span className="card-label">Current Amount</span>
                  <div className="card-icon tertiary">📈</div>
                </div>
                <div className="card-value">{formatCurrency(goalsSummary.totalCurrentAmount)}</div>
              </div>
            </div>
            
            <div className="overview-card featured">
              <div className="card-content">
                <div className="card-header">
                  <span className="card-label">Overall Progress</span>
                  <div className="card-icon">⚡</div>
                </div>
                <div className="card-value">{goalsSummary.overallProgress?.toFixed(1) || 0}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {goalsLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your goals...</p>
        </div>
      )}

      {/* Error State */}
      {goalsError && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load goals</h3>
          <p>There was an error loading your goals. Please try again.</p>
          <button className="retry-button" onClick={refetchGoals}>
            Try Again
          </button>
        </div>
      )}

      {/* Goals List */}
      {!goalsLoading && !goalsError && (
        <div className="goal-details-section">
          {goalsArray.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No Goals Yet</h3>
              <p>Start your financial journey by creating your first savings goal.</p>
              <button 
                className="primary-action-btn"
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                  setShowGoalForm(true);
                  
                  // Scroll to form after state update
                  setTimeout(() => {
                    scrollToForm('.modal-overlay', {
                      block: 'center',
                      offset: -50
                    });
                  }, 100);
                }}
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="goal-cards-container">
              {goalsArray.map(goal => (
                <div key={goal._id} className="goal-card-modern">
                  {/* Card Header */}
                  <div className="goal-card-header">
                    <div className="goal-badge-section">
                      <div className="goal-category-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>{goal.category}</span>
                      </div>
                      <div className="goal-target-amount">{formatCurrency(goal.targetAmount)}</div>
                    </div>
                    
                    <div className="goal-info-section">
                      <h3 className="goal-title-text">{goal.title}</h3>
                      <div className="goal-due-date">
                        <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Due: {formatDate(goal.targetDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="goal-progress-container">
                    <div className="progress-amounts">
                      <span className="current-amount">{formatCurrency(goal.currentAmount)}</span>
                      <span className="progress-percentage">{goal.progressPercentage?.toFixed(1) || 0}%</span>
                    </div>
                    
                    <div className="progress-bar-container">
                      <div className="progress-bar-track">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${Math.min(goal.progressPercentage || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {goal.description && (
                      <div className="goal-description-text">{goal.description}</div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="goal-actions-container">
                    <button
                      className="goal-action-btn contribute-btn"
                      onClick={() => handleContribute(goal._id)}
                      disabled={goal.status === 'completed'}
                      title="Add contribution"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                    </button>

                    <button
                      className="goal-action-btn edit-btn"
                      onClick={() => handleEdit(goal)}
                      title="Edit goal"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    <button
                      className="goal-action-btn delete-btn"
                      onClick={() => handleDelete(goal._id)}
                      title="Delete goal"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Goal' : 'Create New Goal'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowGoalForm(false);
                  setIsEditing(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="goal-form">
              <div className="form-group">
                <label htmlFor="title">Goal Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description of your goal"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="targetAmount">Target Amount *</label>
                  <input
                    type="number"
                    id="targetAmount"
                    step="0.01"
                    min="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    placeholder="10000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currentAmount">Current Amount</label>
                  <input
                    type="number"
                    id="currentAmount"
                    step="0.01"
                    min="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="targetDate">Target Date *</label>
                <input
                  type="date"
                  id="targetDate"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    {GOAL_CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <div className="form-note">
                    Priority is automatically set by the system based on your goal's urgency and target date.
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowGoalForm(false);
                    setIsEditing(false);
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Form Modal */}
      {showContributionForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Contribution</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowContributionForm(false);
                  setSelectedGoalId(null);
                  setContributionData({ amount: '', description: '' });
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleContributionSubmit} className="contribution-form">
              <div className="form-group">
                <label htmlFor="amount">Contribution Amount *</label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0.01"
                  value={contributionData.amount}
                  onChange={(e) => setContributionData({...contributionData, amount: e.target.value})}
                  placeholder="100.00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contributionDescription">Description</label>
                <input
                  type="text"
                  id="contributionDescription"
                  value={contributionData.description}
                  onChange={(e) => setContributionData({...contributionData, description: e.target.value})}
                  placeholder="Optional note about this contribution"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowContributionForm(false);
                    setSelectedGoalId(null);
                    setContributionData({ amount: '', description: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <PageAIInsight />
    </div>
  );
};

export default Goal;