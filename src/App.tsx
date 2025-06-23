import React, { useEffect } from 'react';
import { HybridWeb3Provider } from './config/HybridWeb3Config';
import { Web3ContextEnhancedProvider } from './contexts/Web3ContextEnhanced';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import SimpleAppRoutes from './routes/SimpleAppRoutes';
import { initializeOAuthHandling, cleanupOAuthHandling } from './utils/oauthHandler';

export default function App() {
  useEffect(() => {
    // Initialize OAuth handling
    initializeOAuthHandling();

    // Cleanup on unmount
    return () => {
      cleanupOAuthHandling();
    };
  }, []);

  return (
    <ErrorBoundary>
      <HybridWeb3Provider>
        <ToastProvider>
          <Web3ContextEnhancedProvider>
            <SimpleAppRoutes />
          </Web3ContextEnhancedProvider>
        </ToastProvider>
      </HybridWeb3Provider>
    </ErrorBoundary>
  );
}
