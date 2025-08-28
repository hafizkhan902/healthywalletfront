import { useCurrency } from '../contexts/CurrencyContext';

/**
 * Custom hook for currency formatting throughout the app
 * Provides easy access to currency formatting with consistent styling
 */
export const useCurrencyFormatter = () => {
  const { currency, symbol, formatCurrency } = useCurrency();

  // Quick format function for common use cases
  const format = (amount, options = {}) => {
    return formatCurrency(amount, {
      showSymbol: true,
      decimals: 2,
      ...options
    });
  };

  // Format without symbol (for input fields, calculations, etc.)
  const formatNumber = (amount, decimals = 2) => {
    return formatCurrency(amount, {
      showSymbol: false,
      decimals
    });
  };

  // Format with currency code (for international contexts)
  const formatWithCode = (amount, decimals = 2) => {
    return formatCurrency(amount, {
      showSymbol: false,
      showCode: true,
      decimals
    });
  };

  // Format for compact display (K, M, B suffixes)
  const formatCompact = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `${symbol}0`;
    }

    const absAmount = Math.abs(amount);
    
    if (absAmount >= 1e9) {
      return `${symbol}${(amount / 1e9).toFixed(1)}B`;
    } else if (absAmount >= 1e6) {
      return `${symbol}${(amount / 1e6).toFixed(1)}M`;
    } else if (absAmount >= 1e3) {
      return `${symbol}${(amount / 1e3).toFixed(1)}K`;
    } else {
      return `${symbol}${amount.toFixed(0)}`;
    }
  };

  // Format for input placeholders
  const formatPlaceholder = (amount = 0) => {
    return `${symbol}${amount.toFixed(2)}`;
  };

  return {
    currency,
    symbol,
    format,
    formatNumber,
    formatWithCode,
    formatCompact,
    formatPlaceholder,
    // Direct access to the full formatter
    formatCurrency
  };
};
