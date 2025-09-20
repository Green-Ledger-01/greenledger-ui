# GreenLedger Systems Design Document

## 🎯 Executive Summary

GreenLedger is a blockchain-powered agricultural supply chain platform that tokenizes crop batches as ERC1155 NFTs and provides real-time provenance verification. The system's core differentiator is **instant QR code verification** that bridges physical products to immutable blockchain records, addressing the $40B+ global food fraud problem.

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React UI]
        QR[QR Verification]
        WEB3[Web3 Integration]
    end
    
    subgraph "Blockchain Layer"
        SC[Smart Contracts]
        EVENTS[Event System]
        ROLES[Access Control]
    end
    
    subgraph "Storage Layer"
        IPFS[IPFS/Pinata]
        META[Metadata]
        IMAGES[Images]
    end
    
    subgraph "Network Layer"
        LISK[Lisk Sepolia]
        RPC[RPC Endpoints]
        EXPLORER[Block Explorer]
    end
    
    UI --> WEB3
    WEB3 --> SC
    SC --> EVENTS
    SC --> ROLES
    UI --> IPFS
    SC --> LISK
    LISK --> RPC
    LISK --> EXPLORER
```

### Component Architecture

```mermaid
graph LR
    subgraph "Core Components"
        QRV[QR Verification System]
        SCE[Supply Chain Explorer]
        MP[Marketplace]
        DASH[Dashboard]
    end
    
    subgraph "Shared Components"
        CBC[CropBatchCard]
        SIDE[Sidebar]
        TOAST[Toast System]
        ERROR[Error Boundary]
    end
    
    subgraph "Business Logic"
        SCM[Supply Chain Manager]
        CBT[Crop Batch Token]
        UM[User Management]
    end
    
    QRV --> CBT
    SCE --> SCM
    MP --> CBT
    DASH --> SCM
    CBC --> CBT
    TOAST --> ERROR
```

## 🔄 Data Flow Architecture

### 1. **Crop Batch Lifecycle**

```mermaid
sequenceDiagram
    participant F as Farmer
    participant SC as Smart Contract
    participant IPFS as IPFS Storage
    participant T as Transporter
    participant B as Buyer
    participant QR as QR System
    
    F->>IPFS: Upload metadata & images
    IPFS-->>F: Return IPFS hash
    F->>SC: Mint crop batch NFT
    SC-->>F: Token ID generated
    
    F->>SC: Transfer to Transporter
    SC->>SC: Update provenance
    SC-->>T: Ownership transferred
    
    T->>SC: Transfer to Buyer
    SC->>SC: Update provenance
    SC-->>B: Final ownership
    
    B->>QR: Scan QR code
    QR->>SC: Query provenance
    SC-->>QR: Return full history
    QR-->>B: Display verification
```

### 2. **Real-Time Verification Flow**

```mermaid
graph TD
    A[Consumer Scans QR] --> B[Extract Token ID]
    B --> C[Query Smart Contract]
    C --> D[Fetch IPFS Metadata]
    D --> E[Validate Provenance]
    E --> F[Display Verification]
    
    C --> G[Get Ownership History]
    C --> H[Get Supply Chain Steps]
    G --> E
    H --> E
    
    E --> I{Valid?}
    I -->|Yes| J[Show Green Checkmark]
    I -->|No| K[Show Red Warning]
```

## 📊 Smart Contract Architecture

### Contract Hierarchy

```mermaid
classDiagram
    class UserManagement {
        +registerUser(address, role)
        +getUserRole(address)
        +hasRole(address, role)
        +updateUserRole(address, role)
    }
    
    class CropBatchToken {
        +mint(to, id, amount, data)
        +safeTransferFrom(from, to, id, amount, data)
        +setURI(newuri)
        +royaltyInfo(tokenId, salePrice)
    }
    
    class SupplyChainManager {
        +initializeProvenance(tokenId, farmer, location, notes)
        +transferWithProvenance(tokenId, to, newState, location, notes)
        +getProvenanceHistory(tokenId)
        +getProvenanceStep(tokenId, stepIndex)
    }
    
    class GreenLedgerAccess {
        +grantRole(role, account)
        +revokeRole(role, account)
        +hasRole(role, account)
        +getRoleAdmin(role)
    }
    
    UserManagement --> GreenLedgerAccess
    CropBatchToken --> GreenLedgerAccess
    SupplyChainManager --> CropBatchToken
