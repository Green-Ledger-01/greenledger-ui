import { createContext, useContext, useCallback, useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, DEFAULT_ADMIN_ROLE } from "../config/constants";
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
  account: string | undefined;
  isConnected: boolean;
  
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
  const { address: account, isConnected } = useAccount();
  const { addToast } = useToast();
  
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

  // Read user roles from contract (if available)
  const { data: contractRoles, error: readError, refetch: refetchRoles } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
    abi: [
      {
        inputs: [{ name: "user", type: "address" }],
        name: "getUserRoles",
        outputs: [{ name: "", type: "uint8[]" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getUserRoles",
    args: account ? [account as `0x${string}`] : undefined,
    query: {
      enabled: !!account && isConnected,
      retry: 3,
      retryDelay: 1000,
    },
  });

  // Check if user has admin role on-chain
  const { data: hasAdminRole } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: "role", type: "bytes32" },
          { name: "account", type: "address" }
        ],
        name: "hasRole",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "hasRole",
    args: account ? [DEFAULT_ADMIN_ROLE as `0x${string}`, account as `0x${string}`] : undefined,
    query: {
      enabled: !!account && isConnected,
    },
  });

  // Load user roles on account change
  useEffect(() => {
    if (account && isConnected) {
      loadUserRoles();
    } else {
      setUserRoles([]);
      setNeedsRoleRegistration(false);
    }
  }, [account, isConnected]);

  // Handle contract role data
  useEffect(() => {
    if (contractRoles && Array.isArray(contractRoles)) {
      const onChainRoles: UserRole[] = contractRoles.map((roleNum: number) => {
        const roleEntry = Object.entries(ROLE_MAPPING).find(([, num]) => num === roleNum);
        const roleId = roleEntry ? roleEntry[0] as UserRole['id'] : 'farmer';
        
        return {
          id: roleId,
          title: roleId.charAt(0).toUpperCase() + roleId.slice(1),
          onChain: true,
          timestamp: Date.now(),
        };
      });

      // Merge with local roles
      const localRoles = getLocalRoles();
      const mergedRoles = mergeRoles(localRoles, onChainRoles);
      setUserRoles(mergedRoles);
      setNeedsRoleRegistration(mergedRoles.length === 0);
    }
  }, [contractRoles, account]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      addToast('Role registration confirmed on blockchain!', 'success');
      setIsRegistering(false);
      refreshUserData();
    }
  }, [isConfirmed, hash, addToast]);

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
    }
  }, [readError]);

  // Load user roles from local storage and contract
  const loadUserRoles = useCallback(async () => {
    if (!account) return;

    try {
      const localRoles = getLocalRoles();
      setUserRoles(localRoles);
      
      // If no local roles, user needs registration
      if (localRoles.length === 0) {
        setNeedsRoleRegistration(true);
      }

      // Refetch contract data
      await refetchRoles();
    } catch (error) {
      console.error('Failed to load user roles:', error);
    }
  }, [account, refetchRoles]);

  // Get local roles from storage
  const getLocalRoles = useCallback((): UserRole[] => {
    if (!account) return [];

    try {
      const stored = localStorage.getItem(`greenledger_user_roles_${account}`);
      if (stored) {
        const data = JSON.parse(stored);
        return data.roles || [];
      }
    } catch (error) {
      console.error('Failed to parse stored roles:', error);
    }
    return [];
  }, [account]);

  // Merge local and on-chain roles
  const mergeRoles = useCallback((localRoles: UserRole[], onChainRoles: UserRole[]): UserRole[] => {
    const roleMap = new Map<string, UserRole>();

    // Add local roles first
    localRoles.forEach(role => {
      roleMap.set(role.id, role);
    });

    // Override with on-chain roles (they take precedence)
    onChainRoles.forEach(role => {
      roleMap.set(role.id, role);
    });

    return Array.from(roleMap.values());
  }, []);

  // Register roles (both locally and on-chain)
  const registerRoles = useCallback(async (roleIds: string[]) => {
    if (!account || !isConnected) {
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
      // Store roles locally first (immediate access)
      const newRoles: UserRole[] = roleIds.map(roleId => ({
        id: roleId as UserRole['id'],
        title: roleId.charAt(0).toUpperCase() + roleId.slice(1),
        onChain: false,
        timestamp: Date.now(),
      }));

      const roleData = {
        address: account,
        roles: newRoles,
        timestamp: Date.now(),
        isOnChain: false,
      };

      localStorage.setItem(`greenledger_user_roles_${account}`, JSON.stringify(roleData));
      setUserRoles(newRoles);
      setNeedsRoleRegistration(false);

      addToast(
        `Roles registered locally: ${newRoles.map(r => r.title).join(', ')}`,
        'success'
      );

      // Try to register on-chain (optional, can fail gracefully)
      try {
        const contractRoleIds = roleIds.map(roleId => ROLE_MAPPING[roleId as keyof typeof ROLE_MAPPING]);
        
        await writeContract({
          address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
          abi: [
            {
              inputs: [
                { name: "user", type: "address" },
                { name: "roles", type: "uint8[]" }
              ],
              name: "assignMultipleRoles",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "assignMultipleRoles",
          args: [account as `0x${string}`, contractRoleIds],
        });

        addToast('Submitting role registration to blockchain...', 'info');
      } catch (contractError) {
        console.warn('On-chain registration failed, but local registration succeeded:', contractError);
        addToast('Roles registered locally. Blockchain registration will be attempted later.', 'warning');
        setIsRegistering(false);
      }

    } catch (error: any) {
      console.error('Role registration failed:', error);
      addToast('Failed to register roles. Please try again.', 'error');
      setIsRegistering(false);
    }
  }, [account, isConnected, writeContract, addToast]);

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
    if (account) {
      localStorage.removeItem(`greenledger_user_roles_${account}`);
      setUserRoles([]);
      setNeedsRoleRegistration(true);
    }
  }, [account]);

  // Context value
  const contextValue: Web3ContextEnhancedType = {
    // Account & Connection
    account,
    isConnected,
    
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