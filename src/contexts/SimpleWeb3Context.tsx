import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWeb3Enhanced } from '../hooks/useWeb3Enhanced';
import { useToast } from './ToastContext';

// Types
interface UserRoles {
  isFarmer: boolean;
  isTransporter: boolean;
  isBuyer: boolean;
  isAdmin: boolean;
}

interface SimpleWeb3ContextType {
  // Web3 State
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  
  // User Roles
  userRoles: UserRoles;
  isLoadingRoles: boolean;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  refetchRoles: () => void;
  
  // Role Management
  canPerformAction: (requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => boolean;
  needsRole: (requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => boolean;
  updateUserRoles: (roles: Partial<UserRoles>) => void;
}

// Context
const SimpleWeb3Context = createContext<SimpleWeb3ContextType | undefined>(undefined);

// Provider Component
export const SimpleWeb3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    account,
    isConnected,
    isConnecting,
    chainId,
    connectWallet: web3Connect,
    disconnectWallet: web3Disconnect,
    switchNetwork,
    error
  } = useWeb3Enhanced();
  
  const { addToast } = useToast();
  const [userRoles, setUserRoles] = useState<UserRoles>({
    isFarmer: false,
    isTransporter: false,
    isBuyer: false,
    isAdmin: false,
  });
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // Load user roles from localStorage (in real app, this would be from smart contract)
  const loadUserRoles = useCallback(async (userAddress: string) => {
    setIsLoadingRoles(true);
    
    try {
      // Check localStorage for roles
      const storedRoles = localStorage.getItem(`greenledger_user_roles_${userAddress}`);
      
      if (storedRoles) {
        const roleData = JSON.parse(storedRoles);
        const roles = roleData.roles || [];
        
        setUserRoles({
          isFarmer: roles.includes('farmer'),
          isTransporter: roles.includes('transporter'),
          isBuyer: roles.includes('buyer'),
          isAdmin: roles.includes('admin'),
        });
      } else {
        // No roles found, reset to default
        setUserRoles({
          isFarmer: false,
          isTransporter: false,
          isBuyer: false,
          isAdmin: false,
        });
      }
    } catch (error) {
      console.error('Failed to load user roles:', error);
      addToast('Failed to load user roles', 'error');
    } finally {
      setIsLoadingRoles(false);
    }
  }, [addToast]);

  // Connect wallet wrapper
  const connectWallet = useCallback(async () => {
    try {
      await web3Connect();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  }, [web3Connect]);

  // Disconnect wallet wrapper
  const disconnectWallet = useCallback(() => {
    web3Disconnect();
    setUserRoles({
      isFarmer: false,
      isTransporter: false,
      isBuyer: false,
      isAdmin: false,
    });
  }, [web3Disconnect]);

  // Refetch roles
  const refetchRoles = useCallback(() => {
    if (account) {
      loadUserRoles(account);
    }
  }, [account, loadUserRoles]);

  // Update user roles
  const updateUserRoles = useCallback((newRoles: Partial<UserRoles>) => {
    setUserRoles(prev => ({ ...prev, ...newRoles }));
  }, []);

  // Check if user can perform action based on role
  const canPerformAction = useCallback((requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => {
    if (!isConnected) return false;
    
    // Admin can perform all actions
    if (userRoles.isAdmin) return true;
    
    switch (requiredRole) {
      case 'farmer':
        return userRoles.isFarmer;
      case 'transporter':
        return userRoles.isTransporter;
      case 'buyer':
        return userRoles.isBuyer;
      case 'admin':
        return userRoles.isAdmin;
      default:
        return false;
    }
  }, [isConnected, userRoles]);

  // Check if user needs a specific role
  const needsRole = useCallback((requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => {
    if (!isConnected) return false;
    return !canPerformAction(requiredRole);
  }, [isConnected, canPerformAction]);

  // Load roles when account changes
  useEffect(() => {
    if (account && isConnected) {
      loadUserRoles(account);
    } else {
      setUserRoles({
        isFarmer: false,
        isTransporter: false,
        isBuyer: false,
        isAdmin: false,
      });
    }
  }, [account, isConnected, loadUserRoles]);

  // Handle Web3 errors
  useEffect(() => {
    if (error) {
      addToast(error, 'error');
    }
  }, [error, addToast]);

  const contextValue: SimpleWeb3ContextType = {
    // Web3 State
    account,
    isConnected,
    isConnecting,
    chainId,
    
    // User Roles
    userRoles,
    isLoadingRoles,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refetchRoles,
    
    // Role Management
    canPerformAction,
    needsRole,
    updateUserRoles,
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

// Custom hook for role-based access
export const useRequireRole = (role: 'farmer' | 'transporter' | 'buyer' | 'admin') => {
  const { canPerformAction, needsRole, isLoadingRoles } = useSimpleWeb3();
  return {
    canPerformAction: canPerformAction(role),
    needsRole: needsRole(role),
    isLoadingRoles,
  };
};