```

### State Management

```typescript
// Supply Chain States
enum SupplyChainState {
    PRODUCED = 0,    // Farmer mints token
    IN_TRANSIT = 1,  // Transporter has custody
    DELIVERED = 2,   // Buyer receives token
    CONSUMED = 3     // Final consumption
}

// User Roles
enum UserRole {
    FARMER = 0,      // Can mint tokens
    TRANSPORTER = 1, // Can transport tokens
    BUYER = 2,       // Can receive tokens
    ADMIN = 3        // Can manage system
}
```

## 🔧 Frontend Architecture

### State Management Strategy

```mermaid
graph TB
    subgraph "Context Providers"
        WEB3[Web3Context]
        TOAST[ToastContext]
        CART[CartContext]
    end
    
    subgraph "Custom Hooks"
        SCM[useSupplyChainManager]
        CBT[useCropBatchToken]
        UM[useUserManagement]
    end
    
    subgraph "Components"
        QRV[QR Verification]
        SCE[Supply Chain Explorer]
        MP[Marketplace]
    end
    
    WEB3 --> SCM
    WEB3 --> CBT
    WEB3 --> UM
    SCM --> QRV
    CBT --> SCE
    UM --> MP
    TOAST --> QRV
    CART --> MP
```

### Component Design Patterns

```typescript
// Hook Pattern for Business Logic
export const useSupplyChainManager = () => {
  const { writeContractAsync } = useWriteContract();
  
  const initializeProvenance = async (args: ProvenanceArgs) => {
    // Business logic here
  };
  
  return { initializeProvenance };
};

// Component Pattern for UI
export const QRVerificationSystem: React.FC<Props> = ({ tokenId }) => {
  const { verification, loading, error } = useVerification(tokenId);
  
  return (
    <div className="verification-container">
      {/* UI rendering logic */}
    </div>
  );
};
```

## 🔐 Security Architecture

### Access Control Matrix

| Role | Mint Tokens | Transfer Tokens | View Provenance | Manage Users |
|------|-------------|-----------------|-----------------|--------------|
| Farmer | ✅ | ✅ (to Transporter) | ✅ | ❌ |
| Transporter | ❌ | ✅ (to Buyer) | ✅ | ❌ |
| Buyer | ❌ | ❌ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |

### Security Measures

```mermaid
graph TD
    A[User Request] --> B[Role Validation]
    B --> C{Has Permission?}
    C -->|Yes| D[Execute Function]
    C -->|No| E[Revert Transaction]
    
    D --> F[Update State]
    F --> G[Emit Event]
    G --> H[Return Success]
    
    E --> I[Return Error]
```

## 📱 QR Verification System Design

### Core Implementation

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
  lastVerified: string;
  certifications?: string[];
}

class QRVerificationSystem {
  async verifyToken(tokenId: number): Promise<VerificationResult> {
    // 1. Query smart contract for token data
    const batch = await getBatchById(tokenId);
    
    // 2. Fetch IPFS metadata
    const metadata = await fetchMetadataFromIPFS(batch.metadataUri);
    
    // 3. Get provenance history
    const provenance = await getProvenanceHistory(tokenId);
    
    // 4. Compile verification result
    return {
      tokenId,
      isValid: true,
      cropType: batch.cropType,
      // ... other fields
    };
  }
}
```

### QR Code Generation Strategy

```typescript
// Generate verification URL
const generateQRUrl = (tokenId: number) => {
  return `${window.location.origin}/verify/${tokenId}`;
};

// QR Code contains: https://app.greenledger.com/verify/123
// When scanned: Instant verification without app installation
```

## 🚀 Performance Optimization

### Caching Strategy

```mermaid
graph LR
    A[User Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached Data]
    B -->|No| D[Fetch from Blockchain]
    D --> E[Update Cache]
    E --> F[Return Fresh Data]
    
    subgraph "Cache Layers"
        G[Browser Cache - 5min]
        H[React Query - 30sec]
        I[Local Storage - 1hr]
    end
```

### Optimization Techniques

1. **Smart Contract Calls**
   - Batch multiple reads into single call
   - Use multicall pattern for efficiency
   - Cache frequently accessed data

