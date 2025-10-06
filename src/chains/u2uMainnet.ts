import { Chain } from 'wagmi';

export const u2uMainnet: Chain = {
  id: 39,
  name: 'U2U Network',
  network: 'u2u-mainnet',
  nativeCurrency: {
    name: 'U2U',
    symbol: 'U2U',
    decimals: 18,
  },
  rpcUrls: {
    default: { 
      http: ['https://rpc-mainnet.u2u.xyz'],
    },
    public: { 
      http: ['https://rpc-mainnet.u2u.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'U2U Explorer',
      url: 'https://u2uscan.xyz',
    },
  },
  testnet: false,
  
  // Contract addresses for better wallet support
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
  
  // Mobile-specific configurations
  iconUrl: 'https://u2u.xyz/favicon.ico',
  iconBackground: '#fff',
};