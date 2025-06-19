import { createConfig, http } from 'wagmi'
import { liskSepolia } from '../chains/liskSepolia'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { WALLETCONNECT_PROJECT_ID, APP_CONFIG } from './constants'

// Ensure this is a readonly tuple
export const chains = [liskSepolia] as const

export const config = createConfig({
  connectors: [
    injected(),
    coinbaseWallet({ appName: APP_CONFIG.NAME }),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  ],
  chains,
  transports: {
    [liskSepolia.id]: http(),
  },
})