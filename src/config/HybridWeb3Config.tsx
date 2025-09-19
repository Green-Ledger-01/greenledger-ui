import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Use the existing wagmi config
import { config } from './wagmiConfig';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Environment variables validation (simplified for WalletConnect only)
const validateEnvVars = () => {
  const requiredVars = {
    VITE_WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.warn('Some Web3 features may not work properly.');
  }

  return requiredVars;
};

// Lisk Sepolia configuration is imported from chains/liskSepolia

// React Query client with Web3-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

/**
 * Web3 Provider using RainbowKit and Wagmi
 *
 * Provides wallet connection functionality through RainbowKit with:
 * - MetaMask, Coinbase Wallet, and WalletConnect support
 * - Lisk Sepolia network configuration
 * - Custom GreenLedger theme
 * - React Query integration for caching
 */
export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  validateEnvVars();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#10B981', // green-500
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          modalSize="compact"
          showRecentTransactions={true}
          coolMode={false}
          appInfo={{
            appName: 'GreenLedger',
            learnMoreUrl: 'https://greenledger.app',
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Export configurations
export { config as wagmiConfig, queryClient };

// Backward compatibility export
export const HybridWeb3Provider = Web3Provider;