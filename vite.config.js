import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { fileURLToPath, URL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      include: ['buffer', 'stream'], // Remove 'util' since we're using custom shim
      exclude: ['util'], // Explicitly exclude util to avoid conflicts
      protocolImports: true, // Support `node:` protocol imports if required
    }),
  ],
  // Load environment variables from .env file
  envDir: '.',
  envPrefix: 'VITE_',
  define: {
    global: 'globalThis',
    'process.env': 'import.meta.env',
    'process.env.DEBUG': 'import.meta.env.VITE_DEBUG',
    'process.env.NODE_ENV': 'import.meta.env.VITE_NODE_ENV',
    // Ensure import.meta.env is properly defined
    'import.meta.env.VITE_NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'import.meta.env.VITE_DEBUG': JSON.stringify(process.env.VITE_DEBUG || ''),
  },
  optimizeDeps: {
    include: [
      '@coinbase/wallet-sdk',
      '@particle-network/authkit',
      '@particle-network/auth-core',
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
    ],
    exclude: ['@solana/web3.js'],
  },
  resolve: {
    alias: {
      '@coinbase/wallet-sdk/dist/vendor-js/eth-eip712-util/index.cjs': 'eth-eip712-util',
      'react': path.resolve(__dirname, './node_modules/react'),
      'util': path.resolve(__dirname, 'src/shims/utils.js'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-router': path.resolve(__dirname, './node_modules/react-router'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: (id) => {
        if (id.includes('@solana/web3.js')) {
          return false;
        }
        return false;
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          web3: ['wagmi', 'viem'],
          rainbowkit: ['@rainbow-me/rainbowkit'],
          particle: ['@particle-network/authkit', '@particle-network/auth-core'],
          query: ['@tanstack/react-query'],
          utils: ['lucide-react', 'valtio'],
        },
      },
      onwarn(warning, warn) {
        if (warning.code === 'INVALID_ANNOTATION' && warning.message.includes('__PURE__')) {
          return;
        }
        if (warning.code === 'MISSING_EXPORT' && warning.id?.includes('@coinbase/wallet-sdk')) {
          return;
        }
        if (
          warning.message?.includes('@solana') ||
          warning.message?.includes('serialize')
        ) {
          return;
        }
        if (
          warning.message?.includes('createContext') ||
          warning.message?.includes('forwardRef') ||
          warning.message?.includes('useContext')
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
});