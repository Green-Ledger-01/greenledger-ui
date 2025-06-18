import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useReadContracts } from './useContracts';
import { CONTRACT_CONFIG } from '../config/contracts';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';

export interface BatchInfo {
  cropType: string;
  quantity: bigint;
  originFarm: string;
  harvestDate: bigint;
  notes: string;
  metadataUri: string;
}

export interface MintBatchParams {
  to: string;
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number;
  notes: string;
  metadataUri: string;
}

/**
 * Hook for crop batch token operations
 */
export const useCropBatchToken = () => {
  const { address } = useAccount();
  const { cropBatchToken } = useReadContracts();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Get the next token ID that will be minted
   */
  const { data: nextTokenId, refetch: refetchNextTokenId } = useReadContract({
    address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    functionName: 'nextTokenId',
  });

  /**
   * Get batch details for a specific token ID
   */
  const getBatchDetails = (tokenId: number) => {
    const { data: batchDetails, isLoading, refetch } = useReadContract({
      address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
      abi: CropBatchTokenABI,
      functionName: 'batchDetails',
      args: [BigInt(tokenId)],
      query: {
        enabled: tokenId > 0,
      },
    });

    return {
      batchDetails: batchDetails as BatchInfo | undefined,
      isLoading,
      refetch,
    };
  };

  /**
   * Check if a token exists
   */
  const checkTokenExists = (tokenId: number) => {
    const { data: exists, isLoading } = useReadContract({
      address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
      abi: CropBatchTokenABI,
      functionName: 'exists',
      args: [BigInt(tokenId)],
      query: {
        enabled: tokenId > 0,
      },
    });

    return { exists: !!exists, isLoading };
  };

  /**
   * Get token balance for current user
   */
  const getTokenBalance = (tokenId: number) => {
    const { data: balance, isLoading, refetch } = useReadContract({
      address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
      abi: CropBatchTokenABI,
      functionName: 'balanceOf',
      args: address && tokenId > 0 ? [address, BigInt(tokenId)] : undefined,
      query: {
        enabled: !!address && tokenId > 0,
      },
    });

    return {
      balance: balance ? Number(balance) : 0,
      isLoading,
      refetch,
    };
  };

  /**
   * Get token URI for metadata
   */
  const getTokenUri = (tokenId: number) => {
    const { data: uri, isLoading } = useReadContract({
      address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
      abi: CropBatchTokenABI,
      functionName: 'uri',
      args: [BigInt(tokenId)],
      query: {
        enabled: tokenId > 0,
      },
    });

    return { uri: uri as string | undefined, isLoading };
  };

  /**
   * Check if metadata is frozen for a token
   */
  const isMetadataFrozen = (tokenId: number) => {
    const { data: frozen, isLoading } = useReadContract({
      address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
      abi: CropBatchTokenABI,
      functionName: 'isMetadataFrozen',
      args: [BigInt(tokenId)],
      query: {
        enabled: tokenId > 0,
      },
    });

    return { frozen: !!frozen, isLoading };
  };

  /**
   * Mint a new crop batch token (farmers only)
   */
  const mintNewBatch = async (params: MintBatchParams) => {
    try {
      // Validate IPFS URI format
      if (!params.metadataUri.startsWith('ipfs://')) {
        throw new Error('Metadata URI must be a valid IPFS URI starting with "ipfs://"');
      }

      // Validate quantity (max 100 as per contract)
      if (params.quantity > 100) {
        throw new Error('Batch quantity cannot exceed 100 kg');
      }

      await writeContract({
        address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
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
      });
    } catch (err) {
      console.error('Error minting crop batch:', err);
      throw err;
    }
  };

  /**
   * Update token URI (admin only)
   */
  const updateTokenUri = async (tokenId: number, newUri: string) => {
    try {
      if (!newUri.startsWith('ipfs://')) {
        throw new Error('New URI must be a valid IPFS URI starting with "ipfs://"');
      }

      await writeContract({
        address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
        abi: CropBatchTokenABI,
        functionName: 'updateTokenUri',
        args: [BigInt(tokenId), newUri],
      });
    } catch (err) {
      console.error('Error updating token URI:', err);
      throw err;
    }
  };

  /**
   * Freeze metadata for a token (admin only)
   */
  const freezeMetadata = async (tokenId: number) => {
    try {
      await writeContract({
        address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
        abi: CropBatchTokenABI,
        functionName: 'freezeMetadata',
        args: [BigInt(tokenId)],
      });
    } catch (err) {
      console.error('Error freezing metadata:', err);
      throw err;
    }
  };

  /**
   * Get royalty information for a token
   */
  const getRoyaltyInfo = (tokenId: number, salePrice: number) => {
    const { data: royaltyInfo, isLoading } = useReadContract({
      address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
      abi: CropBatchTokenABI,
      functionName: 'royaltyInfo',
      args: [BigInt(tokenId), BigInt(salePrice)],
      query: {
        enabled: tokenId > 0 && salePrice > 0,
      },
    });

    return {
      royaltyInfo: royaltyInfo as [string, bigint] | undefined,
      isLoading,
    };
  };

  /**
   * Transfer token to another address
   */
  const transferToken = async (to: string, tokenId: number, amount: number = 1) => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      await writeContract({
        address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
        abi: CropBatchTokenABI,
        functionName: 'safeTransferFrom',
        args: [address, to, BigInt(tokenId), BigInt(amount), '0x'],
      });
    } catch (err) {
      console.error('Error transferring token:', err);
      throw err;
    }
  };

  return {
    // Token information
    nextTokenId: nextTokenId ? Number(nextTokenId) : 1,
    refetchNextTokenId,
    
    // Query functions
    getBatchDetails,
    checkTokenExists,
    getTokenBalance,
    getTokenUri,
    isMetadataFrozen,
    getRoyaltyInfo,
    
    // Actions
    mintNewBatch,
    updateTokenUri,
    freezeMetadata,
    transferToken,
    
    // Transaction status
    isMinting: isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};

/**
 * Hook to get user's owned tokens
 */
export const useUserTokens = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;
  const [ownedTokens, setOwnedTokens] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { nextTokenId } = useCropBatchToken();

  useEffect(() => {
    if (!targetAddress || !nextTokenId) return;

    const fetchOwnedTokens = async () => {
      setIsLoading(true);
      const tokens: number[] = [];
      
      try {
        // Check each token ID to see if user owns it
        for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
          // This would need to be implemented with proper batch reading
          // For now, we'll use individual calls (not optimal for production)
          // TODO: Implement batch reading or use events/indexing
        }
      } catch (error) {
        console.error('Error fetching owned tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnedTokens();
  }, [targetAddress, nextTokenId]);

  return {
    ownedTokens,
    isLoading,
  };
};