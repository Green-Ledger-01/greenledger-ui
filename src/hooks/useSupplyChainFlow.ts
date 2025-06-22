/**
 * Supply Chain Flow Hook
 * Handles the 3-step supply chain flow: farmer → transporter → buyer
 * Includes ownership transfer logic and real-time tracking
 */

import { useState, useCallback, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/constants';
import { useToast } from '../contexts/ToastContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getErrorMessage } from '../utils';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';
import UserManagementABI from '../contracts/UserManagement.json';

export interface SupplyChainStep {
  role: 'farmer' | 'transporter' | 'buyer';
  address: string;
  timestamp: number;
  transactionHash?: string;
  blockNumber?: number;
}

export interface SupplyChainHistory {
  tokenId: number;
  steps: SupplyChainStep[];
  currentStep: number; // 0: farmer, 1: transporter, 2: buyer
  isComplete: boolean;
}

interface TransferParams {
  tokenId: number;
  to: string;
  amount?: number; // Default to 1 for ERC1155
}

interface UseSupplyChainFlowReturn {
  // Transfer functions
  transferToTransporter: (params: TransferParams) => Promise<void>;
  transferToBuyer: (params: TransferParams) => Promise<void>;
  transferOwnership: (params: TransferParams) => Promise<void>;
  
  // State
  isTransferring: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  transferError: Error | null;
  transferHash: string | undefined;
  
  // Supply chain tracking
  getSupplyChainHistory: (tokenId: number) => Promise<SupplyChainHistory | null>;
  trackingHistory: Map<number, SupplyChainHistory>;
  isLoadingHistory: boolean;
  
  // Role validation
  canTransferTo: (role: 'transporter' | 'buyer') => boolean;
  validateTransferRecipient: (address: string, expectedRole: 'transporter' | 'buyer') => Promise<boolean>;
  
  // Real-time updates
  lastTransferUpdate: number;
}

export const useSupplyChainFlow = (): UseSupplyChainFlowReturn => {
  const { address } = useAccount();
  const { addToast } = useToast();
  const { userRoles, canPerformAction } = useWeb3();
  
  const [trackingHistory, setTrackingHistory] = useState<Map<number, SupplyChainHistory>>(new Map());
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastTransferUpdate, setLastTransferUpdate] = useState(Date.now());

  // Contract write operations
  const { 
    writeContract, 
    data: transferHash, 
    isPending: isTransferring, 
    error: writeError 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: confirmError 
  } = useWaitForTransactionReceipt({ hash: transferHash });

  const transferError = writeError || confirmError;

  // Function to validate if an address has a specific role
  const validateTransferRecipient = useCallback(async (
    recipientAddress: string, 
    expectedRole: 'transporter' | 'buyer'
  ): Promise<boolean> => {
    try {
      // This would be implemented with actual contract calls
      // For now, we'll simulate the role validation
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate role validation based on address pattern
          const lastChar = recipientAddress.slice(-1).toLowerCase();
          if (expectedRole === 'transporter') {
            resolve(['4', '5', '6', '7'].includes(lastChar));
          } else if (expectedRole === 'buyer') {
            resolve(['8', '9', 'a', 'b', 'c', 'd', 'e', 'f'].includes(lastChar));
          }
          resolve(false);
        }, 100);
      });
    } catch (error) {
      console.error('Error validating recipient role:', error);
      return false;
    }
  }, []);

  // Function to get user role from address
  const getUserRole = useCallback(async (userAddress: string): Promise<'farmer' | 'transporter' | 'buyer' | null> => {
    try {
      // This would be implemented with actual contract calls to UserManagement
      // For now, we'll simulate it
      return new Promise((resolve) => {
        setTimeout(() => {
          const lastChar = userAddress.slice(-1).toLowerCase();
          if (['0', '1', '2', '3'].includes(lastChar)) resolve('farmer');
          else if (['4', '5', '6', '7'].includes(lastChar)) resolve('transporter');
          else if (['8', '9', 'a', 'b', 'c', 'd', 'e', 'f'].includes(lastChar)) resolve('buyer');
          else resolve(null);
        }, 50);
      });
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }, []);

  // Function to get supply chain history for a token
  const getSupplyChainHistory = useCallback(async (tokenId: number): Promise<SupplyChainHistory | null> => {
    try {
      setIsLoadingHistory(true);
      
      // Check cache first
      const cached = trackingHistory.get(tokenId);
      if (cached && Date.now() - lastTransferUpdate < 30000) {
        return cached;
      }

      // This would be implemented by querying Transfer events from the blockchain
      // For now, we'll simulate the history
      const mockHistory: SupplyChainHistory = {
        tokenId,
        steps: [
          {
            role: 'farmer',
            address: `0x${tokenId.toString().padStart(40, '0')}`,
            timestamp: Math.floor(Date.now() / 1000) - (tokenId * 86400),
            transactionHash: `0x${tokenId.toString().padStart(64, '0')}`,
            blockNumber: 1000000 + tokenId,
          }
        ],
        currentStep: 0,
        isComplete: false,
      };

      // Simulate additional steps based on token ID
      if (tokenId % 3 === 0) {
        mockHistory.steps.push({
          role: 'transporter',
          address: `0x${(tokenId + 1000).toString().padStart(40, '0')}`,
          timestamp: Math.floor(Date.now() / 1000) - (tokenId * 43200),
          transactionHash: `0x${(tokenId + 1000).toString().padStart(64, '0')}`,
          blockNumber: 1000000 + tokenId + 100,
        });
        mockHistory.currentStep = 1;
      }

      if (tokenId % 5 === 0) {
        mockHistory.steps.push({
          role: 'buyer',
          address: `0x${(tokenId + 2000).toString().padStart(40, '0')}`,
          timestamp: Math.floor(Date.now() / 1000) - (tokenId * 21600),
          transactionHash: `0x${(tokenId + 2000).toString().padStart(64, '0')}`,
          blockNumber: 1000000 + tokenId + 200,
        });
        mockHistory.currentStep = 2;
        mockHistory.isComplete = true;
      }

      // Update cache
      setTrackingHistory(prev => new Map(prev.set(tokenId, mockHistory)));
      
      return mockHistory;
    } catch (error) {
      console.error(`Error fetching supply chain history for token ${tokenId}:`, error);
      addToast(`Failed to load supply chain history: ${getErrorMessage(error)}`, 'error');
      return null;
    } finally {
      setIsLoadingHistory(false);
    }
  }, [trackingHistory, lastTransferUpdate, addToast]);

  // Generic transfer function
  const transferOwnership = useCallback(async (params: TransferParams) => {
    if (!address) {
      addToast('Please connect your wallet first', 'error');
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
        abi: CropBatchTokenABI,
        functionName: 'safeTransferFrom',
        args: [
          address as `0x${string}`,
          params.to as `0x${string}`,
          BigInt(params.tokenId),
          BigInt(params.amount || 1),
          '0x', // Empty data
        ],
      });
    } catch (error) {
      console.error('Transfer error:', error);
      addToast(`Transfer failed: ${getErrorMessage(error)}`, 'error');
    }
  }, [address, writeContract, addToast]);

  // Transfer to transporter with role validation
  const transferToTransporter = useCallback(async (params: TransferParams) => {
    if (!canPerformAction('farmer')) {
      addToast('Only farmers can transfer to transporters', 'error');
      return;
    }

    // Validate recipient is a transporter
    const isValidTransporter = await validateTransferRecipient(params.to, 'transporter');
    if (!isValidTransporter) {
      addToast('Recipient must be a registered transporter', 'error');
      return;
    }

    addToast('Transferring to transporter...', 'info');
    await transferOwnership(params);
  }, [canPerformAction, validateTransferRecipient, transferOwnership, addToast]);

  // Transfer to buyer with role validation
  const transferToBuyer = useCallback(async (params: TransferParams) => {
    if (!canPerformAction('transporter') && !canPerformAction('farmer')) {
      addToast('Only farmers or transporters can transfer to buyers', 'error');
      return;
    }

    // Validate recipient is a buyer
    const isValidBuyer = await validateTransferRecipient(params.to, 'buyer');
    if (!isValidBuyer) {
      addToast('Recipient must be a registered buyer', 'error');
      return;
    }

    addToast('Transferring to buyer...', 'info');
    await transferOwnership(params);
  }, [canPerformAction, validateTransferRecipient, transferOwnership, addToast]);

  // Check if current user can transfer to specific role
  const canTransferTo = useCallback((role: 'transporter' | 'buyer'): boolean => {
    if (role === 'transporter') {
      return canPerformAction('farmer');
    } else if (role === 'buyer') {
      return canPerformAction('transporter') || canPerformAction('farmer');
    }
    return false;
  }, [canPerformAction]);

  // Handle transfer confirmation
  useEffect(() => {
    if (isConfirmed && transferHash) {
      addToast('Ownership transferred successfully!', 'success');
      setLastTransferUpdate(Date.now());
      
      // Clear relevant cache entries
      setTrackingHistory(prev => {
        const newMap = new Map(prev);
        // In a real implementation, we'd know which token was transferred
        // For now, we'll clear the entire cache to force refresh
        newMap.clear();
        return newMap;
      });
    }
    
    if (confirmError) {
      addToast(`Transfer confirmation failed: ${getErrorMessage(confirmError)}`, 'error');
    }
  }, [isConfirmed, confirmError, transferHash, addToast]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      addToast(`Transfer failed: ${getErrorMessage(writeError)}`, 'error');
    }
  }, [writeError, addToast]);

  // Watch for transfer events to update supply chain history
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    eventName: 'TransferSingle',
    onLogs: (logs) => {
      logs.forEach(async (log) => {
        if (log.args.from !== '0x0000000000000000000000000000000000000000') {
          const tokenId = Number(log.args.id);
          const fromAddress = log.args.from as string;
          const toAddress = log.args.to as string;
          
          console.log(`Transfer detected for token ${tokenId}: ${fromAddress} → ${toAddress}`);
          
          // Update supply chain history
          const fromRole = await getUserRole(fromAddress);
          const toRole = await getUserRole(toAddress);
          
          if (fromRole && toRole) {
            addToast(
              `Supply chain update: Token #${tokenId} moved from ${fromRole} to ${toRole}`, 
              'info'
            );
            
            // Remove from cache to force refresh
            setTrackingHistory(prev => {
              const newMap = new Map(prev);
              newMap.delete(tokenId);
              return newMap;
            });
            
            setLastTransferUpdate(Date.now());
          }
        }
      });
    },
    onError: (error) => {
      console.error('Error watching transfer events:', error);
    },
  });

  return {
    // Transfer functions
    transferToTransporter,
    transferToBuyer,
    transferOwnership,
    
    // State
    isTransferring,
    isConfirming,
    isConfirmed,
    transferError,
    transferHash,
    
    // Supply chain tracking
    getSupplyChainHistory,
    trackingHistory,
    isLoadingHistory,
    
    // Role validation
    canTransferTo,
    validateTransferRecipient,
    
    // Real-time updates
    lastTransferUpdate,
  };
};