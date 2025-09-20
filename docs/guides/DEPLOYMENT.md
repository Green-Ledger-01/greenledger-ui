# 🚀 GreenLedger Deployment Guide

This guide will walk you through deploying the GreenLedger smart contracts and configuring the frontend application.

## 📋 Prerequisites

### Development Environment
- Node.js 18+ and npm
- Hardhat or Foundry for smart contract deployment
- MetaMask or compatible Web3 wallet
- Access to Lisk Sepolia testnet (or your preferred network)

### Required Information
- Admin wallet address (for initial setup)
- Royalty recipient address (for NFT royalties)
- EntryPoint contract address (for paymaster, if using Account Abstraction)

## 🔧 Smart Contract Deployment

### Step 1: Deploy GreenLedgerAccess Contract

This contract manages role-based access control for the entire system.

```solidity
// Constructor parameters:
// - initialAdmin: Address that will have admin privileges

const adminAddress = "0xYourAdminAddress";
const accessControl = await GreenLedgerAccess.deploy(adminAddress);
await accessControl.deployed();

console.log("GreenLedgerAccess deployed to:", accessControl.address);
```

### Step 2: Deploy CropBatchToken Contract

This is the main NFT contract for crop batch tokenization.

```solidity
// Constructor parameters:
// - _accessControlAddress: Address of the deployed GreenLedgerAccess contract
// - _initialURI: Base URI for token metadata (e.g., "https://api.yourapp.com/metadata/")
// - royaltyRecipient_: Address to receive royalty payments
// - royaltyBps_: Royalty percentage in basis points (e.g., 250 = 2.5%)

const cropBatchToken = await CropBatchToken.deploy(
  accessControl.address,
  "https://api.yourapp.com/metadata/",
  "0xRoyaltyRecipientAddress",
  250 // 2.5% royalty
);
await cropBatchToken.deployed();

console.log("CropBatchToken deployed to:", cropBatchToken.address);
```

### Step 3: Deploy GreenLedgerPaymaster Contract (Optional)

This contract enables gas sponsorship for user operations.

```solidity
// Constructor parameters:
// - _entryPoint: Address of the EntryPoint contract (for Account Abstraction)
// - _accessControlAddress: Address of the deployed GreenLedgerAccess contract

const entryPointAddress = "0xEntryPointAddress"; // Get from AA infrastructure
const paymaster = await GreenLedgerPaymaster.deploy(
  entryPointAddress,
  accessControl.address
);
await paymaster.deployed();

console.log("GreenLedgerPaymaster deployed to:", paymaster.address);
```

### Step 4: Verify Contracts

Verify your contracts on the block explorer for transparency:

```bash
# Example for Hardhat verification
npx hardhat verify --network liskSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# For GreenLedgerAccess
npx hardhat verify --network liskSepolia 0xAccessControlAddress 0xAdminAddress

# For CropBatchToken
npx hardhat verify --network liskSepolia 0xCropTokenAddress 0xAccessControlAddress "https://api.yourapp.com/metadata/" 0xRoyaltyRecipient 250

# For GreenLedgerPaymaster
npx hardhat verify --network liskSepolia 0xPaymasterAddress 0xEntryPointAddress 0xAccessControlAddress
```

## ⚙️ Frontend Configuration

### Step 1: Update Contract Addresses

Edit `src/config/contracts.ts` with your deployed contract addresses:

```typescript
export const CONTRACT_CONFIG = {
  addresses: {
    GreenLedgerAccess: '0xYourAccessControlAddress',
    CropBatchToken: '0xYourCropTokenAddress',
    GreenLedgerPaymaster: '0xYourPaymasterAddress', // Optional
  },
  
  network: {
    chainId: 4202, // Update if using different network
    name: 'Lisk Sepolia',
    rpcUrl: 'https://rpc.sepolia-api.lisk.com',
    blockExplorer: 'https://sepolia-blockscout.lisk.com',
  },
};
```

### Step 2: Configure Network Settings

Update `src/chains/liskSepolia.ts` if needed:

