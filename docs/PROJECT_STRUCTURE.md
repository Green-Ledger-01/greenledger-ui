# GreenLedger Project Structure

## 📁 Directory Overview

```
greenledger-ui/
├── 📄 README.md                    # Main project documentation
├── 📄 package.json                 # Dependencies and scripts
├── 📄 .env                         # Environment configuration
├── 📄 vite.config.js              # Vite build configuration
├── 📄 tailwind.config.js          # Tailwind CSS configuration
├── 📄 tsconfig.json               # TypeScript configuration
│
├── 📁 docs/                        # 📚 Documentation
│   ├── 📄 SYSTEMS_DESIGN.md       # Comprehensive systems architecture
│   ├── 📄 TECHNICAL_GUIDE.md      # Development and implementation guide
│   └── 📄 PROJECT_STRUCTURE.md    # This file
│
├── 📁 public/                      # Static assets
│   ├── 📄 vite.svg                # Vite logo
│   └── 📄 redirect.html           # OAuth redirect handler
│
└── 📁 src/                         # 💻 Source code
    ├── 📄 main.tsx                 # Application entry point
    ├── 📄 App.tsx                  # Root component
    ├── 📄 index.css                # Global styles
    │
    ├── 📁 components/              # 🧩 Reusable UI components
    │   ├── 📄 QRVerificationSystem.tsx     # 🎯 Core differentiator
    │   ├── 📄 CropBatchCard.tsx            # Token display card
    │   ├── 📄 SupplyChainExplorer.tsx      # Traceability interface
    │   ├── 📄 SidebarSimple.tsx            # Navigation sidebar
    │   ├── 📄 CartSidebar.tsx              # Shopping cart
    │   ├── 📄 ErrorBoundary.tsx            # Error handling
    │   ├── 📄 LoadingSpinner.tsx           # Loading states
    │   └── 📄 ToastNotification.tsx        # User feedback
    │
    ├── 📁 pages/                   # 📱 Application screens
    │   ├── 📄 LandingPage.tsx              # Welcome screen
    │   ├── 📄 Dashboard.tsx                # User dashboard
    │   ├── 📄 Marketplace.tsx              # Token marketplace
    │   ├── 📄 TokenizationPage.tsx         # Mint new tokens
    │   ├── 📄 SupplyChainExplorer.tsx      # Provenance tracking
    │   ├── 📄 AuthenticationPage.tsx       # User authentication
    │   └── 📄 RegisterUserSimple.tsx       # Role registration
    │
    ├── 📁 hooks/                   # 🎣 Custom React hooks (Business Logic)
    │   ├── 📄 useSupplyChainManager.ts     # 🔗 Provenance operations
    │   ├── 📄 useCropBatchToken.ts         # NFT operations
    │   ├── 📄 useUserManagement.ts         # Role management
    │   └── 📄 useSupplyChainFlow.ts        # End-to-end flow
    │
    ├── 📁 contexts/                # 🌐 React Context providers
    │   ├── 📄 Web3ContextEnhanced.tsx      # Blockchain state
    │   ├── 📄 CartContext.tsx              # Shopping cart state
    │   └── 📄 ToastContext.tsx             # Notification state
    │
    ├── 📁 config/                  # ⚙️ Configuration files
    │   ├── 📄 constants.ts                 # App constants & addresses
    │   ├── 📄 wagmiConfig.ts               # Web3 configuration
    │   └── 📄 HybridWeb3Config.tsx         # Web3 provider setup
    │
    ├── 📁 contracts/               # 📜 Smart contract ABIs
    │   ├── 📄 CropBatchToken.json          # ERC1155 NFT contract
    │   ├── 📄 UserManagement.json          # Role management
    │   ├── 📄 SupplyChainManager.json      # Provenance tracking
    │   ├── 📄 GreenLedgerAccess.json       # Access control
    │   └── 📄 GreenLedgerPaymaster.json    # Gas sponsorship
    │
    ├── 📁 utils/                   # 🛠️ Utility functions
    │   ├── 📄 ipfs.ts                      # IPFS integration
    │   ├── 📄 authPersistence.ts           # Auth state management
    │   ├── 📄 oauthHandler.ts              # OAuth handling
    │   ├── 📄 mobileDetection.ts           # Device detection
    │   └── 📄 index.ts                     # Utility exports
    │
    ├── 📁 chains/                  # ⛓️ Blockchain network configs
    │   └── 📄 liskSepolia.ts               # Lisk Sepolia testnet
    │
    ├── 📁 routes/                  # 🛣️ Application routing
    │   └── 📄 AppRoutes.tsx                # Route definitions
    │
    └── 📁 assets/                  # 🖼️ Static assets
        └── 📄 react.svg                    # React logo
```

## 🎯 Core Components Breakdown

### 🏆 Priority 1: QR Verification System
```typescript
// src/components/QRVerificationSystem.tsx
// The core differentiator - instant product verification
interface QRVerificationProps {
  tokenId?: number;
  embedded?: boolean;
}
```

### 🔗 Priority 2: Supply Chain Management
```typescript
// src/hooks/useSupplyChainManager.ts
// Handles provenance tracking and state transitions
export const useSupplyChainManager = () => {
  // initializeProvenance, transferWithProvenance, getProvenanceHistory
};
```

### 📊 Priority 3: Supply Chain Explorer
```typescript
// src/pages/SupplyChainExplorer.tsx
// Interactive traceability interface with real-time updates
```

## 🧩 Component Architecture

