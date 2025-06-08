import { createConfig, http } from 'wagmi'
import { liskSepolia } from '../chains/liskSepolia'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Ensure this is a readonly tuple
export const chains = [liskSepolia] as const

export const config = createConfig({
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'GreenLedger' }),
    walletConnect({ projectId: '48eb3c0dc304ad679c805fba58632a31' }),
  ],
  chains,
  transports: {
    [liskSepolia.id]: http(),
  },
})