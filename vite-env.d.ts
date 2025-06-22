interface ImportMetaEnv {
    // Add declarations for your VITE_ prefixed environment variables here
    // For example, based on your HybridWeb3Config.tsx:
    readonly VITE_PARTICLE_PROJECT_ID: string;
    readonly VITE_PARTICLE_CLIENT_KEY: string;
    readonly VITE_PARTICLE_APP_ID: string;
    readonly VITE_WALLETCONNECT_PROJECT_ID: string;
    // Add any other VITE_ variables you use
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }