/**
 * Network Status Component
 * Shows current network and contract deployment status
 */

import React from 'react';
import { useChainId } from 'wagmi';
import { getNetworkByChainId, NETWORKS } from '../config/networks';
import { useContractAddresses } from '../hooks/useContractAddresses';
import { switchToNetwork } from '../utils/networkSwitcher';

export const NetworkStatus: React.FC = () => {
  const chainId = useChainId();
  const { networkName, isSupported } = useContractAddresses();
  
  const currentNetwork = networkName ? NETWORKS[networkName] : null;
  
  const handleNetworkSwitch = async (targetNetwork: 'u2u' | 'lisk') => {
    await switchToNetwork(targetNetwork);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="font-medium">
        {currentNetwork?.name || `Chain ${chainId}`}
      </span>
      
      {isSupported && (
        <span className="text-xs text-green-600">✓ Contracts Available</span>
      )}
      
      {!isSupported && chainId && (
        <div className="flex gap-1">
          <button
            onClick={() => handleNetworkSwitch('lisk')}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Lisk
          </button>
          <button
            onClick={() => handleNetworkSwitch('u2u')}
            className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
          >
            U2U
          </button>
        </div>
      )}
    </div>
  );
};