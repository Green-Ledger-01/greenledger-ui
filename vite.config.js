import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import inject from '@rollup/plugin-inject'

export default defineConfig({
  plugins: [
    react(),
    inject({
      Buffer: ['buffer', 'Buffer']
    }),
  ],
  define: {
    global: {}, 
  },
  optimizeDeps: {
    include: ['buffer'], 
  },
})
