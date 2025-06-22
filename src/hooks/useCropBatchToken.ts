/**
 * Crop Batch Token Hook
 * Handles crop batch minting and token operations
 */

import { useCallback, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/constants';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';

interface MintBatchParams {
  to: `0x${string}`;
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number;
  notes: string;
  metadataUri: string;
}

export const useCropBatchToken = () => {
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: confirmError 
  } = useWaitForTransactionReceipt({ hash });

  // Read nextTokenId for display/form logic
  const { 
    data: nextTokenIdBigInt, 
    isLoading: isLoadingNextTokenId,
    refetch: refetchNextTokenId
  } = useReadContract({
    address: CONTRACT_ADDRESSES.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    functionName: 'nextTokenId',
    query: {
      select: (data: bigint) => Number(data),
      onError: (err) => {
        console.error('Failed to fetch next token ID:', err);
        addToast(`Failed to fetch next token ID: ${getErrorMessage(err)}`, 'error');
      },
    },
  });

  const nextTokenId = nextTokenIdBigInt || 1;

  const mintNewBatch = useCallback(async (params: MintBatchParams) => {
    try {
      await writeContract({
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
      });
    } catch (e) {
      console.error('Minting error:', e);
      addToast(getErrorMessage(e), 'error');
    }
  }, [writeContract, addToast]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      addToast(`Minting failed: ${getErrorMessage(writeError)}`, 'error');
    }
  }, [writeError, addToast]);

  // Handle confirmation
  useEffect(() => {
    if (isConfirmed) {
      addToast('Crop batch minted successfully!', 'success');
      // Refetch next token ID after successful mint
      refetchNextTokenId();
    }
    if (confirmError) {
      addToast(`Minting confirmation failed: ${getErrorMessage(confirmError)}`, 'error');
    }
  }, [isConfirmed, confirmError, addToast, refetchNextTokenId]);

  return {
    mintNewBatch,
    isMinting: isPending,
    isConfirming: isConfirming,
    isConfirmed: isConfirmed,
    error: writeError || confirmError,
    hash,
    nextTokenId,
    isLoadingNextTokenId,
    refetchNextTokenId,
  };
};