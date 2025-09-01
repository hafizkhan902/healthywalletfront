// 🚀 HealthyWallet API Service Layer
// Comprehensive backend integration following API_END_POINTS.md
// Cache bust: 2025-08-26-22:06 - Fixed proxy and API URL duplication

// Import test utility for development - DISABLED to prevent excessive requests
// import '../utils/apiTest.js';
import requestDeduplicator from '../utils/requestDeduplicator';
import { runNetworkDiagnostics } from '../utils/networkDiagnostics';

// Use proxy in development, full URL in production
// Handle cases where env already includes /api or not
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return '/api'; // Use proxy in development
  }
  
  // Production - handle env vars that may or may not include /api
  const envUrl = process.env.REACT_APP_BASE_API_URI || process.env.BASE_API_URI || 'http://localhost:2000';
  
  // If the env URL already ends with /api, use it as is
  // If not, append /api
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging for API URL - removed console.log statements

// Test backend connectivity on startup
const testConnection = async () => {
  try {
    // Health endpoint is at root level, not under /api
    const getHealthUrl = () => {
      if (process.env.NODE_ENV === 'development') {
        return '/health'; // Direct health endpoint via proxy
      }
      
      // Production - get base URL without /api for health check
      const envUrl = process.env.REACT_APP_BASE_API_URI || process.env.BASE_API_URI || 'http://localhost:2000';
      const baseUrl = envUrl.replace('/api', ''); // Remove /api if present
      return `${baseUrl}/health`;
    };
    
    const healthUrl = getHealthUrl();
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    // Backend connectivity test successful
    return response.ok;
  } catch (error) {
    // Backend connectivity test failed
    return false;
  }
};

// Run connectivity test on startup
testConnection().then(success => {
  if (!success) {
    // Run diagnostics after a short delay
    setTimeout(() => {
      runNetworkDiagnostics();
    }, 2000);
  }
});

// API Response handler
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;

  // Parse response body
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  // Response received

  // Handle non-ok responses
  if (!response.ok) {
    // Handle specific status codes
    switch (response.status) {
      case 400:
      case 401:
        // For auth endpoints, return the error response for proper handling
        return data; // Return the error response with success: false
      
      case 429:
        // Rate limiting - provide helpful message
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? `${Math.ceil(retryAfter / 60)} minutes` : 'a few minutes';
        return {
          success: false,
          message: `Too many requests. Please wait ${waitTime} before trying again.`,
          retryAfter: retryAfter,
          statusCode: 429
        };
      
      case 500:
        return {
          success: false,
          message: 'Server error. Please try again later.',
          statusCode: 500
        };
      
      default:
        // For other errors, throw
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
  }

  return data;
};

