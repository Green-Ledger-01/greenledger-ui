import React from 'react';
import { Web3Provider } from './config/HybridWeb3Config';
import { Web3ContextEnhancedProvider } from './contexts/Web3ContextEnhanced';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import SimpleAppRoutes from './routes/AppRoutes';
import WalletDebugInfo from './components/WalletDebugInfo';
import { InstallPrompt } from './components/InstallPrompt';
import { PWAService } from './services/pwa.service';

export default function App() {
  React.useEffect(() => {
    PWAService.getInstance().init();
  }, []);

  return (
    <ErrorBoundary>
      <Web3Provider>
        <ToastProvider>
          <CartProvider>
            <Web3ContextEnhancedProvider>
              <SimpleAppRoutes />
              <InstallPrompt />
              {import.meta.env.DEV && <WalletDebugInfo />}
            </Web3ContextEnhancedProvider>
          </CartProvider>
        </ToastProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
}
