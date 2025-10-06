// src/config/wagmiConfig.ts
import { createConfig, http } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { liskSepolia } from '../chains/liskSepolia';
import { u2uMainnet } from '../chains/u2uMainnet';
import { NETWORKS } from './networks';
import { APP_CONFIG, WALLETCONNECT_PROJECT_ID } from './constants';

// Validate environment variables at build time
if (!WALLETCONNECT_PROJECT_ID) {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID is missing. WalletConnect may not work properly.');
}

// Create readonly tuple for strict type safety
// Support both Lisk Sepolia (testnet) and U2U Mainnet
export const chains = [liskSepolia, u2uMainnet] as const;

export const config = createConfig({
  connectors: [
    // 1. Injected connector with mobile-specific detection
    injected({
      target: () => ({
        id: 'injected',
        name: 'Injected',
        provider: typeof window !== 'undefined' ? window.ethereum : undefined,
      }),
    }),
    // 2. WalletConnect with mobile optimization
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: APP_CONFIG.NAME,
        description: APP_CONFIG.DESCRIPTION,
        url: typeof window !== 'undefined' ? window.location.origin : 'https://greenledger.app',
        icons: []
      },
      showQrModal: true,
    }),
    // 3. Coinbase Wallet
    coinbaseWallet({
      appName: APP_CONFIG.NAME,
      appLogoUrl: undefined,
    }),
  ],
  
  // Chain configuration
  chains,
  
  // Transport configuration (RPC providers)
  transports: {
    [liskSepolia.id]: http(NETWORKS.lisk.rpcUrl),
    [u2uMainnet.id]: http(NETWORKS.u2u.rpcUrl),
  },
  ssr: false,
})