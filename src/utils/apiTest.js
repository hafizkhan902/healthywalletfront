// 🧪 API Connection Test Utility

export const testBackendConnection = async (baseUrl) => {
  const tests = [
    {
      name: 'Health Check',
      url: `${baseUrl}/health`,
      method: 'GET'
    },
    {
      name: 'Auth Register Endpoint',
      url: `${baseUrl}/auth/register`,
      method: 'POST',
      body: { test: 'connectivity' }
    }
  ];

  // console.log('🧪 Running Backend Connectivity Tests...');
  // console.log('🔗 Base URL:', baseUrl);

  for (const test of tests) {
    try {
      const config = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include' // Match backend specification
      };

      if (test.body) {
        config.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, config);
      const data = await response.text();
      
      // console.log(`✅ ${test.name}:`, {
        status: response.status,
        ok: response.ok,
        response: data.substring(0, 100) + (data.length > 100 ? '...' : '')
      });
    } catch (error) {
      // console.log(`❌ ${test.name}:`, {
        error: error.message,
        name: error.name
      });
      
      if (error.message.includes('CORS')) {
        // console.log('💡 CORS Issue Detected! Backend needs CORS configuration.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        // console.log('💡 Connection Issue! Check if backend server is running.');
      }
    }
  }
};

// Auto-run test if this module is imported - DISABLED to prevent excessive requests
// if (process.env.NODE_ENV === 'development') {
//   const API_BASE_URL = process.env.REACT_APP_BASE_API_URI || 'http://localhost:2000/api';
//   setTimeout(() => testBackendConnection(API_BASE_URL), 1000);
// }
