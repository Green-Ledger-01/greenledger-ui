# 🚀 U2U Mainnet Deployment Guide

## 📋 **HackQuest Requirements**
- **Deadline**: October 6, 2024
- **Network**: U2U Mainnet (Chain ID: 39)
- **Forms to Complete**:
  - [Integration Progress Form](https://docs.google.com/forms/d/e/1FAIpQLSc5ohrcDkFJ-6LhH3aViR75K-iCERiptbKwr-b-1LC0tOVu0g/viewform)
  - [Gas Fee Wallet Form](https://docs.google.com/forms/d/e/1FAIpQLSdfkDeHxnuDgJqUSY5Nn7Vx26XVDvzqU-fCjSPgMWbWTg8T8w/viewform)

## 🔧 **Technical Setup**

### 1. **Environment Configuration**
```bash
# Copy and update environment variables
cp .env.example .env
```

Add U2U configuration to `.env`:
```env
# U2U Mainnet Configuration
VITE_U2U_RPC_URL="https://rpc-mainnet.u2u.xyz"
VITE_U2U_CHAIN_ID="39"

# U2U Contract Addresses (after deployment)
VITE_U2U_USER_MANAGEMENT_CONTRACT_ADDRESS=""
VITE_U2U_CROPBATCH_TOKEN_CONTRACT_ADDRESS=""
VITE_U2U_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS=""
```

### 2. **Network Support**
✅ **Already Configured**:
- U2U Mainnet chain definition
- Multi-network wagmi config
- Network switcher component
- RPC transport setup

### 3. **Smart Contract Deployment**

#### **Prerequisites**:
- U2U tokens for gas fees (from HackQuest)
- Deployment wallet configured
- Contract source code ready

#### **Deployment Steps**:
```bash
# 1. Deploy contracts to U2U mainnet
# (Use your existing deployment scripts with U2U network)

# 2. Update contract addresses in .env
VITE_U2U_USER_MANAGEMENT_CONTRACT_ADDRESS="0x..."
VITE_U2U_CROPBATCH_TOKEN_CONTRACT_ADDRESS="0x..."
VITE_U2U_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS="0x..."

# 3. Test deployment
npm run dev
```

### 4. **Frontend Configuration**

#### **Update Constants** (if needed):
```typescript
// src/config/constants.ts
export const CONTRACT_ADDRESSES = {
  // Lisk Sepolia (existing)
  UserManagement: process.env.VITE_GREENLEDGER_USER_MANAGEMENT_CONTRACT_ADDRESS,
  CropBatchToken: process.env.VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS,
  SupplyChainManager: process.env.VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS,
  
  // U2U Mainnet (new)
  U2U_UserManagement: process.env.VITE_U2U_USER_MANAGEMENT_CONTRACT_ADDRESS,
  U2U_CropBatchToken: process.env.VITE_U2U_CROPBATCH_TOKEN_CONTRACT_ADDRESS,
  U2U_SupplyChainManager: process.env.VITE_U2U_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS,
};
```

## 🧪 **Testing Checklist**

### **Pre-Deployment**:
- [ ] U2U network added to MetaMask
- [ ] Test wallet has U2U tokens
- [ ] RPC connection working
- [ ] Network switcher functional

### **Post-Deployment**:
- [ ] Contracts deployed successfully
- [ ] Contract addresses updated in config
- [ ] Wallet connection works on U2U
- [ ] Role registration works
- [ ] NFT minting works
- [ ] Marketplace loads
- [ ] Transfer functionality works

## 🌐 **Production Deployment**

### **Build for Production**:
```bash
# Build optimized bundle
npm run build

# Test production build
npm run preview
```

### **Deploy Options**:
1. **Vercel** (Recommended)
2. **Netlify**
3. **AWS S3 + CloudFront**
4. **IPFS** (Decentralized)

### **Environment Variables for Production**:
```env
# Production U2U Configuration
VITE_U2U_RPC_URL="https://rpc-mainnet.u2u.xyz"
VITE_U2U_CHAIN_ID="39"
VITE_U2U_USER_MANAGEMENT_CONTRACT_ADDRESS="0x..."
VITE_U2U_CROPBATCH_TOKEN_CONTRACT_ADDRESS="0x..."
VITE_U2U_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS="0x..."
```

## 📊 **Monitoring & Analytics**

### **Track Deployment Success**:
- Contract deployment transactions
- First successful user registration
- First NFT mint on U2U
- Network switching functionality
- Performance metrics

## 🔗 **Useful Links**

- **U2U Network**: https://u2u.xyz
- **U2U Explorer**: https://u2uscan.xyz
- **U2U RPC**: https://rpc-mainnet.u2u.xyz
- **HackQuest**: Contact Allen (@AAbbiiiiiiiiiii)

## 🚨 **Important Notes**

1. **Deadline**: October 6, 2024
2. **Fill out both HackQuest forms ASAP**
3. **Test thoroughly before final deployment**
4. **Keep backup of contract addresses**
5. **Monitor gas usage during deployment**

---

**Status**: ✅ Ready for U2U deployment
**Branch**: `feat/u2u-mainnet-deployment`
**Next Steps**: Deploy contracts → Update config → Test → Submit forms