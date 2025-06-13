import { useState, useEffect } from 'react';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { contractUtils, UserRole } from '../utils/contracts';
import { getContractAddress } from '../config/contracts';
import GreenLedgerAccessABI from '../contracts/GreenLedgerAccess.json';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';

export interface UserRoles {
  isFarmer: boolean;
  isTransporter: boolean;
  isBuyer: boolean;
}

export interface BatchDetails {
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number;
  notes: string;
  metadataUri: string;
}

export interface CropBatch {
  tokenId: number;
  details: BatchDetails;
  balance: number;
}

export const useContracts = () => {
  const { address, isConnected } = useAccount();
  const [userRoles, setUserRoles] = useState<UserRoles>({
    isFarmer: false,
    isTransporter: false,
    isBuyer: false,
  });
  const [userBatches, setUserBatches] = useState<CropBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user roles when address changes
  useEffect(() => {
    if (address && isConnected) {
      loadUserRoles();
      loadUserBatches();
    } else {
      setUserRoles({ isFarmer: false, isTransporter: false, isBuyer: false });
      setUserBatches([]);
    }
  }, [address, isConnected]);

  const loadUserRoles = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      const roles = await contractUtils.getUserRoles(address);
      setUserRoles(roles);
    } catch (err) {
      setError('Failed to load user roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBatches = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      // Get next token ID to know how many tokens exist
      const nextTokenId = await contractUtils.getNextTokenId();
      const batches: CropBatch[] = [];
      
      // Check balance for each token ID
      for (let i = 1; i < nextTokenId; i++) {
        try {
          const balance = await contractUtils.getTokenBalance(address, i);
          if (balance > 0) {
            const details = await contractUtils.getBatchDetails(i);
            batches.push({
              tokenId: i,
              details,
              balance,
            });
          }
        } catch (err) {
          // Token might not exist or other error, continue
          console.warn(`Error loading token ${i}:`, err);
        }
      }
      
      setUserBatches(batches);
    } catch (err) {
      setError('Failed to load user batches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (role: UserRole) => {
    if (!address) throw new Error('No wallet connected');
    
    try {
      setLoading(true);
      setError(null);
      const tx = await contractUtils.registerUser(address, role);
      // Wait for transaction confirmation
      await tx.wait();
      // Reload user roles
      await loadUserRoles();
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const mintBatch = async (
    cropType: string,
    quantity: number,
    originFarm: string,
    harvestDate: Date,
    notes: string,
    metadataUri: string = ''
  ) => {
    if (!address) throw new Error('No wallet connected');
    
    try {
      setLoading(true);
      setError(null);
      const harvestTimestamp = Math.floor(harvestDate.getTime() / 1000);
      const tx = await contractUtils.mintNewBatch(
        address,
        cropType,
        quantity,
        originFarm,
        harvestTimestamp,
        notes,
        metadataUri
      );
      // Wait for transaction confirmation
      await tx.wait();
      // Reload user batches
      await loadUserBatches();
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mint batch';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const transferBatch = async (
    to: string,
    tokenId: number,
    amount: number
  ) => {
    if (!address) throw new Error('No wallet connected');
    
    try {
      setLoading(true);
      setError(null);
      const tx = await contractUtils.transferToken(address, to, tokenId, amount);
      // Wait for transaction confirmation
      await tx.wait();
      // Reload user batches
      await loadUserBatches();
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to transfer batch';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getBatchDetails = async (tokenId: number): Promise<BatchDetails> => {
    try {
      return await contractUtils.getBatchDetails(tokenId);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get batch details';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  return {
    // State
    userRoles,
    userBatches,
    loading,
    error,
    isConnected: isConnected && !!address,
    address,
    
    // Actions
    registerUser,
    mintBatch,
    transferBatch,
    getBatchDetails,
    loadUserRoles,
    loadUserBatches,
    clearError,
  };
};

// Hook for watching contract events
export const useContractEvents = () => {
  const [events, setEvents] = useState<any[]>([]);

  // Watch for user registration events
  useWatchContractEvent({
    address: getContractAddress('GreenLedgerAccess') as `0x${string}`,
    abi: GreenLedgerAccessABI,
    eventName: 'UserRegistered',
    onLogs(logs) {
      console.log('User registered:', logs);
      setEvents(prev => [...prev, ...logs]);
    },
  });

  // Watch for crop batch minted events
  useWatchContractEvent({
    address: getContractAddress('CropBatchToken') as `0x${string}`,
    abi: CropBatchTokenABI,
    eventName: 'CropBatchMinted',
    onLogs(logs) {
      console.log('Crop batch minted:', logs);
      setEvents(prev => [...prev, ...logs]);
    },
  });

  // Watch for transfer events
  useWatchContractEvent({
    address: getContractAddress('CropBatchToken') as `0x${string}`,
    abi: CropBatchTokenABI,
    eventName: 'TransferSingle',
    onLogs(logs) {
      console.log('Token transferred:', logs);
      setEvents(prev => [...prev, ...logs]);
    },
  });

  return { events };
};
