/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Existing Particle and WalletConnect config
  readonly VITE_PARTICLE_PROJECT_ID: string;
  readonly VITE_PARTICLE_CLIENT_KEY: string;
  readonly VITE_PARTICLE_APP_ID: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_DEBUG: string;
  readonly VITE_NODE_ENV: string;
  
  // Contract Addresses - Missing from your current file
  readonly VITE_GREENLEDGER_USER_MANAGEMENT_CONTRACT_ADDRESS: string;
  readonly VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS: string;
  readonly VITE_MARKETPLACE_CONTRACT_ADDRESS: string;
  readonly VITE_TRANSPORTATION_MANAGER_CONTRACT_ADDRESS: string;
  readonly VITE_PAYMENT_PROCESSOR_CONTRACT_ADDRESS: string;
  readonly VITE_ORDER_MANAGER_CONTRACT_ADDRESS: string;
  readonly VITE_GREENLEDGER_ACCESS_CONTRACT_ADDRESS: string;
  readonly VITE_GREENLEDGER_PAYMASTER_CONTRACT_ADDRESS: string;
  readonly VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS: string;
  
  // IPFS/Pinata Configuration - Missing from your current file
  readonly VITE_APP_PINATA_API_KEY: string;
  readonly VITE_APP_PINATA_SECRET_KEY: string;
  readonly VITE_PINATA_GATEWAY: string;
  readonly VITE_APP_IPFS_ENDPOINT: string;

  // Web3Auth Configuration
  readonly VITE_WEB3AUTH_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  
  // App Configuration 
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_DESCRIPTION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global process type for browser polyfill
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
  var process: {
    env: Record<string, string>;
    version: string;
    versions: { node: string };
    platform: string;
    nextTick: (cb: Function) => void;
  };
}