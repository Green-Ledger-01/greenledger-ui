import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Use the existing wagmi config
import { config } from './wagmiConfig';

// Particle Network imports (updated to use auth-core only)
import { 
  AuthCoreContextProvider, 
  AuthType,
  PromptSettingType
} from '@particle-network/auth-core';

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

// Lisk Sepolia configuration
const liskSepolia = {
  id: 4202,
  name: 'Lisk Sepolia',
  network: 'lisk-sepolia',
  nativeCurrency: { 
    name: 'Sepolia Ether', 
    symbol: 'ETH', 
    decimals: 18 
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
    public: { http: ['https://rpc.sepolia-api.lisk.com'] },
  },
  blockExplorers: {
    default: { 
      name: 'Blockscout', 
      url: 'https://sepolia-blockscout.lisk.com' 
    },
  },
};

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

interface HybridWeb3ProviderProps {
  children: React.ReactNode;
}

/**
 * Updated Hybrid Web3 Provider with simplified Particle integration
 * 
 * Key Changes:
 * 1. Removed AuthKitProvider dependency (not needed for core functionality)
 * 2. Simplified chain configuration to use single Lisk Sepolia definition
 * 3. Added explicit type for authTypes array
 * 4. Improved environment variable handling with fallbacks
 * 5. Enhanced security configuration
 */
export const HybridWeb3Provider: React.FC<HybridWeb3ProviderProps> = ({ children }) => {
  const envVars = validateEnvVars();

  return (
    <AuthCoreContextProvider
      options={{
        projectId: envVars.VITE_PARTICLE_PROJECT_ID || 'default-project-id',
        clientKey: envVars.VITE_PARTICLE_CLIENT_KEY || 'default-client-key',
        appId: envVars.VITE_PARTICLE_APP_ID || 'default-app-id',
        
        // Authentication methods
        authTypes: [
          AuthType.email,
          AuthType.google,
          AuthType.twitter,
        ] as AuthType[], // Explicit type for TS safety
        
        // UI Configuration
        themeType: 'dark',
        
        // Chain configuration - focus on Lisk Sepolia
        chains: [liskSepolia],
        
        // Security configuration
        securityAccount: {
          // Prompt settings
          promptSettingWhenSign: 1, // First time only
          promptMasterPasswordSettingWhenLogin: 1 // First time only
        },
        
        // Wallet configuration
        wallet: {
          visible: true,
          preload: true,
          customStyle: {
            supportChains: [liskSepolia],
            supportUIModeSwitch: true,
          }
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
            chains={[liskSepolia]}
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

// Export configurations
export { config as wagmiConfig, queryClient };