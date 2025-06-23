import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Ensure import.meta.env is available
try {
  if (!import.meta.env) {
    (import.meta as any).env = {
      VITE_NODE_ENV: 'production',
      VITE_DEBUG: '',
      MODE: 'production',
      DEV: false,
      PROD: true,
      SSR: false
    };
  }
} catch (e) {
  // import.meta might not be available in some environments
  console.warn('import.meta.env not available:', e);
}

// Ensure TextEncoder/TextDecoder are available globally
if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = window.TextEncoder;
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = window.TextDecoder;
}

// Ensure process.env is available globally for libraries that expect it
if (!globalThis.process) {
  // Safely access import.meta.env with fallbacks
  let env: any = {};
  try {
    env = import.meta.env || {};
  } catch (e) {
    env = {};
  }

  globalThis.process = {
    env: {
      DEBUG: env.VITE_DEBUG || '',
      NODE_ENV: env.VITE_NODE_ENV || 'production',
      ...env
    },
    version: '18.0.0',
    versions: { node: '18.0.0' },
    platform: 'browser',
    nextTick: (cb: Function) => setTimeout(cb, 0),
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { config } from './config/wagmiConfig';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);