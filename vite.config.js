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
      process: 'process/browser',
    }),
  ],
  define: {
    global: 'globalThis',
    'process.env': 'import.meta.env',
  },
  optimizeDeps: {
    include: [
      'buffer', 
      'process/browser',
      '@coinbase/wallet-sdk',
      '@particle-network/authkit',
      '@particle-network/auth-core'
    ],
    exclude: [
      '@solana/web3.js',
      'borsh'
    ],
  },
  resolve: {
    alias: {
      '@coinbase/wallet-sdk/dist/vendor-js/eth-eip712-util/index.cjs': 'eth-eip712-util',
      // Force borsh to use the version that Solana expects
      'borsh': '@solana/web3.js/node_modules/borsh/lib/index.js',
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    // Increase chunk size warning limit to reduce noise
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: (id) => {
        // Mark Solana dependencies as external to avoid build issues
        if (id.includes('@solana/web3.js') || id.includes('borsh')) {
          return false; // Don't externalize, but handle differently
        }
        return false;
      },
      output: {
        // Manual chunking for better code splitting
        manualChunks: {
          // Vendor chunk for large dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Web3 libraries chunk
          web3: ['ethers', 'wagmi', 'viem', '@wagmi/core'],
          // RainbowKit and related UI
          rainbowkit: ['@rainbow-me/rainbowkit'],
          // Particle Network chunk
          particle: ['@particle-network/authkit', '@particle-network/auth-core'],
          // Query libraries
          query: ['@tanstack/react-query'],
          // Icons and utilities
          utils: ['lucide-react', 'valtio', 'buffer'],
        },
      },
      // Suppress specific warnings we can't fix (external dependencies)
      onwarn(warning, warn) {
        // Suppress PURE comment warnings from ox library
        if (warning.code === 'INVALID_ANNOTATION' && warning.message.includes('__PURE__')) {
          return;
        }
        // Suppress missing export warnings from Coinbase SDK
        if (warning.code === 'MISSING_EXPORT' && warning.id?.includes('@coinbase/wallet-sdk')) {
          return;
        }
        // Suppress Solana-related warnings and errors
        if (warning.message?.includes('@solana') || warning.message?.includes('borsh') || warning.message?.includes('serialize')) {
          return;
        }
        // Show other warnings
        warn(warning);
      },
    },
  },
});
