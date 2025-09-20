# 🔌 GreenLedger API Reference

## 📋 Overview

Complete API documentation for GreenLedger's GraphQL and REST endpoints. This reference covers all services including crop management, transportation, QR verification, and blockchain integration.

## 🚀 Quick Start

### **Base URLs**
- **Production**: `https://api.greenledger.com/graphql`
- **Staging**: `https://staging-api.greenledger.com/graphql`
- **Development**: `http://localhost:4000/graphql`

### **Authentication**
```typescript
// Headers for all requests
const headers = {
  'Authorization': `Bearer ${jwt_token}`,
  'Content-Type': 'application/json',
  'X-API-Version': '2.0'
};
```

## 🎯 Core Services

### **1. Crop Management API**

#### **Mint Crop Batch**
```graphql
mutation MintCropBatch($input: CropBatchInput!) {
  mintCropBatch(input: $input) {
    tokenId
    transactionHash
    ipfsHash
    qrCode
    status
  }
}
```

**Input Schema:**
```typescript
interface CropBatchInput {
  cropType: string;           // "Tomatoes", "Wheat", etc.
  quantity: number;           // Quantity in kg
  harvestDate: string;        // ISO date string
  originFarm: string;         // Farm identifier
  qualityGrade: string;       // "A", "B", "C"
  certifications: string[];   // ["Organic", "Fair Trade"]
  images: FileUpload[];       // Crop images
  metadata: CropMetadata;     // Additional data
}
```

#### **Get Crop Batch**
```graphql
query GetCropBatch($tokenId: Int!) {
  cropBatch(tokenId: $tokenId) {
    tokenId
    cropType
    quantity
    harvestDate
    originFarm
    currentOwner
    minter
    transferHistory {
      from
      to
      timestamp
      transactionHash
    }
    metadata {
      qualityScore
      certifications
      images
    }
    qrCode
    verificationCount
    lastVerified
  }
}
```

#### **Search Crop Batches**
```graphql
query SearchCropBatches($filters: CropSearchFilters!) {
  searchCropBatches(filters: $filters) {
    results {
      tokenId
      cropType
      quantity
      harvestDate
      originFarm
      currentOwner
      qualityScore
    }
    pagination {
      total
      page
      limit
      hasNext
    }
  }
}
```

### **2. QR Verification API**

#### **Generate QR Code**
```graphql
mutation GenerateQR($tokenId: Int!, $options: QROptions) {
  generateQR(tokenId: $tokenId, options: $options) {
    qrImage        # Base64 encoded image
    qrData         # JSON data embedded in QR
    downloadUrl    # IPFS URL for QR image
    expiresAt      # Optional expiration
  }
}
```

#### **Verify Token**
```graphql
query VerifyToken($tokenId: Int!) {
  verifyToken(tokenId: $tokenId) {
    isValid
    responseTime
    tokenId
    
    # Basic crop information
    cropType
    quantity
    originFarm
    harvestDate
    
    # Ownership data
    currentOwner
    minter
    transferHistory {
      from
      to
      timestamp
      blockNumber
    }
    
    # Enhanced tracking
    currentLocation
    deliveryStatus
    qualityScore
    certifications
    
    # Blockchain proof
    blockNumber
    transactionHash
    verifiedAt
  }
}
```

### **3. Transportation API**

#### **Find Nearby Transporters**
```graphql
query FindTransporters($location: LocationInput!, $radius: Float!) {
  findNearbyTransporters(location: $location, radius: $radius) {
    id
    name
    rating
    vehicleType
    capacity
    currentLocation {
      latitude
      longitude
    }
    distance
    estimatedArrival
    pricePerKm
    availability
  }
}
```

#### **Create Delivery Request**
```graphql
mutation CreateDeliveryRequest($input: DeliveryRequestInput!) {
  createDeliveryRequest(input: $input) {
    deliveryId
    status
    estimatedCost
    estimatedDuration
    assignedTransporter {
      id
      name
      phone
      vehicleInfo
    }
    trackingUrl
  }
}
```

#### **Track Delivery**
```graphql
query TrackDelivery($deliveryId: String!) {
  trackDelivery(deliveryId: $deliveryId) {
    deliveryId
    status
    currentLocation {
      latitude
      longitude
      address
      timestamp
    }
    route {
      origin
      destination
      waypoints
      estimatedArrival
    }
    transporter {
      name
      phone
      vehicleInfo
    }
    updates {
      timestamp
      status
      message
      location
    }
  }
}
```

## 🔐 Authentication & Authorization

### **JWT Token Structure**
```typescript
interface JWTPayload {
  sub: string;              // User ID
  role: UserRole;           // FARMER, TRANSPORTER, BUYER, ADMIN
  permissions: string[];    // Specific permissions
  iat: number;             // Issued at
  exp: number;             // Expires at
  farmId?: string;         // For farmers
  transporterId?: string;  // For transporters
}
```

