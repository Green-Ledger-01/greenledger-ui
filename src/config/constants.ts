/**
 * Application Constants
 * Centralized configuration for contract addresses, API endpoints, and other constants
 */

// Contract Addresses - loaded from environment variables
export const CONTRACT_ADDRESSES = {
  UserManagement: import.meta.env.VITE_GREENLEDGER_USER_MANAGEMENT_CONTRACT_ADDRESS || '0x66BCB324f59035aD2B084Fe651ea82398A9fac82',
  GreenLedgerAccess: import.meta.env.VITE_GREENLEDGER_ACCESS_CONTRACT_ADDRESS || '0x9DBa889848577778865050e67cd88eD86Cb60db6',
  CropBatchToken: import.meta.env.VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS || '0xA065205364784B3D7e830D0EB2681EB218e3aD27',
  GreenLedgerPaymaster: import.meta.env.VITE_GREENLEDGER_PAYMASTER_CONTRACT_ADDRESS,
  SupplyChainManager: import.meta.env.VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
} as const;

// WalletConnect Configuration
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'a2b252199b53298a09b4344c2ae77d33';

// IPFS Configuration
export const IPFS_CONFIG = {
  PINATA_API_KEY: import.meta.env.VITE_APP_PINATA_API_KEY || 'YOUR_PINATA_API_KEY',
  PINATA_SECRET_API_KEY: import.meta.env.VITE_APP_PINATA_SECRET_KEY || 'YOUR_PINATA_SECRET_API_KEY',
  GATEWAY: import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs',
  PINATA_ENDPOINT: import.meta.env.VITE_APP_IPFS_ENDPOINT || 'https://api.pinata.cloud/pinning/pinFileToIPFS',
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'GreenLedger',
  DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Blockchain-based Agricultural Supply Chain Tracker',
} as const;

// Role Constants
export const USER_ROLES = {
  FARMER: 0,
  TRANSPORTER: 1,
  BUYER: 2,
  ADMIN: 3,
} as const;

// Supply Chain State Constants
export const SUPPLY_CHAIN_STATES = {
  PRODUCED: 0,
  IN_TRANSIT: 1,
  DELIVERED: 2,
  CONSUMED: 3,
} as const;

export const SUPPLY_CHAIN_STATE_LABELS = {
  [SUPPLY_CHAIN_STATES.PRODUCED]: 'Produced',
  [SUPPLY_CHAIN_STATES.IN_TRANSIT]: 'In Transit',
  [SUPPLY_CHAIN_STATES.DELIVERED]: 'Delivered',
  [SUPPLY_CHAIN_STATES.CONSUMED]: 'Consumed',
} as const;

// Default Admin Role Hash for AccessControl
export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

// Form Validation Constants
export const VALIDATION_LIMITS = {
  MAX_QUANTITY_KG: 100,
  MIN_QUANTITY_KG: 1,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024,
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 5000,
  SUCCESS_DURATION: 10000,
  ERROR_DURATION: 8000,
} as const;