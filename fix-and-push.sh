#!/bin/bash

set -e

echo "Starting complete fix for @coinbase/wallet-sdk import issue and pushing to GitHub..."

# Step 1: Verify working directory
if [ "$(pwd)" != "/workspaces/greenledger-ui" ]; then
  echo "Error: Script must run in /workspaces/greenledger-ui"
  exit 1
fi

# Step 2: Clean up any Vim swap files
echo "Cleaning up Vim swap files..."
rm -f .fix-wallet-sdk.sh.swp

# Step 3: Install required dependencies
echo "Installing dependencies..."
npm install --save-dev patch-package postinstall-postinstall vite-plugin-commonjs eth-eip712-util
npm install buffer

# Step 4: Patch @coinbase/wallet-sdk import
echo "Patching @coinbase/wallet-sdk..."
if [ -f "node_modules/@coinbase/wallet-sdk/dist/sign/walletlink/WalletLinkSigner.js" ]; then
  sed -i'' 's/import eip712 from/import * as eip712 from/' node_modules/@coinbase/wallet-sdk/dist/sign/walletlink/WalletLinkSigner.js
else
  echo "Error: WalletLinkSigner.js not found in node_modules/@coinbase/wallet-sdk"
  exit 1
fi

# Step 5: Verify the patch
echo "Verifying patch..."
grep "import.*eip712" node_modules/@coinbase/wallet-sdk/dist/sign/walletlink/WalletLinkSigner.js || {
  echo "Error: Patch verification failed"
  exit 1
}

# Step 6: Create patch file
echo "Creating patch file..."
npx patch-package @coinbase/wallet-sdk

# Step 7: Add postinstall script to package.json
echo "Adding postinstall script..."
npm pkg set scripts.postinstall="patch-package"

# Step 8: Update vite.config.js
echo "Updating vite.config.js..."
cat > vite.config.js << 'INNER_EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [
    react(),
    commonjs({
      include: [/node_modules\/@coinbase\/wallet-sdk\/.*\.cjs$/],
    }),
    inject({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  define: {
    global: {},
  },
  optimizeDeps: {
    include: ['buffer', '@coinbase/wallet-sdk'],
  },
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@coinbase/wallet-sdk/dist/vendor-js/eth-eip712-util/index.cjs': 'eth-eip712-util',
    },
  },
});
INNER_EOF

# Step 9: Test the build
echo "Testing build..."
npm install
npm run build || {
  echo "Error: Build failed. Check npm run build output for details."
  exit 1
}

# Step 10: Pull remote changes to resolve push rejection
echo "Pulling remote changes to sync with origin/main..."
git pull origin main --no-rebase || {
  echo "Merge conflicts detected. Please resolve conflicts manually in the listed files."
  echo "Steps to resolve:"
  echo "1. Open conflicting files and fix conflicts marked with <<<<<<<, =======, >>>>>>>"
  echo "2. Run: git add <file> for each resolved file"
  echo "3. Run: git commit"
  echo "4. Continue with the script or manually push: git push origin main"
  exit 1
}

# Step 11: Stage all relevant files
echo "Staging changes..."
git add patches/ vite.config.js package.json package-lock.json src/config/wagmiConfig.ts fix-wallet-sdk.sh

# Step 12: Commit changes
echo "Committing changes..."
git commit -m "Fix @coinbase/wallet-sdk import issue, update wagmiConfig.ts and include script" || echo "No changes to commit"

# Step 13: Verify Git remote
echo "Verifying Git remote..."
git remote -v | grep "github.com/Green-Ledger-01/greenledger-ui" || {
  echo "Setting remote to HTTPS..."
  git remote set-url origin https://github.com/Green-Ledger-01/greenledger-ui.git
}

# Step 14: Push to GitHub
echo "Pushing to GitHub..."
git push origin main || {
  echo "Error: Push failed. Check authentication or try: git push origin main --force (use with caution)."
  exit 1
}

echo "Fix applied and pushed successfully to https://github.com/Green-Ledger-01/greenledger-ui!"
echo "If linked to Vercel, deployment should trigger automatically. Otherwise, run: vercel deploy"
