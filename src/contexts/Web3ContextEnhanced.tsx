import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useDisconnect, useChainId } from "wagmi";
import { DEFAULT_ADMIN_ROLE } from "../config/constants";
import { useContractAddresses } from "../hooks/useContractAddresses";
import { useCurrentChain } from "../hooks/useCurrentChain";
import { useToast } from "./ToastContext";

// Types
export interface UserRole {
  id: 'farmer' | 'transporter' | 'buyer' | 'admin';
  title: string;
  onChain: boolean;
  timestamp: number;
}

export interface Web3ContextEnhancedType {
  // Account & Connection
  address: `0x${string}` | undefined;
  disconnect: () => void;
  
  // Role Management
  userRoles: UserRole[];
  hasRole: (roleId: string) => boolean;
  isAdmin: boolean;
  needsRoleRegistration: boolean;
  
  // Role Registration
  registerRoles: (roles: string[]) => Promise<void>;
  isRegistering: boolean;
  
  // Contract Interactions
  isContractReady: boolean;
  contractError: string | null;
  
  // Utility Methods
  refreshUserData: () => Promise<void>;
  clearLocalData: () => void;
}

// Context
const Web3ContextEnhanced = createContext<Web3ContextEnhancedType | undefined>(undefined);

// Role mapping for contract calls
const ROLE_MAPPING = {
  farmer: 0,
  transporter: 1,
  buyer: 2,
  admin: 3,
} as const;

