# GreenLedger Technical Guide

## 🚀 Quick Start

### Development Setup
```bash
# Clone and setup
git clone https://github.com/Green-Ledger-01/greenledger-ui
cd greenledger-ui
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development
npm run dev
```

### Essential Environment Variables
```env
# Blockchain Configuration
VITE_WALLETCONNECT_PROJECT_ID="your_project_id"
VITE_APP_RPC_URL="https://rpc.sepolia-api.lisk.com"
VITE_APP_CHAIN_ID="4202"

# IPFS Configuration
VITE_APP_PINATA_API_KEY="your_pinata_key"
VITE_APP_PINATA_SECRET_KEY="your_pinata_secret"

# Contract Addresses (Lisk Sepolia)
VITE_GREENLEDGER_USER_MANAGEMENT_CONTRACT_ADDRESS="0x66BCB324f59035aD2B084Fe651ea82398A9fac82"
VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS="0xA065205364784B3D7e830D0EB2681EB218e3aD27"
VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS="0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
```

## 🏗️ Architecture Overview

### Core Components
```typescript
// Business Logic Hooks
useSupplyChainManager()  // Provenance tracking
useCropBatchToken()      // NFT operations  
useUserManagement()      // Role management

// UI Components
QRVerificationSystem     // 🎯 Core differentiator
SupplyChainExplorer     // Traceability interface
CropBatchCard           // Token display
Marketplace             // Trading interface
```

### Smart Contract Integration
```typescript
// Contract Addresses
const CONTRACTS = {
  UserManagement: "0x66BCB324f59035aD2B084Fe651ea82398A9fac82",
  CropBatchToken: "0xA065205364784B3D7e830D0EB2681EB218e3aD27", 
  SupplyChainManager: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
};

// Supply Chain States
enum SupplyChainState {
  PRODUCED = 0,    // Farmer mints
  IN_TRANSIT = 1,  // Transporter custody
  DELIVERED = 2,   // Buyer receives
  CONSUMED = 3     // Final consumption
}
```

## 🔧 Key Implementation Patterns

### 1. Hook-Based Business Logic
```typescript
export const useSupplyChainManager = () => {
  const { writeContractAsync } = useWriteContract();
  
  const initializeProvenance = async (args: {
    tokenId: bigint;
    farmer: string;
    location: string;
    notes: string;
  }) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.SupplyChainManager,
      abi: SupplyChainManagerABI,
      functionName: 'initializeProvenance',
      args: [args.tokenId, args.farmer, args.location, args.notes],
    });
  };
  
  return { initializeProvenance };
};
```

### 2. IPFS Integration with Fallbacks
```typescript
export const uploadToIPFS = async (file: File): Promise<string> => {
  // Try Pinata first
  try {
    const result = await uploadToPinata(file);
    return result.IpfsHash;
  } catch (error) {
    // Fallback to mock IPFS for development
    console.warn('Pinata upload failed, using mock IPFS');
    return generateMockIPFSHash(file);
  }
};
```

### 3. Real-Time Event Monitoring
```typescript
export const useContractEvents = () => {
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.CropBatchToken,
    abi: CropBatchTokenABI,
    eventName: 'TransferSingle',
    onLogs: (logs) => {
      // Update UI in real-time
      refreshMarketplace();
      showToastNotification('Token transferred!');
    },
  });
};
```

## 🎯 QR Verification Implementation

