import React, { useState, useEffect } from 'react';
import './Goal.css';
import PageAIInsight from './PageAIInsight';

const Goal = () => {
  // State for goal (MVP supports one goal, but designed for multiple)
  const [currentGoal, setCurrentGoal] = useState({
    id: 1,
    name: "Emergency Fund",
    targetAmount: 10000,
    savedAmount: 3500,
    user_id: 1,
    createdDate: '2024-01-01',
    targetDate: '2024-12-31'
  });

  // State for form
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: ''
  });

  // State for saving money form
  const [savingData, setSavingData] = useState({
    amount: ''
  });

  // State for UI
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showSavingForm, setShowSavingForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Calculate goal progress
  const goalProgress = currentGoal ? ((currentGoal.savedAmount / currentGoal.targetAmount) * 100) : 0;
  const remainingAmount = currentGoal ? (currentGoal.targetAmount - currentGoal.savedAmount) : 0;
  
  // Calculate days until target
  const daysUntilTarget = currentGoal ? Math.ceil((new Date(currentGoal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Calculate required monthly savings
  const monthsRemaining = Math.max(1, Math.ceil(daysUntilTarget / 30));
  const requiredMonthlySaving = remainingAmount / monthsRemaining;

  // Handle goal form submission
  const handleGoalSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      alert('Please fill all fields');
      return;
    }

    if (parseFloat(formData.targetAmount) <= 0) {
      alert('Target amount must be greater than 0');
      return;
    }

    const targetDate = new Date(formData.targetDate);
    const today = new Date();
    if (targetDate <= today) {
      alert('Target date must be in the future');
      return;
    }

    if (isEditing && currentGoal) {
      // Update existing goal
      setCurrentGoal({
        ...currentGoal,
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate
      });
    } else {
      // Create new goal (replace current for MVP)
      setCurrentGoal({
        id: 1,
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        savedAmount: 0,
        user_id: 1,
        createdDate: new Date().toISOString().split('T')[0],
        targetDate: formData.targetDate
      });
    }

    // Reset form
    setFormData({
      name: '',
      targetAmount: '',
      targetDate: ''
    });
    setShowGoalForm(false);
    setIsEditing(false);
  };

  // Handle saving money
  const handleSavingSubmit = (e) => {
    e.preventDefault();
    
    if (!savingData.amount) {
      alert('Please enter an amount');
      return;
    }

    const amount = parseFloat(savingData.amount);
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (currentGoal) {
      const newSavedAmount = currentGoal.savedAmount + amount;
      setCurrentGoal({
        ...currentGoal,
        savedAmount: Math.min(newSavedAmount, currentGoal.targetAmount) // Don't exceed target
      });
    }

    // Reset form
    setSavingData({ amount: '' });
    setShowSavingForm(false);
  };

  // Handle edit goal
  const handleEditGoal = () => {
    if (currentGoal) {
      setFormData({
        name: currentGoal.name,
        targetAmount: currentGoal.targetAmount.toString(),
        targetDate: currentGoal.targetDate
      });
      setIsEditing(true);
      setShowGoalForm(true);
    }
  };

  // Handle delete goal
  const handleDeleteGoal = () => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      setCurrentGoal(null);
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

  return (
    <div className="goal-module">
      {/* Hero Header Section */}
      <section className="hero-header">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Savings Goals</h1>
            <p className="hero-subtitle">Set and track your financial objectives with smart goal management</p>
          </div>
          <div className="hero-actions">
            {currentGoal ? (
              <button 
                className={`primary-action-btn ${showSavingForm ? 'active' : ''}`}
                onClick={() => showSavingForm ? setShowSavingForm(false) : setShowSavingForm(true)}
              >
                {showSavingForm ? (
                  <>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Savings
                  </>
                )}
              </button>
            ) : (
              <button 
                className={`primary-action-btn ${showGoalForm ? 'active' : ''}`}
                onClick={() => showGoalForm ? setShowGoalForm(false) : setShowGoalForm(true)}
              >
                {showGoalForm ? (
                  <>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                    </svg>
                    Create Goal
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Goal Display or Empty State */}
      {currentGoal ? (
        <>
          {/* Financial Overview Dashboard */}
          <section className="financial-overview">
            <h2 className="section-title">Goal Overview</h2>
            <div className="overview-grid">
              <div className="overview-card featured">
                <div className="card-content">
                  <div className="card-header">
                    <span className="card-label">Progress</span>
                    <div className="card-icon primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                      </svg>
                    </div>
                  </div>
                  <div className="card-value">{goalProgress.toFixed(1)}%</div>
                  <div className="card-trend positive">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    <span>Goal completion</span>
                  </div>
                  <div className="progress-bar-modern">
                    <div className="progress-fill-modern" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="overview-card">
                <div className="card-content">
                  <div className="card-header">
                    <span className="card-label">Saved Amount</span>
                    <div className="card-icon secondary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="card-value">{formatCurrency(currentGoal.savedAmount)}</div>
                  <div className="card-trend neutral">
                    <span>Current savings</span>
                  </div>
                </div>
              </div>
              
              <div className="overview-card">
                <div className="card-content">
                  <div className="card-header">
                    <span className="card-label">Remaining</span>
                    <div className="card-icon tertiary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="card-value">{formatCurrency(remainingAmount)}</div>
                  <div className="card-trend neutral">
                    <span>Still needed</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Goal Details Section */}
          <section className="goal-details-section">
            <div className="goal-details-card">
              <div className="goal-info">
                <div className="goal-name-section">
                  <h3 className="goal-name-modern">{currentGoal.name}</h3>
                  <div className="goal-meta">
                    <div className="goal-target">
                      <span className="meta-label">Target:</span>
                      <span className="meta-value">{formatCurrency(currentGoal.targetAmount)}</span>
                    </div>
                    <div className="goal-date">
                      <span className="meta-label">Due:</span>
                      <span className={`meta-value ${daysUntilTarget < 30 ? 'urgent' : ''}`}>
                        {formatDate(currentGoal.targetDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="goal-actions-modern">
                  <button className="action-btn-modern edit" onClick={handleEditGoal} title="Edit goal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button className="action-btn-modern delete" onClick={handleDeleteGoal} title="Delete goal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="goal-insights">
                <div className="insight-item">
                  <span className="insight-label">Days Remaining</span>
                  <span className={`insight-value ${daysUntilTarget < 30 ? 'urgent' : ''}`}>
                    {daysUntilTarget > 0 ? daysUntilTarget : 0}
                  </span>
                </div>
                <div className="insight-item">
                  <span className="insight-label">Monthly Target</span>
                  <span className="insight-value">{formatCurrency(requiredMonthlySaving)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* AI Insight */}
          <PageAIInsight page="goal" data={[currentGoal]} />

          {/* Quick Add Savings Form - Compact Design */}
          {showSavingForm && (
            <section className="quick-add-section">
              <div className="quick-add-card">
                <form className="quick-add-form" onSubmit={handleSavingSubmit}>
                  <div className="quick-form-header">
                    <div className="form-title-compact">
                      <svg className="form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>Add to Savings</span>
                    </div>
                  </div>
                  
                  <div className="quick-form-grid-single">
                    <div className="input-compact">
                      <label className="input-label">Amount</label>
                      <div className="input-wrapper-compact">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={savingData.amount}
                          onChange={(e) => setSavingData({amount: e.target.value})}
                          className="input-compact-field amount"
                          required
                        />
                      </div>
                    </div>

                    <div className="input-compact action-field">
                      <button type="submit" className="submit-compact">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Add to Goal
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </section>
          )}
        </>
      ) : (
        /* Revolutionary Empty State */
        <section className="records-section">
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                </svg>
              </div>
            </div>
            <div className="empty-content">
              <h3 className="empty-title">Set Your First Savings Goal</h3>
              <p className="empty-description">Define a financial target and track your progress toward achieving it. Start building your financial future today.</p>
              <button 
                className="empty-action-btn"
                onClick={() => setShowGoalForm(true)}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                </svg>
                Create Your First Goal
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Goal Form */}
      {showGoalForm && (
        <section className="quick-add-section">
          <div className="quick-add-card">
            <form className="quick-add-form" onSubmit={handleGoalSubmit}>
              <div className="quick-form-header">
                <div className="form-title-compact">
                  <svg className="form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"></polygon>
                  </svg>
                  <span>{isEditing ? 'Edit Goal' : 'Create New Goal'}</span>
                </div>
              </div>
              
              <div className="quick-form-grid">
                <div className="input-compact">
                  <label className="input-label">Goal Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Emergency Fund, Vacation"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-compact-field"
                    required
                  />
                </div>

                <div className="input-compact">
                  <label className="input-label">Target Amount</label>
                  <div className="input-wrapper-compact">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                      className="input-compact-field amount"
                      required
                    />
                  </div>
                </div>

                <div className="input-compact">
                  <label className="input-label">Target Date</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-compact-field"
                    required
                  />
                </div>

                <div className="input-compact action-field">
                  <button type="submit" className="submit-compact">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};

export default Goal;