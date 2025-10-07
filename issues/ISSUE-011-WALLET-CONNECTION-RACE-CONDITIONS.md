# 🔗 ISSUE-011: WALLET CONNECTION RACE CONDITIONS

## 🎯 Priority: 🔴 CRITICAL (Production Blocker)
**Milestone**: `v1.0-mvp` | **Type**: `bug` | **Component**: `wallet`

### 📊 Impact Assessment
- **Business Impact**: CRITICAL - Users cannot complete transactions
- **Technical Effort**: Low (2-4 hours)
- **User Impact**: CRITICAL - Wallet disconnects during minting
- **Risk Level**: CRITICAL - Core functionality broken

## 🔍 Issue Description

Based on user report: "When I press the button to mint the wallet disconnects and I'm told to connect my wallet then it reconnects automatically but the transaction doesn't go through."

### Root Cause Analysis
**File**: `src/contexts/Web3ContextEnhanced.tsx`
**Issue**: Race condition between wallet state and transaction signing

```typescript
// PROBLEMATIC: State inconsistency
const { isConnected } = useAccount(); // May be stale
const { writeContract } = useWriteContract(); // Triggers disconnect

// Race condition occurs here:
if (isConnected) {
  await writeContract(); // Wallet disconnects mid-transaction
}
```

## 🛠️ Implementation Plan

### Phase 1: Fix Race Condition (2 hours)

#### 1. Add Connection Validation
```typescript
// Create: src/hooks/useWalletValidation.ts
export const useWalletValidation = () => {
  const { isConnected, address, chain } = useAccount();
  
  const validateConnection = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    
    if (chain?.id !== 4202) {
      throw new Error('Wrong network');
    }
    
    return true;
  }, [isConnected, address, chain]);
  
  return { validateConnection };
};
```

#### 2. Fix Minting Flow
```typescript
// Update: src/hooks/useCropBatchToken.ts
const mintCropBatch = async (data: CropBatchData) => {
  try {
    // Validate before transaction
    await validateConnection();
    
    setIsMinting(true);
    
    // Upload to IPFS first
    const uri = await uploadMetadata(data);
    
    // Re-validate before contract call
    await validateConnection();
    
    const result = await writeContract({
      address: CROPBATCH_TOKEN_ADDRESS,
      abi: CropBatchTokenABI,
      functionName: 'mint',
      args: [address, data.quantity, uri],
    });
    
    return result;
  } catch (error) {
    if (error.message.includes('User rejected')) {
      toast.error('Transaction cancelled by user');
    } else if (error.message.includes('not connected')) {
      toast.error('Please connect your wallet');
    } else {
      toast.error('Minting failed. Please try again.');
    }
    throw error;
  } finally {
    setIsMinting(false);
  }
};
```

### Phase 2: UI State Sync (1-2 hours)

#### 1. Connection Status Component
```typescript
// Create: src/components/WalletStatus.tsx
export const WalletStatus = () => {
  const { isConnected, isConnecting, address } = useAccount();
  
  if (isConnecting) {
    return <div className="text-yellow-600">Connecting...</div>;
  }
  
  if (!isConnected) {
    return <div className="text-red-600">Wallet not connected</div>;
  }
  
  return (
    <div className="text-green-600">
      Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
    </div>
  );
};
```

#### 2. Form Validation
```typescript
// Update: src/pages/TokenizationPage.tsx
const TokenizationPage = () => {
  const { isConnected } = useAccount();
  const { validateConnection } = useWalletValidation();
  
  const handleSubmit = async (data: FormData) => {
    try {
      await validateConnection();
      await mintCropBatch(data);
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <WalletStatus />
      <button 
        type="submit" 
        disabled={!isConnected}
        className={!isConnected ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {!isConnected ? 'Connect Wallet First' : 'Mint Crop Batch Token'}
      </button>
    </form>
  );
};
```

## 🎯 Success Criteria

### Technical Validation
- [ ] Wallet state synchronized across components
- [ ] No race conditions during transaction signing
- [ ] Proper error handling for disconnections
- [ ] UI reflects actual wallet state

### User Experience
- [ ] Clear feedback when wallet disconnects
- [ ] Transaction completes without interruption
- [ ] Proper error messages for different scenarios
- [ ] Smooth reconnection flow

---

**🔗 CRITICAL: This issue prevents users from completing core functionality and must be fixed immediately.**