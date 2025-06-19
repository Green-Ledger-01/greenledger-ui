# 🚀 Development Setup Guide

## 📋 Prerequisites

- **Node.js 18+** 
- **npm or yarn**
- **MetaMask or compatible Web3 wallet**
- **Pinata Account** (for IPFS storage)

## 🔧 Quick Setup

### 1. **Environment Configuration**

Copy the environment template:
```bash
cp .env.example .env
```

### 2. **Configure Pinata API Keys**

1. **Create a Pinata Account**: Visit [pinata.cloud](https://pinata.cloud) and sign up
2. **Generate API Keys**:
   - Go to API Keys section in your Pinata dashboard
   - Create a new API key with pinning permissions
   - Copy the API Key and Secret API Key

3. **Update .env file**:
```env
VITE_PINATA_API_KEY=your_actual_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_actual_pinata_secret_key
```

### 3. **Install Dependencies**
```bash
npm install
```

### 4. **Start Development Server**
```bash
npm run dev
```

## 🔍 **Troubleshooting Common Issues**

### **IPFS Upload Errors (401 Unauthorized)**

**Problem**: `Failed to load resource: the server responded with a status of 401`

**Solutions**:
1. **Check API Keys**: Ensure your Pinata API keys are correctly set in `.env`
2. **Verify Permissions**: Make sure your Pinata API key has pinning permissions
3. **Account Limits**: Check if you've exceeded your Pinata account limits

**Development Fallback**: The app automatically uses a mock IPFS service when API keys are not configured, allowing you to test the UI without real IPFS uploads.

### **MetaMask Extension Not Found**

**Problem**: `[ChromeTransport] connectChrome error: Error: MetaMask extension not found`

**Solutions**:
1. **Install MetaMask**: Install the MetaMask browser extension
2. **Enable Extension**: Make sure MetaMask is enabled in your browser
3. **Alternative Wallets**: Use WalletConnect for mobile wallets or other browser wallets

### **Lit Development Mode Warning**

**Problem**: `Lit is in dev mode. Not recommended for production!`

**Solution**: This is normal in development mode and will be resolved in production builds.

### **React DevTools Recommendation**

**Problem**: `Download the React DevTools for a better development experience`

**Solution**: Install React DevTools browser extension for enhanced debugging.

## 🛠️ **Development Features**

### **Mock IPFS Service**
When Pinata API keys are not configured, the application automatically uses a mock IPFS service that:
- Simulates file uploads with realistic delays
- Stores data in localStorage for demo purposes
- Generates mock IPFS hashes
- Provides fallback images for testing

### **Environment Detection**
The app automatically detects:
- Development vs production mode
- API key configuration status
- Network connectivity issues
- Wallet connection status

### **Error Handling**
Comprehensive error handling for:
- IPFS upload failures
- Wallet connection issues
- Smart contract interactions
- Network errors
- Form validation

## 📱 **Testing Different Scenarios**

### **Test with Mock IPFS**
1. Don't configure Pinata API keys
2. Try minting a crop batch
3. Observe mock IPFS behavior

### **Test with Real IPFS**
1. Configure valid Pinata API keys
2. Try minting a crop batch
3. Verify files are uploaded to Pinata

### **Test Error Scenarios**
1. Use invalid API keys
2. Try uploading large files
3. Test network disconnection

## 🔐 **Security Best Practices**

### **Environment Variables**
- Never commit `.env` files to version control
- Use different API keys for development and production
- Regularly rotate API keys

### **API Key Management**
- Limit API key permissions to minimum required
- Monitor API usage in Pinata dashboard
- Set up usage alerts

### **Wallet Security**
- Use testnet for development
- Never share private keys
- Use hardware wallets for production

## 🚀 **Production Deployment**

### **Environment Setup**
1. Set production environment variables
2. Configure production Pinata API keys
3. Update contract addresses for mainnet

### **Build Optimization**
```bash
npm run build
```

### **Performance Monitoring**
- Monitor IPFS upload success rates
- Track transaction confirmation times
- Monitor error rates and user feedback

## 📊 **Monitoring & Analytics**

### **IPFS Monitoring**
- Track upload success/failure rates
- Monitor file sizes and types
- Check gateway response times

### **Blockchain Monitoring**
- Monitor transaction success rates
- Track gas usage patterns
- Monitor contract interaction errors

### **User Experience**
- Track form completion rates
- Monitor error message frequency
- Analyze user flow patterns

## 🆘 **Getting Help**

### **Common Resources**
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

### **Debugging Tools**
- Browser Developer Tools
- React DevTools
- MetaMask Developer Tools
- Network tab for API calls

### **Community Support**
- GitHub Issues
- Discord/Telegram communities
- Stack Overflow

---

**Happy Coding! 🌱**