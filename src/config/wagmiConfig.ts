import { createConfig, http } from 'wagmi'
import { liskSepolia } from '../chains/liskSepolia'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { WALLETCONNECT_PROJECT_ID, APP_CONFIG } from './constants'

// Ensure this is a readonly tuple
export const chains = [liskSepolia] as const

export const config = createConfig({
  connectors: [
    injected(),
    coinbaseWallet({ 
      appName: APP_CONFIG.NAME,
      appLogoUrl: undefined,
    }),
    walletConnect({ 
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: APP_CONFIG.NAME,
        description: 'Blockchain-based Agricultural Supply Chain Tracker',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://greenledger.app',
        icons: []
      }
    }),
  ],
  chains,
  transports: {
    [liskSepolia.id]: http(import.meta.env.VITE_APP_RPC_URL || 'https://rpc.sepolia-api.lisk.com'),
  },
  ssr: false,
})