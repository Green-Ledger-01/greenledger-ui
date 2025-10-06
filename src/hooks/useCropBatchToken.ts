import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useWatchContractEvent, useChainId } from 'wagmi';
import { getAddress } from 'viem';
\import { useContractAddresses } from './useContractAddresses';
import { useCurrentChain } from './useCurrentChain';
import { useToast } from '../contexts/ToastContext';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';
import { secureLog, secureError, secureWarn } from '../utils/secureLogger';

// Constants
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const BLOCK_RANGE_LIMIT = 10000; // ~2 days of blocks

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
  const { addresses: CONTRACT_ADDRESSES, isSupported } = useContractAddresses();
  const currentChain = useCurrentChain();

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
    query: {
      enabled: isSupported,
    },
  });

  // Get batch details with caching
  const getBatchDetails = useCallback(async (tokenId: number): Promise<CropBatch | null> => {
    if (!publicClient) return null;
    
    // Check cache first
    const cached = getCachedBatch(tokenId);
    if (cached) {
      return cached;
    }
    
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
      let currentOwner = ZERO_ADDRESS;

      try {
        // Get current block for optimized range
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > BLOCK_RANGE_LIMIT ? currentBlock - BigInt(BLOCK_RANGE_LIMIT) : 0n;
        
        // Get transfer events with optimized block range
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
          fromBlock,
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
        if (address) {
          try {
            const balance = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
              abi: CropBatchTokenABI,
              functionName: 'balanceOf',
              args: [address, BigInt(tokenId)],
            });
            if (Number(balance) > 0) {
              currentOwner = address;
            }
          } catch (balanceError) {
            secureWarn('Failed to check balance:', balanceError);
          }
        }
      }

      // Get minting event to find original minter (search all blocks)
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
      if (!mintEvent?.args) {
        throw new Error(`Mint event not found for token ${tokenId}`);
      }
      
      const minter = mintEvent.args.minter || ZERO_ADDRESS;
      const timestamp = mintEvent.blockNumber ? 
        Number((await publicClient.getBlock({ blockNumber: mintEvent.blockNumber })).timestamp) * 1000 : 
        Date.now();

      const batch: CropBatch = {
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
      
      // Cache the result
      setCachedBatch(tokenId, batch);
      return batch;

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

      // Get current block for optimized range
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > BLOCK_RANGE_LIMIT ? currentBlock - BigInt(BLOCK_RANGE_LIMIT) : 0n;
      
      // Get all minting events for this user with optimized range
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
        fromBlock,
        toBlock: 'latest',
      });

      // Batch process all token details in parallel
      const tokenPromises = logs
        .filter(log => log.args?.tokenId)
        .map(log => getBatchDetails(Number(log.args!.tokenId)));
      
      const batchResults = await Promise.allSettled(tokenPromises);
      const tokens: CropBatch[] = batchResults
        .filter((result): result is PromiseFulfilledResult<CropBatch> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

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
        chain: currentChain,
        account: address as `0x${string}`,
      });

    } catch (err) {
      secureError('Error minting batch:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mint batch';
      setError(errorMessage);
      throw err;
    }
  }, [address, writeContract, currentChain]);

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
        chain: currentChain,
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

      // Check cache first
      const cached = getMarketplaceCache();
      if (cached.length > 0) {
        setIsLoading(false);
        return cached;
      }
      
      // Get all minting events from contract deployment (no block limit)
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

      // Batch process all token details in parallel
      const tokenPromises = logs
        .filter(log => log.args?.tokenId)
        .map(log => getBatchDetails(Number(log.args!.tokenId)));
      
      const batchResults = await Promise.allSettled(tokenPromises);
      const batches: CropBatch[] = batchResults
        .filter((result): result is PromiseFulfilledResult<CropBatch> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      const sortedBatches = batches.sort((a, b) => b.timestamp - a.timestamp);
      
      // Cache results for faster loading
      setMarketplaceCache(sortedBatches);
      
      return sortedBatches;

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
      // Clear marketplace cache on transfers
      localStorage.removeItem('greenledger_marketplace_cache');
      setRefreshTrigger(prev => prev + 1);
      addToast('Ownership transfer detected - updating data...', 'info');
    },
  });

  // Watch for new mints to update marketplace
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    eventName: 'CropBatchMinted',
    onLogs(logs) {
      secureLog('New batch minted:', logs);
      // Clear marketplace cache on new mints
      localStorage.removeItem('greenledger_marketplace_cache');
      setRefreshTrigger(prev => prev + 1);
      addToast('New crop batch available in marketplace!', 'success');
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

// Export alias for compatibility with existing components - FIXED INFINITE RE-RENDER
export const useCropBatchTokens = () => {
  const { getAllBatches, isLoading, error, refreshTrigger } = useCropBatchToken();
  const [data, setData] = useState<CropBatch[]>([]);

  // Use getAllBatches directly since it's already memoized with useCallback

  useEffect(() => {
    const fetchData = async () => {
      try {
        const batches = await getAllBatches();
        setData(batches);
      } catch (error) {
        secureError('Failed to fetch batches in useCropBatchTokens:', error);
      }
    };

    fetchData();
  }, [refreshTrigger]); // Use refreshTrigger instead of getAllBatches

  return {
    data,
    isLoading,
    error,
    refetch: getAllBatches,
  };
};

// Add batch cache with size limit for better performance
const MAX_CACHE_SIZE = 100;
const batchCache = new Map<number, { data: CropBatch; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedBatch = (tokenId: number): CropBatch | null => {
  const cached = batchCache.get(tokenId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setCachedBatch = (tokenId: number, batch: CropBatch): void => {
  // Implement LRU eviction if cache is full
  if (batchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = batchCache.keys().next().value;
    if (firstKey !== undefined) {
      batchCache.delete(firstKey);
    }
  }
  batchCache.set(tokenId, { data: batch, timestamp: Date.now() });
};

// Marketplace cache for persistent storage
const MARKETPLACE_CACHE_KEY = 'greenledger_marketplace_cache';
const MARKETPLACE_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const getMarketplaceCache = (): CropBatch[] => {
  try {
    const cached = localStorage.getItem(MARKETPLACE_CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < MARKETPLACE_CACHE_DURATION) {
        return data.batches || [];
      }
    }
  } catch (error) {
    secureWarn('Failed to parse marketplace cache:', error);
  }
  return [];
};

export const setMarketplaceCache = (batches: CropBatch[]): void => {
  try {
    const cacheData = {
      batches,
      timestamp: Date.now(),
    };
    localStorage.setItem(MARKETPLACE_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    secureWarn('Failed to cache marketplace data:', error);
  }
};
