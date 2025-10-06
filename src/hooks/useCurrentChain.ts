/**
 * Dynamic Chain Hook
 * Returns the current chain configuration based on connected network
 */

import { useChainId } from 'wagmi';
import { liskSepolia } from '../chains/liskSepolia';
import { u2uMainnet } from '../chains/u2uMainnet';

export const useCurrentChain = () => {
  const chainId = useChainId();
  
  // Return the appropriate chain based on connected network
  switch (chainId) {
    case 39: // U2U Mainnet
      return u2uMainnet;
    case 4202: // Lisk Sepolia
      return liskSepolia;
    default:
      // Default to Lisk Sepolia for unsupported networks
      return liskSepolia;
  }
};