2. **IPFS Optimization**
   - Multiple gateway fallbacks
   - Image compression and lazy loading
   - Metadata caching in localStorage

3. **UI Performance**
   - Virtual scrolling for large lists
   - Skeleton loading states
   - Code splitting by routes

## 🔄 Event-Driven Architecture

### Event Flow

```mermaid
sequenceDiagram
    participant SC as Smart Contract
    participant WS as WebSocket/RPC
    participant FE as Frontend
    participant UI as User Interface
    
    SC->>WS: Emit TokenMinted event
    WS->>FE: Push event notification
    FE->>FE: Update local state
    FE->>UI: Refresh marketplace
    
    SC->>WS: Emit OwnershipTransferred event
    WS->>FE: Push event notification
    FE->>FE: Update provenance data
    FE->>UI: Show transfer notification
```

### Event Handling Strategy

```typescript
// Real-time event listening
export const useContractEvents = () => {
  const { data: logs } = useWatchContractEvent({
    address: CONTRACT_ADDRESSES.CropBatchToken,
    abi: CropBatchTokenABI,
    eventName: 'TransferSingle',
    onLogs: (logs) => {
      // Handle real-time updates
      updateMarketplace(logs);
      showToastNotification('Token transferred!');
    },
  });
};
```

## 📊 Data Models

### Core Data Structures

```typescript
// Crop Batch Token
interface CropBatch {
  tokenId: number;
  owner: string;
  minter: string;
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number;
  metadataUri: string;
  timestamp: number;
  notes: string;
}

// Provenance Record
interface ProvenanceRecord {
  tokenId: bigint;
  originalFarmer: string;
  creationTime: bigint;
  currentState: number;
  currentOwner: string;
  totalSteps: bigint;
}

// Provenance Step
interface ProvenanceStep {
  actor: string;
  state: number;
  timestamp: bigint;
  location: string;
  notes: string;
  transactionHash: string;
}

// IPFS Metadata
interface CropMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number;
  notes: string;
}
```

## 🔧 Integration Patterns

### IPFS Integration

```typescript
class IPFSService {
  private gateways = [
    'https://ipfs.io/ipfs',
    'https://gateway.pinata.cloud/ipfs',
    'https://cloudflare-ipfs.com/ipfs'
  ];
  
  async uploadToIPFS(file: File): Promise<string> {
    // Upload with retry logic and fallbacks
  }
  
  async fetchFromIPFS(hash: string): Promise<any> {
    // Fetch with multiple gateway fallbacks
  }
}
```

### Web3 Integration

```typescript
class Web3Service {
  async connectWallet(): Promise<void> {
    // Multi-wallet connection strategy
  }
  
  async executeTransaction(tx: Transaction): Promise<string> {
    // Transaction execution with error handling
  }
  
  async listenToEvents(): Promise<void> {
    // Real-time event monitoring
  }
}
```

## 🚀 Deployment Architecture

### Infrastructure

```mermaid
graph TB
    subgraph "Frontend"
        VERCEL[Vercel Hosting]
        CDN[Global CDN]
        DNS[Custom Domain]
    end
    
    subgraph "Blockchain"
        LISK[Lisk Sepolia]
        RPC[RPC Endpoints]
        CONTRACTS[Smart Contracts]
    end
    
    subgraph "Storage"
        PINATA[Pinata IPFS]
        GATEWAYS[IPFS Gateways]
    end
    
    subgraph "Monitoring"
        ANALYTICS[Web Analytics]
        ERRORS[Error Tracking]
        PERFORMANCE[Performance Monitoring]
    end
    
    VERCEL --> CDN
    CDN --> DNS
    VERCEL --> LISK
    LISK --> RPC
    RPC --> CONTRACTS
    VERCEL --> PINATA
    PINATA --> GATEWAYS
    VERCEL --> ANALYTICS
    VERCEL --> ERRORS
    VERCEL --> PERFORMANCE
```

### Deployment Pipeline

```yaml
# CI/CD Pipeline
stages:
  - build:
      - npm install
      - npm run build
      - run tests
  
  - deploy:
      - deploy to staging
      - run integration tests
      - deploy to production
  
  - monitor:
      - check deployment health
      - monitor error rates
      - verify functionality
```

## 📈 Scalability Considerations

### Horizontal Scaling

