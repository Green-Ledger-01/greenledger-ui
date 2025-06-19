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
    global: 'globalThis',
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
  build: {
    // Increase chunk size warning limit to reduce noise
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['borsh/dist/bundle-entrypoints'],
      output: {
        // Manual chunking for better code splitting
        manualChunks: {
          // Vendor chunk for large dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Web3 libraries chunk
          web3: ['ethers', 'wagmi', 'viem', '@wagmi/core'],
          // RainbowKit and related UI
          rainbowkit: ['@rainbow-me/rainbowkit'],
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
        // Show other warnings
        warn(warning);
      },
    },
  },
});
