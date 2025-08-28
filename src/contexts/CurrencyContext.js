import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Currency mapping for common currencies
const CURRENCY_SYMBOLS = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'CNY': '¥',
  'INR': '₹',
  'KRW': '₩',
  'BRL': 'R$',
  'MXN': '$',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
  'RUB': '₽',
  'TRY': '₺',
  'ZAR': 'R',
  'SGD': 'S$',
  'HKD': 'HK$',
  'NZD': 'NZ$',
  'THB': '฿',
  'MYR': 'RM',
  'IDR': 'Rp',
  'PHP': '₱',
  'VND': '₫',
  'AED': 'د.إ',
  'SAR': 'ر.س',
  'EGP': 'E£',
  'NGN': '₦',
  'KES': 'KSh',
  'GHS': '₵',
  'MAD': 'د.م.',
  'TND': 'د.ت',
  'LKR': 'Rs',
  'PKR': 'Rs',
  'BDT': '৳',
  'NPR': 'Rs',
  'AFN': '؋',
  'IQD': 'ع.د',
  'JOD': 'د.ا',
  'KWD': 'د.ك',
  'LBP': 'ل.ل',
  'OMR': 'ر.ع.',
  'QAR': 'ر.ق',
  'SYP': 'ل.س',
  'YER': 'ر.ي',
  'BHD': '.د.ب',
  'ILS': '₪',
  'IRR': '﷼',
  'AMD': '֏',
  'AZN': '₼',
  'GEL': '₾',
  'KZT': '₸',
  'KGS': 'с',
  'TJS': 'ЅМ',
  'TMT': 'T',
  'UZS': 'so\'m',
  'MNT': '₮',
  'MMK': 'Ks',
  'LAK': '₭',
  'KHR': '៛',
  'BND': 'B$',
  'FJD': 'FJ$',
  'PGK': 'K',
  'SBD': 'SI$',
  'TOP': 'T$',
  'VUV': 'VT',
  'WST': 'WS$',
  'XPF': '₣',
  'NCL': '₣',
  'ETB': 'Br',
  'RWF': 'R₣',
  'UGX': 'USh',
  'TZS': 'TSh',
  'MWK': 'MK',
  'ZMW': 'ZK',
  'BWP': 'P',
  'SZL': 'L',
  'LSL': 'L',
  'NAD': 'N$',
  'AOA': 'Kz',
  'MZN': 'MT',
  'MGA': 'Ar',
  'KMF': 'CF',
  'SCR': 'Sr',
  'MUR': 'Rs',
  'MVR': 'Rf',
  'STN': 'Db',
  'CVE': '$',
  'GMD': 'D',
  'GNF': 'FG',
  'LRD': 'L$',
  'SLE': 'Le',
  'XOF': 'CFA',
  'XAF': 'FCFA',
  'BIF': 'FBu',
  'DJF': 'Fdj',
  'ERN': 'Nfk',
  'SOS': 'S',
  'SSD': '£',
  'SDG': 'ج.س.',
  'CDF': 'FC',
  'XDR': 'SDR'
};

