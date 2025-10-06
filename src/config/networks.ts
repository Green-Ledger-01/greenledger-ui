/**
 * Dynamic Multi-Network Configuration
 * Automatically detects connected network and uses correct contract addresses
 */

export type NetworkName = 'u2u' | 'lisk';

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  contracts: {
    userManagement: string;
    cropBatchToken: string;
    access: string;
    paymaster: string;
    supplyChain: string;
  };
}

export const NETWORKS: Record<NetworkName, NetworkConfig> = {
  u2u: {
    chainId: 39,
    name: 'U2U Network',
    rpcUrl: import.meta.env.VITE_U2U_RPC_URL || 'https://rpc-mainnet.u2u.xyz',
    explorerUrl: 'https://u2uscan.xyz',
    contracts: {
      userManagement: import.meta.env.VITE_U2U_USER_MANAGEMENT_CONTRACT || '0x45639B93D48754ec21266c745e968930EB8b4BB6',
      cropBatchToken: import.meta.env.VITE_U2U_CROPBATCH_TOKEN_CONTRACT || '0xd3549d47D09b485d3921E5169596deB47158b490',
      access: import.meta.env.VITE_U2U_ACCESS_CONTRACT || '0x64C9197f7051b6908d3a9FEe5b4369ff24E1e21B',
      paymaster: import.meta.env.VITE_U2U_PAYMASTER_CONTRACT || '0x747F40796cD10E72718fC801d3466B03F1755398',
      supplyChain: import.meta.env.VITE_U2U_SUPPLY_CHAIN_CONTRACT || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    },
  },
  lisk: {
    chainId: 4202,
    name: 'Lisk Sepolia',
    rpcUrl: import.meta.env.VITE_LISK_RPC_URL || 'https://rpc.sepolia-api.lisk.com',
    explorerUrl: 'https://sepolia-blockscout.lisk.com',
    contracts: {
      userManagement: import.meta.env.VITE_LISK_USER_MANAGEMENT_CONTRACT || '0x58C584ddDaAe2DF9Ac73F33F733B876Ffc23CE53',
      cropBatchToken: import.meta.env.VITE_LISK_CROPBATCH_TOKEN_CONTRACT || '0x4097236ED51C12a7b57Af129190E0166248709D0',
      access: import.meta.env.VITE_LISK_ACCESS_CONTRACT || '0x9DBa889848577778865050e67cd88eD86Cb60db6',
      paymaster: import.meta.env.VITE_LISK_PAYMASTER_CONTRACT || '0xbDc36735342605D1FdcE9A0E2bEcebC3F1A7e044',
      supplyChain: import.meta.env.VITE_LISK_SUPPLY_CHAIN_CONTRACT || '0xDc64a140Aa3E681100a9becA4E685f962f0cF6C9',
    },
  },
};

// Get network by chain ID (dynamic detection)
export const getNetworkByChainId = (chainId: number): NetworkName | null => {
  for (const [name, config] of Object.entries(NETWORKS)) {
    if (config.chainId === chainId) {
      return name as NetworkName;
    }
  }
  return null;
};

// Get active network from environment or connected chain
export const getActiveNetwork = (connectedChainId?: number): NetworkName => {
  // If connected to a chain, use that network
  if (connectedChainId) {
    const networkName = getNetworkByChainId(connectedChainId);
    if (networkName) return networkName;
  }
  
  // Fallback to environment variable
  const activeNetwork = import.meta.env.VITE_ACTIVE_NETWORK as NetworkName;
  return activeNetwork && activeNetwork in NETWORKS ? activeNetwork : 'lisk';
};

// Get current network configuration
export const getCurrentNetworkConfig = (chainId?: number): NetworkConfig => {
  return NETWORKS[getActiveNetwork(chainId)];
};

// Get contract addresses for current network
export const getContractAddresses = (chainId?: number) => {
  const config = getCurrentNetworkConfig(chainId);
  return {
    UserManagement: config.contracts.userManagement,
    CropBatchToken: config.contracts.cropBatchToken,
    GreenLedgerAccess: config.contracts.access,
    GreenLedgerPaymaster: config.contracts.paymaster,
    SupplyChainManager: config.contracts.supplyChain,
  };
};