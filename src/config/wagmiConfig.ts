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
    
    // 2. Coinbase Wallet with dark theme
    coinbaseWallet({
      appName: APP_NAME,
      darkMode: true,
    }),
    
    // 3. WalletConnect v2 with Lisk Sepolia metadata
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID || 'fallback-project-id',
      metadata: {
        name: APP_NAME,
        description: 'Tokenized Agricultural Supply Chain Tracker',
        url: window.location.origin,
        icons: [`${window.location.origin}/logo192.png`],
      },
      showQrModal: true,
    }),
  ],
  
  // Chain configuration
  chains,
  
  // Transport configuration (RPC providers)
  transports: {
    [liskSepolia.id]: http(
      // Fallback to public RPC if needed
      import.meta.env.VITE_LISK_RPC_URL || 'https://rpc.sepolia-api.lisk.com',
      {
        // Production-ready settings
        batch: {
          wait: 50, // 50ms batching window
        },
        retryCount: 3, // Retry failed requests
        timeout: 15_000, // 15 second timeout
      }
    ),
  },
  
  // Optional: Enable debug mode in development
  ssr: import.meta.env.DEV,
});