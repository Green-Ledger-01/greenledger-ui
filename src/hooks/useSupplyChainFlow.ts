import { useState, useCallback, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { getAddress } from 'viem';
import { CONTRACT_ADDRESSES } from '../config/constants';
import { useToast } from '../contexts/ToastContext';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';
import { useCropBatchToken } from './useCropBatchToken';
import { secureError } from '../utils/secureLogger';

export interface SupplyChainEvent {
  id: string;
  tokenId: number;
  eventType: 'minted' | 'transferred';
  from: string;
  to: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  metadata?: {
    cropType?: string;
    quantity?: number;
    metadataUri?: string;
  };
}

export interface SupplyChainHistory {
  tokenId: number;
  events: SupplyChainEvent[];
  currentOwner: string;
  minter: string;
  totalTransfers: number;
}

export const useSupplyChainFlow = () => {
  const { addToast } = useToast();
  const publicClient = usePublicClient();
  const { transferToken } = useCropBatchToken();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get supply chain history for a token
  const getSupplyChainHistory = useCallback(async (tokenId: number): Promise<SupplyChainHistory | null> => {
    if (!publicClient) return null;
    
    try {
      setIsLoading(true);
      setError(null);

      const events: SupplyChainEvent[] = [];

      // Get minting events
      const mintLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
        event: {
          type: 'event',
          name: 'CropBatchMinted',
          inputs: [
            { name: 'tokenId', type: 'uint256', indexed: true },
            { name: 'minter', type: 'address', indexed: true },
            { name: 'metadataUri', type: 'string', indexed: false },
            { name: 'cropType', type: 'string', indexed: false },
            { name: 'quantity', type: 'uint256', indexed: false },
          ],
        },
        args: {
          tokenId: BigInt(tokenId),
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      // Process mint events
      for (const log of mintLogs) {
        if (log.args && log.blockNumber) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          events.push({
            id: `mint-${log.transactionHash}-${log.logIndex}`,
            tokenId,
            eventType: 'minted',
            from: '0x0000000000000000000000000000000000000000',
            to: log.args.minter as string,
            timestamp: Number(block.timestamp) * 1000,
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
            metadata: {
              cropType: log.args.cropType as string,
              quantity: Number(log.args.quantity),
              metadataUri: log.args.metadataUri as string,
            },
          });
        }
      }

      // Get transfer events
      const transferLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
        event: {
          type: 'event',
          name: 'TransferSingle',
          inputs: [
            { name: 'operator', type: 'address', indexed: true },
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'id', type: 'uint256', indexed: false },
            { name: 'value', type: 'uint256', indexed: false },
          ],
        },
        args: {
          id: BigInt(tokenId),
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      // Process transfer events (excluding mints)
      for (const log of transferLogs) {
        if (log.args && log.blockNumber && log.args.from !== '0x0000000000000000000000000000000000000000') {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          events.push({
            id: `transfer-${log.transactionHash}-${log.logIndex}`,
            tokenId,
            eventType: 'transferred',
            from: log.args.from as string,
            to: log.args.to as string,
            timestamp: Number(block.timestamp) * 1000,
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
          });
        }
      }

      // Sort events by timestamp
      events.sort((a, b) => a.timestamp - b.timestamp);

      const minter = events.find(e => e.eventType === 'minted')?.to || '0x0000000000000000000000000000000000000000';
      const currentOwner = events.length > 0 ? events[events.length - 1].to : minter;
      const totalTransfers = events.filter(e => e.eventType === 'transferred').length;

      return {
        tokenId,
        events,
        currentOwner,
        minter,
        totalTransfers,
      };

    } catch (err) {
      secureError('Error fetching supply chain history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch supply chain history');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  // Transfer to transporter
  const transferToTransporter = useCallback(async (params: { tokenId: number; to: string; amount?: number }) => {
    try {
      setError(null);
      
      await transferToken({
        from: '', // Will be filled by the hook
        to: params.to,
        tokenId: params.tokenId,
        amount: params.amount || 1,
      });

      addToast('Transfer to transporter initiated', 'info');
      
    } catch (err) {
      secureError('Error transferring to transporter:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer to transporter';
      setError(errorMessage);
      addToast(`Transfer failed: ${errorMessage}`, 'error');
      throw err;
    }
  }, [transferToken, addToast]);

  // Transfer to buyer
  const transferToBuyer = useCallback(async (params: { tokenId: number; to: string; amount?: number }) => {
    try {
      setError(null);
      
      await transferToken({
        from: '', // Will be filled by the hook
        to: params.to,
        tokenId: params.tokenId,
        amount: params.amount || 1,
      });

      addToast('Transfer to buyer initiated', 'info');
      
    } catch (err) {
      secureError('Error transferring to buyer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer to buyer';
      setError(errorMessage);
      addToast(`Transfer failed: ${errorMessage}`, 'error');
      throw err;
    }
  }, [transferToken, addToast]);

  // Validate transfer recipient (check if address has required role)
  const validateTransferRecipient = useCallback(async (address: string, expectedRole: string): Promise<boolean> => {
    try {
      // For now, we'll do basic address validation
      // In a full implementation, this would check the UserManagement contract for roles
      if (!address || address.length !== 42 || !address.startsWith('0x')) {
        return false;
      }

      // Basic checksum validation
      try {
        getAddress(address);
        return true;
      } catch {
        return false;
      }
    } catch (err) {
      secureError('Error validating transfer recipient:', err);
      return false;
    }
  }, []);

  // Check if user can transfer to specific role
  const canTransferTo = useCallback((role: string): boolean => {
    // This would typically check the current user's role and the supply chain rules
    // For now, we'll allow all transfers for demonstration
    return true;
  }, []);

  // Get recent supply chain activity
  const getRecentActivity = useCallback(async (limit: number = 10): Promise<SupplyChainEvent[]> => {
    if (!publicClient) return [];
    
    try {
      setIsLoading(true);
      setError(null);

      const events: SupplyChainEvent[] = [];

      // Get recent mint events
      const mintLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
        event: {
          type: 'event',
          name: 'CropBatchMinted',
          inputs: [
            { name: 'tokenId', type: 'uint256', indexed: true },
            { name: 'minter', type: 'address', indexed: true },
            { name: 'metadataUri', type: 'string', indexed: false },
            { name: 'cropType', type: 'string', indexed: false },
            { name: 'quantity', type: 'uint256', indexed: false },
          ],
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      // Get recent transfer events
      const transferLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
        event: {
          type: 'event',
          name: 'TransferSingle',
          inputs: [
            { name: 'operator', type: 'address', indexed: true },
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'id', type: 'uint256', indexed: false },
            { name: 'value', type: 'uint256', indexed: false },
          ],
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      // Process and combine events
      const allLogs = [...mintLogs, ...transferLogs];
      
      for (const log of allLogs.slice(-limit)) {
        if (log.blockNumber) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          
          if (log.eventName === 'CropBatchMinted' && log.args) {
            events.push({
              id: `mint-${log.transactionHash}-${log.logIndex}`,
              tokenId: Number(log.args.tokenId),
              eventType: 'minted',
              from: '0x0000000000000000000000000000000000000000',
              to: log.args.minter as string,
              timestamp: Number(block.timestamp) * 1000,
              blockNumber: Number(log.blockNumber),
              transactionHash: log.transactionHash,
              metadata: {
                cropType: log.args.cropType as string,
                quantity: Number(log.args.quantity),
                metadataUri: log.args.metadataUri as string,
              },
            });
          } else if (log.eventName === 'TransferSingle' && log.args && log.args.from !== '0x0000000000000000000000000000000000000000') {
            events.push({
              id: `transfer-${log.transactionHash}-${log.logIndex}`,
              tokenId: Number(log.args.id),
              eventType: 'transferred',
              from: log.args.from as string,
              to: log.args.to as string,
              timestamp: Number(block.timestamp) * 1000,
              blockNumber: Number(log.blockNumber),
              transactionHash: log.transactionHash,
            });
          }
        }
      }

      return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    } catch (err) {
      secureError('Error fetching recent activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recent activity');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,

    // Functions
    getSupplyChainHistory,
    transferToTransporter,
    transferToBuyer,
    validateTransferRecipient,
    canTransferTo,
    getRecentActivity,
    clearError,
  };
};
