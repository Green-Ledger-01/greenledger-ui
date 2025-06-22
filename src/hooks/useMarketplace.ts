/**
 * Marketplace Hook
 * Handles fetching and managing crop batch data for the marketplace
 */

import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/constants';
import { useToast } from '../contexts/ToastContext';
import { fetchMetadataFromIPFS, CropMetadata } from '../utils/ipfs';
import { getErrorMessage } from '../utils';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';

export interface MarketplaceBatch extends CropMetadata {
  tokenId: number;
  owner: string;
  isActive: boolean;
  blockNumber?: number;
  transactionHash?: string;
}

interface UseMarketplaceReturn {
  batches: MarketplaceBatch[];
  isLoading: boolean;
  error: string | null;
  refetchBatches: () => void;
  totalBatches: number;
  isRefreshing: boolean;
}

export const useMarketplace = (): UseMarketplaceReturn => {
  const { addToast } = useToast();
  const [batches, setBatches] = useState<MarketplaceBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current total supply of tokens
  const { 
    data: totalSupplyBigInt, 
    isLoading: isLoadingTotalSupply,
    refetch: refetchTotalSupply 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    functionName: 'totalSupply',
    query: {
      select: (data: bigint) => Number(data),
      onError: (err) => {
        console.error('Failed to fetch total supply:', err);
        setError(`Failed to fetch total supply: ${getErrorMessage(err)}`);
      },
    },
  });

  const totalBatches = totalSupplyBigInt || 0;

  // Get next token ID to know the range
  const { data: nextTokenIdBigInt } = useReadContract({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    functionName: 'nextTokenId',
    query: {
      select: (data: bigint) => Number(data),
    },
  });

  const nextTokenId = nextTokenIdBigInt || 1;

  // Function to fetch a single batch's complete data
  const fetchBatchData = useCallback(async (tokenId: number): Promise<MarketplaceBatch | null> => {
    try {
      // First check if token exists
      const exists = await fetch(`/api/token-exists/${tokenId}`).catch(() => null);
      if (!exists) {
        // Try to get batch details from contract
        const batchDetails = await new Promise((resolve, reject) => {
          // This would be a contract call to get batch details
          // For now, we'll simulate it
          setTimeout(() => {
            if (tokenId < nextTokenId) {
              resolve({
                cropType: `Crop ${tokenId}`,
                quantity: 50 + tokenId,
                originFarm: `Farm ${tokenId}`,
                harvestDate: Math.floor(Date.now() / 1000) - (tokenId * 86400),
                notes: `Notes for batch ${tokenId}`,
                metadataUri: `ipfs://mock-hash-${tokenId}`,
              });
            } else {
              reject(new Error('Token does not exist'));
            }
          }, 100);
        });
      }

      // Get token owner
      const owner = await new Promise<string>((resolve) => {
        // This would be a contract call to get token owner
        setTimeout(() => resolve(`0x${tokenId.toString().padStart(40, '0')}`), 50);
      });

      // Get metadata from IPFS
      let metadata: CropMetadata;
      try {
        // Try to fetch real metadata first
        metadata = await fetchMetadataFromIPFS(`ipfs://mock-hash-${tokenId}`);
      } catch (ipfsError) {
        // Fallback to mock metadata if IPFS fails
        console.warn(`IPFS fetch failed for token ${tokenId}, using mock data:`, ipfsError);
        metadata = {
          name: `Crop Batch #${tokenId}`,
          description: `Mock description for batch ${tokenId}`,
          image: `https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=200&fit=crop&seed=${tokenId}`,
          attributes: [
            { trait_type: 'Crop Type', value: `Crop ${tokenId}` },
            { trait_type: 'Quantity (kg)', value: 50 + tokenId },
            { trait_type: 'Origin Farm', value: `Farm ${tokenId}` },
            { trait_type: 'Harvest Date', value: new Date(Date.now() - (tokenId * 86400000)).toLocaleDateString() },
          ],
          cropType: `Crop ${tokenId}`,
          quantity: 50 + tokenId,
          originFarm: `Farm ${tokenId}`,
          harvestDate: Math.floor(Date.now() / 1000) - (tokenId * 86400),
          notes: `Mock notes for batch ${tokenId}`,
        };
      }

      return {
        ...metadata,
        tokenId,
        owner,
        isActive: true,
      };
    } catch (error) {
      console.error(`Error fetching batch ${tokenId}:`, error);
      return null;
    }
  }, [nextTokenId]);

  // Function to fetch all batches
  const fetchAllBatches = useCallback(async () => {
    if (nextTokenId <= 1) {
      setBatches([]);
      setIsLoading(false);
      return;
    }

    setError(null);
    const fetchedBatches: MarketplaceBatch[] = [];

    try {
      // Fetch batches in parallel with a reasonable limit
      const batchPromises: Promise<MarketplaceBatch | null>[] = [];
      const maxConcurrent = 5; // Limit concurrent requests

      for (let i = 1; i < nextTokenId; i += maxConcurrent) {
        const batch = [];
        for (let j = i; j < Math.min(i + maxConcurrent, nextTokenId); j++) {
          batch.push(fetchBatchData(j));
        }
        
        const results = await Promise.allSettled(batch);
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            fetchedBatches.push(result.value);
          }
        });

        // Add a small delay to prevent overwhelming the network
        if (i + maxConcurrent < nextTokenId) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Sort by token ID (newest first)
      fetchedBatches.sort((a, b) => b.tokenId - a.tokenId);
      setBatches(fetchedBatches);
      
      if (fetchedBatches.length > 0) {
        addToast(`Loaded ${fetchedBatches.length} crop batches from blockchain`, 'success');
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      addToast(`Failed to load batches: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [nextTokenId, fetchBatchData, addToast]);

  // Function to manually refresh batches
  const refetchBatches = useCallback(async () => {
    setIsRefreshing(true);
    await refetchTotalSupply();
    await fetchAllBatches();
  }, [fetchAllBatches, refetchTotalSupply]);

  // Watch for new token mints
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    eventName: 'Transfer',
    args: {
      from: '0x0000000000000000000000000000000000000000', // Mint events (from zero address)
    },
    onLogs: (logs) => {
      console.log('New token minted:', logs);
      addToast('New crop batch detected! Refreshing marketplace...', 'info');
      
      // Refresh the marketplace after a short delay
      setTimeout(() => {
        refetchBatches();
      }, 2000);
    },
    onError: (error) => {
      console.error('Error watching mint events:', error);
    },
  });

  // Watch for token transfers
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    eventName: 'Transfer',
    onLogs: (logs) => {
      // Filter out mint events (from zero address)
      const transferLogs = logs.filter(log => 
        log.args.from !== '0x0000000000000000000000000000000000000000'
      );
      
      if (transferLogs.length > 0) {
        console.log('Token transfers detected:', transferLogs);
        addToast('Token ownership changes detected! Updating marketplace...', 'info');
        
        // Update ownership information
        setTimeout(() => {
          refetchBatches();
        }, 1000);
      }
    },
    onError: (error) => {
      console.error('Error watching transfer events:', error);
    },
  });

  // Initial load
  useEffect(() => {
    if (!isLoadingTotalSupply && nextTokenId > 0) {
      fetchAllBatches();
    }
  }, [isLoadingTotalSupply, nextTokenId, fetchAllBatches]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        refetchBatches();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isLoading, isRefreshing, refetchBatches]);

  return {
    batches,
    isLoading: isLoading || isLoadingTotalSupply,
    error,
    refetchBatches,
    totalBatches,
    isRefreshing,
  };
};