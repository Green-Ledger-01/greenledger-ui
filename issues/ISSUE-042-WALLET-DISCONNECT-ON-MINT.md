# Wallet Disconnects During Minting

## Bug
Wallet disconnects when clicking "Mint Crop Batch Token", shows "connect wallet" message, then reconnects but transaction fails.

## Fix
Check wallet connection state in TokenizationPage before mint operation.

## Priority
High