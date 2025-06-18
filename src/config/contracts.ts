// Contract Configuration - Deployed on Lisk Sepolia
export const CONTRACT_CONFIG = {
  // Deployed contract addresses from .env.local
  addresses: {
    UserManagement: import.meta.env.VITE_USER_MANAGEMENT_CONTRACT_ADDRESS || '0x66BCB324f59035aD2B084Fe651ea82398A9fac82',
    CropBatchToken: import.meta.env.VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS || '0xA065205364784B3D7e830D0EB2681EB218e3aD27',
    GreenLedgerAccess: import.meta.env.VITE_GREENLEDGER_ACCESS_CONTRACT_ADDRESS || '0x9DBa889848577778865050e67cd88eD86Cb60db6',
    GreenLedgerPaymaster: import.meta.env.VITE_GREENLEDGER_PAYMASTER_CONTRACT_ADDRESS || '0xbDc36735342605D1FdcE9A0E2bEcebC3F1A7e044',
  },
  
  // Network configuration
  network: {
    chainId: parseInt(import.meta.env.VITE_APP_CHAIN_ID) || 4202,
    name: import.meta.env.VITE_APP_NETWORK_NAME || 'Lisk Sepolia',
    rpcUrl: import.meta.env.VITE_APP_RPC_URL || 'https://rpc.sepolia-api.lisk.com',
    blockExplorer: import.meta.env.VITE_APP_EXPLORER_URL || 'https://sepolia-blockscout.lisk.com',
  },
  
  // Contract metadata
  metadata: {
    baseUri: import.meta.env.VITE_CROPBATCH_TOKEN_BASE_URI || 'https://your-nft-metadata-base-uri/',
    royaltyRecipient: import.meta.env.VITE_CROPBATCH_TOKEN_ROYALTY_RECIPIENT || '0xF65781317f8E35891CD2edDa1Db26e56ba53B736',
    royaltyBps: parseInt(import.meta.env.VITE_CROPBATCH_TOKEN_ROYALTY_BPS) || 250,
  },
  
  // IPFS Configuration
  ipfs: {
    endpoint: import.meta.env.VITE_APP_IPFS_ENDPOINT || 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    apiKey: import.meta.env.VITE_APP_PINATA_API_KEY,
    secretKey: import.meta.env.VITE_APP_PINATA_SECRET_KEY,
  },
};

// Validation function to check if addresses are set
export const validateContractAddresses = () => {
  const { addresses } = CONTRACT_CONFIG;
  const unsetAddresses = Object.entries(addresses)
    .filter(([_, address]) => address === '0x...')
    .map(([name, _]) => name);
  
  if (unsetAddresses.length > 0) {
    console.warn(
      `⚠️  Contract addresses not set for: ${unsetAddresses.join(', ')}\n` +
      `Please update src/config/contracts.ts with your deployed contract addresses.`
    );
    return false;
  }
  
  return true;
};

// Helper function to get contract address with validation
export const getContractAddress = (contractName: keyof typeof CONTRACT_CONFIG.addresses): string => {
  const address = CONTRACT_CONFIG.addresses[contractName];
  
  if (address === '0x...') {
    throw new Error(
      `Contract address for ${contractName} is not set. ` +
      `Please update src/config/contracts.ts with the deployed address.`
    );
  }
  
  return address;
};

// Export addresses for easy access
export const ADDRESSES = CONTRACT_CONFIG.addresses;
