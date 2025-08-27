// 🎣 Custom Hook for API Calls with Loading States and Error Handling

import { useState, useEffect, useCallback } from 'react';

// Generic API hook for handling loading, data, and error states
export const useAPI = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { 
    immediate = true, 
    onSuccess, 
    onError,
    transform 
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(...args);
      const result = transform ? transform(response) : response;
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute
  };
};

// Hook for mutations (POST, PUT, DELETE)
export const useMutation = (apiCall, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { onSuccess, onError } = options;

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(...args);
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  return {
    mutate,
    loading,
    error,
    reset: () => {
      setError(null);
      setLoading(false);
    }
  };
};

// Hook for paginated data
export const usePaginatedAPI = (apiCall, initialParams = {}, options = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    count: 0,
    totalRecords: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, ...initialParams });

  const { onSuccess, onError } = options;

  const fetchData = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalParams = { ...params, ...newParams };
      const response = await apiCall(finalParams);
      
      if (response.success && response.data) {
        // Handle different API response structures
        const items = response.data.items || 
                     response.data.incomes || 
                     response.data.expenses || 
                     response.data.goals || 
                     response.data.reports || 
                     response.data;
        const dataArray = Array.isArray(items) ? items : [];
        
        setData(dataArray);
        setPagination(prev => response.data.pagination || prev);
        
        if (onSuccess) {
          onSuccess(response.data);
        }
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      
      // Ensure data remains an array even on error
      if (!Array.isArray(data)) {
        setData([]);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Load more data (for infinite scroll)
  const loadMore = useCallback(async () => {
    if (pagination.current < pagination.total) {
      const nextPage = pagination.current + 1;
      const newParams = { ...params, page: nextPage };
      
      try {
        setLoading(true);
        const response = await apiCall(newParams);
        
        if (response.success && response.data) {
          setData(prev => [...prev, ...(response.data.items || response.data)]);
          setPagination(response.data.pagination || pagination);
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
  }, [apiCall, params, pagination]);

  // Update params and fetch
  const updateParams = useCallback(async (newParams) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    
    // Fetch with new params directly to avoid dependency issues
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(updatedParams);
      
      if (response.success && response.data) {
        // Handle different API response structures
        const items = response.data.items || 
                     response.data.incomes || 
                     response.data.expenses || 
                     response.data.goals || 
                     response.data.reports || 
                     response.data;
        const dataArray = Array.isArray(items) ? items : [];
        
        setData(dataArray);
        setPagination(response.data.pagination || pagination);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      if (!Array.isArray(data)) {
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    params,
    fetchData,
    loadMore,
    updateParams,
    refetch: () => fetchData(params)
  };
};

// Hook for real-time data with polling
export const usePollingAPI = (apiCall, interval = 30000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      setData(response);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (isPolling) {
      fetchData(); // Initial fetch
      
      const intervalId = setInterval(() => {
        if (isPolling) {
          fetchData();
        }
      }, interval);
      
      return () => clearInterval(intervalId);
    }
  }, [fetchData, interval, isPolling]);

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling: () => setIsPolling(true),
    stopPolling: () => setIsPolling(false),
    refetch: fetchData
  };
};

const apiHooks = {
  useAPI,
  useMutation,
  usePaginatedAPI,
  usePollingAPI
};

export default apiHooks;
