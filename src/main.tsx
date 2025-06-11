import { Buffer } from 'buffer'
window.Buffer = Buffer

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { config } from './config/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Remove BrowserRouter from here as it will be in AppRoutes

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
