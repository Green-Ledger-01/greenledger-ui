import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useDisconnect } from "wagmi";
import { DEFAULT_ADMIN_ROLE } from "../config/constants";
import { useContractAddresses } from "../hooks/useContractAddresses";
import { useCurrentChain } from "../hooks/useCurrentChain";
import { useToast } from "./ToastContext";
import UserManagementABI from '../contracts/UserManagement.json';

// Types
export interface UserRole {
  id: 'farmer' | 'transporter' | 'buyer' | 'admin';
  title: string;
  onChain: boolean;
  timestamp: number;
}

export interface Web3ContextEnhancedType {
  address: `0x${string}` | undefined;
  disconnect: () => void;
  userRoles: UserRole[];
  hasRole: (roleId: string) => boolean;
  isAdmin: boolean;
  needsRoleRegistration: boolean;
  registerRoles: (roles: string[]) => Promise<void>;
  isRegistering: boolean;
  isContractReady: boolean;
  contractError: string | null;
  refreshUserData: () => Promise<void>;
  clearLocalData: () => void;
  clearSkipPreference: () => void;
}

const Web3ContextEnhanced = createContext<Web3ContextEnhancedType | undefined>(undefined);

export const Web3ContextEnhancedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { addToast } = useToast();
  const { addresses: CONTRACT_ADDRESSES, isSupported } = useContractAddresses();
  const currentChain = useCurrentChain();
  
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [needsRoleRegistration, setNeedsRoleRegistration] = useState(false);

  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: contractRoles, error: readError, refetch: refetchRoles } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
    query: {
      enabled: !!address && isConnected && isSupported && !!CONTRACT_ADDRESSES.UserManagement,
      retry: 3,
      retryDelay: 1000,
    },
    abi: UserManagementABI,
    functionName: "getUserRolesStatus",
    args: address ? [address as `0x${string}`] : undefined,
  });

  const { data: hasAdminRole } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
    query: {
      enabled: !!address && isConnected && isSupported && !!CONTRACT_ADDRESSES.UserManagement,
    },
    abi: UserManagementABI,
    functionName: "hasRole",
    args: address ? [DEFAULT_ADMIN_ROLE as `0x${string}`, address as `0x${string}`] : undefined,
  });

  useEffect(() => {
    if (address && isConnected) {
      console.log('🔍 Web3 Debug:', {
        address,
        isConnected,
        isSupported,
        userManagementAddress: CONTRACT_ADDRESSES.UserManagement,
        networkName: CONTRACT_ADDRESSES
      });
      loadUserRoles();
    } else {
      setUserRoles([]);
      const hasSkipped = localStorage.getItem('greenledger_role_registration_skipped');
      setNeedsRoleRegistration(!hasSkipped);
      if (!hasSkipped) {
        clearLocalData();
      }
    }
  }, [address, isConnected, isSupported, CONTRACT_ADDRESSES]);

  useEffect(() => {
    if (contractRoles && Array.isArray(contractRoles) && contractRoles.length === 3) {
      const [isFarmer, isTransporter, isBuyer] = contractRoles;
      const onChainRoles: UserRole[] = [];

      if (isFarmer) {
        onChainRoles.push({
          id: 'farmer',
          title: 'Farmer',
          onChain: true,
          timestamp: Date.now(),
        });
      }

      if (isTransporter) {
        onChainRoles.push({
          id: 'transporter',
          title: 'Transporter',
          onChain: true,
          timestamp: Date.now(),
        });
      }

      if (isBuyer) {
        onChainRoles.push({
          id: 'buyer',
          title: 'Buyer',
          onChain: true,
          timestamp: Date.now(),
        });
      }

      if (hasAdminRole) {
        onChainRoles.push({
          id: 'admin',
          title: 'Admin',
          onChain: true,
          timestamp: Date.now(),
        });
      }

      const localRoles = getLocalRoles();
      const mergedRoles = mergeRoles(localRoles, onChainRoles);
      setUserRoles(mergedRoles);
      setNeedsRoleRegistration(mergedRoles.length === 0);
    }
  }, [contractRoles, hasAdminRole]);

  useEffect(() => {
    if (isConfirmed && hash) {
      addToast('Role registration confirmed on blockchain!', 'success');
      setIsRegistering(false);
      refetchRoles();
    }
  }, [isConfirmed, hash, addToast, refetchRoles]);

  useEffect(() => {
    if (writeError) {
      console.error('Contract write error:', writeError);
      setContractError(writeError.message);
      addToast('Failed to register roles on blockchain', 'error');
      setIsRegistering(false);
    }
  }, [writeError, addToast]);

  useEffect(() => {
    if (readError) {
      console.error('Contract read error:', readError);
      setContractError(readError.message);
      addToast('Failed to fetch user roles from blockchain', 'error');
    }
  }, [readError, addToast]);

  const loadUserRoles = useCallback(async () => {
    if (!address) return;

    try {
      const localRoles = getLocalRoles();
      setUserRoles(localRoles);
      
      if (localRoles.length === 0) {
        const hasSkipped = localStorage.getItem('greenledger_role_registration_skipped');
        setNeedsRoleRegistration(!hasSkipped);
      } else {
        setNeedsRoleRegistration(false);
      }

      await refetchRoles();
    } catch (error) {
      console.error('Failed to load user roles:', error);
      addToast('Failed to load user roles', 'error');
    }
  }, [address, refetchRoles, addToast]);

  const getLocalRoles = useCallback((): UserRole[] => {
    if (!address) return [];

    try {
      const stored = localStorage.getItem(`greenledger_user_roles_${address}`);
      if (stored) {
        const data = JSON.parse(stored);
        return data.roles || [];
      }
    } catch (error) {
      console.error('Failed to parse stored roles:', error);
    }
    return [];
  }, [address]);

  const mergeRoles = useCallback((localRoles: UserRole[], onChainRoles: UserRole[]): UserRole[] => {
    const roleMap = new Map<string, UserRole>();

    onChainRoles.forEach(role => {
      roleMap.set(role.id, role);
    });

    localRoles.forEach(role => {
      if (!roleMap.has(role.id)) {
        roleMap.set(role.id, role);
      }
    });

    return Array.from(roleMap.values());
  }, []);

  const registerRoles = useCallback(async (roleIds: string[]) => {
    let retries = 0;
    const maxRetries = 10;
    
    while ((!address || !isConnected) && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 200));
      retries++;
    }
    
    if (!address || !isConnected) {
      addToast('Please connect your wallet first', 'warning');
      return;
    }

    if (roleIds.length === 0) {
      addToast('Please select at least one role', 'warning');
      return;
    }

    setIsRegistering(true);
    setContractError(null);

    try {
      const newRoles: UserRole[] = roleIds.map(roleId => ({
        id: roleId as UserRole['id'],
        title: roleId.charAt(0).toUpperCase() + roleId.slice(1),
        onChain: false,
        timestamp: Date.now(),
      }));

      const roleData = {
        address,
        roles: newRoles,
        timestamp: Date.now(),
        isOnChain: false,
      };

      localStorage.setItem(`greenledger_user_roles_${address}`, JSON.stringify(roleData));
      setUserRoles(newRoles);
      setNeedsRoleRegistration(false);
      localStorage.removeItem('greenledger_role_registration_skipped');

      addToast(
        `Roles registered: ${newRoles.map(r => r.title).join(', ')}`,
        'success'
      );

      setIsRegistering(false);
      
    } catch (error: any) {
      console.error('Role registration failed:', error);
      addToast('Failed to register roles', 'error');
      setIsRegistering(false);
      setContractError(error.message || 'Unknown error');
    }
  }, [address, isConnected, addToast]);

  const hasRole = useCallback((roleId: string): boolean => {
    return userRoles.some(role => role.id === roleId);
  }, [userRoles]);

  const isAdmin = useCallback((): boolean => {
    return hasRole('admin') || Boolean(hasAdminRole);
  }, [hasRole, hasAdminRole]);

  const refreshUserData = useCallback(async () => {
    await loadUserRoles();
  }, [loadUserRoles]);

  const clearLocalData = useCallback(() => {
    if (address) {
      localStorage.removeItem(`greenledger_user_roles_${address}`);
      setUserRoles([]);
      setNeedsRoleRegistration(true);
    }
  }, [address]);

  const clearSkipPreference = useCallback(() => {
    localStorage.removeItem('greenledger_role_registration_skipped');
    setNeedsRoleRegistration(true);
  }, []);

  const contextValue: Web3ContextEnhancedType = {
    address,
    disconnect,
    userRoles,
    hasRole,
    isAdmin: isAdmin(),
    needsRoleRegistration,
    registerRoles,
    isRegistering: isRegistering || isWritePending || isConfirming,
    isContractReady: !readError && !writeError,
    contractError,
    refreshUserData,
    clearLocalData,
    clearSkipPreference,
  };

  return (
    <Web3ContextEnhanced.Provider value={contextValue}>
      {children}
    </Web3ContextEnhanced.Provider>
  );
};

export const useWeb3Enhanced = () => {
  const context = useContext(Web3ContextEnhanced);
  if (!context) {
    throw new Error('useWeb3Enhanced must be used within a Web3ContextEnhancedProvider');
  }
  return context;
};