### Core Verification Logic
```typescript
interface VerificationResult {
  tokenId: number;
  isValid: boolean;
  cropType: string;
  originFarm: string;
  currentOwner: string;
  currentState: string;
  harvestDate: string;
  totalSteps: number;
  certifications?: string[];
}

export const QRVerificationSystem: React.FC = ({ tokenId }) => {
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const { getBatchById } = useCropBatchToken();
  const { data: provenanceData } = useProvenanceHistory(tokenId ? BigInt(tokenId) : undefined);

  const verifyToken = async (id: number) => {
    try {
      // 1. Get token data from contract
      const batch = await getBatchById(id);
      
      // 2. Fetch IPFS metadata
      const metadata = await fetchMetadataFromIPFS(batch.metadataUri);
      
      // 3. Compile verification result
      const result: VerificationResult = {
        tokenId: id,
        isValid: true,
        cropType: batch.cropType,
        originFarm: batch.originFarm,
        currentOwner: batch.owner,
        currentState: getStateLabel(provenanceData?.[3] || 0),
        harvestDate: new Date(batch.harvestDate * 1000).toLocaleDateString(),
        totalSteps: provenanceData ? Number(provenanceData[5]) : 0,
        certifications: metadata?.attributes?.filter(attr => 
          attr.trait_type?.toLowerCase().includes('cert')
        ).map(attr => attr.value) || []
      };
      
      setVerification(result);
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  return (
    <div className="verification-container">
      {verification && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle size={20} />
            <span className="font-medium">Verified Authentic</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Crop Type</p>
              <p className="font-medium">{verification.cropType}</p>
            </div>
            <div>
              <p className="text-gray-500">Origin</p>
              <p className="font-medium">{verification.originFarm}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### QR Code Generation
```typescript
// Generate verification URL for QR codes
const generateQRUrl = (tokenId: number) => {
  return `${window.location.origin}/verify/${tokenId}`;
};

