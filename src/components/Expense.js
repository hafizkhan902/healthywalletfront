import React, { useState, useEffect } from 'react';
import './Expense.css';
import PageAIInsight from './PageAIInsight';

const Expense = () => {
  // Predefined categories for MVP
  const categories = ['Food', 'Bills', 'Transport', 'Entertainment', 'Other'];

  // State for expense records
  const [expenses, setExpenses] = useState([
    { id: 1, amount: 45.50, category: 'Food', date: '2024-01-20', note: 'Lunch at restaurant', user_id: 1 },
    { id: 2, amount: 120.00, category: 'Bills', date: '2024-01-18', note: 'Electricity bill', user_id: 1 },
    { id: 3, amount: 25.00, category: 'Transport', date: '2024-01-17', note: 'Gas for car', user_id: 1 },
    { id: 4, amount: 60.00, category: 'Entertainment', date: '2024-01-15', note: 'Movie tickets', user_id: 1 },
    { id: 5, amount: 89.99, category: 'Bills', date: '2024-01-12', note: 'Internet bill', user_id: 1 },
  ]);

  // State for form
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  // State for editing and filtering
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, today, monthly
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate filtered expenses
  const getFilteredExpenses = () => {
    let filtered = expenses;

    // Filter by period
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    if (filterPeriod === 'today') {
      filtered = filtered.filter(expense => expense.date === today);
    } else if (filterPeriod === 'monthly') {
      filtered = filtered.filter(expense => expense.date.startsWith(currentMonth));
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Calculate summary statistics
  const filteredExpenses = getFilteredExpenses();
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = expenses.filter(expense => 
    expense.date.startsWith(new Date().toISOString().slice(0, 7))
  );
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Category breakdown
  const categoryTotals = categories.map(category => {
    const categoryExpenses = filteredExpenses.filter(exp => exp.category === category);
    const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { category, total, count: categoryExpenses.length };
  }).filter(item => item.total > 0);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.date) {
      alert('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (editingId) {
      // Update existing expense
      setExpenses(expenses.map(expense => 
        expense.id === editingId 
          ? { 
              ...expense, 
              amount: parseFloat(formData.amount), 
              category: formData.category, 
              date: formData.date,
              note: formData.note 
            }
          : expense
      ));
      setEditingId(null);
    } else {
      // Add new expense
      const newExpense = {
        id: Date.now(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        note: formData.note,
        user_id: 1
      };
      setExpenses([...expenses, newExpense]);
    }

    // Reset form
    setFormData({
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      note: expense.note || ''
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setFormData({
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Food': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      ),
      'Bills': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
      ),
      'Transport': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
          <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
          <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2"></path>
          <path d="M9 17v-6h4v6"></path>
        </svg>
      ),
      'Entertainment': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      ),
      'Other': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    };
    return icons[category] || icons['Other'];
  };

  return (
    <div className="expense-module">
      {/* Hero Header Section */}
      <section className="hero-header">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Expense Management</h1>
            <p className="hero-subtitle">Track your spending and optimize your financial health with smart expense monitoring</p>
          </div>
          <div className="hero-actions">
            <button 
              className={`primary-action-btn ${showForm ? 'active' : ''}`}
              onClick={() => showForm ? handleCancel() : setShowForm(true)}
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
                  Add New Expense
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
                    <polyline points="22 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                    <polyline points="17 18 23 18 23 12"></polyline>
                  </svg>
                </div>
              </div>
              <div className="card-value">{formatCurrency(monthlyTotal)}</div>
              <div className="card-trend negative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                  <polyline points="17 18 23 18 23 12"></polyline>
                </svg>
                <span>Monthly spending</span>
              </div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="card-content">
              <div className="card-header">
                <span className="card-label">Filtered Total</span>
                <div className="card-icon secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </div>
              </div>
              <div className="card-value">{formatCurrency(totalAmount)}</div>
              <div className="card-trend neutral">
                <span>All filtered expenses</span>
              </div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="card-content">
              <div className="card-header">
                <span className="card-label">Expense Records</span>
                <div className="card-icon tertiary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
              </div>
              <div className="card-value">{expenses.length}</div>
              <div className="card-trend neutral">
                <span>Active records</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insight */}
      <PageAIInsight page="expense" data={expenses} />

      {/* Quick Add Expense Form - Compact Design */}
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
                  <span>{editingId ? 'Edit Expense' : 'Quick Add Expense'}</span>
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
                  <label className="input-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-compact-field"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
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
              
              <div className="note-field-full">
                <div className="input-compact">
                  <label className="input-label">Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Lunch with colleagues"
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    className="input-compact-field"
                  />
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Smart Filters Section */}
      <section className="smart-filters-section">
        <h3 className="filter-title">Smart Filters</h3>
        <div className="filter-grid">
          <div className="filter-group-modern">
            <label className="filter-label">Time Period</label>
            <select 
              className="filter-select"
              value={filterPeriod} 
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="monthly">This Month</option>
            </select>
          </div>
          
          <div className="filter-group-modern">
            <label className="filter-label">Category</label>
            <select 
              className="filter-select"
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Expense Records */}
      <section className="records-section">
        <div className="section-header">
          <h2 className="section-title">Expense Records</h2>
          <div className="section-meta">
            <span className="record-count">{filteredExpenses.length} {filteredExpenses.length === 1 ? 'record' : 'records'}</span>
          </div>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="22 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                  <polyline points="17 18 23 18 23 12"></polyline>
                </svg>
              </div>
            </div>
            <div className="empty-content">
              <h3 className="empty-title">No expense records found</h3>
              <p className="empty-description">Start tracking your expenses by adding your first spending record. This will help you monitor and optimize your financial health.</p>
              <button 
                className="empty-action-btn"
                onClick={() => setShowForm(true)}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Your First Expense
              </button>
            </div>
          </div>
        ) : (
          <div className="records-grid">
            {filteredExpenses.map(expense => (
              <div key={expense.id} className="record-card">
                <div className="record-main">
                  <div className="record-amount">{formatCurrency(expense.amount)}</div>
                  <div className="record-details">
                    <div className="record-category">
                      <span className="category-icon">{getCategoryIcon(expense.category)}</span>
                      {expense.category}
                    </div>
                    <div className="record-date">
                      <svg className="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {formatDate(expense.date)}
                    </div>
                    {expense.note && (
                      <div className="record-note">{expense.note}</div>
                    )}
                  </div>
                </div>
                <div className="record-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(expense)}
                    title="Edit expense record"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(expense.id)}
                    title="Delete expense record"
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

export default Expense;