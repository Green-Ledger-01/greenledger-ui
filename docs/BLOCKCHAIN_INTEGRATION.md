# GreenLedger Blockchain Integration

## Overview

GreenLedger has been upgraded from mock data to a complete real-time blockchain integration platform. This document outlines the implemented features, architecture, and usage guidelines.

## 🚀 Key Features Implemented

### 1. **Real-time Blockchain Integration**
- Live connection to Lisk Sepolia testnet
- Real-time event monitoring for token mints and transfers
- Automatic data synchronization with blockchain state
- Connection status monitoring and error handling

### 2. **ERC1155 Tokenized Agricultural Supply Chain**
- **CropBatchToken Contract**: ERC1155 implementation for crop batch NFTs
- **Batch Minting**: Farmers can tokenize crop batches with metadata
- **Ownership Transfer**: Seamless transfer between farmers, transporters, and buyers
- **Metadata Storage**: IPFS integration for decentralized metadata storage

### 3. **3-Step Supply Chain Flow**
```
Farmer → Transporter → Buyer
```
- **Role-based Access Control**: Users must register with specific roles
- **Transfer Validation**: Ensures only valid role transitions
- **Real-time Tracking**: Live updates on batch movements
- **Supply Chain History**: Complete audit trail of ownership changes

### 4. **Advanced UI Features**
- **Live Data Visualizations**: Real-time statistics and charts
- **Connection Status Indicators**: Visual feedback on blockchain connectivity
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Toast Notifications**: Real-time feedback for all blockchain interactions
- **Loading States**: Skeleton screens and progress indicators

### 5. **State Management & Performance**
- **Intelligent Caching**: Reduces unnecessary blockchain calls
- **Optimistic Updates**: Immediate UI feedback with blockchain confirmation
- **Error Boundaries**: Graceful error handling and recovery
- **Auto-refresh**: Periodic data synchronization

## 🏗️ Architecture

### Frontend Architecture
```
src/
├── hooks/
│   ├── useRealTimeMarketplace.ts    # Real-time marketplace data
│   ├── useSupplyChainFlow.ts        # Supply chain management
│   ├── useCropBatchToken.ts         # Token operations
│   └── useUserManagement.ts         # Role management
├── contexts/
│   ├── Web3Context.tsx              # Blockchain state management
│   └── ToastContext.tsx             # Notification system
├��─ pages/
│   ├── Dashboard.tsx                # Live dashboard with real-time stats
│   ├── Marketplace.tsx              # Real-time marketplace
│   ├── SupplyChainTracker.tsx       # Supply chain visualization
│   └── MintCropBatch.tsx           # Batch creation
└── utils/
    ├── ipfs.ts                      # IPFS integration
    ├── testIntegration.ts           # Integration testing
    └── errorHandling.ts             # Error management
```

### Smart Contract Integration
- **CropBatchToken (ERC1155)**: Multi-token standard for crop batches
- **UserManagement**: Role-based access control
- **Event Monitoring**: Real-time blockchain event listening
- **Transaction Management**: Proper gas estimation and error handling

### IPFS Integration
- **Pinata Integration**: Reliable IPFS pinning service
- **Metadata Storage**: JSON metadata for crop batch details
- **Image Storage**: Decentralized image hosting
- **Fallback Mechanisms**: Graceful degradation when IPFS is unavailable

## 🔧 Configuration

### Environment Variables
```env
# Blockchain Configuration
VITE_APP_RPC_URL=https://rpc.sepolia-api.lisk.com
VITE_APP_CHAIN_ID=4202
VITE_APP_NETWORK_NAME=Lisk Sepolia
VITE_APP_EXPLORER_URL=https://sepolia-blockscout.lisk.com

# Contract Addresses
VITE_GREENLEDGER_ACCESS_CONTRACT_ADDRESS=0xYourUserManagementContract
VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS=0xYourCropBatchTokenContract
VITE_GREENLEDGER_PAYMASTER_CONTRACT_ADDRESS=0xYourPaymasterContract

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# IPFS Configuration
VITE_APP_IPFS_ENDPOINT=https://api.pinata.cloud/pinning/pinFileToIPFS
VITE_APP_PINATA_API_KEY=your_pinata_api_key
VITE_APP_PINATA_SECRET_KEY=your_pinata_secret_key

# Token Configuration
VITE_CROPBATCH_TOKEN_BASE_URI=https://your-metadata-base-uri/
VITE_CROPBATCH_TOKEN_ROYALTY_RECIPIENT=0xYourRoyaltyRecipient
VITE_CROPBATCH_TOKEN_ROYALTY_BPS=250
```

## 🎯 Usage Guide

### For Farmers
1. **Connect Wallet**: Use MetaMask or WalletConnect
2. **Register Role**: Register as a farmer through the admin
3. **Mint Crop Batch**: Create new tokenized crop batches
4. **Transfer to Transporter**: Move batches to transportation phase