```typescript
export const liskSepolia = {
  id: 4202,
  name: 'Lisk Sepolia',
  network: 'lisk-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
    public: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia-blockscout.lisk.com',
    },
  },
  testnet: true,
};
```

### Step 3: Update Wagmi Configuration

Ensure `src/config/wagmiConfig.ts` includes your network:

```typescript
import { createConfig, http } from 'wagmi'
import { liskSepolia } from '../chains/liskSepolia'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'GreenLedger' }),
    walletConnect({ projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' }),
  ],
  chains: [liskSepolia],
  transports: {
    [liskSepolia.id]: http(),
  },
})
```

## 🌐 Production Deployment

### Frontend Deployment

1. **Build the application**
```bash
npm run build
```

2. **Deploy to your hosting platform**
```bash
# Example for Vercel
vercel --prod

# Example for Netlify
netlify deploy --prod --dir=dist

# Example for traditional hosting
# Upload the 'dist' folder to your web server
```

### Environment Variables

Set up environment variables for production:

```bash
# .env.production
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_APP_NAME=GreenLedger
VITE_APP_DESCRIPTION="Tokenized Agricultural Supply Chain"
```

## 🔒 Security Considerations

### Smart Contract Security
- Ensure admin keys are secured with multi-signature wallets
- Consider using timelock contracts for critical operations
- Regularly audit smart contracts
- Monitor contract events for suspicious activity

### Frontend Security
- Use HTTPS in production
- Implement Content Security Policy (CSP)
- Validate all user inputs
- Keep dependencies updated

## 📊 Post-Deployment Setup

### 1. Register Initial Users
Use the admin account to register initial users:

```javascript
// Connect with admin wallet
const accessControl = new ethers.Contract(
  accessControlAddress,
  GreenLedgerAccessABI,
  adminSigner
);

// Register a farmer
await accessControl.registerUser(farmerAddress, 0); // 0 = FARMER_ROLE

// Register a transporter
await accessControl.registerUser(transporterAddress, 1); // 1 = TRANSPORTER_ROLE

// Register a buyer
await accessControl.registerUser(buyerAddress, 2); // 2 = BUYER_ROLE
```

### 2. Set Up Metadata Server (Optional)
If using external metadata URIs, set up a server to host NFT metadata:

```json
{
  "name": "Crop Batch #1",
  "description": "Organic tomatoes from Green Valley Farm",
  "image": "https://your-server.com/images/batch-1.jpg",
  "attributes": [
    {
      "trait_type": "Crop Type",
      "value": "Tomatoes"
    },
    {
      "trait_type": "Farm",
      "value": "Green Valley Farm"
    },
    {
      "trait_type": "Harvest Date",
      "value": "2024-01-15"
    }
  ]
}
```

### 3. Configure Paymaster (If Using)
Set up the paymaster for gas sponsorship:

```javascript
// Deposit funds to paymaster
await paymaster.deposit({ value: ethers.utils.parseEther("1.0") });

// Configure allowed operations
await paymaster.setOperationStatus("0x12345678", true); // Allow specific function
```

## 🔍 Testing

### Test the Complete Flow

1. **Connect wallet** to the application
2. **Register as farmer** using the role registration
3. **Mint a crop batch** with test data
4. **Transfer to another address** (transporter/buyer)
5. **Search for the token** in the supply chain explorer
6. **Verify all data** is displayed correctly

### Automated Testing

```bash
# Run frontend tests
npm test

# Run smart contract tests
npx hardhat test

# Run integration tests
npm run test:integration
```

## 🆘 Troubleshooting

### Common Issues

1. **Contract addresses not set**
   - Update `src/config/contracts.ts` with correct addresses

2. **Network mismatch**
   - Ensure MetaMask is connected to the correct network
   - Check chain ID in configuration

3. **Transaction failures**
   - Check user has sufficient ETH for gas
   - Verify user has required role for the operation
   - Check contract is not paused

4. **Role registration fails**
   - Ensure admin has granted necessary permissions
   - Check if user already has the role

### Getting Help

- Check browser console for error messages
- Verify contract addresses on block explorer
- Test with small amounts first
- Join our community for support

---

**Deployment complete! Your GreenLedger dApp is now ready for use.** 🎉