// Provider Component
export const Web3ContextEnhancedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { addToast } = useToast();
  const { addresses: CONTRACT_ADDRESSES, isSupported } = useContractAddresses();
  const currentChain = useCurrentChain();
  
  // Local state
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [needsRoleRegistration, setNeedsRoleRegistration] = useState(false);

  // Contract hooks
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read user roles from contract
  const { data: contractRoles, error: readError, refetch: refetchRoles } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
    query: {
      enabled: !!address && isConnected && isSupported,
      retry: 3,
      retryDelay: 1000,
    },
    abi: [
      {
        inputs: [{ name: "_user", type: "address" }],
        name: "getUserRolesStatus",
        outputs: [
          { name: "isFarmer", type: "bool" },
          { name: "isTransporter", type: "bool" },
          { name: "isBuyer", type: "bool" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getUserRolesStatus",
    args: address ? [address as `0x${string}`] : undefined,

  });

  // Check admin role
  const { data: hasAdminRole } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
    query: {
      enabled: !!address && isConnected && isSupported,
    },
    abi: [
      {
        inputs: [
          { name: "role", type: "bytes32" },
          { name: "account", type: "address" },
        ],
        name: "hasRole",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "hasRole",
    args: address ? [DEFAULT_ADMIN_ROLE as `0x${string}`, address as `0x${string}`] : undefined,

  });

  // Load user roles on address change
  useEffect(() => {
    if (address && isConnected) {
      loadUserRoles();
    } else {
      setUserRoles([]);
      setNeedsRoleRegistration(false);
      clearLocalData();
    }
  }, [address, isConnected]);

  // Handle contract role data
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

      // Merge with local roles (if any)
      const localRoles = getLocalRoles();
      const mergedRoles = mergeRoles(localRoles, onChainRoles);
      setUserRoles(mergedRoles);
      setNeedsRoleRegistration(mergedRoles.length === 0);
    }
  }, [contractRoles, hasAdminRole]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      addToast('Role registration confirmed on blockchain!', 'success');
      setIsRegistering(false);
      refetchRoles(); // Immediately fetch updated roles
    }
  }, [isConfirmed, hash, addToast, refetchRoles]);

  // Handle errors
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

  // Load user roles from local storage and contract
  const loadUserRoles = useCallback(async () => {
    if (!address) return;

    try {
      const localRoles = getLocalRoles();
      setUserRoles(localRoles);
      
      // If no local or on-chain roles, user needs registration
      if (localRoles.length === 0) {
        setNeedsRoleRegistration(true);
      }

      // Refetch contract data
      await refetchRoles();
    } catch (error) {
      console.error('Failed to load user roles:', error);
      addToast('Failed to load user roles', 'error');
    }
  }, [address, refetchRoles, addToast]);

  // Get local roles from storage
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

  // Merge local and on-chain roles
  const mergeRoles = useCallback((localRoles: UserRole[], onChainRoles: UserRole[]): UserRole[] => {
    const roleMap = new Map<string, UserRole>();

    // On-chain roles take precedence
    onChainRoles.forEach(role => {
      roleMap.set(role.id, role);
    });

    // Add local roles only if not overridden by on-chain
    localRoles.forEach(role => {
      if (!roleMap.has(role.id)) {
        roleMap.set(role.id, role);
      }
    });

    return Array.from(roleMap.values());
  }, []);

  // Register roles (both locally and on-chain)
  const registerRoles = useCallback(async (roleIds: string[]) => {
    // Enhanced connection validation with retry logic
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
      // Store roles locally
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

      addToast(
        `Roles registered successfully: ${newRoles.map(r => r.title).join(', ')}`,
        'success'
      );

      // Skip blockchain registration for now - roles work locally
      setIsRegistering(false);
      
      // Optional: Try blockchain registration in background without blocking UI
      try {
        const primaryRoleId = roleIds[0];
        const contractRoleId = ROLE_MAPPING[primaryRoleId as keyof typeof ROLE_MAPPING];
        
        if (contractRoleId !== undefined) {
          await writeContract({
            address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
            abi: [
              {
                inputs: [
                  { name: "_user", type: "address" },
                  { name: "_role", type: "uint8" },
                ],
                name: "registerUser",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "registerUser",
            args: [address as `0x${string}`, contractRoleId],
            chain: currentChain,
            account: address as `0x${string}`,
          });
        }
      } catch (blockchainError) {
        // Silently handle blockchain registration failure - local roles still work
        console.log('Blockchain registration failed, but local roles are active:', blockchainError);
      }
    } catch (error: any) {
      console.error('Role registration failed:', error);
      addToast('Failed to register roles. Please try again.', 'error');
      setIsRegistering(false);
      setContractError(error.message || 'Unknown error');
    }
  }, [address, isConnected, writeContract, addToast]);

  // Check if user has specific role
  const hasRole = useCallback((roleId: string): boolean => {
    return userRoles.some(role => role.id === roleId);
  }, [userRoles]);

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return hasRole('admin') || Boolean(hasAdminRole);
  }, [hasRole, hasAdminRole]);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    await loadUserRoles();
  }, [loadUserRoles]);

  // Clear local data
  const clearLocalData = useCallback(() => {
    if (address) {
      localStorage.removeItem(`greenledger_user_roles_${address}`);
      setUserRoles([]);
      setNeedsRoleRegistration(true);
    }
  }, [address]);

  // Context value
  const contextValue: Web3ContextEnhancedType = {
    // Account & Connection
    address,
    disconnect,
    
    // Role Management
    userRoles,
    hasRole,
    isAdmin: isAdmin(),
    needsRoleRegistration,
    
    // Role Registration
    registerRoles,
    isRegistering: isRegistering || isWritePending || isConfirming,
    
    // Contract Interactions
    isContractReady: !readError && !writeError,
    contractError,
    
    // Utility Methods
    refreshUserData,
    clearLocalData,
  };

  return (
    <Web3ContextEnhanced.Provider value={contextValue}>
      {children}
    </Web3ContextEnhanced.Provider>
  );
};

// Hook
export const useWeb3Enhanced = () => {
  const context = useContext(Web3ContextEnhanced);
  if (!context) {
    throw new Error('useWeb3Enhanced must be used within a Web3ContextEnhancedProvider');
  }
  return context;
};