// Extracted request execution function with retry logic
const executeRequest = async (fullUrl, config, retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff
  
  try {
    // Making API request
    
    // POST request processing
    
    // Create AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(fullUrl, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Response received
    
    const result = await handleResponse(response);
    
    // API response processed
    return result;
  } catch (error) {
    // API request error occurred
    
    // Check if this is a network error that can be retried
    const isNetworkError = error.name === 'TypeError' && 
      (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'));
    const isTimeoutError = error.name === 'AbortError';
    const canRetry = (isNetworkError || isTimeoutError) && retryCount < maxRetries;
    
    if (canRetry) {
      // Retrying request
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return executeRequest(fullUrl, config, retryCount + 1);
    }
    
    // Error details logged internally
    
    // Network error handling
    if (isNetworkError) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please check if the server is running and CORS is properly configured.`);
    }
    
    if (isTimeoutError) {
      throw new Error(`Request timeout: The server took too long to respond. Please try again.`);
    }
    
    throw error;
  }
};

// API Request helper with deduplication
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    // Enhanced configuration for better CORS support
    credentials: 'include',
    mode: 'cors',
    cache: 'no-cache',
    ...options,
  };

  // Add auth header for protected routes
  if (token && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/login')) {
    config.headers.Authorization = `Bearer ${token}`;
    // Adding auth token
  } else if (!endpoint.includes('/auth/') && !endpoint.includes('/health')) {
    // No auth token found for protected endpoint
    
    // Settings endpoints require authentication
    if (endpoint.includes('/settings')) {
      // App will continue to work with localStorage for offline functionality
    }
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`;

  // Use request deduplication for GET requests to prevent double calls
  // Re-enable deduplication for auth endpoints to prevent excessive requests
  const shouldDeduplicate = (!config.method || config.method === 'GET');
  
  if (shouldDeduplicate) {
    return requestDeduplicator.execute(fullUrl, config, async () => {
      return await executeRequest(fullUrl, config);
    });
  } else {
    return await executeRequest(fullUrl, config);
  }
};

// 🔐 Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // User login
  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Get current user info
  getMe: async () => {
    return await apiRequest('/auth/me');
  },

  // Update password
  updatePassword: async (passwordData) => {
    return await apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
};

// 👤 User Management API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return await apiRequest('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Update user settings
  updateSettings: async (settingsData) => {
    return await apiRequest('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },

  // Get financial summary
  getFinancialSummary: async () => {
    return await apiRequest('/users/financial-summary');
  },

  // Get user achievements
  getAchievements: async () => {
    return await apiRequest('/users/achievements');
  },

  // Delete user account
  deleteAccount: async () => {
    return await apiRequest('/users/account', {
      method: 'DELETE',
    });
  }
};

// 💰 Income Management API
export const incomeAPI = {
  // Get all income entries
  getIncomes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/income?${queryString}` : '/income';
    return await apiRequest(endpoint);
  },

  // Create new income entry
  createIncome: async (incomeData) => {
    return await apiRequest('/income', {
      method: 'POST',
      body: JSON.stringify(incomeData),
    });
  },

  // Get income summary
  getIncomeSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/income/summary?${queryString}` : '/income/summary';
    return await apiRequest(endpoint);
  },

  // Get income by category
  getIncomeByCategory: async () => {
    return await apiRequest('/income/by-category');
  },

  // Get recurring incomes
  getRecurringIncomes: async () => {
    return await apiRequest('/income/recurring');
  },

  // Get specific income
  getIncome: async (id) => {
    return await apiRequest(`/income/${id}`);
  },

  // Update income entry
  updateIncome: async (id, incomeData) => {
    return await apiRequest(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(incomeData),
    });
  },

  // Delete income entry
  deleteIncome: async (id) => {
    return await apiRequest(`/income/${id}`, {
      method: 'DELETE',
    });
  }
};

// 💸 Expense Management API
export const expenseAPI = {
  // Get all expenses
  getExpenses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/expenses?${queryString}` : '/expenses';
    return await apiRequest(endpoint);
  },

  // Create new expense
  createExpense: async (expenseData) => {
    return await apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  // Get expense summary
  getExpenseSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/expenses/summary?${queryString}` : '/expenses/summary';
    return await apiRequest(endpoint);
  },

  // Get expenses by category
  getExpensesByCategory: async () => {
    return await apiRequest('/expenses/by-category');
  },

  // Get recurring expenses
  getRecurringExpenses: async () => {
    return await apiRequest('/expenses/recurring');
  },

  // Get top spending categories
  getTopCategories: async (limit = 5) => {
    return await apiRequest(`/expenses/top-categories?limit=${limit}`);
  },

  // Get specific expense
  getExpense: async (id) => {
    return await apiRequest(`/expenses/${id}`);
  },

  // Update expense
  updateExpense: async (id, expenseData) => {
    return await apiRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  // Delete expense
  deleteExpense: async (id) => {
    return await apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }
};

// 🎯 Goal Management API
export const goalAPI = {
  // Get all goals
  getGoals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/goals?${queryString}` : '/goals';
    return await apiRequest(endpoint);
  },

  // Create new goal
  createGoal: async (goalData) => {
    return await apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },

  // Get goals summary
  getGoalsSummary: async () => {
    return await apiRequest('/goals/summary');
  },

  // Get goals by category
  getGoalsByCategory: async () => {
    return await apiRequest('/goals/by-category');
  },

  // Get specific goal
  getGoal: async (id) => {
    return await apiRequest(`/goals/${id}`);
  },

  // Update goal
  updateGoal: async (id, goalData) => {
    return await apiRequest(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  },

  // Delete goal
  deleteGoal: async (id) => {
    return await apiRequest(`/goals/${id}`, {
      method: 'DELETE',
    });
  },

  // Add contribution to goal
  contributeToGoal: async (id, contributionData) => {
    return await apiRequest(`/goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify(contributionData),
    });
  },

  // Update goal status
  updateGoalStatus: async (id, status) => {
    return await apiRequest(`/goals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
};

// 📊 Reports & Analytics API
export const reportsAPI = {
  // Get dashboard overview data
  getDashboard: async () => {
    return await apiRequest('/reports/dashboard');
  },

  // Get monthly report
  getMonthlyReport: async (year, month) => {
    return await apiRequest(`/reports/monthly/${year}/${month}`);
  },

  // Get category analysis
  getCategoryAnalysis: async (period = 12) => {
    return await apiRequest(`/reports/category-analysis?period=${period}`);
  },

  // Get trend analysis
  getTrendAnalysis: async (months = 12) => {
    return await apiRequest(`/reports/trend-analysis?months=${months}`);
  },

  // Get financial health score
  getHealthScore: async () => {
    return await apiRequest('/reports/health-score');
  },

  // Export user data
  exportData: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/reports/export?${queryString}` : '/reports/export';
    return await apiRequest(endpoint);
  }
};

