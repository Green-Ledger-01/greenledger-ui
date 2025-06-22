import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';

/**
 * Enhanced Role Management Hook
 * 
 * This hook manages the self-service role registration flow and determines
 * when to show the role registration modal. It integrates with wagmi for
 * proper Web3 state management.
 * 
 * Key Features:
 * - Automatic role registration detection
 * - Persistent user preferences
 * - Integration with wagmi account state
 * - Graceful handling of disconnected states
 * - Support for skipping role registration
 * 
 * Architecture Benefits:
 * - Eliminates user lockout scenarios
 * - Provides smooth onboarding experience
 * - Maintains user choice and flexibility
 * - Integrates seamlessly with Web3 state
 */
export const useRoleManagementEnhanced = () => {
  const { address: account, isConnected } = useAccount();
  const { 
    userRoles, 
    needsRoleRegistration, 
    registerRoles, 
    isRegistering 
  } = useWeb3Enhanced();

  // Local state
  const [showRoleRegistration, setShowRoleRegistration] = useState(false);
  const [hasSkippedRegistration, setHasSkippedRegistration] = useState(false);

  // Check if user has skipped registration for this session
  useEffect(() => {
    if (account) {
      const skipped = sessionStorage.getItem(`greenledger_skipped_registration_${account}`);
      setHasSkippedRegistration(Boolean(skipped));
    } else {
      setHasSkippedRegistration(false);
    }
  }, [account]);

  // Determine if we should show role registration
  useEffect(() => {
    if (!isConnected || !account) {
      setShowRoleRegistration(false);
      return;
    }

    // Show registration if:
    // 1. User needs role registration (no roles assigned)
    // 2. User hasn't skipped registration in this session
    // 3. Not currently registering
    const shouldShow = needsRoleRegistration && 
                      !hasSkippedRegistration && 
                      !isRegistering;

    setShowRoleRegistration(shouldShow);
  }, [isConnected, account, needsRoleRegistration, hasSkippedRegistration, isRegistering]);

  // Handle registration completion
  const handleRegistrationComplete = useCallback(() => {
    setShowRoleRegistration(false);
    // Clear any skip flags since user has now registered
    if (account) {
      sessionStorage.removeItem(`greenledger_skipped_registration_${account}`);
    }
    setHasSkippedRegistration(false);
  }, [account]);

  // Handle skipping role registration
  const handleSkipRoleSelection = useCallback(() => {
    setShowRoleRegistration(false);
    if (account) {
      // Remember that user skipped for this session
      sessionStorage.setItem(`greenledger_skipped_registration_${account}`, 'true');
    }
    setHasSkippedRegistration(true);
  }, [account]);

  // Force show registration (for manual trigger)
  const forceShowRegistration = useCallback(() => {
    if (account) {
      sessionStorage.removeItem(`greenledger_skipped_registration_${account}`);
    }
    setHasSkippedRegistration(false);
    setShowRoleRegistration(true);
  }, [account]);

  // Register user roles
  const handleRegisterRoles = useCallback(async (roleIds: string[]) => {
    try {
      await registerRoles(roleIds);
      handleRegistrationComplete();
    } catch (error) {
      console.error('Failed to register roles:', error);
      // Don't close the modal on error, let user retry
    }
  }, [registerRoles, handleRegistrationComplete]);

  // Check if user has specific role
  const hasRole = useCallback((roleId: string): boolean => {
    return userRoles.some(role => role.id === roleId);
  }, [userRoles]);

  // Get user role titles
  const getUserRoleTitles = useCallback((): string[] => {
    return userRoles.map(role => role.title);
  }, [userRoles]);

  // Check if user has any roles
  const hasAnyRole = useCallback((): boolean => {
    return userRoles.length > 0;
  }, [userRoles]);

  return {
    // Registration State
    showRoleRegistration,
    needsRoleRegistration,
    hasSkippedRegistration,
    isRegistering,
    
    // User Roles
    userRoles,
    hasRole,
    hasAnyRole,
    getUserRoleTitles,
    
    // Registration Actions
    handleRegistrationComplete,
    handleSkipRoleSelection,
    handleRegisterRoles,
    forceShowRegistration,
    
    // Account State
    account,
    isConnected,
  };
};