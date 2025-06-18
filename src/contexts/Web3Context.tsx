import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useUserManagement } from '../hooks/useUserManagement';
import { validateContractAddresses, NETWORK_CONFIG } from '../config/contracts';
import { parseContractError } from '../utils/errors';

interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address?: string;
  chainId?: number;
  isCorrectNetwork: boolean;
  
  // User roles
  userRoleStatus: {
    isFarmer: boolean;
    isTransporter: boolean;
    isBuyer: boolean;
  } | null;
  isLoadingRoles: boolean;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  switchToCorrectNetwork: () => void;
  
  // Contract validation
  contractsValid: boolean;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const [contractsValid, setContractsValid] = useState(false);
  
  // Wagmi hooks
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  // User management
  const { userRoleStatus, isLoadingRoles } = useUserManagement();
  
  // Check if on correct network
  const isCorrectNetwork = chainId === NETWORK_CONFIG.chainId;
  
  // Validate contracts on mount
  useEffect(() => {
    const isValid = validateContractAddresses();
    setContractsValid(isValid);
    
    if (!isValid) {
      setError('Contract addresses are not properly configured. Please check your environment variables.');
    }
  }, []);
  
  // Handle connection errors
  useEffect(() => {
    if (!isConnected && error) {
      // Clear error when disconnected
      setError(null);
    }
  }, [isConnected, error]);
  
  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      try {
        // Check if user was previously connected
        const wasConnected = localStorage.getItem('wagmi.connected');
        if (wasConnected && !isConnected && !isConnecting) {
          // Auto-connect with the first available connector
          const connector = connectors[0];
          if (connector) {
            await connect({ connector });
          }
        }
      } catch (err) {
        console.error('Auto-connect failed:', err);
      }
    };
    
    autoConnect();
  }, [connect, connectors, isConnected, isConnecting]);
  
  const handleConnect = async () => {
    try {
      setError(null);
      const connector = connectors[0]; // Use first available connector
      if (connector) {
        await connect({ connector });
        localStorage.setItem('wagmi.connected', 'true');
      } else {
        setError('No wallet connector available');
      }
    } catch (err) {
      const parsedError = parseContractError(err);
      setError(parsedError.message);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      await disconnect();
      localStorage.removeItem('wagmi.connected');
      setError(null);
    } catch (err) {
      const parsedError = parseContractError(err);
      setError(parsedError.message);
    }
  };
  
  const switchToCorrectNetwork = async () => {
    try {
      setError(null);
      await switchChain({ chainId: NETWORK_CONFIG.chainId });
    } catch (err) {
      const parsedError = parseContractError(err);
      setError(`Failed to switch network: ${parsedError.message}`);
    }
  };
  
  const clearError = () => {
    setError(null);
  };
  
  const contextValue: Web3ContextType = {
    // Connection state
    isConnected,
    isConnecting,
    address,
    chainId,
    isCorrectNetwork,
    
    // User roles
    userRoleStatus,
    isLoadingRoles,
    
    // Actions
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchToCorrectNetwork,
    
    // Contract validation
    contractsValid,
    
    // Error handling
    error,
    clearError,
  };
  
  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Hook for checking if user has specific role
export const useHasRole = (role: 'farmer' | 'transporter' | 'buyer') => {
  const { userRoleStatus, isLoadingRoles } = useWeb3();
  
  if (!userRoleStatus || isLoadingRoles) {
    return { hasRole: false, isLoading: isLoadingRoles };
  }
  
  const roleMap = {
    farmer: userRoleStatus.isFarmer,
    transporter: userRoleStatus.isTransporter,
    buyer: userRoleStatus.isBuyer,
  };
  
  return {
    hasRole: roleMap[role] || false,
    isLoading: false,
  };
};

// Hook for requiring connection
export const useRequireConnection = () => {
  const { isConnected, connect, error } = useWeb3();
  
  const requireConnection = async () => {
    if (!isConnected) {
      await connect();
    }
  };
  
  return {
    isConnected,
    requireConnection,
    error,
  };
};

// Hook for requiring correct network
export const useRequireNetwork = () => {
  const { isCorrectNetwork, switchToCorrectNetwork, chainId } = useWeb3();
  
  const requireCorrectNetwork = async () => {
    if (!isCorrectNetwork) {
      await switchToCorrectNetwork();
    }
  };
  
  return {
    isCorrectNetwork,
    requireCorrectNetwork,
    currentChainId: chainId,
    expectedChainId: NETWORK_CONFIG.chainId,
  };
};

// Hook for requiring specific role
export const useRequireRole = (role: 'farmer' | 'transporter' | 'buyer') => {
  const { hasRole, isLoading } = useHasRole(role);
  const { isConnected } = useWeb3();
  
  const canPerformAction = isConnected && hasRole;
  const needsRole = isConnected && !hasRole && !isLoading;
  
  return {
    canPerformAction,
    needsRole,
    hasRole,
    isLoading,
    isConnected,
  };
};