export const CurrencyProvider = ({ children }) => {
  // Initialize with saved currency from localStorage for instant UI
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('healthywallet-currency');
    console.log('🚀 Initializing currency from localStorage:', savedCurrency || 'USD (default)');
    return savedCurrency || 'USD';
  });
  const [symbol, setSymbol] = useState(() => {
    const savedSymbol = localStorage.getItem('healthywallet-currency-symbol');
    const savedCurrency = localStorage.getItem('healthywallet-currency') || 'USD';
    const fallbackSymbol = CURRENCY_SYMBOLS[savedCurrency?.toUpperCase()] || savedCurrency || '$';
    console.log('🚀 Initializing symbol from localStorage:', savedSymbol || fallbackSymbol);
    return savedSymbol || fallbackSymbol;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get currency symbol from currency code
  const getCurrencySymbol = (currencyCode) => {
    return CURRENCY_SYMBOLS[currencyCode?.toUpperCase()] || currencyCode || '$';
  };

  // Listen for currency updates from AuthContext
  useEffect(() => {
    const handleCurrencyUpdate = (event) => {
      const { currency: newCurrency, symbol: newSymbol } = event.detail;
      console.log('🔄 Currency updated from AuthContext:', { currency: newCurrency, symbol: newSymbol });
      
      setCurrency(newCurrency);
      setSymbol(newSymbol);
      setLoading(false);
    };

    window.addEventListener('currencyUpdated', handleCurrencyUpdate);
    
    return () => {
      window.removeEventListener('currencyUpdated', handleCurrencyUpdate);
    };
  }, []);

  // Fetch currency from backend
  const fetchCurrency = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching user currency from backend...');
      
      // First, load from localStorage immediately for instant UI
      const localCurrency = localStorage.getItem('healthywallet-currency');
      const localSymbol = localStorage.getItem('healthywallet-currency-symbol');
      
      if (localCurrency && localSymbol) {
        console.log('💾 Loading currency from localStorage for instant UI:', { currency: localCurrency, symbol: localSymbol });
        setCurrency(localCurrency);
        setSymbol(localSymbol);
      }
      
      // Try to get currency symbol from backend to sync/update
      const response = await settingsAPI.getCurrencySymbol();
      
      if (response.success && response.data) {
        const { currency: backendCurrency, symbol: backendSymbol } = response.data;
        
        console.log('✅ Currency fetched from backend:', { currency: backendCurrency, symbol: backendSymbol });
        
        setCurrency(backendCurrency || 'USD');
        setSymbol(backendSymbol || getCurrencySymbol(backendCurrency) || '$');
        
        // Also save to localStorage for offline use
        localStorage.setItem('healthywallet-currency', backendCurrency || 'USD');
        localStorage.setItem('healthywallet-currency-symbol', backendSymbol || getCurrencySymbol(backendCurrency) || '$');
      } else {
        throw new Error('Invalid response from currency API');
      }
    } catch (err) {
      console.log('⚠️ Backend currency fetch failed, using localStorage fallback:', err.message);
      
      // Check if it's an authentication error
      const isAuthError = err.message.includes('Not authorized') || 
                          err.message.includes('401') || 
                          err.message.includes('unauthorized');
      
      // Only set fallback if currency wasn't already loaded from localStorage
      if (!currency || currency === 'USD') {
        const fallbackCurrency = localStorage.getItem('healthywallet-currency') || 'USD';
        const fallbackSymbol = localStorage.getItem('healthywallet-currency-symbol') || getCurrencySymbol(fallbackCurrency);
        
        setCurrency(fallbackCurrency);
        setSymbol(fallbackSymbol);
        
        console.log('📱 Using localStorage fallback currency:', { currency: fallbackCurrency, symbol: fallbackSymbol });
      }
      
      if (isAuthError) {
        setError('Authentication required for backend sync');
        console.log('🔐 Currency will sync with backend after user logs in');
      } else {
        setError('Using offline currency settings');
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  // Update currency (called when user changes settings)
  const updateCurrency = async (newCurrency) => {
    console.log('🔄 Updating currency to:', newCurrency);
    
    const newSymbol = getCurrencySymbol(newCurrency);
    
    // Update local state immediately for responsive UI
    setCurrency(newCurrency);
    setSymbol(newSymbol);
    
    // Save to localStorage immediately
    localStorage.setItem('healthywallet-currency', newCurrency);
    localStorage.setItem('healthywallet-currency-symbol', newSymbol);
    
    console.log('✅ Currency updated:', { currency: newCurrency, symbol: newSymbol });
  };

  // Initialize currency on app load
  useEffect(() => {
    fetchCurrency();
  }, [fetchCurrency]);

  // Format currency value with current symbol
  const formatCurrency = (amount, options = {}) => {
    const {
      showSymbol = true,
      decimals = 2,
      showCode = false,
      position = 'before' // 'before' or 'after'
    } = options;

    if (amount === null || amount === undefined || isNaN(amount)) {
      return showSymbol ? `${symbol}0.00` : '0.00';
    }

    const formattedAmount = Number(amount).toLocaleString('en-US', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    if (!showSymbol) {
      return formattedAmount;
    }

    if (showCode) {
      return `${formattedAmount} ${currency}`;
    }

    return position === 'after' 
      ? `${formattedAmount}${symbol}`
      : `${symbol}${formattedAmount}`;
  };

  const value = {
    currency,
    symbol,
    loading,
    error,
    fetchCurrency,
    updateCurrency,
    formatCurrency,
    getCurrencySymbol,
    supportedCurrencies: Object.keys(CURRENCY_SYMBOLS)
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
