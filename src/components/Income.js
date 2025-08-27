import React, { useState } from 'react';
import './Income.css';
import PageAIInsight from './PageAIInsight';
import { useMutation, usePaginatedAPI } from '../hooks/useAPI';
import { incomeAPI } from '../services/api';
import { scrollToForm } from '../utils/scrollUtils';

const Income = () => {
  // Fetch income data from backend with pagination
  const {
    data: incomes,
    loading: incomesLoading,
    error: incomesError,
    fetchData: refetchIncomes
  } = usePaginatedAPI(incomeAPI.getIncomes, { 
    page: 1, 
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  }, {
    onError: (error) => {
      console.error('Failed to fetch incomes:', error);
    }
  });

  // Fetch income summary (for future use)
  // const {
  //   data: incomeSummary,
  //   loading: summaryLoading
  // } = useAPI(incomeAPI.getIncomeSummary);

  // Mutation for creating new income
  const {
    mutate: createIncomeAPI
    // loading: createLoading,
    // error: createError
  } = useMutation(incomeAPI.createIncome, {
    onSuccess: () => {
      refetchIncomes();
      setShowForm(false);
      setFormData({
        amount: '',
        source: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  });

  // Mutation for updating income
  const {
    mutate: updateIncomeAPI
    // loading: updateLoading
  } = useMutation(incomeAPI.updateIncome, {
    onSuccess: () => {
      refetchIncomes();
      setEditingId(null);
      setShowForm(false);
    }
  });

  // Mutation for deleting income
  const {
    mutate: deleteIncomeAPI
    // loading: deleteLoading
  } = useMutation(incomeAPI.deleteIncome, {
    onSuccess: () => {
      refetchIncomes();
    }
  });

  // State for form
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0]
  });

  // State for editing
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Calculate monthly summary with safe array handling
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const incomesArray = Array.isArray(incomes) ? incomes : [];
  
  // Debug logging (temporary)
  if (incomesArray.length > 0) {
    console.log('✅ Income data loaded:', incomesArray.length, 'records');
  }
  
  const monthlyIncomes = incomesArray.filter(income => 
    income.date && income.date.startsWith(currentMonth)
  );
  const monthlyTotal = monthlyIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);
  const totalIncome = incomesArray.reduce((sum, income) => sum + (income.amount || 0), 0);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.source || !formData.date) {
      alert('Please fill all fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    try {
      const incomeData = {
        amount: parseFloat(formData.amount),
        source: formData.source,
        category: 'salary', // Default category
        date: formData.date,
        description: formData.source
      };

      if (editingId) {
        // Update existing income via API
        await updateIncomeAPI(editingId, incomeData);
      } else {
        // Add new income via API
        await createIncomeAPI(incomeData);
      }
    } catch (error) {
      console.error('Failed to save income:', error);
      alert('Failed to save income. Please try again.');
    }
  };

  // Handle edit with auto-scroll
  const handleEdit = (income) => {
    setFormData({
      amount: income.amount.toString(),
      source: income.source,
      date: income.date ? new Date(income.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditingId(income._id || income.id); // Handle both _id and id
    setShowForm(true);
    
    // Scroll to form after state update
    setTimeout(() => {
      scrollToForm('.quick-add-section', {
        block: 'center',
        offset: -50
      });
    }, 100);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await deleteIncomeAPI(id);
      } catch (error) {
        console.error('Failed to delete income:', error);
        alert('Failed to delete income. Please try again.');
      }
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setFormData({
      amount: '',
      source: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Handle show form with auto-scroll
  const handleShowForm = () => {
    setShowForm(true);
    // Scroll to form after state update
    setTimeout(() => {
      scrollToForm('.quick-add-section', {
        block: 'center',
        offset: -50
      });
    }, 100);
  };

  // Format currency with safety checks
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return '$0.00';
    }
    return `$${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (incomesLoading && !incomesArray.length) {
    return (
      <div className="income-module">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your income data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (incomesError) {
    return (
      <div className="income-module">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Income Data</h3>
          <p>{incomesError}</p>
          <button onClick={refetchIncomes} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="income-module">
      {/* Hero Header Section */}
      <section className="hero-header">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Income Management</h1>
            <p className="hero-subtitle">Track your earnings and build wealth with smart income monitoring</p>
          </div>
          <div className="hero-actions">
            <button 
              className={`primary-action-btn ${showForm ? 'active' : ''}`}
              onClick={() => showForm ? handleCancel() : handleShowForm()}
            >
              {showForm ? (
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
                  Add New Income
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Financial Overview Dashboard */}
      <section className="financial-overview">
        <h2 className="section-title">Financial Overview</h2>
        <div className="overview-grid">
          <div className="overview-card featured">
            <div className="card-content">
              <div className="card-header">
                <span className="card-label">This Month</span>
                <div className="card-icon primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
              </div>
              <div className="card-value">{formatCurrency(monthlyTotal)}</div>
              <div className="card-trend positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                <span>Monthly earnings</span>
              </div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="card-content">
              <div className="card-header">
                <span className="card-label">Total Income</span>
                <div className="card-icon secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
              </div>
              <div className="card-value">{formatCurrency(totalIncome)}</div>
              <div className="card-trend neutral">
                <span>All time earnings</span>
              </div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="card-content">
              <div className="card-header">
                <span className="card-label">Income Sources</span>
                <div className="card-icon tertiary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
              </div>
              <div className="card-value">{incomesArray.length}</div>
              <div className="card-trend neutral">
                <span>Active records</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insight */}
      <PageAIInsight page="income" data={incomesArray} />

      {/* Quick Add Income Form - Compact Design */}
      {showForm && (
        <section className="quick-add-section">
          <div className="quick-add-card">
            <form className="quick-add-form" onSubmit={handleSubmit}>
              <div className="quick-form-header">
                <div className="form-title-compact">
                  <svg className="form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>{editingId ? 'Edit Income' : 'Quick Add Income'}</span>
                </div>
              </div>
              
              <div className="quick-form-grid">
                <div className="input-compact">
                  <label className="input-label">Amount</label>
                  <div className="input-wrapper-compact">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="input-compact-field amount"
                      required
                    />
                  </div>
                </div>

                <div className="input-compact">
                  <label className="input-label">Source</label>
                  <input
                    type="text"
                    placeholder="Salary, Freelance, etc."
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="input-compact-field"
                    required
                  />
                </div>

                <div className="input-compact">
                  <label className="input-label">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="input-compact-field"
                    required
                  />
                </div>

                <div className="input-compact action-field">
                  <button type="submit" className="submit-compact">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {editingId ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Income Records */}
      <section className="records-section">
        <div className="section-header">
          <h2 className="section-title">Income Records</h2>
          <div className="section-meta">
            <span className="record-count">{incomesArray.length} {incomesArray.length === 1 ? 'record' : 'records'}</span>
          </div>
        </div>
        
        {incomesArray.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
            </div>
            <div className="empty-content">
              <h3 className="empty-title">No income records yet</h3>
              <p className="empty-description">Start tracking your income by adding your first earning record. This will help you monitor your financial growth.</p>
              <button 
                className="empty-action-btn"
                onClick={handleShowForm}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Your First Income
              </button>
            </div>
          </div>
        ) : (
          <div className="records-grid">
            {incomesArray
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(income => (
              <div key={income._id || income.id} className="record-card">
                <div className="record-main">
                  <div className="record-amount">{formatCurrency(income.amount)}</div>
                  <div className="record-details">
                    <div className="record-source">{income.source}</div>
                    <div className="record-date">
                      <svg className="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {formatDate(income.date)}
                    </div>
                  </div>
                </div>
                <div className="record-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(income)}
                    title="Edit income record"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(income._id || income.id)}
                    title="Delete income record"
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
      </section>
    </div>
  );
};

export default Income;