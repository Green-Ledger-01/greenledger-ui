
import { Web3Provider } from './config/HybridWeb3Config';
import { Web3ContextEnhancedProvider } from './contexts/Web3ContextEnhanced';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <ToastProvider>
          <CartProvider>
            <Web3ContextEnhancedProvider>
              <AppRoutes />
            </Web3ContextEnhancedProvider>
          </CartProvider>
        </ToastProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
}
