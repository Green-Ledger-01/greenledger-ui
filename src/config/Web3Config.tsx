import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig, Chain } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, polygon, sepolia, polygonAmoy } from 'wagmi/chains';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Custom chain configurations for development
const localhost: Chain = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Local Explorer', url: 'http://localhost:8545' },
  },
  testnet: true,
};

// Configure chains based on environment
const chains = [
  mainnet,
  polygon,
  sepolia,
  polygonAmoy,
  ...(import.meta.env.DEV ? [localhost] : []),
] as const;

// Wagmi configuration with best practices
const config = getDefaultConfig({
  appName: 'GreenLedger',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains,
  ssr: false, // Since we're using Vite, not Next.js
});

// React Query client with optimized settings for Web3
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce background refetch for blockchain data
      refetchOnWindowFocus: false,
      // Increase stale time for blockchain data that doesn't change often
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Retry failed requests with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry user rejected transactions
        if (error?.code === 4001) return false;
        // Don't retry more than 3 times
        if (failureCount >= 3) return false;
        return true;
      },
    },
    mutations: {
      // Don't retry mutations by default (transactions should be explicit)
      retry: false,
    },
  },
});

// RainbowKit theme configuration
const rainbowKitTheme = {
  blurs: {
    modalOverlay: 'blur(4px)',
  },
  colors: {
    accentColor: '#10b981', // Green theme to match GreenLedger
    accentColorForeground: 'white',
    actionButtonBorder: 'rgba(255, 255, 255, 0.04)',
    actionButtonBorderMobile: 'rgba(255, 255, 255, 0.08)',
    actionButtonSecondaryBackground: 'rgba(255, 255, 255, 0.08)',
    closeButton: 'rgba(224, 232, 255, 0.6)',
    closeButtonBackground: 'rgba(255, 255, 255, 0.08)',
    connectButtonBackground: '#10b981',
    connectButtonBackgroundError: '#ff4444',
    connectButtonInnerBackground: 'linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15))',
    connectButtonText: 'white',
    connectButtonTextError: 'white',
    connectionIndicator: '#10b981',
    downloadBottomCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #1a1b1f',
    downloadTopCardBackground: 'linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #1a1b1f',
    error: '#ff4444',
    generalBorder: 'rgba(255, 255, 255, 0.08)',
    generalBorderDim: 'rgba(255, 255, 255, 0.04)',
    menuItemBackground: 'rgba(224, 232, 255, 0.1)',
    modalBackdrop: 'rgba(0, 0, 0, 0.5)',
    modalBackground: '#1a1b1f',
    modalBorder: 'rgba(255, 255, 255, 0.08)',
    modalText: '#ffffff',
    modalTextDim: 'rgba(224, 232, 255, 0.3)',
    modalTextSecondary: 'rgba(255, 255, 255, 0.6)',
    profileAction: 'rgba(224, 232, 255, 0.1)',
    profileActionHover: 'rgba(224, 232, 255, 0.2)',
    profileForeground: '#1a1b1f',
    selectedOptionBorder: '#10b981',
    standby: '#ffd700',
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
  },
  radii: {
    actionButton: '12px',
    connectButton: '12px',
    menuButton: '12px',
    modal: '16px',
    modalMobile: '16px',
  },
  shadows: {
    connectButton: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    dialog: '0px 8px 32px rgba(0, 0, 0, 0.32)',
    profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.04)',
    selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.24)',
    selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.12)',
    walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.16)',
  },
};

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rainbowKitTheme}
          modalSize="compact"
          initialChain={import.meta.env.DEV ? sepolia : mainnet}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Export configuration for use in other parts of the app
export { config as wagmiConfig, queryClient };

// Export commonly used chains
export { mainnet, polygon, sepolia, polygonAmoy, localhost };

// Type exports for TypeScript support
export type { Chain };