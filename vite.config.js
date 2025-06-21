import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import commonjs from 'vite-plugin-commonjs';
import path from 'path'; // Add path module for resolution

export default defineConfig({
  plugins: [
    react({
      // Add this to handle React 19 JSX transforms
      jsxRuntime: 'classic',
    }),
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
      '@particle-network/auth-core',
      '@aws-sdk/client-cognito-identity',
      'react',
      'react-dom',
      'react-router',
      'react-router-dom'
    ],
    exclude: [
      '@solana/web3.js',
      'borsh'
    ],
  },
  resolve: {
    alias: {
      '@coinbase/wallet-sdk/dist/vendor-js/eth-eip712-util/index.cjs': 'eth-eip712-util',
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-router': path.resolve(__dirname, './node_modules/react-router'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: (id) => {
        if (id.includes('@solana/web3.js') || id.includes('borsh')) {
          return false;
        }
        return false;
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          web3: ['ethers', 'wagmi', 'viem', '@wagmi/core'],
          rainbowkit: ['@rainbow-me/rainbowkit'],
          particle: ['@particle-network/authkit', '@particle-network/auth-core'],
          query: ['@tanstack/react-query'],
          utils: ['lucide-react', 'valtio', 'buffer'],
        },
      },
      onwarn(warning, warn) {
        if (warning.code === 'INVALID_ANNOTATION' && warning.message.includes('__PURE__')) {
          return;
        }
        if (warning.code === 'MISSING_EXPORT' && warning.id?.includes('@coinbase/wallet-sdk')) {
          return;
        }
        if (warning.message?.includes('@solana') || warning.message?.includes('borsh') || warning.message?.includes('serialize')) {
          return;
        }
        // Suppress React 19 warnings
        if (warning.message?.includes('createContext') || 
            warning.message?.includes('forwardRef') ||
            warning.message?.includes('useContext')) {
          return;
        }
        warn(warning);
      },
    },
  },
});