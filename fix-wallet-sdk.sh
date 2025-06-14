#!/bin/bash

set -e

echo "Starting fix for @coinbase/wallet-sdk import issue..."

# Step 1: Install required dependencies
echo "Installing dependencies..."
npm install --save-dev patch-package postinstall-postinstall vite-plugin-commonjs eth-eip712-util
npm install buffer

# Step 2: Patch @coinbase/wallet-sdk import
echo "Patching @coinbase/wallet-sdk..."
sed -i'' 's/import eip712 from/import * as eip712 from/' node_modules/@coinbase/wallet-sdk/dist/sign/walletlink/WalletLinkSigner.js

# Step 3: Verify the patch
echo "Verifying patch..."
grep "import.*eip712" node_modules/@coinbase/wallet-sdk/dist/sign/walletlink/WalletLinkSigner.js

# Step 4: Create patch file
echo "Creating patch file..."
npx patch-package @coinbase/wallet-sdk

# Step 5: Add postinstall script to package.json
echo "Adding postinstall script..."
npm pkg set scripts.postinstall="patch-package"

# Step 6: Update vite.config.js
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

# Step 7: Test the build
echo "Testing build..."
npm install
npm run build

# Step 8: Commit changes to Git
echo "Staging and committing changes..."
git add patches/ vite.config.js package.json package-lock.json
git commit -m "Fix @coinbase/wallet-sdk import issue with patch-package and vite-plugin-commonjs" || echo "No changes to commit"

# Step 9: Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo "Fix applied and pushed successfully! Ready for Vercel deployment."
