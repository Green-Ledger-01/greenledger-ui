import type { Chain } from 'viem/chains'

export const liskSepolia: Chain = {
  id: 4202,
  name: 'Lisk Sepolia Testnet',
  nativeCurrency: {
    name: 'Lisk',
    symbol: 'LSK',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
    public: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lisk Explorer',
      url: 'https://explorer.sepolia-api.lisk.com',
    },
  },
  testnet: true,
}