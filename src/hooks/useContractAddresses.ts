/**
 * Dynamic Contract Addresses Hook
 * Returns contract addresses based on connected network
 */

import { useChainId } from 'wagmi';
import { getContractAddresses, getNetworkByChainId } from '../config/networks';

export const useContractAddresses = () => {
  const chainId = useChainId();
  
  const addresses = getContractAddresses(chainId);
  const networkName = getNetworkByChainId(chainId);
  const isSupported = networkName !== null;
  
  // Check if specific contracts are available
  const hasSupplyChain = !!addresses.SupplyChainManager;
  const hasUserManagement = !!addresses.UserManagement;
  const hasCropBatchToken = !!addresses.CropBatchToken;
  
  return {
    addresses,
    networkName,
    isSupported,
    chainId,
    hasSupplyChain,
    hasUserManagement,
    hasCropBatchToken,
  };
};