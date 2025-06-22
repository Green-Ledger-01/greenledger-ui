import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

// Types
interface SimpleWeb3ContextType {
  // Web3 State
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Connection Methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // Error State
  error: string | null;
  clearError: () => void;
}

// Context
const SimpleWeb3Context = createContext<SimpleWeb3ContextType | undefined>(undefined);

// Provider Component
export const SimpleWeb3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  // Check if wallet is connected
  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      const errorMsg = 'MetaMask is not installed. Please install MetaMask to continue.';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        addToast('Wallet connected successfully!', 'success');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to connect wallet';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [addToast]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    addToast('Wallet disconnected', 'info');
  }, [addToast]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: SimpleWeb3ContextType = {
    // Web3 State
    account,
    isConnected,
    isConnecting,
    
    // Connection Methods
    connectWallet,
    disconnectWallet,
    
    // Error State
    error,
    clearError,
  };

  return (
    <SimpleWeb3Context.Provider value={contextValue}>
      {children}
    </SimpleWeb3Context.Provider>
  );
};

// Hook
export const useSimpleWeb3 = () => {
  const context = useContext(SimpleWeb3Context);
  if (!context) {
    throw new Error('useSimpleWeb3 must be used within a SimpleWeb3Provider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}