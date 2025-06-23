// src/providers/wagmiConfig.ts
import { createConfig, http } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { liskSepolia } from '../chains/liskSepolia';

// Environment variables for better security
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const APP_NAME = import.meta.env.VITE_APP_NAME || 'GreenLedger';

// Validate environment variables at build time
if (!WALLETCONNECT_PROJECT_ID) {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID is missing. WalletConnect may not work properly.');
}

// Create readonly tuple for strict type safety
export const chains = [liskSepolia] as const;

export const config = createConfig({
  connectors: [
    // 1. Injected connector (MetaMask, etc.)
    injected(),
    coinbaseWallet({
      appName: APP_NAME,
      appLogoUrl: undefined,
    }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: APP_NAME,
        description: 'Blockchain-based Agricultural Supply Chain Tracker',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://greenledger.app',
        icons: []
      }
    }),
  ],
  
  // Chain configuration
  chains,
  
  // Transport configuration (RPC providers)
  transports: {
    [liskSepolia.id]: http(import.meta.env.VITE_APP_RPC_URL || 'https://rpc.sepolia-api.lisk.com'),
  },
  ssr: false,
})