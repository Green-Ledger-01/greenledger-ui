import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
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
      'react',
      'react-dom',
      'react-router-dom',
      'buffer',
      'process/browser',
      'lucide-react',
    ],
  },
  resolve: {
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking for better code splitting
        manualChunks: {
          // Vendor chunk for large dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Icons and utilities
          utils: ['lucide-react', 'buffer'],
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
