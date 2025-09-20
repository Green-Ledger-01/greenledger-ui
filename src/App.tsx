import React from 'react';
import { Web3Provider } from './config/HybridWeb3Config';
import { Web3ContextEnhancedProvider } from './contexts/Web3ContextEnhanced';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import SimpleAppRoutes from './routes/AppRoutes';
import WalletDebugInfo from './components/WalletDebugInfo';

export default function App() {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <ToastProvider>
          <CartProvider>
            <Web3ContextEnhancedProvider>
              <SimpleAppRoutes />
              {import.meta.env.DEV && <WalletDebugInfo />}
            </Web3ContextEnhancedProvider>
          </CartProvider>
        </ToastProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
}
