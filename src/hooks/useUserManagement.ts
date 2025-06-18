import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useReadContracts } from './useContracts';
import { CONTRACT_CONFIG } from '../config/contracts';
import UserManagementABI from '../contracts/UserManagement.json';

// User role enum matching the smart contract
export enum UserRole {
  Farmer = 0,
  Transporter = 1,
  Buyer = 2,
}

export interface UserRoleStatus {
  isFarmer: boolean;
  isTransporter: boolean;
  isBuyer: boolean;
}

/**
 * Hook for user management operations
 */
export const useUserManagement = () => {
  const { address } = useAccount();
  const { userManagement } = useReadContracts();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Get user role status for a specific address
   */
  const { data: userRoleStatus, isLoading: isLoadingRoles, refetch: refetchRoles } = useReadContract({
    address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    functionName: 'getUserRolesStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  /**
   * Check if user has a specific role
   */
  const { data: hasRole, refetch: refetchHasRole } = useReadContract({
    address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    functionName: 'hasRole',
    args: address ? [
      '0x523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c', // FARMER_ROLE hash
      address
    ] : undefined,
    query: {
      enabled: !!address,
    },
  });

  /**
   * Register a user with a specific role (admin only)
   */
  const registerUser = async (userAddress: string, role: UserRole) => {
    try {
      await writeContract({
        address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
        abi: UserManagementABI,
        functionName: 'registerUser',
        args: [userAddress, role],
      });
    } catch (err) {
      console.error('Error registering user:', err);
      throw err;
    }
  };

  /**
   * Revoke a user's role (admin only)
   */
  const revokeUserRole = async (userAddress: string, role: UserRole) => {
    try {
      await writeContract({
        address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
        abi: UserManagementABI,
        functionName: 'revokeRole',
        args: [userAddress, role],
      });
    } catch (err) {
      console.error('Error revoking user role:', err);
      throw err;
    }
  };

  /**
   * Parse user role status from contract response
   */
  const parseUserRoleStatus = (roleData: any): UserRoleStatus | null => {
    if (!roleData || !Array.isArray(roleData) || roleData.length !== 3) {
      return null;
    }
    
    return {
      isFarmer: roleData[0],
      isTransporter: roleData[1],
      isBuyer: roleData[2],
    };
  };

  const parsedRoleStatus = parseUserRoleStatus(userRoleStatus);

  return {
    // User role status
    userRoleStatus: parsedRoleStatus,
    isLoadingRoles,
    refetchRoles,
    
    // Role checking
    hasRole,
    refetchHasRole,
    
    // Actions
    registerUser,
    revokeUserRole,
    
    // Transaction status
    isRegistering: isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    
    // Helper functions
    isAdmin: parsedRoleStatus ? false : false, // TODO: Add admin role check
    isFarmer: parsedRoleStatus?.isFarmer || false,
    isTransporter: parsedRoleStatus?.isTransporter || false,
    isBuyer: parsedRoleStatus?.isBuyer || false,
  };
};

/**
 * Hook to check if current user has admin privileges
 */
export const useIsAdmin = () => {
  const { address } = useAccount();
  
  const { data: isAdmin, isLoading } = useReadContract({
    address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    functionName: 'hasRole',
    args: address ? [
      '0x0000000000000000000000000000000000000000000000000000000000000000', // DEFAULT_ADMIN_ROLE
      address
    ] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isAdmin: !!isAdmin,
    isLoading,
  };
};

/**
 * Hook to get role constants from the contract
 */
export const useRoleConstants = () => {
  const { data: farmerRole } = useReadContract({
    address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    functionName: 'FARMER_ROLE',
  });

  const { data: transporterRole } = useReadContract({
    address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    functionName: 'TRANSPORTER_ROLE',
  });

  const { data: buyerRole } = useReadContract({
    address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    functionName: 'BUYER_ROLE',
  });

  return {
    FARMER_ROLE: farmerRole,
    TRANSPORTER_ROLE: transporterRole,
    BUYER_ROLE: buyerRole,
  };
};