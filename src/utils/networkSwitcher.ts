/**
 * Network Switcher Utility
 * Handles switching between U2U and Lisk networks
 */

import { switchChain } from '@wagmi/core';
import { config } from '../config/wagmiConfig';
import { NETWORKS, NetworkName } from '../config/networks';

export const switchToNetwork = async (networkName: NetworkName) => {
  const network = NETWORKS[networkName];
  
  try {
    await switchChain(config, { chainId: network.chainId });
    return { success: true };
  } catch (error) {
    console.error(`Failed to switch to ${network.name}:`, error);
    return { success: false, error };
  }
};

export const addNetworkToWallet = async (networkName: NetworkName) => {
  const network = NETWORKS[networkName];
  
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${network.chainId.toString(16)}`,
        chainName: network.name,
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.explorerUrl],
        nativeCurrency: networkName === 'u2u' 
          ? { name: 'U2U', symbol: 'U2U', decimals: 18 }
          : { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }
      }]
    });
    return { success: true };
  } catch (error) {
    console.error(`Failed to add ${network.name} to wallet:`, error);
    return { success: false, error };
  }
};

export const getCurrentChainId = (): number | null => {
  if (!window.ethereum) return null;
  return parseInt(window.ethereum.chainId || '0x0', 16);
};

export const isCorrectNetwork = (networkName: NetworkName): boolean => {
  const currentChainId = getCurrentChainId();
  const targetChainId = NETWORKS[networkName].chainId;
  return currentChainId === targetChainId;
};