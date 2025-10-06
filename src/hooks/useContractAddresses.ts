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
  
  return {
    addresses,
    networkName,
    isSupported,
    chainId,
  };
};