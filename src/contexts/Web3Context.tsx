import React, { createContext, useContext, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, DEFAULT_ADMIN_ROLE } from '../config/constants';
import { useToast } from './ToastContext';
import { getErrorMessage } from '../utils';
import UserManagementABI from '../contracts/UserManagement.json';

// Types
interface UserRoles {
  isFarmer: boolean;
  isTransporter: boolean;
  isBuyer: boolean;
  isAdmin: boolean;
}

interface Web3ContextType {
  userRoles: UserRoles;
  isLoadingRoles: boolean;
  refetchRoles: () => void;
  canPerformAction: (requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => boolean;
  needsRole: (requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => boolean;
}

// Context
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Provider Component
export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { addToast } = useToast();

  // Fetch user roles from contract
  const { 
    data: rolesData, 
    isLoading: isLoadingRoles, 
    refetch: refetchRoles 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    functionName: 'getUserRolesStatus',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
      select: (data: any) => ({
        isFarmer: data[0],
        isTransporter: data[1],
        isBuyer: data[2],
      }),
      onError: (err) => {
        console.error('Failed to fetch user roles:', err);
        addToast(`Failed to fetch user roles: ${getErrorMessage(err)}`, 'error');
      },
    },
  });

  // Fetch admin role separately
  const { 
    data: isAdminRole, 
    isLoading: isLoadingAdminRole 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    functionName: 'hasRole',
    args: [DEFAULT_ADMIN_ROLE, address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
      onError: (err) => {
        console.error('Failed to fetch admin role:', err);
        addToast(`Failed to fetch admin role: ${getErrorMessage(err)}`, 'error');
      },
    },
  });

  // Combine roles
  const userRoles: UserRoles = {
    isFarmer: rolesData?.isFarmer || false,
    isTransporter: rolesData?.isTransporter || false,
    isBuyer: rolesData?.isBuyer || false,
    isAdmin: isAdminRole || false,
  };

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
    if (!isConnected) return false; // If not connected, cannot "need" a role yet
    return !canPerformAction(requiredRole);
  }, [isConnected, canPerformAction]);

  const isLoadingCombined = isLoadingRoles || isLoadingAdminRole;

  return (
    <Web3Context.Provider 
      value={{ 
        userRoles, 
        isLoadingRoles: isLoadingCombined, 
        refetchRoles, 
        canPerformAction, 
        needsRole 
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// Hook
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Custom hook for role-based access
export const useRequireRole = (role: 'farmer' | 'transporter' | 'buyer' | 'admin') => {
  const { canPerformAction, needsRole, isLoadingRoles } = useWeb3();
  return {
    canPerformAction: canPerformAction(role),
    needsRole: needsRole(role),
    isLoadingRoles,
  };
};