// 🤖 AI Insights API
export const aiAPI = {
  // Get AI spending pattern analysis
  getSpendingAnalysis: async (period = 6) => {
    return await apiRequest(`/ai-insights/spending-analysis?period=${period}`);
  },

  // Get personalized savings recommendations
  getSavingsRecommendations: async () => {
    return await apiRequest('/ai-insights/savings-recommendations');
  },

  // Get goal achievement forecast
  getGoalForecast: async (goalId) => {
    return await apiRequest(`/ai-insights/goal-forecast/${goalId}`);
  },

  // Get financial health insights
  getHealthInsights: async () => {
    return await apiRequest('/ai-insights/health-insights');
  },

  // Get AI budget recommendations
  getBudgetSuggestions: async (targetSavingsRate = 20) => {
    return await apiRequest(`/ai-insights/budget-suggestions?targetSavingsRate=${targetSavingsRate}`);
  }
};

// 🏥 System Health API
export const systemAPI = {
  // Check API health status
  getHealth: async () => {
    // Health endpoint is at /health, not /api/health, so we need to call it directly
    const healthUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.REACT_APP_BASE_API_URI || process.env.BASE_API_URI || 'http://localhost:2000') + '/health'
      : '/health';
    
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: `HTTP ${response.status} ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 🔧 Settings API
export const settingsAPI = {
  // Get user settings
  getSettings: async () => {
    return await apiRequest('/settings');
  },

  // Update user settings
  updateSettings: async (settings) => {
    return await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Migrate localStorage data
  migrateLocalStorageData: async (localStorageData) => {
    return await apiRequest('/settings/migrate', {
      method: 'POST',
      body: JSON.stringify({ localStorageData }),
    });
  },

  // Update single setting
  updateSingleSetting: async (key, value) => {
    return await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify({ [key]: value }),
    });
  },

  // Get currency symbol
  getCurrencySymbol: async () => {
    return await apiRequest('/settings/currency-symbol', {
      method: 'GET',
    });
  }
};

// 🏆 Achievement API
export const achievementAPI = {
  // Get all achievements (locked & unlocked) with progress
  getAllAchievements: async () => {
    return await apiRequest('/achievements', {
      method: 'GET',
    });
  },
  
  // Check for new achievements and unlock them
  checkAchievements: async () => {
    return await apiRequest('/achievements/check', {
      method: 'POST',
    });
  },
  
  // Get achievement leaderboard
  getLeaderboard: async (limit = 10) => {
    return await apiRequest(`/achievements/leaderboard?limit=${limit}`, {
      method: 'GET',
    });
  },
  
  // Get user's unlocked achievements only (legacy endpoint)
  getUserAchievements: async () => {
    return await apiRequest('/users/achievements', {
      method: 'GET',
    });
  }
};

// Export all APIs
const allAPIs = {
  auth: authAPI,
  user: userAPI,
  income: incomeAPI,
  expense: expenseAPI,
  goal: goalAPI,
  reports: reportsAPI,
  ai: aiAPI,
  system: systemAPI,
  settings: settingsAPI,
  achievements: achievementAPI
};

export default allAPIs;
