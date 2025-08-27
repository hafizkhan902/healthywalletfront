import React, { useState, useEffect } from 'react';
import { quickConnectivityTest, runNetworkDiagnostics } from '../utils/networkDiagnostics';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking'); // checking, online, offline
  const [lastCheck, setLastCheck] = useState(null);
  const [showOffline, setShowOffline] = useState(false);

  const checkStatus = async () => {
    setStatus('checking');
    try {
      const isOnline = await quickConnectivityTest();
      if (isOnline) {
        setStatus('online');
        setShowOffline(false);
      } else {
        setStatus('offline');
        // Delay showing offline status to avoid false positives
        setTimeout(() => setShowOffline(true), 2000);
      }
      setLastCheck(new Date());
    } catch (error) {
      setStatus('offline');
      setTimeout(() => setShowOffline(true), 2000);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Check every 60 seconds (less frequent)
    const interval = setInterval(checkStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDiagnostics = () => {
    runNetworkDiagnostics();
  };

  if (status === 'online' || (status === 'offline' && !showOffline)) {
    return null; // Don't show anything when backend is working or during delay
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: status === 'offline' ? '#fee2e2' : '#fef3c7',
      border: `1px solid ${status === 'offline' ? '#fecaca' : '#fde68a'}`,
      borderRadius: '8px',
      padding: '12px 16px',
      zIndex: 10000,
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      maxWidth: '300px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: status === 'checking' ? '#fbbf24' : '#ef4444',
          animation: status === 'checking' ? 'pulse 2s infinite' : 'none'
        }}></div>
        <strong>
          {status === 'checking' ? 'Checking Backend...' : 'Backend Offline'}
        </strong>
      </div>
      
      {status === 'offline' && (
        <>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#7f1d1d' }}>
            Cannot connect to the backend server. Some features may not work.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={checkStatus}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
            <button
              onClick={handleDiagnostics}
              style={{
                background: '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Diagnose
            </button>
          </div>
        </>
      )}
      
      {lastCheck && (
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '11px', 
          color: '#6b7280',
          opacity: 0.7 
        }}>
          Last checked: {lastCheck.toLocaleTimeString()}
        </p>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default BackendStatus;
