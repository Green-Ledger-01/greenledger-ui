import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [
    react(),
    commonjs(), // Add this to handle CommonJS modules
    inject({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  define: {
    global: {}, 
  },
  optimizeDeps: {
    include: ['buffer'], 
  },
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      // Alias to bypass the problematic CommonJS module
      '@coinbase/wallet-sdk/dist/vendor-js/eth-eip712-util/index.cjs': 'eth-eip712-util',
    },
  },
});