### For Transporters
1. **Register Role**: Get registered as a transporter
2. **Receive Batches**: Accept transfers from farmers
3. **Track Movement**: Monitor batches in transit
4. **Transfer to Buyer**: Complete delivery to final destination

### For Buyers
1. **Browse Marketplace**: View available crop batches
2. **Track Provenance**: See complete supply chain history
3. **Receive Batches**: Accept final delivery
4. **Verify Authenticity**: Check blockchain records

### For Administrators
1. **Manage Roles**: Register and manage user roles
2. **Monitor System**: View real-time statistics
3. **Oversee Operations**: Track all supply chain activities

## 📊 Real-time Features

### Live Dashboard
- **Connection Status**: Real-time blockchain connectivity
- **Live Statistics**: Auto-updating batch counts and farm data
- **Recent Activity**: Latest mints and transfers
- **Performance Metrics**: System health indicators

### Marketplace Updates
- **Auto-refresh**: New batches appear automatically
- **Live Filters**: Real-time search and filtering
- **Status Updates**: Supply chain status changes
- **Owner Information**: Current ownership details

### Supply Chain Tracking
- **Real-time Events**: Instant transfer notifications
- **Progress Visualization**: Interactive supply chain flow
- **Transaction Links**: Direct links to blockchain explorer
- **History Timeline**: Complete audit trail

## 🔒 Security Features

### Smart Contract Security
- **Role-based Access**: Only authorized users can perform actions
- **Transfer Validation**: Ensures valid supply chain transitions
- **Reentrancy Protection**: Prevents common attack vectors
- **Input Validation**: Comprehensive parameter checking

### Frontend Security
- **Environment Variables**: Sensitive data protection
- **Error Boundaries**: Prevents application crashes
- **Input Sanitization**: XSS protection
- **Secure IPFS**: Validated metadata handling

## 🧪 Testing

### Integration Testing
Run the comprehensive integration test suite:

```typescript
import { integrationTester } from './src/utils/testIntegration';

// Run all tests
const results = await integrationTester.runAllTests();
```

### Test Coverage
- **Configuration Tests**: Environment and contract setup
- **Blockchain Connection**: RPC and chain verification
- **IPFS Integration**: Pinata API and gateway tests
- **Contract Interaction**: ABI loading and deployment verification
- **Real-time Features**: Event monitoring and data flow

## 🚀 Deployment

### Prerequisites
1. **Smart Contracts**: Deploy CropBatchToken and UserManagement contracts
2. **IPFS Setup**: Configure Pinata account and API keys
3. **WalletConnect**: Set up project ID
4. **Environment**: Configure all environment variables

### Build Process
```bash
# Install dependencies
npm install

# Run integration tests
npm run test:integration

# Build for production
npm run build

# Deploy to hosting platform
npm run deploy
```

## 📈 Performance Optimizations

### Caching Strategy
- **Batch Data Caching**: 30-second cache for batch information
- **Role Caching**: Persistent role information storage
- **IPFS Caching**: Local metadata caching
- **Event Deduplication**: Prevents duplicate event processing

### Network Optimization
- **Batch Requests**: Parallel blockchain calls
- **Rate Limiting**: Prevents API overload
- **Retry Logic**: Automatic retry for failed requests
- **Connection Pooling**: Efficient RPC usage

### UI Performance
- **Skeleton Loading**: Immediate visual feedback
- **Virtual Scrolling**: Efficient large list rendering
- **Image Optimization**: Lazy loading and compression
- **Code Splitting**: Reduced bundle sizes

## 🔮 Future Enhancements

### Planned Features
1. **Advanced Analytics**: Comprehensive reporting dashboard
2. **Mobile App**: React Native implementation
3. **Multi-chain Support**: Ethereum, Polygon integration
4. **IoT Integration**: Sensor data incorporation
5. **AI Predictions**: Supply chain optimization

### Scalability Improvements
1. **Layer 2 Integration**: Reduced transaction costs
2. **Batch Operations**: Multiple transfers in single transaction
3. **Indexing Service**: Faster data retrieval
4. **CDN Integration**: Global content delivery

## 🆘 Troubleshooting

### Common Issues

#### Connection Problems
```
Error: Failed to connect to blockchain
Solution: Check RPC URL and network configuration
```

#### IPFS Upload Failures
```
Error: IPFS upload failed
Solution: Verify Pinata API keys and account limits
```

#### Transaction Failures
```
Error: Transaction reverted
Solution: Check user roles and contract permissions
```

### Debug Mode
Enable debug logging by setting:
```env
VITE_DEBUG_MODE=true
```

## 📞 Support

For technical support and questions:
- **Documentation**: Check this README and inline code comments
- **Integration Tests**: Run test suite for diagnostics
- **Error Logs**: Check browser console for detailed errors
- **Community**: Join our Discord for community support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**GreenLedger** - Revolutionizing agricultural supply chains through blockchain technology. 🌱⛓️