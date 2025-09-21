import { useState, useCallback, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useWatchContractEvent, useChainId } from 'wagmi';
import { getAddress } from 'viem';
import { CONTRACT_ADDRESSES } from '../config/constants';
import { useToast } from '../contexts/ToastContext';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';
import { secureLog, secureError, secureWarn } from '../utils/secureLogger';
import { liskSepolia } from '../chains/liskSepolia';

export interface CropBatch {
  tokenId: number;
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number;
  notes: string;
  metadataUri: string;
  owner: string;
  minter: string;
  timestamp: number;
}

export interface MintParams {
  to: string;
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number;
  notes: string;
  metadataUri: string;
}

export interface TransferParams {
  from: string;
  to: string;
  tokenId: number;
  amount: number;
}

export const useCropBatchToken = () => {
  const { address } = useAccount();
  const { addToast } = useToast();
  const publicClient = usePublicClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Contract write hook
  const { 
    writeContract, 
    data: hash, 
    error: writeError, 
    isPending: isWritePending 
  } = useWriteContract();

  // Transaction receipt hook
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Read next token ID
  const { 
    data: nextTokenId, 
    isLoading: isLoadingNextTokenId,
    refetch: refetchNextTokenId 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    functionName: 'nextTokenId',
  });

  // Get batch details
  const getBatchDetails = useCallback(async (tokenId: number): Promise<CropBatch | null> => {
    if (!publicClient) return null;
    
    try {
      setIsLoading(true);
      setError(null);

      const batchDetails = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
        abi: CropBatchTokenABI,
        functionName: 'batchDetails',
        args: [BigInt(tokenId)],
      });

      if (!batchDetails || !Array.isArray(batchDetails)) {
        throw new Error('Invalid batch details response');
      }

      const [cropType, quantity, originFarm, harvestDate, notes, metadataUri] = batchDetails;

      // Find the current owner by checking transfer events
      let currentOwner = '0x0000000000000000000000000000000000000000';

      try {
        // Get all transfer events for this token to find current owner
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
            operator: undefined,
            from: undefined,
            to: undefined,
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        // Find the most recent transfer to get current owner
        if (transferLogs.length > 0) {
          const latestTransfer = transferLogs[transferLogs.length - 1];
          currentOwner = latestTransfer.args?.to || currentOwner;
        }
      } catch (error) {
        secureWarn('Failed to fetch transfer events for ownership:', error);
        // Fallback: check if current user owns it
        const balance = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
          abi: CropBatchTokenABI,
          functionName: 'balanceOf',
          args: [address || '0x0000000000000000000000000000000000000000', BigInt(tokenId)],
        });
        if (Number(balance) > 0) {
          currentOwner = address || '0x0000000000000000000000000000000000000000';
        }
      }

      // Get minting event to find original minter
      const logs = await publicClient.getLogs({
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

      const mintEvent = logs[0];
      const minter = mintEvent?.args?.minter || '0x0000000000000000000000000000000000000000';
      const timestamp = mintEvent?.blockNumber ? 
        Number((await publicClient.getBlock({ blockNumber: mintEvent.blockNumber })).timestamp) * 1000 : 
        Date.now();

      return {
        tokenId,
        cropType: cropType as string,
        quantity: Number(quantity),
        originFarm: originFarm as string,
        harvestDate: Number(harvestDate),
        notes: notes as string,
        metadataUri: metadataUri as string,
        owner: currentOwner,
        minter: minter as string,
        timestamp,
      };

    } catch (err) {
      secureError('Error fetching batch details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch batch details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address]);

  // Get user's tokens
  const getUserTokens = useCallback(async (userAddress?: string): Promise<CropBatch[]> => {
    if (!publicClient || !userAddress) return [];
    
    try {
      setIsLoading(true);
      setError(null);

      // Get all minting events for this user
      const logs = await publicClient.getLogs({
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
          minter: getAddress(userAddress),
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      const tokens: CropBatch[] = [];
      
      for (const log of logs) {
        if (log.args?.tokenId) {
          const tokenId = Number(log.args.tokenId);
          const batch = await getBatchDetails(tokenId);
          if (batch) {
            tokens.push(batch);
          }
        }
      }

      return tokens.sort((a, b) => b.timestamp - a.timestamp);

    } catch (err) {
      secureError('Error fetching user tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user tokens');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, getBatchDetails]);

  // Mint new batch
  const mintNewBatch = useCallback(async (params: MintParams) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      
      writeContract({
        address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
        abi: CropBatchTokenABI,
        functionName: 'mintNewBatch',
        args: [
          params.to,
          params.cropType,
          BigInt(params.quantity),
          params.originFarm,
          BigInt(params.harvestDate),
          params.notes,
          params.metadataUri,
        ],
        chain: liskSepolia,
        account: address as `0x${string}`,
      });

    } catch (err) {
      secureError('Error minting batch:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mint batch';
      setError(errorMessage);
      throw err;
    }
  }, [address, writeContract]);

  // Transfer token
  const transferToken = useCallback(async (params: TransferParams) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      
      writeContract({
        address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
        abi: CropBatchTokenABI,
        functionName: 'safeTransferFrom',
        args: [
          params.from,
          params.to,
          BigInt(params.tokenId),
          BigInt(params.amount),
          '0x', // data
        ],
        chain: liskSepolia,
        account: address as `0x${string}`,
      });

    } catch (err) {
      secureError('Error transferring token:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer token';
      setError(errorMessage);
      throw err;
    }
  }, [address, writeContract]);

  // Get all batches (for marketplace/explorer)
  const getAllBatches = useCallback(async (): Promise<CropBatch[]> => {
    if (!publicClient) return [];

    try {
      setIsLoading(true);
      setError(null);

      // Get all minting events
      const logs = await publicClient.getLogs({
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

      const batches: CropBatch[] = [];

      for (const log of logs) {
        if (log.args?.tokenId) {
          const tokenId = Number(log.args.tokenId);
          const batch = await getBatchDetails(tokenId);
          if (batch) {
            batches.push(batch);
          }
        }
      }

      return batches.sort((a, b) => b.timestamp - a.timestamp);

    } catch (err) {
      secureError('Error fetching all batches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch batches');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, getBatchDetails]);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effect to handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      addToast('Transaction confirmed successfully!', 'success');
      refetchNextTokenId();
    }
  }, [isConfirmed, hash, addToast, refetchNextTokenId]);

  // Effect to handle errors
  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError.message || 'Transaction failed';
      setError(errorMessage);
      addToast(`Transaction failed: ${errorMessage}`, 'error');
    }
  }, [writeError, addToast]);

  useEffect(() => {
    if (receiptError) {
      const errorMessage = receiptError.message || 'Transaction receipt error';
      setError(errorMessage);
      addToast(`Transaction error: ${errorMessage}`, 'error');
    }
  }, [receiptError, addToast]);

  // Watch for transfer events to trigger live updates
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    eventName: 'TransferSingle',
    onLogs(logs) {
      secureLog('Transfer event detected:', logs);
      // Trigger refresh for components using this hook
      setRefreshTrigger(prev => prev + 1);
      addToast('Ownership transfer detected - updating data...', 'info');
    },
  });

  // Watch for batch transfer events (if using TransferBatch)
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    eventName: 'TransferBatch',
    onLogs(logs) {
      secureLog('Batch transfer event detected:', logs);
      setRefreshTrigger(prev => prev + 1);
      addToast('Batch transfer detected - updating data...', 'info');
    },
  });

  // Function to manually trigger refresh
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    // State
    isLoading,
    error,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    nextTokenId: nextTokenId ? Number(nextTokenId) : undefined,
    isLoadingNextTokenId,
    refreshTrigger, // For components to watch for changes

    // Functions
    mintNewBatch,
    transferToken,
    getBatchDetails,
    getUserTokens,
    getAllBatches,
    clearError,
    refetchNextTokenId,
    triggerRefresh, // Manual refresh trigger
  };
};

// Export alias for compatibility with existing components
export const useCropBatchTokens = () => {
  const { getAllBatches, isLoading, error } = useCropBatchToken();
  const [data, setData] = useState<CropBatch[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const batches = await getAllBatches();
      setData(batches);
    };

    fetchData();
  }, [getAllBatches]);

  return {
    data,
    isLoading,
    error,
    refetch: getAllBatches,
  };
};
