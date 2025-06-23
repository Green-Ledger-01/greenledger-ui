import { useCallback } from 'react';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';

/**
 * Hook for user role management functionality
 * Provides access to user roles and role-based permissions
 */
export const useUserRole = (address?: string) => {
  const { userRoles, hasRole, isAdmin, account } = useWeb3Enhanced();

  // Get the primary role number for compatibility with existing code
  const getPrimaryRoleNumber = useCallback((): number => {
    // If checking for a different address than the connected account, return 0 (farmer) as default
    if (address && address !== account) {
      return 0;
    }

    // Check roles in priority order: admin > buyer > transporter > farmer
    if (hasRole('admin')) return 3;
    if (hasRole('buyer')) return 2;
    if (hasRole('transporter')) return 1;
    if (hasRole('farmer')) return 0;
    
    // Default to farmer role if no roles found
    return 0;
  }, [userRoles, hasRole, address, account]);

  // Get all role numbers for the user
  const getAllRoleNumbers = useCallback((): number[] => {
    if (address && address !== account) {
      return [0]; // Default to farmer for other addresses
    }

    const roleNumbers: number[] = [];
    if (hasRole('farmer')) roleNumbers.push(0);
    if (hasRole('transporter')) roleNumbers.push(1);
    if (hasRole('buyer')) roleNumbers.push(2);
    if (hasRole('admin')) roleNumbers.push(3);
    
    return roleNumbers.length > 0 ? roleNumbers : [0];
  }, [userRoles, hasRole, address, account]);

  return {
    data: getPrimaryRoleNumber(),
    roles: getAllRoleNumbers(),
    userRoles,
    hasRole,
    isAdmin,
    isLoading: false,
    error: null,
  };
};

/**
 * Hook to check if a user has a specific role
 */
export const useHasRole = (roleId: string) => {
  const { hasRole } = useWeb3Enhanced();
  return hasRole(roleId);
};

/**
 * Hook to get user role information
 */
export const useUserRoleInfo = () => {
  const { userRoles, hasRole, isAdmin, needsRoleRegistration } = useWeb3Enhanced();
  
  return {
    userRoles,
    hasRole,
    isAdmin,
    needsRoleRegistration,
    isLoading: false,
  };
};