// QR codes contain: https://app.greenledger.com/verify/123
// Instant verification without app installation required
```

## 🔐 Security Implementation

### Role-Based Access Control
```typescript
export const useUserManagement = () => {
  const checkUserRole = async (address: string): Promise<number> => {
    const role = await readContract({
      address: CONTRACT_ADDRESSES.UserManagement,
      abi: UserManagementABI,
      functionName: 'getUserRole',
      args: [address],
    });
    return Number(role);
  };
  
  const hasPermission = (userRole: number, requiredRole: number): boolean => {
    // Admin (3) can do everything
    // Farmer (0) can mint and transfer to transporter
    // Transporter (1) can transfer to buyer
    // Buyer (2) can receive only
    return userRole >= requiredRole || userRole === 3;
  };
  
  return { checkUserRole, hasPermission };
};
```

### Input Validation
```typescript
const validateCropBatch = (data: CropBatchData): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.cropType || data.cropType.trim().length < 2) {
    errors.push('Crop type must be at least 2 characters');
  }
  
  if (!data.quantity || data.quantity < 1 || data.quantity > 100) {
    errors.push('Quantity must be between 1 and 100 kg');
  }
  
  if (!data.originFarm || data.originFarm.trim().length < 3) {
    errors.push('Origin farm must be at least 3 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## 📊 Performance Optimization

### Caching Strategy
```typescript
// React Query configuration for blockchain data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,      // 30 seconds
      cacheTime: 5 * 60 * 1000,  // 5 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// IPFS metadata caching
const metadataCache = new Map<string, CropMetadata>();

export const fetchMetadataFromIPFS = async (hash: string): Promise<CropMetadata> => {
  // Check cache first
  if (metadataCache.has(hash)) {
    return metadataCache.get(hash)!;
  }
  
  // Fetch from IPFS with multiple gateway fallbacks
  const metadata = await fetchWithFallbacks(hash);
  
  // Cache the result
  metadataCache.set(hash, metadata);
  
  return metadata;
};
```

### Batch Operations
```typescript
// Batch multiple contract reads
export const getBatchesInBulk = async (tokenIds: number[]) => {
  const multicallResults = await multicall({
    contracts: tokenIds.map(id => ({
      address: CONTRACT_ADDRESSES.CropBatchToken,
      abi: CropBatchTokenABI,
      functionName: 'getBatch',
      args: [id],
    })),
  });
  
  return multicallResults.map((result, index) => ({
    tokenId: tokenIds[index],
    data: result.result,
  }));
};
```

## 🚀 Deployment Guide

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel (recommended)
vercel --prod
```

### Environment Configuration
```typescript
// Production environment validation
const validateEnvironment = () => {
  const required = [
    'VITE_WALLETCONNECT_PROJECT_ID',
    'VITE_APP_PINATA_API_KEY',
    'VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
```

### Smart Contract Deployment
```solidity
// Deploy sequence for new networks
1. Deploy GreenLedgerAccess with admin address
2. Deploy CropBatchToken with access control address
3. Deploy SupplyChainManager with token address
4. Grant roles to initial users
5. Verify contracts on block explorer
```

## 🧪 Testing Strategy

### Integration Testing
```typescript
// Test complete flow
describe('Supply Chain Flow', () => {
  it('should complete farmer to buyer flow', async () => {
    // 1. Farmer mints token
    const mintTx = await cropBatchToken.mint(
      farmerAddress,
      tokenId,
      1,
      metadataUri
    );
    
    // 2. Initialize provenance
    await supplyChainManager.initializeProvenance(
      tokenId,
      farmerAddress,
      'Farm Location',
      'Initial harvest'
    );
    
    // 3. Transfer to transporter
    await cropBatchToken.safeTransferFrom(
      farmerAddress,
      transporterAddress,
      tokenId,
      1,
      '0x'
    );
    
    // 4. Transfer to buyer
    await cropBatchToken.safeTransferFrom(
      transporterAddress,
      buyerAddress,
      tokenId,
      1,
      '0x'
    );
    
    // 5. Verify final state
    const finalOwner = await cropBatchToken.balanceOf(buyerAddress, tokenId);
    expect(finalOwner).to.equal(1);
  });
});
```

### Manual Testing Checklist
```markdown
## Core Functionality
- [ ] Wallet connection (MetaMask, WalletConnect)
- [ ] Role registration (Farmer, Transporter, Buyer)
- [ ] Token minting with IPFS metadata
- [ ] Supply chain transfers
- [ ] QR code verification
- [ ] Provenance history display

## Edge Cases
- [ ] Invalid token ID verification
- [ ] IPFS upload failures
- [ ] Network disconnection handling
- [ ] Transaction failures
- [ ] Role permission violations

## Performance
- [ ] Page load times < 3 seconds
- [ ] Transaction confirmations < 30 seconds
- [ ] IPFS uploads < 10 seconds
- [ ] Real-time updates working
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Wallet Connection Fails
```typescript
// Debug wallet connection
const debugWalletConnection = () => {
  console.log('Available providers:', window.ethereum);
  console.log('Chain ID:', window.ethereum?.chainId);
  console.log('Selected account:', window.ethereum?.selectedAddress);
};

// Solution: Check MetaMask network, clear cache, try different wallet
```

#### 2. IPFS Upload Errors
```typescript
// Handle IPFS failures gracefully
const uploadWithFallback = async (file: File) => {
  try {
    return await uploadToPinata(file);
  } catch (error) {
    console.warn('Pinata failed, using mock IPFS');
    return { IpfsHash: generateMockHash(file) };
  }
};
```

#### 3. Transaction Reverts
```typescript
// Debug transaction failures
const debugTransaction = async (txHash: string) => {
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  console.log('Transaction receipt:', receipt);
  
  if (receipt.status === 'reverted') {
    // Check revert reason
    const trace = await publicClient.traceTransaction({ hash: txHash });
    console.log('Revert reason:', trace);
  }
};
```

## 📈 Monitoring & Analytics

### Key Metrics to Track
```typescript
interface Metrics {
  // User Engagement
  dailyActiveUsers: number;
  tokensMinted: number;
  verificationsPerformed: number;
  
  // Performance
  averagePageLoadTime: number;
  transactionSuccessRate: number;
  ipfsUploadSuccessRate: number;
  
  // Business
  supplyChainCompletionRate: number;
  userRetentionRate: number;
  fraudDetectionRate: number;
}
```

### Error Tracking
```typescript
// Implement error boundaries and logging
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('Application error:', error, errorInfo);
    
    // Track error metrics
    trackError({
      error: error.message,
      stack: error.stack,
      component: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## 🔮 Future Enhancements

### Planned Features
1. **Mobile App**: React Native implementation
2. **Advanced Analytics**: Comprehensive reporting dashboard  
3. **IoT Integration**: Sensor data incorporation
4. **AI Predictions**: Supply chain optimization
5. **Multi-chain Support**: Ethereum, Polygon integration

### Technical Improvements
1. **Performance**: Layer 2 integration, batch operations
2. **Security**: Zero-knowledge proofs, advanced auditing
3. **UX**: Progressive Web App, offline functionality
4. **Scalability**: Microservices architecture, CDN optimization

---

This technical guide provides the essential information for developing, deploying, and maintaining the GreenLedger platform efficiently.
