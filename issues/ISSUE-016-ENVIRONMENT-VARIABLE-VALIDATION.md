# ⚙️ ISSUE-016: ENVIRONMENT VARIABLE VALIDATION

## 🎯 Priority: 🟠 HIGH (Configuration)
**Milestone**: `v1.0-mvp` | **Type**: `config` | **Component**: `env`

### 📊 Impact Assessment
- **Business Impact**: HIGH - Silent failures in production
- **Technical Effort**: Low (1 hour)
- **User Impact**: MEDIUM - Features fail silently
- **Risk Level**: HIGH - Hard to debug issues

## 🔍 Issue Description

Missing environment variable validation causes silent failures:
- IPFS uploads fail without proper Pinata keys
- Wallet connections fail without WalletConnect ID
- Features break without clear error messages

### Root Cause
**Issue**: No validation of required environment variables at startup

## 🛠️ Implementation Plan

### Phase 1: Environment Validation (45 minutes)

#### 1. Create Validation Utility
```typescript
// Create: src/utils/envValidation.ts
interface EnvConfig {
  VITE_WALLETCONNECT_PROJECT_ID: string;
  VITE_APP_PINATA_API_KEY: string;
  VITE_APP_PINATA_SECRET_KEY: string;
  VITE_GREENLEDGER_USER_MANAGEMENT_CONTRACT_ADDRESS: string;
  VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS: string;
  VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS: string;
  VITE_APP_RPC_URL: string;
  VITE_APP_CHAIN_ID: string;
}

export const validateEnvironment = (): EnvConfig => {
  const requiredVars: (keyof EnvConfig)[] = [
    'VITE_WALLETCONNECT_PROJECT_ID',
    'VITE_APP_PINATA_API_KEY',
    'VITE_APP_PINATA_SECRET_KEY',
    'VITE_GREENLEDGER_USER_MANAGEMENT_CONTRACT_ADDRESS',
    'VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS',
    'VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS',
    'VITE_APP_RPC_URL',
    'VITE_APP_CHAIN_ID',
  ];
  
  const missing: string[] = [];
  const config: Partial<EnvConfig> = {};
  
  for (const key of requiredVars) {
    const value = import.meta.env[key];
    if (!value || value.includes('your_') || value.includes('placeholder')) {
      missing.push(key);
    } else {
      config[key] = value;
    }
  }
  
  if (missing.length > 0) {
    const error = `Missing or invalid environment variables:\n${missing.join('\n')}`;
    console.error(error);
    throw new Error(error);
  }
  
  return config as EnvConfig;
};
```

#### 2. Add Startup Validation
```typescript
// Update: src/main.tsx
import { validateEnvironment } from './utils/envValidation';

try {
  validateEnvironment();
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  
  // Show user-friendly error
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial; color: red;">
      <h2>Configuration Error</h2>
      <p>The application is not properly configured.</p>
      <pre>${error.message}</pre>
      <p>Please check your environment variables.</p>
    </div>
  `;
  
  throw error;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Phase 2: Runtime Checks (15 minutes)

#### 1. Service-Level Validation
```typescript
// Update: src/utils/ipfs.ts
export const validateIPFSConfig = () => {
  const apiKey = import.meta.env.VITE_APP_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_APP_PINATA_SECRET_KEY;
  
  if (!apiKey || !secretKey || apiKey.includes('your_')) {
    throw new Error('Pinata API keys not configured properly');
  }
  
  return { apiKey, secretKey };
};

export const uploadToIPFS = async (file: File) => {
  validateIPFSConfig(); // Validate before upload
  // ... rest of upload logic
};
```

#### 2. Contract Address Validation
```typescript
// Update: src/config/constants.ts
import { validateEnvironment } from '../utils/envValidation';

const env = validateEnvironment();

export const CONTRACT_ADDRESSES = {
  USER_MANAGEMENT: env.VITE_GREENLEDGER_USER_MANAGEMENT_CONTRACT_ADDRESS,
  CROPBATCH_TOKEN: env.VITE_CROPBATCH_TOKEN_CONTRACT_ADDRESS,
  SUPPLY_CHAIN_MANAGER: env.VITE_SUPPLY_CHAIN_MANAGER_CONTRACT_ADDRESS,
} as const;

// Validate addresses are proper format
Object.entries(CONTRACT_ADDRESSES).forEach(([name, address]) => {
  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error(`Invalid contract address for ${name}: ${address}`);
  }
});
```

## 🎯 Success Criteria
- [ ] Clear error messages for missing env vars
- [ ] Application fails fast on misconfiguration
- [ ] Runtime validation prevents silent failures
- [ ] Development setup guide updated

---

**⚙️ HIGH: Prevents silent failures and improves debugging experience.**