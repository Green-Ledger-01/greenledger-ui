import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface UseWeb3Enhanced {
  // State
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  
  // Contract interaction helpers
  getContract: (address: string, abi: any[]) => ethers.Contract | null;
  sendTransaction: (to: string, value?: string, data?: string) => Promise<ethers.TransactionResponse | null>;
  signMessage: (message: string) => Promise<string | null>;
}

/**
 * Enhanced Web3 Hook
 * 
 * Provides comprehensive Web3 functionality with proper error handling,
 * transaction lifecycle management, and network switching capabilities.
 * 
 * Architecture Decision:
 * - Uses ethers.js v6 for modern Web3 interactions
 * - Implements proper error handling and user feedback
 * - Supports multiple wallet types through window.ethereum
 * - Provides contract interaction helpers
 * - Manages connection state and network switching
 * 
 * Benefits:
 * - Production-ready error handling
 * - Comprehensive transaction feedback
 * - Network switching support
 * - Contract interaction abstraction
 * - Wallet connection management
 */
export const useWeb3Enhanced = (): UseWeb3Enhanced => {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Check if wallet is available
  const isWalletAvailable = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum;
  }, []);

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    if (!isWalletAvailable()) {
      setState(prev => ({
        ...prev,
        error: 'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setState(prev => ({
        ...prev,
        provider,
        signer,
        account,
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
        error: null,
      }));

      // Store connection preference
      localStorage.setItem('greenledger_wallet_connected', 'true');
      
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      let errorMessage = 'Failed to connect wallet';
      if (error.code === 4001) {
        errorMessage = 'Wallet connection rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Wallet connection request already pending';
      }
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [isWalletAvailable]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setState({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
    
    localStorage.removeItem('greenledger_wallet_connected');
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!isWalletAvailable() || !state.provider) {
      setState(prev => ({
        ...prev,
        error: 'No wallet connected',
      }));
      return;
    }

    try {
      const chainIdHex = `0x${targetChainId.toString(16)}`;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      // Update chain ID in state
      setState(prev => ({
        ...prev,
        chainId: targetChainId,
        error: null,
      }));
      
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      
      let errorMessage = 'Failed to switch network';
      if (error.code === 4902) {
        errorMessage = 'Network not added to wallet. Please add it manually.';
      } else if (error.code === 4001) {
        errorMessage = 'Network switch rejected by user';
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [isWalletAvailable, state.provider]);

  // Get contract instance
  const getContract = useCallback((address: string, abi: any[]) => {
    if (!state.signer) {
      console.warn('No signer available for contract interaction');
      return null;
    }
    
    try {
      return new ethers.Contract(address, abi, state.signer);
    } catch (error) {
      console.error('Failed to create contract instance:', error);
      return null;
    }
  }, [state.signer]);

  // Send transaction
  const sendTransaction = useCallback(async (
    to: string, 
    value?: string, 
    data?: string
  ): Promise<ethers.TransactionResponse | null> => {
    if (!state.signer) {
      setState(prev => ({
        ...prev,
        error: 'No signer available for transaction',
      }));
      return null;
    }

    try {
      const tx = await state.signer.sendTransaction({
        to,
        value: value ? ethers.parseEther(value) : 0,
        data: data || '0x',
      });
      
      setState(prev => ({ ...prev, error: null }));
      return tx;
      
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      let errorMessage = 'Transaction failed';
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Unable to estimate gas. Transaction may fail.';
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      
      return null;
    }
  }, [state.signer]);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!state.signer) {
      setState(prev => ({
        ...prev,
        error: 'No signer available for message signing',
      }));
      return null;
    }

    try {
      const signature = await state.signer.signMessage(message);
      setState(prev => ({ ...prev, error: null }));
      return signature;
      
    } catch (error: any) {
      console.error('Message signing failed:', error);
      
      let errorMessage = 'Message signing failed';
      if (error.code === 4001) {
        errorMessage = 'Message signing rejected by user';
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      
      return null;
    }
  }, [state.signer]);

  // Handle account changes
  useEffect(() => {
    if (!isWalletAvailable()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== state.account) {
        // Reconnect with new account
        connectWallet();
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16),
      }));
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [isWalletAvailable, state.account, connectWallet, disconnectWallet]);

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('greenledger_wallet_connected');
    if (wasConnected === 'true' && isWalletAvailable() && !state.isConnected && !state.isConnecting) {
      connectWallet();
    }
  }, [isWalletAvailable, state.isConnected, state.isConnecting, connectWallet]);

  return {
    // State
    provider: state.provider,
    signer: state.signer,
    account: state.account,
    chainId: state.chainId,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    
    // Helpers
    getContract,
    sendTransaction,
    signMessage,
  };
};

// Contract interaction hook
export const useContract = (address: string, abi: any[]) => {
  const { getContract, signer, isConnected } = useWeb3Enhanced();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (isConnected && signer && address && abi) {
      const contractInstance = getContract(address, abi);
      setContract(contractInstance);
    } else {
      setContract(null);
    }
  }, [getContract, signer, isConnected, address, abi]);

  return contract;
};

// Transaction hook with status tracking
export const useTransaction = () => {
  const [txState, setTxState] = useState<{
    hash: string | null;
    status: 'idle' | 'pending' | 'success' | 'error';
    error: string | null;
  }>({
    hash: null,
    status: 'idle',
    error: null,
  });

  const sendTransaction = useCallback(async (
    contractMethod: () => Promise<ethers.ContractTransactionResponse>,
    onSuccess?: (receipt: ethers.TransactionReceipt) => void,
    onError?: (error: any) => void
  ) => {
    setTxState({ hash: null, status: 'pending', error: null });

    try {
      const tx = await contractMethod();
      setTxState(prev => ({ ...prev, hash: tx.hash }));
      
      const receipt = await tx.wait();
      setTxState({ hash: tx.hash, status: 'success', error: null });
      
      if (onSuccess) {
        onSuccess(receipt);
      }
      
      return receipt;
      
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      let errorMessage = 'Transaction failed';
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.reason) {
        errorMessage = error.reason;
      }
      
      setTxState({ hash: null, status: 'error', error: errorMessage });
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  }, []);

  const resetTransaction = useCallback(() => {
    setTxState({ hash: null, status: 'idle', error: null });
  }, []);

  return {
    ...txState,
    sendTransaction,
    resetTransaction,
  };
};