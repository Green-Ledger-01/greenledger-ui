# RainbowKit Implementation Issues

## Issue #1: Duplicate Provider Wrapping
**Priority**: Critical
**Status**: Open

### Description
App is wrapped with duplicate `WagmiProvider` and `QueryClientProvider` instances causing context conflicts.

### Location
- `src/main.tsx` (lines 65-69)
- `src/config/HybridWeb3Config.tsx` (lines 95-97)

### Fix Required
Remove providers from `main.tsx`, keep only in `HybridWeb3Config.tsx`.

### Test
- [ ] Wallet connection works without errors
- [ ] No duplicate provider warnings in console
- [ ] Context values accessible throughout app

---

## Issue #2: Chain Configuration Mismatch
**Priority**: Critical
**Status**: Open

### Description
Different `liskSepolia` chain objects used across files causing RainbowKit chain detection failures.

### Location
- `src/chains/liskSepolia.ts` (export)
- `src/config/HybridWeb3Config.tsx` (lines 47-62, redefined)
- `src/config/wagmiConfig.ts` (import)

### Fix Required
Use single chain definition from `liskSepolia.ts` everywhere.

### Test
- [ ] Same chain object reference used across all files
- [ ] RainbowKit displays correct network name
- [ ] Network switching works properly

---

## Issue #3: Missing Environment Variables
**Priority**: High
**Status**: Open

### Description
Particle Network environment variables commented out, causing silent authentication failures.

### Location
- `.env` (lines 25-28, commented)
- `src/config/HybridWeb3Config.tsx` (lines 18-26, validation)

### Fix Required
Uncomment and populate Particle Network variables or provide fallbacks.

### Test
- [ ] All required env vars present
- [ ] Validation warnings appear for missing vars
- [ ] Social login functionality works

---

## Issue #4: RainbowKit Chain Prop Error
**Priority**: High
**Status**: Open

### Description
RainbowKitProvider receives explicit chains array instead of using wagmi config chains.

### Location
- `src/config/HybridWeb3Config.tsx` (line 108)

### Fix Required
Remove `chains={[liskSepolia]}` prop from RainbowKitProvider.

### Test
- [ ] RainbowKit uses chains from wagmi config
- [ ] No chain mismatch errors in console
- [ ] Wallet connection modal shows correct chains

---

## Issue #5: Wagmi Config Chain Export
**Priority**: Medium
**Status**: Open

### Description
Chain export format may not be compatible with RainbowKit expectations.

### Location
- `src/config/wagmiConfig.ts` (line 16)

### Fix Required
Verify chain export format matches RainbowKit requirements.

### Test
- [ ] Chains properly exported from wagmi config
- [ ] RainbowKit recognizes available chains
- [ ] Chain switching functionality works

---

## Issue #6: Circular Import Dependencies
**Priority**: Medium
**Status**: Open

### Description
Commented import in `liskSepolia.ts` references itself, potential circular dependency.

### Location
- `src/chains/liskSepolia.ts` (line 2, commented)

### Fix Required
Remove commented self-referencing import.

### Test
- [ ] No circular dependency warnings
- [ ] Clean import structure
- [ ] Build completes without errors

---

## Issue #7: React Query Client Duplication
**Priority**: Medium
**Status**: Open

### Description
Two separate QueryClient instances with different configurations.

### Location
- `src/main.tsx` (lines 55-63)
- `src/config/HybridWeb3Config.tsx` (lines 64-78)

### Fix Required
Use single QueryClient instance with consistent configuration.

### Test
- [ ] Single QueryClient instance used
- [ ] Consistent query configuration
- [ ] No duplicate network requests

---

## Issue #8: Polyfill Conflicts
**Priority**: Medium
**Status**: Open

### Description
Complex polyfill setup may interfere with RainbowKit wallet connections.

### Location
- `vite.config.js` (lines 18-26)
- `src/main.tsx` (lines 1-48, polyfill setup)

### Fix Required
Simplify polyfill configuration, test wallet compatibility.

### Test
- [ ] Wallet connections work with current polyfills
- [ ] No polyfill-related console errors
- [ ] MetaMask/WalletConnect function properly

---

## Issue #9: React Strict Mode Conflicts
**Priority**: Low
**Status**: Open

### Description
React.StrictMode may cause double initialization of RainbowKit connectors.

### Location
- `src/main.tsx` (line 65)

### Fix Required
Test without StrictMode, implement proper cleanup if needed.

### Test
- [ ] Connectors initialize once
- [ ] No double connection attempts
- [ ] Proper cleanup on unmount

---

## Issue #10: Hook Usage Race Conditions
**Priority**: Low
**Status**: Open

### Description
Simultaneous use of wagmi and Particle hooks may cause state conflicts.

### Location
- `src/components/HybridConnectButton.tsx` (lines 12-18)

### Fix Required
Implement proper state synchronization between connection methods.

### Test
- [ ] No conflicting connection states
- [ ] Proper state updates
- [ ] Clean disconnection handling

---

## Fix Priority Order
1. **Issue #1**: Remove duplicate providers
2. **Issue #2**: Fix chain configuration mismatch  
3. **Issue #4**: Remove explicit chains prop from RainbowKit
4. **Issue #3**: Add missing environment variables
5. **Issue #7**: Consolidate QueryClient instances
6. **Issues #5-10**: Address remaining issues

## Verification Checklist
- [ ] Wallet connection works without errors
- [ ] Network switching functions properly
- [ ] Social login integration works
- [ ] No console errors or warnings
- [ ] Clean build without dependency issues
- [ ] Proper state management across providers