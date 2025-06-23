# GreenLedger Payment System

A comprehensive blockchain-based payment system for agricultural marketplaces, enabling secure transactions between farmers, buyers, and transporters with built-in escrow, tracking, and dispute resolution.

## 🌟 Features

### Core Functionality
- **Crop Tokenization**: Farmers mint crop batches as ERC1155 NFTs
- **Marketplace Listings**: Farmers set prices and list crops for sale
- **Order Management**: Complete order lifecycle from creation to delivery
- **Transportation Integration**: Automated transporter selection and cost calculation
- **Escrow Payments**: Secure payment holding until delivery confirmation
- **Real-time Tracking**: GPS-style tracking throughout the delivery process
- **Dispute Resolution**: Built-in dispute handling with admin resolution

### Smart Contracts

#### 1. Marketplace.sol
Manages crop listings and marketplace operations.

**Key Functions:**
- `createListing()` - Farmers create crop listings with pricing
- `updateListing()` - Update price, quantity, or description
- `reserveQuantity()` - Reserve crops for orders
- `calculateTotalPrice()` - Calculate total cost including fees

#### 2. TransportationManager.sol
Handles transporter registration and cost calculations.

**Key Functions:**
- `registerTransporter()` - Register transportation services
- `calculateTransportationCost()` - Calculate shipping costs
- `submitTransportBid()` - Transporters bid on delivery jobs
- `selectTransporter()` - Buyers select preferred transporter

#### 3. PaymentProcessor.sol
Manages escrow payments and fund distribution.

**Key Functions:**
- `createPayment()` - Create payment for an order
- `escrowPayment()` - Hold payment in escrow
- `releasePayment()` - Distribute funds to recipients
- `raiseDispute()` - Handle payment disputes

#### 4. OrderManager.sol
Orchestrates the complete order workflow.

**Key Functions:**
- `createOrder()` - Buyers create purchase orders
- `confirmOrder()` - Farmers confirm order fulfillment
- `shipOrder()` - Transporters begin delivery
- `updateTracking()` - Real-time location updates
- `markDelivered()` - Confirm delivery completion
- `completeOrder()` - Finalize order and release payments

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- Hardhat
- MetaMask or similar Web3 wallet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd greenledger-ui

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
```

### Deployment

```bash
# Deploy to local network
npx hardhat node

# Deploy payment system contracts
npx hardhat run scripts/deploy-payment-system.js --network localhost

# Deploy to Lisk Sepolia testnet
npx hardhat run scripts/deploy-payment-system.js --network lisk-sepolia
```

### Testing

```bash
# Run comprehensive test suite
npx hardhat test test/PaymentSystem.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## 📋 Usage Workflow

### 1. User Registration
```javascript
// Register users with appropriate roles
await userManagement.registerUser(farmerAddress, 0); // Farmer
await userManagement.registerUser(buyerAddress, 2);  // Buyer
await userManagement.registerUser(transporterAddress, 1); // Transporter
```

### 2. Farmer: Mint and List Crops
```javascript
// Mint crop batch NFT
await cropBatchToken.mintNewBatch(
    farmerAddress,
    "Organic Wheat",
    100, // kg
    "Green Valley Farm",
    harvestDate,
    "Premium organic wheat",
    "ipfs://metadata-hash"
);

// Create marketplace listing
await marketplace.createListing(
    tokenId,
    pricePerKg,
    quantity,
    description,
    farmLocation,
    listingDuration
);
```

### 3. Transporter: Register Service
```javascript
await transportationManager.registerTransporter(
    "Transport Co",
    "contact@transport.com",
    "City Center",
    vehicleType,
    maxCapacity,
    ratePerKm,
    ratePerKg,
    minimumFee
);
```

### 4. Buyer: Create Order
```javascript
// Create order
await orderManager.createOrder(
    listingId,
    quantity,
    deliveryLocation,
    requestedDeliveryDate
);

// Select transporter
await orderManager.selectTransporter(
    orderId,
    transporterAddress,
    transportPrice
);

// Process payment
await orderManager.processPayment(orderId, { value: totalPrice });
```

