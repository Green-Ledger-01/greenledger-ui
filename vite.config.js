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
