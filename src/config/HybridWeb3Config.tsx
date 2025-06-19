import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Use the existing wagmi config instead of creating a new one
import { config } from './wagmiConfig';

// Particle Network imports
import { AuthType } from '@particle-network/auth-core';
import {
  AuthCoreContextProvider,
  PromptSettingType,
} from '@particle-network/authkit';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Environment variables validation
const validateEnvVars = () => {
  const requiredVars = {
    VITE_PARTICLE_PROJECT_ID: import.meta.env.VITE_PARTICLE_PROJECT_ID,
    VITE_PARTICLE_CLIENT_KEY: import.meta.env.VITE_PARTICLE_CLIENT_KEY,
    VITE_PARTICLE_APP_ID: import.meta.env.VITE_PARTICLE_APP_ID,
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

// Particle Network chain configurations (for Lisk Sepolia)
const particleChains = [
  {
    id: 4202,
    name: 'Lisk Sepolia',
    network: 'lisk-sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
    blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
  },
];

// React Query client with Web3-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry user rejected transactions
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') return false;
        // Don't retry network errors more than 3 times
        if (failureCount >= 3) return false;
        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't retry mutations (transactions) automatically
    },
  },
});


interface HybridWeb3ProviderProps {
  children: React.ReactNode;
}

/**
 * HybridWeb3Provider combines Particle Network (social login) with traditional wallet connections
 * 
 * Architecture Decision:
 * - Particle Network provides social login abstraction for non-technical users
 * - RainbowKit provides traditional wallet connections for crypto-native users
 * - Both systems coexist, allowing maximum user flexibility
 * - Wagmi handles the underlying Web3 interactions uniformly
 * 
 * Benefits:
 * - Lower barrier to entry for Web2 users
 * - Full Web3 functionality for crypto-native users
 * - Consistent developer experience through Wagmi
 * - Production-ready error handling and retry logic
 */
export const HybridWeb3Provider: React.FC<HybridWeb3ProviderProps> = ({ children }) => {
  const envVars = validateEnvVars();

  return (
    <AuthCoreContextProvider
      options={{
        projectId: envVars.VITE_PARTICLE_PROJECT_ID || '',
        clientKey: envVars.VITE_PARTICLE_CLIENT_KEY || '',
        appId: envVars.VITE_PARTICLE_APP_ID || '',
        
        // Authentication methods - prioritize social logins for ease of use
        authTypes: [
          AuthType.email,
          AuthType.google,
          AuthType.twitter,
          AuthType.github,
          AuthType.apple,
          AuthType.discord,
        ],
        
        // UI Configuration
        themeType: 'dark',
        
        // Chain configuration - Lisk Sepolia focused
        chains: particleChains,
        
        // Smart Account Configuration (ERC-4337)
        // Uncomment to enable account abstraction
        // erc4337: {
        //   name: 'BICONOMY',
        //   version: '2.0.0',
        // },
        
        // Security prompts for enhanced user protection
        promptSettingConfig: {
          promptPaymentPasswordSettingWhenSign: PromptSettingType.first,
          promptMasterPasswordSettingWhenLogin: PromptSettingType.first,
        },
        
        // Wallet UI configuration
        wallet: {
          themeType: 'dark',
          visible: true,
          customStyle: {
            supportUIModeSwitch: true,
            supportLanguageSwitch: false,
          },
        },
      }}
    >
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
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AuthCoreContextProvider>
  );
};

// Export configurations for use in other parts of the app
export { config as wagmiConfig, queryClient };