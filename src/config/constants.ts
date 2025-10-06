/**
 * Application Constants
 * Centralized configuration for contract addresses, API endpoints, and other constants
 */

import { getContractAddresses } from './networks';

// Contract Addresses - dynamically loaded based on connected network
// This will be updated when the user switches networks
export const getContractAddressesForChain = (chainId?: number) => getContractAddresses(chainId);

// Legacy export for backward compatibility
export const CONTRACT_ADDRESSES = getContractAddresses();

// WalletConnect Configuration
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c7a85de336009620345903a0c197ddb8';

// IPFS Configuration
export const IPFS_CONFIG = {
  PINATA_API_KEY: import.meta.env.VITE_APP_PINATA_API_KEY,
  PINATA_SECRET_API_KEY: import.meta.env.VITE_APP_PINATA_SECRET_KEY,
  GATEWAY: import.meta.env.VITE_PINATA_GATEWAY || 'https://ipfs.io/ipfs',
  PINATA_ENDPOINT: import.meta.env.VITE_APP_IPFS_ENDPOINT || 'https://api.pinata.cloud/pinning/pinFileToIPFS',
  // Fallback gateways for better reliability and CORS support
  FALLBACK_GATEWAYS: [
    'https://ipfs.io/ipfs',
    'https://gateway.pinata.cloud/ipfs',
    'https://cloudflare-ipfs.com/ipfs',
    'https://dweb.link/ipfs',
    'https://cf-ipfs.com/ipfs',
    'https://ipfs.filebase.io/ipfs',
    'https://4everland.io/ipfs',
  ],
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'GreenLedger',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'production',
  DESCRIPTION: 'Blockchain-based Agricultural Supply Chain Tracker',
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

// Payment System Constants
export const LISTING_STATUS = {
  ACTIVE: 0,
  SOLD: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const;

export const ORDER_STATUS = {
  CREATED: 0,
  PAID: 1,
  CONFIRMED: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
  COMPLETED: 5,
  CANCELLED: 6,
  DISPUTED: 7,
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.CREATED]: 'Created',
  [ORDER_STATUS.PAID]: 'Paid',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.IN_TRANSIT]: 'In Transit',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.DISPUTED]: 'Disputed',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 0,
  ESCROWED: 1,
  RELEASED: 2,
  REFUNDED: 3,
  DISPUTED: 4,
} as const;

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.ESCROWED]: 'Escrowed',
  [PAYMENT_STATUS.RELEASED]: 'Released',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [PAYMENT_STATUS.DISPUTED]: 'Disputed',
} as const;

export const VEHICLE_TYPES = {
  TRUCK: 0,
  REFRIGERATED: 1,
  VAN: 2,
  MOTORCYCLE: 3,
} as const;

export const VEHICLE_TYPE_LABELS = {
  [VEHICLE_TYPES.TRUCK]: 'Truck',
  [VEHICLE_TYPES.REFRIGERATED]: 'Refrigerated Truck',
  [VEHICLE_TYPES.VAN]: 'Van',
  [VEHICLE_TYPES.MOTORCYCLE]: 'Motorcycle',
} as const;

export const TRANSPORTER_STATUS = {
  ACTIVE: 0,
  BUSY: 1,
  INACTIVE: 2,
  SUSPENDED: 3,
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

// Currency Configuration
export const CURRENCY_CONFIG = {
  DEFAULT_CURRENCY: 'USD' as const,
  SUPPORTED_CURRENCIES: ['ETH', 'USD', 'KES', 'NGN'] as const,
  EXCHANGE_RATE_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  FALLBACK_ETH_PRICE_USD: 2000,
  FALLBACK_USD_KES: 150,
  FALLBACK_USD_NGN: 800,
} as const;