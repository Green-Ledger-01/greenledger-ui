# 🔧 Troubleshooting Guide

This directory contains detailed documentation for resolving common issues in the GreenLedger application.

## 📋 **Available Guides**

### **🔗 Wallet & Connection Issues**
- [**Wallet Connection Race Condition Fix**](./WALLET_CONNECTION_RACE_CONDITION_FIX.md) - Comprehensive guide for resolving wallet connection state synchronization issues

### **🚀 Coming Soon**
- Smart Contract Interaction Issues
- IPFS Upload Failures
- Network Switching Problems
- Transaction Timeout Handling
- Mobile Wallet Compatibility

## 🎯 **Quick Reference**

| Issue Type | Symptoms | Quick Fix | Detailed Guide |
|------------|----------|-----------|----------------|
| **Wallet Connection** | False "connect wallet" warnings | Use single state source | [Full Guide](./WALLET_CONNECTION_RACE_CONDITION_FIX.md) |
| **Transaction Failures** | Wagmi v2 type errors | Add `chain` and `account` params | [Full Guide](./WALLET_CONNECTION_RACE_CONDITION_FIX.md) |
| **State Sync Issues** | Inconsistent connection state | Remove duplicate state management | [Full Guide](./WALLET_CONNECTION_RACE_CONDITION_FIX.md) |

## 🆘 **Getting Help**

1. **Check this documentation first**
2. **Search existing GitHub issues**
3. **Create a new issue with detailed reproduction steps**
4. **Include browser console logs and network requests**

---

*Last Updated: December 2024*