### Reusable Components (`/components`)
- **QRVerificationSystem**: Core verification UI
- **CropBatchCard**: Token display with metadata
- **SidebarSimple**: Navigation with role-based menu
- **ErrorBoundary**: Application error handling
- **LoadingSpinner**: Consistent loading states

### Page Components (`/pages`)
- **LandingPage**: Marketing and wallet connection
- **Dashboard**: User overview with statistics
- **Marketplace**: Browse and purchase tokens
- **TokenizationPage**: Mint new crop batch NFTs
- **SupplyChainExplorer**: Provenance tracking interface

### Business Logic (`/hooks`)
- **useSupplyChainManager**: Provenance operations
- **useCropBatchToken**: NFT minting and transfers
- **useUserManagement**: Role-based access control
- **useSupplyChainFlow**: End-to-end workflow management

## 🌐 State Management

### Context Providers (`/contexts`)
```typescript
// Web3 state management
Web3ContextEnhanced: {
  account, chainId, isConnected, 
  connectWallet, switchNetwork
}

// Shopping cart state
CartContext: {
  items, addItem, removeItem, 
  total, checkout
}

// User notifications
ToastContext: {
  showToast, hideToast,
  success, error, warning, info
}
```

## ⚙️ Configuration Management

### Environment Configuration (`/config`)
```typescript
// constants.ts - Centralized configuration
export const CONTRACT_ADDRESSES = {
  UserManagement: process.env.VITE_USER_MANAGEMENT_CONTRACT,
  CropBatchToken: process.env.VITE_CROPBATCH_TOKEN_CONTRACT,
  SupplyChainManager: process.env.VITE_SUPPLY_CHAIN_MANAGER_CONTRACT,
};

export const IPFS_CONFIG = {
  PINATA_API_KEY: process.env.VITE_APP_PINATA_API_KEY,
  PINATA_SECRET_KEY: process.env.VITE_APP_PINATA_SECRET_KEY,
  GATEWAY: 'https://gateway.pinata.cloud/ipfs',
};
```

## 📜 Smart Contract Integration

### Contract ABIs (`/contracts`)
- **CropBatchToken.json**: ERC1155 multi-token standard
- **UserManagement.json**: Role-based access control
- **SupplyChainManager.json**: Provenance tracking logic
- **GreenLedgerAccess.json**: Permission management
- **GreenLedgerPaymaster.json**: Gas sponsorship (optional)

### Contract Interaction Pattern
```typescript
// Hook-based contract interaction
export const useCropBatchToken = () => {
  const { writeContractAsync } = useWriteContract();
  
  const mint = async (args: MintArgs) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.CropBatchToken,
      abi: CropBatchTokenABI,
      functionName: 'mint',
      args: [args.to, args.id, args.amount, args.data],
    });
  };
  
  return { mint };
};
```

## 🛠️ Utility Functions

### IPFS Integration (`/utils/ipfs.ts`)
```typescript
// Multi-gateway IPFS with fallbacks
export const uploadToIPFS = async (file: File): Promise<string>;
export const fetchMetadataFromIPFS = async (hash: string): Promise<Metadata>;
```

### Authentication (`/utils/authPersistence.ts`)
```typescript
// Persistent auth state management
export const saveAuthState = (state: AuthState): void;
export const loadAuthState = (): AuthState | null;
```

## 🛣️ Routing Structure

### Route Configuration (`/routes/AppRoutes.tsx`)
```typescript
const routes = [
  { path: '/', component: LandingPage },
  { path: '/dashboard', component: Dashboard, protected: true },
  { path: '/marketplace', component: Marketplace },
  { path: '/mint', component: TokenizationPage, roles: ['farmer', 'admin'] },
  { path: '/explorer', component: SupplyChainExplorer },
  { path: '/verify/:tokenId', component: QRVerificationSystem },
];
```

## 📱 Mobile Optimization

### Responsive Design Strategy
- **Mobile-first CSS**: Tailwind utility classes
- **Touch-friendly UI**: Larger buttons and touch targets
- **Wallet compatibility**: MetaMask mobile browser support
- **Progressive Web App**: Service worker ready

## 🔧 Build Configuration

### Vite Configuration (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util'],
    }),
  ],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
});
```

### TypeScript Configuration (`tsconfig.json`)
- Strict type checking enabled
- Path mapping for clean imports
- Modern ES target for optimal performance

## 📊 Performance Considerations

### Code Splitting Strategy
```typescript
// Lazy load heavy components
const SupplyChainExplorer = lazy(() => import('./pages/SupplyChainExplorer'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
```

### Caching Strategy
- **React Query**: 30-second stale time for blockchain data
- **LocalStorage**: Persistent user preferences
- **IPFS Metadata**: In-memory caching for session

## 🔐 Security Architecture

### Access Control Flow
```
User Request → Role Check → Permission Validation → Contract Call
```

### Input Validation
- Form validation with real-time feedback
- File type and size restrictions
- Address format validation
- Sanitized user inputs

## 🧪 Testing Strategy

### Test Structure
```
tests/
├── unit/           # Component unit tests
├── integration/    # Contract interaction tests
├── e2e/           # End-to-end user flows
└── utils/         # Testing utilities
```

## 📈 Monitoring & Analytics

### Key Metrics Tracking
- User engagement (DAU, token mints, verifications)
- Performance (page load times, transaction success rates)
- Business (supply chain completion rates, fraud detection)

### Error Tracking
- React Error Boundaries
- Contract interaction failures
- IPFS upload errors
- Network connectivity issues

---

This project structure is designed for **scalability**, **maintainability**, and **developer productivity** while focusing on the core QR verification differentiator that sets GreenLedger apart in the agri-tech market.
