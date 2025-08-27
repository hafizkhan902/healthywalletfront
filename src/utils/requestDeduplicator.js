/**
 * Request deduplication utility to prevent duplicate API calls
 * Especially useful for handling React Strict Mode double invocation
 */

class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
    this.requestTimeouts = new Map();
  }

  /**
   * Create a unique key for the request
   * @param {string} url - API endpoint URL
   * @param {object} options - Request options
   * @returns {string} - Unique request key
   */
  createKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    const headers = options.headers ? JSON.stringify(options.headers) : '';
    
    return `${method}:${url}:${body}:${headers}`;
  }

  /**
   * Execute a request with deduplication
   * @param {string} url - API endpoint URL
   * @param {object} options - Request options
   * @param {Function} requestFn - Function that makes the actual request
   * @returns {Promise} - Request promise
   */
  async execute(url, options, requestFn) {
    const key = this.createKey(url, options);

    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 Deduplicating request: ${url}`);
      return this.pendingRequests.get(key);
    }

    // Create new request promise
    const requestPromise = requestFn()
      .finally(() => {
        // Clean up after request completes
        this.pendingRequests.delete(key);
        if (this.requestTimeouts.has(key)) {
          clearTimeout(this.requestTimeouts.get(key));
          this.requestTimeouts.delete(key);
        }
      });

    // Store the pending request
    this.pendingRequests.set(key, requestPromise);

    // Set timeout to clean up stale requests (5 seconds)
    const timeout = setTimeout(() => {
      this.pendingRequests.delete(key);
      this.requestTimeouts.delete(key);
    }, 5000);
    
    this.requestTimeouts.set(key, timeout);

    return requestPromise;
  }

  /**
   * Clear all pending requests (useful for cleanup)
   */
  clear() {
    this.pendingRequests.clear();
    this.requestTimeouts.forEach(timeout => clearTimeout(timeout));
    this.requestTimeouts.clear();
  }
}

// Create singleton instance
const requestDeduplicator = new RequestDeduplicator();

export default requestDeduplicator;
