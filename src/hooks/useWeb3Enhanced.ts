/**
 * Enhanced Web3 Hook
 * 
 * This hook provides enhanced Web3 functionality including:
 * - Wallet connection management
 * - Transaction handling with better UX
 * - Self-service role registration
 * - Local storage fallback for roles
 * - Progressive enhancement capabilities
 */

import { useCallback, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWeb3Enhanced as useWeb3EnhancedContext } from '../contexts/Web3ContextEnhanced';
import { useToast } from '../contexts/ToastContext';

export interface TransactionStatus {
  status: 'idle' | 'pending' | 'confirming' | 'success' | 'error';
  hash?: string;
  error?: string;
}

export interface UseWeb3EnhancedReturn {
  // Account info
  account: string | undefined;
  isConnected: boolean;
  
  // Connection management
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // Role management (from context)
  userRoles: any;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  needsRoleRegistration: boolean;
  registerRoles: (roles: string[]) => Promise<void>;
  
  // Transaction management
  sendTransaction: (txFunction: () => Promise<any>) => Promise<any>;
  transactionStatus: TransactionStatus;
  
  // Loading states
  isLoading: boolean;
  isRegistering: boolean;
}

// Helper function to get error message
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.reason) return error.reason;
  return 'An unknown error occurred';
};

export const useWeb3Enhanced = (): UseWeb3EnhancedReturn => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { addToast } = useToast();
  
  // Get enhanced context
  const {
    userRoles,
    hasRole,
    isAdmin,
    needsRoleRegistration,
    registerRoles,
    isRegistering,
  } = useWeb3EnhancedContext();
  
  // Local state
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    status: 'idle'
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Get the first available connector (usually MetaMask or injected)
      const connector = connectors[0];
      if (!connector) {
        throw new Error('No wallet connector available');
      }
      
      await connect({ connector });
      addToast('Wallet connected successfully', 'success');
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      addToast(`Failed to connect wallet: ${errorMessage}`, 'error');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connectors, addToast]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    try {
      disconnect();
      addToast('Wallet disconnected', 'info');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      addToast(`Failed to disconnect wallet: ${errorMessage}`, 'error');
    }
  }, [disconnect, addToast]);

  // Send transaction with enhanced UX
  const sendTransaction = useCallback(async (txFunction: () => Promise<any>) => {
    try {
      setTransactionStatus({ status: 'pending' });
      
      const result = await txFunction();
      
      if (result?.hash) {
        setTransactionStatus({ 
          status: 'confirming', 
          hash: result.hash 
        });
        
        // Wait for confirmation (this would be handled by the calling component)
        // For now, we'll just mark as success after a delay
        setTimeout(() => {
          setTransactionStatus({ 
            status: 'success', 
            hash: result.hash 
          });
        }, 2000);
      }
      
      return result;
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setTransactionStatus({ 
        status: 'error', 
        error: errorMessage 
      });
      throw error;
    }
  }, []);

  const isLoading = isConnecting;

  return {
    // Account info
    account: address,
    isConnected,
    
    // Connection management
    connectWallet,
    disconnectWallet,
    
    // Role management
    userRoles,
    hasRole,
    isAdmin,
    needsRoleRegistration,
    registerRoles,
    
    // Transaction management
    sendTransaction,
    transactionStatus,
    
    // Loading states
    isLoading,
    isRegistering,
  };
};