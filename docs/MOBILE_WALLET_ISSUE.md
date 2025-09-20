# Issue: Wallet Connection Fails on MetaMask Mobile Browser

## 🐛 Problem
Wallet connection does not work when accessing GreenLedger UI through MetaMask mobile browser, while desktop browsers work perfectly.

## 🔍 Root Cause
- RainbowKit not detecting MetaMask mobile browser environment
- Incorrect connector selection for mobile wallet browsers
- Missing mobile-specific connection strategies

## 📱 Environment
- **Device**: Mobile (iOS/Android)
- **Browser**: MetaMask Mobile Browser
- **Network**: Lisk Sepolia Testnet
- **Status**: Desktop ✅ | Mobile ❌

## 🎯 Solution
1. Add mobile wallet detection utilities
2. Create mobile-optimized connect button
3. Update wagmi config with mobile connectors
4. Add WebSocket support for mobile
5. Include debug component

## 📋 Acceptance Criteria
- [ ] Wallet connects on MetaMask mobile browser
- [ ] Smart connector selection based on environment
- [ ] Desktop functionality preserved
- [ ] Debug info in development mode
- [ ] Mobile network switching works

## 🏷️ Labels
`bug` `mobile` `wallet` `high-priority`