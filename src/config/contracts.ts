// Contract Configuration
// Update these addresses with your deployed contract addresses

export const CONTRACT_CONFIG = {
  // Replace these with your actual deployed contract addresses
  addresses: {
    GreenLedgerAccess: '0x...', // Replace with actual deployed address
    CropBatchToken: '0x...', // Replace with actual deployed address
    GreenLedgerPaymaster: '0x...', // Replace with actual deployed address
  },
  
  // Network configuration
  network: {
    chainId: 4202, // Lisk Sepolia testnet
    name: 'Lisk Sepolia',
    rpcUrl: 'https://rpc.sepolia-api.lisk.com',
    blockExplorer: 'https://sepolia-blockscout.lisk.com',
  },
  
  // Contract deployment instructions
  deployment: {
    instructions: `
      To deploy the contracts and update the addresses:
      
      1. Deploy GreenLedgerAccess contract first
      2. Deploy CropBatchToken with GreenLedgerAccess address
      3. Deploy GreenLedgerPaymaster with required parameters
      4. Update the addresses in this file
      5. Verify contracts on block explorer
      
      Example deployment script:
      
      // Deploy GreenLedgerAccess
      const accessControl = await GreenLedgerAccess.deploy(adminAddress);
      
      // Deploy CropBatchToken
      const cropToken = await CropBatchToken.deploy(
        accessControl.address,
        "https://api.example.com/metadata/",
        royaltyRecipient,
        royaltyBps
      );
      
      // Deploy GreenLedgerPaymaster
      const paymaster = await GreenLedgerPaymaster.deploy(
        entryPointAddress,
        accessControl.address
      );
    `,
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
