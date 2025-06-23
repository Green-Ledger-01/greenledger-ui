interface ImportMetaEnv {
    // Add declarations for your VITE_ prefixed environment variables here
    // For example, based on your HybridWeb3Config.tsx:
    readonly VITE_PARTICLE_PROJECT_ID: string;
    readonly VITE_PARTICLE_CLIENT_KEY: string;
    readonly VITE_PARTICLE_APP_ID: string;
    readonly VITE_WALLETCONNECT_PROJECT_ID: string;
    readonly VITE_DEBUG: string;
    readonly VITE_NODE_ENV: string;
    // Add any other VITE_ variables you use
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  // Global process type for browser polyfill
  declare global {
    interface Window {
      Buffer: typeof Buffer;
    }

    var process: {
      env: Record<string, string>;
      version: string;
      versions: { node: string };
      platform: string;
      nextTick: (cb: Function) => void;
    };
  }