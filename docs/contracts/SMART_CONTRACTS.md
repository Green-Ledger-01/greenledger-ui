# 📜 Smart Contracts Architecture

## 🎯 Contract System Overview

### **Contract Hierarchy & Purpose**
- **GreenLedgerAccess**: Role-based access control foundation
- **CropBatchToken**: ERC1155 NFT implementation for crop batches
- **SupplyChainManager**: Provenance tracking and state management
- **GreenLedgerPaymaster**: Account abstraction for gas sponsorship

## 🔐 Access Control Contract

### **GreenLedgerAccess**
**Purpose**: Centralized role management and user authentication

**Key Features**:
- Role-based permissions (Farmer, Transporter, Buyer, Admin)
- User profile management with metadata
- Account activation/deactivation controls
- Event emission for role changes

**Technology**:
- **Standard**: OpenZeppelin AccessControl
- **Gas Optimization**: Packed structs, efficient mappings
- **Security**: Role hierarchy with admin controls

**Pros**:
- Centralized permission management
- Extensible role system
- Comprehensive user profiles
- Audit trail through events

**Cons**:
- Single point of failure for permissions
- Gas costs for role operations
- Admin key management complexity

**Dependencies**:
- OpenZeppelin AccessControl library
- No external contract dependencies

**Maintainability**: High - well-established patterns

## 🎫 Crop Batch Token Contract

### **CropBatchToken (ERC1155)**
**Purpose**: Multi-token standard for crop batch NFTs

**Key Features**:
- Batch minting with metadata URI
- Royalty support (ERC2981)
- Role-based minting restrictions
- Transfer event tracking

**Technology**:
- **Standard**: ERC1155 with ERC2981 royalties
- **Storage**: IPFS metadata URIs
- **Access Control**: Integration with GreenLedgerAccess

**Pros**:
- Efficient batch operations
- Built-in royalty mechanism
- Flexible metadata system
- Gas-efficient transfers

**Cons**:
- Complex approval mechanisms
- IPFS dependency for metadata
- Limited fungibility features

**Dependencies**:
- GreenLedgerAccess contract
- IPFS infrastructure
- OpenZeppelin ERC1155 implementation

**Maintainability**: Medium - requires NFT expertise

**Scaling Considerations**:
- Metadata caching strategies
- Batch size limitations
- Gas optimization for large transfers

## 🚚 Supply Chain Manager

### **SupplyChainManager**
**Purpose**: Provenance tracking and supply chain state management

**Key Features**:
- State machine for supply chain stages
- Provenance step recording
- Role-based state transitions
- Complete audit trail

**Technology**:
- **State Management**: Enum-based state machine
- **Storage**: Nested mappings for provenance history
- **Events**: Comprehensive event emission

**Pros**:
- Immutable provenance records
- Enforced business logic
- Complete transparency
- Automated compliance

**Cons**:
- High gas costs for complex operations
- State transition rigidity
- Storage cost accumulation

**Dependencies**:
- CropBatchToken contract
- GreenLedgerAccess contract

**Maintainability**: Medium - complex business logic

**Scaling Considerations**:
- Provenance data pruning strategies
- Off-chain indexing requirements
- Gas optimization for frequent updates

## 💰 Paymaster Contract (Account Abstraction)

### **GreenLedgerPaymaster**
**Purpose**: Sponsored transactions for improved UX

**Key Features**:
- Gas sponsorship for specific operations
- User gas limit management
- Operation whitelisting
- Usage tracking and limits

**Technology**:
- **Standard**: ERC4337 Account Abstraction
- **Validation**: Custom paymaster logic
- **Limits**: Per-user gas budgets

**Pros**:
- Improved user experience
- Reduced onboarding friction
- Controlled gas spending
- Flexible sponsorship rules

**Cons**:
- Complex implementation
- Gas budget management
- Potential abuse vectors

**Dependencies**:
- ERC4337 EntryPoint contract
- GreenLedgerAccess for user validation

**Maintainability**: Low - cutting-edge technology

## 🔧 Deployment & Management

### **Deployment Strategy**
**Network**: Lisk Sepolia Testnet (Chain ID: 4202)

**Contract Addresses**:
- **GreenLedgerAccess**: `0x66BCB324f59035aD2B084Fe651ea82398A9fac82`
- **CropBatchToken**: `0xA065205364784B3D7e830D0EB2681EB218e3aD27`
- **SupplyChainManager**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

**Deployment Order**:
1. GreenLedgerAccess (foundation)
2. CropBatchToken (depends on access control)
3. SupplyChainManager (depends on both)
4. GreenLedgerPaymaster (optional enhancement)

### **Upgrade Strategy**
**Pattern**: Proxy pattern for upgradeable contracts

**Considerations**:
- Storage layout compatibility
- Function selector conflicts
- Migration procedures
- Governance mechanisms

**Pros**:
- Bug fixes and improvements
- Feature additions
- Security patches

**Cons**:
- Increased complexity
- Centralization concerns
- Migration risks

## 🔒 Security Considerations

### **Access Control Security**
- Multi-signature admin controls
- Time-locked upgrades
- Role hierarchy enforcement
- Emergency pause mechanisms

### **Economic Security**
- Gas limit protections
- Reentrancy guards
- Integer overflow protection
- Front-running mitigation

### **Operational Security**
- Key management procedures
- Monitoring and alerting
- Incident response plans
- Regular security audits

## 📊 Gas Optimization

### **Optimization Techniques**
- Packed structs for storage efficiency
- Batch operations where possible
- Event-based data retrieval
- Minimal on-chain computation

### **Cost Analysis**
- **Minting**: ~150,000 gas
- **Transfer**: ~80,000 gas
- **Provenance Update**: ~120,000 gas
- **Role Assignment**: ~60,000 gas

### **Scaling Solutions**
- Layer 2 deployment consideration
- State channel implementations
- Batch processing optimizations
- Off-chain computation with proofs

## 🔍 Monitoring & Analytics

### **On-Chain Metrics**
- Transaction volume and frequency
- Gas usage patterns
- Error rates and types
- User adoption metrics

### **Event Indexing**
- Real-time event processing
- Historical data analysis
- Business intelligence integration
- Compliance reporting

### **Performance Monitoring**
- Contract execution times
- Network congestion impact
- Cost optimization opportunities
- User experience metrics

## 🧪 Testing Strategy

### **Test Categories**
- **Unit Tests**: Individual function testing
- **Integration Tests**: Contract interaction testing
- **Security Tests**: Vulnerability assessment
- **Gas Tests**: Optimization validation

### **Testing Tools**
- Hardhat for development
- Foundry for advanced testing
- Slither for static analysis
- MythX for security scanning

### **Test Coverage**
- Function coverage: >95%
- Branch coverage: >90%
- Security test coverage: 100%
- Gas optimization validation

---

**Related Links:**
- [← Backend Services](../backend/SERVICES.md)
- [System Architecture →](../architecture/SYSTEM_ARCHITECTURE.md)
- [Deployment Guide →](../guides/DEPLOYMENT.md)

**Last Updated**: January 15, 2024  
**Version**: 2.0  
**Status**: ✅ Complete