1. **Frontend Scaling**
   - CDN distribution
   - Code splitting
   - Lazy loading
   - Service workers

2. **Blockchain Scaling**
   - Layer 2 integration
   - Batch operations
   - State channels
   - Optimistic rollups

3. **Storage Scaling**
   - Multiple IPFS providers
   - Content addressing
   - Distributed storage
   - Caching layers

### Performance Metrics

```typescript
// Key Performance Indicators
interface PerformanceMetrics {
  // Frontend Metrics
  pageLoadTime: number;        // Target: <3s
  timeToInteractive: number;   // Target: <5s
  firstContentfulPaint: number; // Target: <2s
  
  // Blockchain Metrics
  transactionConfirmTime: number; // Target: <30s
  gasUsageOptimization: number;   // Target: <100k gas
  
  // IPFS Metrics
  ipfsUploadTime: number;      // Target: <10s
  metadataFetchTime: number;   // Target: <2s
  
  // Business Metrics
  verificationSuccessRate: number; // Target: >99%
  userRetentionRate: number;       // Target: >80%
}
```

## 🔮 Future Enhancements

### Roadmap

```mermaid
gantt
    title GreenLedger Development Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1
    QR Verification System    :done, qr, 2024-01-01, 2024-02-01
    Supply Chain Explorer     :done, explorer, 2024-01-15, 2024-02-15
    
    section Phase 2
    Mobile App Development    :active, mobile, 2024-02-01, 2024-04-01
    Advanced Analytics        :analytics, 2024-03-01, 2024-05-01
    
    section Phase 3
    IoT Integration          :iot, 2024-04-01, 2024-06-01
    AI Predictions           :ai, 2024-05-01, 2024-07-01
    
    section Phase 4
    Multi-chain Support      :multichain, 2024-06-01, 2024-08-01
    Enterprise Features      :enterprise, 2024-07-01, 2024-09-01
```

### Technical Enhancements

1. **Advanced Verification**
   - Biometric authentication
   - IoT sensor integration
   - AI-powered fraud detection
   - Zero-knowledge proofs

2. **Enhanced UX**
   - Progressive Web App
   - Offline functionality
   - Voice commands
   - AR visualization

3. **Enterprise Features**
   - Multi-tenant architecture
   - Advanced analytics
   - Custom branding
   - API integrations

## 🎯 Success Metrics

### Business KPIs

```typescript
interface BusinessMetrics {
  // Adoption Metrics
  monthlyActiveUsers: number;
  tokensMinted: number;
  verificationsPerformed: number;
  
  // Quality Metrics
  fraudDetectionRate: number;
  customerSatisfaction: number;
  systemUptime: number;
  
  // Growth Metrics
  userGrowthRate: number;
  revenueGrowth: number;
  marketPenetration: number;
}
```

### Technical KPIs

```typescript
interface TechnicalMetrics {
  // Performance
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  
  // Reliability
  uptime: number;
  mtbf: number; // Mean Time Between Failures
  mttr: number; // Mean Time To Recovery
  
  // Security
  vulnerabilitiesFound: number;
  securityIncidents: number;
  complianceScore: number;
}
```

## 📋 Implementation Checklist

### Phase 1: Core QR Verification (Immediate)
- [ ] QR code generation for tokens
- [ ] Mobile-optimized verification UI
- [ ] Real-time blockchain queries
- [ ] IPFS metadata integration
- [ ] Error handling and fallbacks

### Phase 2: Enhanced Traceability (Next 30 days)
- [ ] Interactive supply chain timeline
- [ ] Real-time event notifications
- [ ] Advanced filtering and search
- [ ] Export capabilities
- [ ] Analytics dashboard

### Phase 3: Mobile & Performance (Next 60 days)
- [ ] Progressive Web App
- [ ] Offline functionality
- [ ] Performance optimization
- [ ] Caching improvements
- [ ] Load testing

### Phase 4: Enterprise Features (Next 90 days)
- [ ] Multi-tenant support
- [ ] Custom branding
- [ ] API development
- [ ] Advanced analytics
- [ ] Integration capabilities

---

This systems design document provides the comprehensive foundation for building and implementing GreenLedger's QR verification flow in the most efficient, maintainable, and scalable way. The architecture prioritizes the core differentiator while maintaining flexibility for future enhancements.
