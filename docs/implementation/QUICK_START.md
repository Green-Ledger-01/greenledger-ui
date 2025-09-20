# 🚀 GreenLedger Quick Start Guide

## 📋 Overview

Get GreenLedger up and running in **15 minutes**. This guide covers the essential setup for both development and production environments, focusing on the current repository structure with gradual enhancement.

## ⚡ Prerequisites

### **Required Software**
```bash
# Check versions
node --version    # Required: 18.0.0+
npm --version     # Required: 8.0.0+
git --version     # Required: 2.0.0+
```

### **Required Accounts**
- **GitHub Account**: For repository access
- **Pinata Account**: For IPFS storage ([pinata.cloud](https://pinata.cloud))
- **WalletConnect Account**: For Web3 integration ([walletconnect.com](https://walletconnect.com))
- **MetaMask Wallet**: For blockchain interactions

### **Recommended Tools**
- **VS Code**: With TypeScript and React extensions
- **Docker**: For database services (optional)
- **Postman**: For API testing (optional)

## 🏃‍♂️ Quick Setup (5 minutes)

### **1. Clone and Install**
```bash
# Clone the repository
git clone https://github.com/Green-Ledger-01/greenledger-ui
cd greenledger-ui

# Install dependencies
npm install

# Verify installation
npm run type-check
```

### **2. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

### **3. Essential Environment Variables**
```env
# 🔑 Blockchain Configuration
VITE_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"
VITE_APP_RPC_URL="https://rpc.sepolia-api.lisk.com"
VITE_APP_CHAIN_ID="4202"

# 📁 IPFS Configuration (get from pinata.cloud)
VITE_APP_PINATA_API_KEY="your_pinata_api_key"
VITE_APP_PINATA_SECRET_KEY="your_pinata_secret_key"

# 📜 Smart Contract Addresses (Lisk Sepolia)
VITE_GREENLEDGER_USER_MANAGEMENT_CONTRACT_ADDRESS="0x66BCB324f59035aD2B084Fe651ea82398A9fac82"
VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS="0xA065205364784B3D7e830D0EB2681EB218e3aD27"
VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS="0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
```

### **4. Start Development Server**
```bash
# Start the development server
npm run dev

# Open in browser
open http://localhost:5173
```

## 🔧 Development Setup (10 minutes)

### **1. Get API Keys**

#### **Pinata IPFS Setup**
```bash
# 1. Go to https://pinata.cloud
# 2. Create free account
# 3. Go to API Keys section
# 4. Create new API key with admin permissions
# 5. Copy API Key and Secret Key to .env
```

#### **WalletConnect Setup**
```bash
# 1. Go to https://walletconnect.com
# 2. Create account and new project
# 3. Copy Project ID to .env
```

### **2. Blockchain Setup**

#### **Add Lisk Sepolia to MetaMask**
```javascript
// Network Details
Network Name: Lisk Sepolia Testnet
RPC URL: https://rpc.sepolia-api.lisk.com
Chain ID: 4202
Currency Symbol: ETH
Block Explorer: https://sepolia-blockscout.lisk.com
```

#### **Get Test ETH**
```bash
# Get Lisk Sepolia ETH from faucet
# 1. Go to https://sepolia-faucet.lisk.com
# 2. Enter your wallet address
# 3. Request test ETH
```

### **3. Verify Setup**
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build project
npm run build

# Preview build
npm run preview
```

## 🎯 First Steps Tutorial

### **Step 1: Connect Wallet**
1. Open http://localhost:5173
2. Click "Connect Wallet" button
3. Select MetaMask
4. Switch to Lisk Sepolia network
5. Approve connection

### **Step 2: Register User Role**
1. Click "Register Role" in dashboard
2. Select your role (Farmer/Transporter/Buyer)
3. Fill in profile information
4. Submit transaction
5. Wait for confirmation

### **Step 3: Create First Crop Batch (Farmers)**
1. Navigate to "Tokenize Crop" page
2. Fill in crop details:
   - Crop Type: "Organic Wheat"
   - Quantity: "100 kg"
   - Origin Farm: "Green Valley Farm"
   - Harvest Date: Select date
3. Upload crop image
4. Add notes and certifications
5. Submit transaction
6. Wait for minting confirmation

### **Step 4: Explore Marketplace**
1. Go to "Marketplace" page
2. Browse available crop batches
3. Use filters to find specific crops
4. Click on batch for detailed view
5. Add to cart if you're a buyer

### **Step 5: Track Supply Chain**
1. Go to "Supply Chain Explorer"
2. Search for your token ID
3. View complete provenance history
4. See ownership transfers
5. Check current status

## 🔄 Adding New Features

### **Current Repository Structure**
```
greenledger-ui/
├── src/
│   ├── components/     # ✅ UI components
│   ├── pages/         # ✅ Route components
│   ├── hooks/         # ✅ Business logic
│   ├── contexts/      # ✅ State management
│   ├── utils/         # ✅ Helper functions
│   ├── contracts/     # ✅ Smart contract ABIs
│   └── config/        # ✅ Configuration
├── docs/              # ✅ Documentation
└── package.json       # ✅ Dependencies
```

### **Adding QR Verification (Priority #1)**
```bash
# 1. Install QR dependencies
npm install react-qr-reader qrcode html5-qrcode

# 2. Create QR components
mkdir src/components/qr
touch src/components/qr/QRVerificationSystem.tsx
touch src/components/qr/QRGenerator.tsx
touch src/components/qr/QRScanner.tsx

# 3. Add QR service
touch src/services/qrService.ts

# 4. Add QR hook
touch src/hooks/useQRVerification.ts
```

### **Adding Backend API (Next Step)**
```bash
# 1. Create backend directory
mkdir backend
cd backend

# 2. Initialize backend
npm init -y
npm install express graphql apollo-server-express

# 3. Create backend structure
mkdir -p src/{resolvers,services,database}
touch src/index.ts
touch src/schema.graphql

# 4. Return to frontend
cd ..
```

## 🚀 Production Deployment

### **Quick Deploy to Vercel**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel dashboard
```

### **Environment Variables for Production**
```env
# Production URLs
VITE_APP_URL="https://your-domain.vercel.app"
VITE_API_URL="https://api.your-domain.com"

# Production API keys (different from development)
VITE_APP_PINATA_API_KEY="production_pinata_key"
VITE_APP_PINATA_SECRET_KEY="production_pinata_secret"
VITE_WALLETCONNECT_PROJECT_ID="production_walletconnect_id"

# Production contract addresses (when deployed to mainnet)
# VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS="mainnet_address"
```

## 🔍 Troubleshooting

### **Common Issues**

#### **1. "Cannot connect to wallet"**
```bash
# Solution:
# 1. Ensure MetaMask is installed
# 2. Check if Lisk Sepolia network is added
# 3. Clear browser cache
# 4. Try different browser
```

#### **2. "Transaction failed"**
```bash
# Solution:
# 1. Check if you have enough ETH for gas
# 2. Verify contract addresses in .env
# 3. Check network connection
# 4. Try increasing gas limit
```

#### **3. "IPFS upload failed"**
```bash
# Solution:
# 1. Verify Pinata API keys
# 2. Check file size (max 100MB)
# 3. Try different image format
# 4. Check internet connection
```

#### **4. "Role registration failed"**
```bash
# Solution:
# 1. Ensure you're connected to correct network
# 2. Check if role is already registered
# 3. Verify contract address
# 4. Try refreshing page
```

### **Debug Mode**
```bash
# Enable debug logging
export VITE_DEBUG=true
npm run dev

# Check browser console for detailed logs
# Check network tab for API calls
# Verify contract interactions in MetaMask
```

## 📊 Performance Optimization

### **Development Performance**
```bash
# Enable fast refresh
export VITE_FAST_REFRESH=true

# Use development build
npm run dev

# Monitor bundle size
npm run build
npx vite-bundle-analyzer dist
```

### **Production Performance**
```bash
# Build with optimization
npm run build

# Preview production build
npm run preview

# Analyze bundle
npx webpack-bundle-analyzer dist
```

## 🔗 Next Steps

### **Immediate Priorities**
1. **Fix Security Issues**: [Security Guidelines](../operations/SECURITY.md)
2. **Add QR Verification**: [QR Verification Guide](../features/QR_VERIFICATION.md)
3. **Set up Testing**: [Testing Guide](../learning/TESTING.md)
4. **Add Monitoring**: [Monitoring Setup](../operations/MONITORING.md)

### **Feature Development**
1. **Transportation System**: [Transportation Guide](../features/TRANSPORTATION.md)
2. **Advanced Analytics**: [Analytics Setup](../features/ANALYTICS.md)
3. **Mobile App**: [Mobile Development](../implementation/MOBILE.md)
4. **Enterprise Features**: [Enterprise Guide](../features/ENTERPRISE.md)

### **Learning Resources**
- [Technology Stack Guide](../learning/TECH_STACK.md)
- [Best Practices](../learning/BEST_PRACTICES.md)
- [API Reference](../api/API_REFERENCE.md)
- [Component Library](../frontend/COMPONENTS.md)

## 📞 Support

### **Getting Help**
- **Documentation**: Browse [docs folder](../README.md)
- **Issues**: Create GitHub issue with `help-wanted` label
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our Discord server (link in README)

### **Contributing**
- **Bug Reports**: Use issue template
- **Feature Requests**: Use feature request template
- **Pull Requests**: Follow contribution guidelines
- **Documentation**: Help improve these docs

---

**Related Links:**
- [← Documentation Hub](../README.md)
- [System Architecture →](../architecture/SYSTEM_ARCHITECTURE.md)
- [QR Verification →](../features/QR_VERIFICATION.md)
- [Development Setup →](./DEVELOPMENT_SETUP.md)

**Last Updated**: January 15, 2024  
**Version**: 2.0  
**Status**: ✅ Complete

---

## 🎉 Congratulations!

You now have GreenLedger running locally. The platform is ready for development and testing. Start by exploring the existing features, then follow the roadmap to add the missing QR verification system and transportation network.

**Happy coding! 🌱**