import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Ensure import.meta.env is available
try {
  // Check if import.meta exists first
  if (typeof import.meta !== 'undefined' && !import.meta.env) {
    (import.meta as any).env = {
      VITE_NODE_ENV: 'production',
      VITE_DEBUG: '',
      MODE: 'production',
      DEV: false,
      PROD: true,
      SSR: false
    };
  }
} catch {
  // import.meta might not be available in some environments
  console.warn('import.meta.env not available');
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
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      env = import.meta.env;
    }
  } catch {
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
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);