### 5. Order Fulfillment
```javascript
// Farmer confirms order
await orderManager.confirmOrder(orderId);

// Transporter ships
await orderManager.shipOrder(orderId, pickupLocation);

// Update tracking
await orderManager.updateTracking(orderId, currentLocation, statusUpdate);

// Mark delivered
await orderManager.markDelivered(orderId);

// Complete order (releases payments)
await orderManager.completeOrder(orderId);
```

## 💰 Payment Flow

### Cost Calculation
```
Total Order Cost = Crop Cost + Transport Cost + Marketplace Fee

Where:
- Crop Cost = Quantity × Price per Kg
- Transport Cost = (Distance × Rate per Km) + (Quantity × Rate per Kg)
- Marketplace Fee = Crop Cost × Fee Percentage (default 2.5%)
```

### Payment Distribution
Upon order completion:
1. **Farmer** receives crop payment
2. **Transporter** receives transportation fee
3. **Marketplace** receives platform fee
4. **Buyer** gets delivery confirmation

### Escrow Protection
- Payments held in smart contract escrow
- Released only upon delivery confirmation
- Dispute resolution available
- Automatic refunds for cancellations

## 🔧 Configuration

### Marketplace Settings
```javascript
// Update marketplace fee (admin only)
await marketplace.updateMarketplaceFee(250); // 2.5%

// Update fee recipient
await marketplace.updateFeeRecipient(treasuryAddress);
```

### Transportation Pricing
```javascript
// Update base rates (admin only)
await transportationManager.updatePricingParameters(
    baseDistanceRate,
    baseWeightRate,
    urgencyMultiplier,
    refrigeratedMultiplier
);
```

### Payment Settings
```javascript
// Update dispute period
await paymentProcessor.updateDisputePeriod(7 * 24 * 60 * 60); // 7 days

// Update escrow release delay
await paymentProcessor.updateEscrowReleaseDelay(24 * 60 * 60); // 1 day
```

## 🛡️ Security Features

### Access Control
- Role-based permissions (farmers, buyers, transporters, admins)
- Multi-signature admin functions
- Pausable contracts for emergency stops

### Payment Security
- Reentrancy protection on all payment functions
- Escrow-based payment holding
- Dispute resolution mechanism
- Automatic timeout handling

### Data Integrity
- IPFS metadata validation
- Quantity tracking and validation
- Immutable transaction history
- Event logging for audit trails

## 🔍 Monitoring & Analytics

### Events Tracking
All major actions emit events for monitoring:
- `CropListed` - New marketplace listings
- `OrderCreated` - New purchase orders
- `PaymentEscrowed` - Payments held in escrow
- `OrderDelivered` - Delivery confirmations
- `PaymentReleased` - Fund distributions

### Query Functions
```javascript
// Get user's orders
const orders = await orderManager.getUserOrders(userAddress);

// Get tracking information
const tracking = await orderManager.getTrackingInfo(orderId);

// Get payment details
const payment = await paymentProcessor.getPaymentDetails(paymentId);
```

## 🚨 Error Handling

### Common Error Scenarios
- Insufficient payment amounts
- Unauthorized role access
- Expired listings or orders
- Invalid transporter selection
- Quantity availability issues

### Dispute Resolution
1. Any participant can raise disputes
2. Admin reviews and resolves
3. Automatic refunds or payment releases
4. Appeal process available

## 📊 Gas Optimization

### Efficient Design
- Batch operations where possible
- Minimal storage reads/writes
- Event-based data retrieval
- Optimized struct packing

### Estimated Gas Costs
- Create listing: ~150,000 gas
- Create order: ~200,000 gas
- Process payment: ~100,000 gas
- Complete order: ~150,000 gas

## 🔮 Future Enhancements

### Planned Features
- Multi-token payment support (ERC20)
- Automated quality scoring
- Insurance integration
- Carbon credit tracking
- Mobile app integration
- Oracle price feeds

### Scalability
- Layer 2 integration
- Cross-chain compatibility
- Batch processing optimization
- State channel payments

## 📞 Support

For technical support or questions:
- Documentation: `/docs/API_REFERENCE.md`
- Test Examples: `/test/PaymentSystem.test.js`
- Usage Examples: `/scripts/payment-system-example.js`

## 📄 License

MIT License - see LICENSE file for details.
