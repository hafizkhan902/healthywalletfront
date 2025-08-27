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

// Debug logging for API URL
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔧 Environment Variables:', {
  REACT_APP_BASE_API_URI: process.env.REACT_APP_BASE_API_URI,
  BASE_API_URI: process.env.BASE_API_URI
});

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
    console.log('🟢 Backend connectivity test:', response.status === 200 ? 'SUCCESS' : `HTTP ${response.status}`);
    return true;
  } catch (error) {
    console.log('🔴 Backend connectivity test: FAILED -', error.message);
    console.log('💡 Possible solutions:');
    console.log('   1. Check if backend server is running on port 2000');
    console.log('   2. Verify CORS is enabled on backend with credentials: true');
    console.log('   3. Check firewall/network settings');
    console.log('   4. Ensure backend allows your frontend origin');
    return false;
  }
};

// Run connectivity test on startup
testConnection().then(success => {
  if (!success) {
    console.log('🔍 Running comprehensive network diagnostics...');
    // Run diagnostics after a short delay to avoid overwhelming the console
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

  // Log response for debugging
  console.log(`📡 Response Status: ${response.status}`, data);

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
    console.log('🌐 Making API Request:', {
      method: config.method || 'GET',
      url: fullUrl,
      headers: config.headers,
      credentials: config.credentials,
      body: config.body ? 'Present' : 'None',
      attempt: retryCount + 1
    });
    
    // Add extra logging for POST requests
    if (config.method === 'POST') {
      console.log('📝 POST Request Details:', {
        contentType: config.headers['Content-Type'],
        bodyLength: config.body ? config.body.length : 0,
        hasBody: !!config.body
      });
    }
    
    // Create AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(fullUrl, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('📡 Response Status:', response.status, response.statusText);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await handleResponse(response);
    
    console.log('✅ API Response received:', result);
    return result;
  } catch (error) {
    console.error('❌ API Request Error:', {
      url: fullUrl,
      error: error.message,
      type: error.name,
      stack: error.stack,
      attempt: retryCount + 1
    });
    
    // Check if this is a network error that can be retried
    const isNetworkError = error.name === 'TypeError' && 
      (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'));
    const isTimeoutError = error.name === 'AbortError';
    const canRetry = (isNetworkError || isTimeoutError) && retryCount < maxRetries;
    
    if (canRetry) {
      console.log(`🔄 Retrying request in ${retryDelay}ms (attempt ${retryCount + 2}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return executeRequest(fullUrl, config, retryCount + 1);
    }
    
    // Add more detailed error information
    console.error('🔍 Error Details:', {
      errorName: error.name,
      errorMessage: error.message,
      isNetworkError,
      isTimeoutError,
      timestamp: new Date().toISOString(),
      finalAttempt: true
    });
    
    // Provide more specific error messages
    if (isNetworkError) {
      console.error('🔴 Network Error: Cannot reach backend server');
      console.error('💡 Troubleshooting:');
      console.error('   1. Check if backend is running on port 2000');
      console.error('   2. Check browser console for CORS errors');
      console.error('   3. Ensure backend CORS allows your origin with credentials');
      console.error('   4. Check if preflight OPTIONS request is successful');
      console.error('   5. Verify firewall/network settings');
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
  }
};

// Export all APIs
export default {
  auth: authAPI,
  user: userAPI,
  income: incomeAPI,
  expense: expenseAPI,
  goal: goalAPI,
  reports: reportsAPI,
  ai: aiAPI,
  system: systemAPI,
  settings: settingsAPI
};
