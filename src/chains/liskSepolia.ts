import { Chain } from 'wagmi';
// import { liskSepolia, chains } from '../chains/liskSepolia';

export const liskSepolia: Chain = {
  id: 4202,
  name: 'Lisk Sepolia',
  network: 'lisk-sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
    public: { http: ['https://rpc.sepolia-api.lisk.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia-blockscout.lisk.com',
    },
  },
  testnet: true,
  
  // Optional: Contract addresses for better wallet support
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 502046,
    },
  },
};