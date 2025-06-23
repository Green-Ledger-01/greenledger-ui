# Supply Chain Management Features

This document describes the new supply chain management features implemented in GreenLedger, including real blockchain integration with IPFS storage and comprehensive provenance tracking.

## 🚀 New Features

### 1. Enhanced Tokenization Page (`/tokenize`)
- **Real IPFS Integration**: Stores crop batch metadata and images on IPFS using Pinata
- **Automatic Provenance Initialization**: Creates supply chain tracking record upon token minting
- **Comprehensive Form Validation**: Validates all input fields with proper error handling
- **Progress Tracking**: Shows real-time progress of IPFS upload and blockchain transactions
- **Role-Based Access**: Only farmers can tokenize crop batches

**Key Improvements:**
- Integrated with SupplyChainManager contract for automatic provenance setup
- Enhanced error handling with specific guidance for different error types
- Real-time status indicators showing wallet connection, transaction progress, and provenance initialization
- Comprehensive metadata collection including certifications, location, and detailed notes

### 2. Transfer Ownership Page (`/transfer`)
- **Role-Based Transfers**: Validates transfers based on user roles and current token state
- **Smart State Management**: Automatically updates supply chain state based on recipient role
- **Token Selection**: Shows only transferable tokens based on user's role and token state
- **Location & Notes Tracking**: Records transfer location and notes for provenance
- **Real-Time Validation**: Validates recipient addresses and transfer eligibility

**Transfer Rules:**
- **Farmers** → Can transfer to Transporters or Buyers (from Produced state)
- **Transporters** → Can transfer to Buyers (from InTransit state)  
- **Buyers** → Can transfer to other Buyers (from Delivered state - resale)

### 3. Supply Chain Explorer (`/explorer`)
- **Real Provenance Data**: Displays actual blockchain data from SupplyChainManager
- **Advanced Filtering**: Filter by supply chain state, search by multiple criteria
- **Interactive Timeline**: Visual representation of token journey through supply chain
- **Detailed Token Information**: Shows complete token metadata and current status
- **Responsive Design**: Works seamlessly on desktop and mobile devices

**Features:**
- Search by token ID, crop type, farmer address, or location
- Filter tokens by supply chain state (Produced, InTransit, Delivered, Consumed)
- View complete provenance history with timestamps and actor information
- Interactive modal with detailed token information and supply chain journey

## 🔗 Smart Contract Integration

### SupplyChainManager Contract
The new `SupplyChainManager` contract provides comprehensive supply chain tracking:

```solidity
// Key functions
function initializeProvenance(uint256 tokenId, address farmer, string location, string notes)
function transferWithProvenance(uint256 tokenId, address from, address to, string location, string notes)
function getProvenanceHistory(uint256 tokenId) returns (ProvenanceRecord)
function getProvenanceStep(uint256 tokenId, uint256 stepIndex) returns (ProvenanceStep)
```

**Supply Chain States:**
- `PRODUCED` (0): Initial state when minted by farmer
- `IN_TRANSIT` (1): Being transported
- `DELIVERED` (2): Delivered to buyer
- `CONSUMED` (3): Final state

### Contract Addresses
Update your `.env` file with the deployed contract address:
```env
VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

## 🛠️ Technical Implementation

### Real IPFS Integration
- Uses Pinata API for reliable IPFS storage
- Stores both images and metadata on IPFS
- Generates proper IPFS URIs for blockchain storage
- Handles upload progress and error states

### Blockchain Integration
- Real contract interactions using wagmi hooks
- Proper error handling and transaction status tracking
- Gas estimation and transaction confirmation
- Event listening for real-time updates

### State Management
- React hooks for contract interactions
- Local state management for UI updates
- Proper loading states and error handling
- Optimistic UI updates where appropriate

## 📱 User Interface

### Navigation
The sidebar now includes dedicated sections for:
- **Tokenize Crop**: Create NFTs with full provenance tracking
- **Transfer Ownership**: Role-based token transfers
- **Supply Chain Explorer**: Comprehensive provenance viewing

### Responsive Design
- Mobile-first design approach
- Touch-friendly interfaces
- Responsive tables and modals
- Optimized for various screen sizes

### User Experience
- Clear visual feedback for all actions
- Progress indicators for long-running operations
- Comprehensive error messages with actionable guidance
- Role-based UI that shows only relevant features

## 🔧 Setup and Configuration

### 1. Environment Variables
```env
# IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_key

# Contract Addresses
VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
VITE_USER_MANAGEMENT_CONTRACT_ADDRESS=0x66BCB324f59035aD2B084Fe651ea82398A9fac82
VITE_CROP_BATCH_TOKEN_CONTRACT_ADDRESS=0xA065205364784B3D7e830D0EB2681EB218e3aD27
```

### 2. Contract Deployment
Deploy the SupplyChainManager contract:
```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export NETWORK=lisk_sepolia
export USER_MANAGEMENT_ADDRESS=0x66BCB324f59035aD2B084Fe651ea82398A9fac82
export CROP_BATCH_TOKEN_ADDRESS=0xA065205364784B3D7e830D0EB2681EB218e3aD27

# Run deployment script
node scripts/deploy-supply-chain-manager.js
```

### 3. Frontend Integration
The frontend automatically integrates with the deployed contracts using the configured addresses.

## 🧪 Testing

### Manual Testing Workflow
1. **Connect Wallet**: Ensure you have a wallet connected with appropriate role
2. **Tokenize Crop**: Create a new crop batch token with full metadata
3. **Verify Provenance**: Check that provenance was initialized in the explorer
4. **Transfer Token**: Transfer the token to another user with appropriate role
5. **Track Journey**: View the complete supply chain journey in the explorer

### Role-Based Testing
- Test with different user roles (Farmer, Transporter, Buyer)
- Verify role-based access controls work correctly
- Test invalid transfer scenarios to ensure proper validation

## 🚀 Production Deployment

### Prerequisites
- Deployed UserManagement contract
- Deployed CropBatchToken contract
- Pinata API keys for IPFS storage
- Sufficient ETH for contract deployment and transactions

### Deployment Steps
1. Deploy SupplyChainManager contract with correct dependency addresses
2. Update environment variables with deployed contract address
3. Configure Pinata API keys for IPFS storage
4. Test all features with real transactions
5. Monitor contract interactions and gas usage

## 📊 Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| ✅ Enhanced Tokenization | Complete | Real IPFS + automatic provenance |
| ✅ Transfer Ownership | Complete | Role-based transfers with tracking |
| ✅ Supply Chain Explorer | Complete | Real provenance data visualization |
| ✅ SupplyChainManager Contract | Complete | Comprehensive tracking contract |
| ✅ Real IPFS Integration | Complete | Pinata-based storage |
| ✅ Role-Based Access Control | Complete | Proper permission validation |
| ✅ Responsive UI | Complete | Mobile-friendly design |
| ✅ Error Handling | Complete | Comprehensive error management |

## 🔮 Future Enhancements

- **QR Code Generation**: Generate QR codes for easy token tracking
- **Batch Operations**: Support for bulk token operations
- **Analytics Dashboard**: Supply chain analytics and insights
- **Mobile App**: Native mobile application
- **API Integration**: REST API for third-party integrations
- **Advanced Filtering**: More sophisticated search and filter options

---

This implementation provides a complete, production-ready supply chain management system with real blockchain integration, IPFS storage, and comprehensive provenance tracking.
