// 🔍 Network Diagnostics Utility
// Helps diagnose backend connectivity issues

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_BASE_API_URI || process.env.BASE_API_URI || 'http://localhost:2000/api')
  : '/api';

// Quick connectivity test for BackendStatus component
export const quickConnectivityTest = async () => {
  try {
    const healthUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.REACT_APP_BASE_API_URI || process.env.BASE_API_URI || 'http://localhost:2000') + '/health'
      : '/health';
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      mode: 'cors',
      // Add timeout for quick check
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    return response.ok;
  } catch (error) {
    // // console.log('🔴 Backend connectivity check failed:', error.message);
    return false;
  }
};

// Test different aspects of backend connectivity
export const runNetworkDiagnostics = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl: API_BASE_URL,
    tests: {}
  };

  // // console.log('🔍 Starting Network Diagnostics...');
  // // console.log('📍 Testing connectivity to:', API_BASE_URL);

  // Test 1: Basic Health Check
  try {
    // console.log('🧪 Test 1: Basic Health Check');
    // Health endpoint is at /health, not /api/health
    const healthUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.REACT_APP_BASE_API_URI || process.env.BASE_API_URI || 'http://localhost:2000') + '/health'
      : '/health';
    
    // console.log('📍 Health check URL:', healthUrl);
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    results.tests.healthCheck = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    };
    
    // console.log('✅ Health check:', response.ok ? 'PASSED' : `FAILED (${response.status})`);
  } catch (error) {
    results.tests.healthCheck = {
      success: false,
      error: error.message,
      type: error.name
    };
    // console.log('❌ Health check: FAILED -', error.message);
  }

  // Test 2: CORS Preflight (OPTIONS request)
  try {
    // console.log('🧪 Test 2: CORS Preflight Check');
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    results.tests.corsPrelight = {
      success: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
      allowMethods: response.headers.get('Access-Control-Allow-Methods'),
      allowHeaders: response.headers.get('Access-Control-Allow-Headers'),
      allowCredentials: response.headers.get('Access-Control-Allow-Credentials')
    };
    
    // console.log('✅ CORS preflight:', response.ok ? 'PASSED' : `FAILED (${response.status})`);
  } catch (error) {
    results.tests.corsPrelight = {
      success: false,
      error: error.message,
      type: error.name
    };
    // console.log('❌ CORS preflight: FAILED -', error.message);
  }

  // Test 3: Network Reachability (different endpoint)
  try {
    // console.log('🧪 Test 3: Network Reachability');
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    results.tests.reachability = {
      success: true,
      status: response.status,
      reachable: true
    };
    
    // console.log('✅ Network reachability: PASSED');
  } catch (error) {
    results.tests.reachability = {
      success: false,
      error: error.message,
      type: error.name,
      reachable: false
    };
    // console.log('❌ Network reachability: FAILED -', error.message);
  }

  // Generate diagnostic report
  generateDiagnosticReport(results);
  
  return results;
};

// Generate a comprehensive diagnostic report
const generateDiagnosticReport = (results) => {
  // console.log('\n📋 NETWORK DIAGNOSTIC REPORT');
  // console.log('================================');
  // console.log(`🕐 Timestamp: ${results.timestamp}`);
  // console.log(`🎯 Target URL: ${results.baseUrl}`);
  // console.log(`🌐 Frontend Origin: ${window.location.origin}`);
  
  // Health Check Analysis
  const healthCheck = results.tests.healthCheck;
  // console.log('\n🏥 Health Check:');
  if (healthCheck.success) {
    // console.log('  ✅ Status: HEALTHY');
    // console.log(`  📡 Response: ${healthCheck.status} ${healthCheck.statusText}`);
  } else {
    // console.log('  ❌ Status: UNHEALTHY');
    // console.log(`  🚨 Error: ${healthCheck.error || 'Unknown error'}`);
  }

  // CORS Analysis
  const cors = results.tests.corsPrelight;
  // console.log('\n🔒 CORS Configuration:');
  if (cors.success) {
    // console.log('  ✅ Preflight: PASSED');
    // console.log(`  🎯 Allow-Origin: ${cors.allowOrigin || 'Not set'}`);
    // console.log(`  🔧 Allow-Methods: ${cors.allowMethods || 'Not set'}`);
    // console.log(`  📝 Allow-Headers: ${cors.allowHeaders || 'Not set'}`);
    // console.log(`  🍪 Allow-Credentials: ${cors.allowCredentials || 'Not set'}`);
  } else {
    // console.log('  ❌ Preflight: FAILED');
    // console.log(`  🚨 Error: ${cors.error || 'Unknown error'}`);
  }

  // Reachability Analysis
  const reachability = results.tests.reachability;
  // console.log('\n🌐 Network Reachability:');
  if (reachability.reachable) {
    // console.log('  ✅ Backend: REACHABLE');
  } else {
    // console.log('  ❌ Backend: UNREACHABLE');
    // console.log(`  🚨 Error: ${reachability.error || 'Unknown error'}`);
  }

  // Recommendations
  // console.log('\n💡 RECOMMENDATIONS:');
  
  if (!healthCheck.success) {
    // console.log('  🔧 Backend Server Issues:');
    // console.log('     - Ensure backend server is running on port 2000');
    // console.log('     - Check server logs for startup errors');
    // console.log('     - Verify database connectivity');
  }

  if (!cors.success || cors.allowCredentials !== 'true') {
    // console.log('  🔒 CORS Configuration Issues:');
    // console.log('     - Enable CORS on backend server');
    // console.log('     - Set Access-Control-Allow-Credentials: true');
    // console.log('     - Add your frontend origin to allowed origins');
    // console.log(`     - Current origin: ${window.location.origin}`);
  }

  if (!reachability.reachable) {
    // console.log('  🌐 Network Connectivity Issues:');
    // console.log('     - Check firewall settings');
    // console.log('     - Verify network connectivity');
    // console.log('     - Try accessing backend directly in browser');
  }

  // console.log('\n================================\n');
};

// Duplicate function removed - using the one at the top of the file

const networkDiagnostics = {
  runNetworkDiagnostics,
  quickConnectivityTest
};

export default networkDiagnostics;
