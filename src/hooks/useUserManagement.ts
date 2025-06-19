/**
 * User Management Hook
 * Handles user registration and role management
 */

import { useCallback, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/constants';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/errorHandling';
import UserManagementABI from '../contracts/UserManagement.json';

export const useUserManagement = () => {
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: confirmError 
  } = useWaitForTransactionReceipt({ hash });

  const registerUser = useCallback(async (userAddress: `0x${string}`, role: number) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
        abi: UserManagementABI,
        functionName: 'registerUser',
        args: [userAddress, role],
      });
    } catch (e) {
      console.error('Registration error:', e);
      addToast(getErrorMessage(e), 'error');
    }
  }, [writeContract, addToast]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      addToast(`Registration failed: ${getErrorMessage(writeError)}`, 'error');
    }
  }, [writeError, addToast]);

  // Handle confirmation
  useEffect(() => {
    if (isConfirmed) {
      addToast('User registered successfully!', 'success');
    }
    if (confirmError) {
      addToast(`Registration confirmation failed: ${getErrorMessage(confirmError)}`, 'error');
    }
  }, [isConfirmed, confirmError, addToast]);

  return {
    registerUser,
    isRegistering: isPending,
    isConfirmingRegistration: isConfirming,
    isRegistrationConfirmed: isConfirmed,
    registrationError: writeError || confirmError,
    registrationTxHash: hash,
  };
};