### **Role-Based Access Control**
```typescript
enum UserRole {
  FARMER = 'FARMER',
  TRANSPORTER = 'TRANSPORTER', 
  BUYER = 'BUYER',
  ADMIN = 'ADMIN'
}

const permissions = {
  FARMER: [
    'crop:mint',
    'crop:transfer_to_transporter',
    'crop:view_own'
  ],
  TRANSPORTER: [
    'crop:transfer_to_buyer',
    'delivery:create',
    'delivery:update',
    'location:update'
  ],
  BUYER: [
    'crop:view_purchased',
    'delivery:track',
    'qr:verify'
  ],
  ADMIN: [
    'crop:*',
    'user:*',
    'analytics:*'
  ]
};
```

## 📊 Real-Time Subscriptions

### **Live Tracking Updates**
```graphql
subscription TrackingUpdates($deliveryId: String!) {
  trackingUpdates(deliveryId: $deliveryId) {
    deliveryId
    location {
      latitude
      longitude
      timestamp
    }
    status
    estimatedArrival
  }
}
```

### **Crop Batch Events**
```graphql
subscription CropBatchEvents($tokenId: Int!) {
  cropBatchEvents(tokenId: $tokenId) {
    tokenId
    eventType    # MINTED, TRANSFERRED, VERIFIED
    actor
    timestamp
    metadata
  }
}
```

## 🚨 Error Handling

### **Error Response Format**
```typescript
interface APIError {
  code: string;           // ERROR_CODE
  message: string;        // Human readable message
  details?: any;          // Additional error details
  timestamp: string;      // ISO timestamp
  requestId: string;      // For debugging
}
```

### **Common Error Codes**
```typescript
const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Business Logic
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_OWNERSHIP: 'INVALID_OWNERSHIP',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};
```

## 📈 Rate Limiting

### **Rate Limits by Endpoint**
| Endpoint | Limit | Window | Burst |
|----------|-------|--------|-------|
| QR Verification | 100/min | 1 min | 10 |
| Crop Search | 60/min | 1 min | 5 |
| Real-time Tracking | 300/min | 1 min | 20 |
| File Upload | 10/min | 1 min | 2 |

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

## 🔄 Pagination

### **Cursor-Based Pagination**
```graphql
query GetCropBatches($first: Int!, $after: String) {
  cropBatches(first: $first, after: $after) {
    edges {
      node {
        tokenId
        cropType
        # ... other fields
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

## 📁 File Upload API

### **Upload Crop Images**
```typescript
// REST endpoint for file uploads
POST /api/v2/upload/crop-images

// Multipart form data
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
formData.append('tokenId', '12345');

const response = await fetch('/api/v2/upload/crop-images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:**
```typescript
interface UploadResponse {
  success: boolean;
  files: {
    filename: string;
    url: string;
    ipfsHash: string;
    size: number;
  }[];
  totalSize: number;
}
```

## 🧪 Testing & Development

### **GraphQL Playground**
Access the interactive GraphQL playground at:
- **Development**: `http://localhost:4000/graphql`
- **Staging**: `https://staging-api.greenledger.com/graphql`

### **Sample Queries**
```typescript
// Complete crop batch creation flow
const MINT_CROP_BATCH = gql`
  mutation MintCropBatch($input: CropBatchInput!) {
    mintCropBatch(input: $input) {
      tokenId
      transactionHash
      qrCode
    }
  }
`;

// Quick verification
const VERIFY_TOKEN = gql`
  query VerifyToken($tokenId: Int!) {
    verifyToken(tokenId: $tokenId) {
      isValid
      cropType
      originFarm
      currentOwner
    }
  }
`;
```

## 📊 Analytics API

### **Platform Metrics**
```graphql
query PlatformMetrics($timeRange: TimeRange!) {
  platformMetrics(timeRange: $timeRange) {
    totalTokens
    totalVerifications
    activeUsers
    averageVerificationTime
    topCropTypes {
      cropType
      count
      percentage
    }
    verificationsByHour {
      hour
      count
    }
  }
}
```

## 🔗 Related Documentation

### **Implementation Guides**
- [Development Setup](../implementation/DEVELOPMENT_SETUP.md) - Local API setup
- [Frontend Integration](../frontend/COMPONENTS.md) - React hooks and components
- [Authentication Guide](../implementation/AUTHENTICATION.md) - JWT setup

### **Architecture**
- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md) - Overall design
- [Microservices](../architecture/MICROSERVICES.md) - Service breakdown
- [Database Design](../architecture/DATABASE_DESIGN.md) - Schema details

### **Operations**
- [Monitoring](../operations/MONITORING.md) - API monitoring
- [Performance](../operations/PERFORMANCE.md) - Optimization
- [Security](../operations/SECURITY.md) - Security practices

---

**Related Links:**
- [← Documentation Hub](../README.md)
- [← System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
- [Frontend Components →](../frontend/COMPONENTS.md)
- [Development Setup →](../implementation/DEVELOPMENT_SETUP.md)

**Last Updated**: January 15, 2024  
**Version**: 2.0  
**Status**: ✅ Complete