import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useWeb3 } from '../contexts/Web3Context';

interface RoleManagementState {
  showRoleRegistration: boolean;
  hasCompletedOnboarding: boolean;
  needsRoleSelection: boolean;
}

/**
 * Role Management Hook
 * 
 * Handles the logic for determining when users need to register roles
 * and manages the onboarding flow to prevent user lockout scenarios.
 * 
 * Architecture Decision:
 * - Automatically detects when users need role registration
 * - Provides smooth onboarding experience
 * - Prevents admin dependency for basic access
 * - Maintains user preferences in localStorage
 * 
 * Benefits:
 * - Eliminates user lockout scenarios
 * - Provides seamless onboarding experience
 * - Reduces support burden
 * - Maintains user autonomy
 */
export const useRoleManagement = () => {
  const { address, isConnected } = useAccount();
  const { userRoles, isLoadingRoles } = useWeb3();
  
  const [state, setState] = useState<RoleManagementState>({
    showRoleRegistration: false,
    hasCompletedOnboarding: false,
    needsRoleSelection: false,
  });

  // Storage keys for user preferences
  const getStorageKey = (addr: string, key: string) => `greenledger_${addr}_${key}`;

  // Check if user has completed onboarding
  const checkOnboardingStatus = useCallback((userAddress: string) => {
    const onboardingKey = getStorageKey(userAddress, 'onboarding_completed');
    const skippedKey = getStorageKey(userAddress, 'role_selection_skipped');
    
    return {
      hasCompletedOnboarding: localStorage.getItem(onboardingKey) === 'true',
      hasSkippedRoleSelection: localStorage.getItem(skippedKey) === 'true',
    };
  }, []);

  // Mark onboarding as completed
  const completeOnboarding = useCallback((userAddress: string) => {
    const onboardingKey = getStorageKey(userAddress, 'onboarding_completed');
    localStorage.setItem(onboardingKey, 'true');
    
    setState(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      showRoleRegistration: false,
    }));
  }, []);

  // Mark role selection as skipped
  const skipRoleSelection = useCallback((userAddress: string) => {
    const skippedKey = getStorageKey(userAddress, 'role_selection_skipped');
    localStorage.setItem(skippedKey, 'true');
    
    setState(prev => ({
      ...prev,
      showRoleRegistration: false,
    }));
  }, []);

  // Reset onboarding status (for testing or re-onboarding)
  const resetOnboarding = useCallback((userAddress: string) => {
    const onboardingKey = getStorageKey(userAddress, 'onboarding_completed');
    const skippedKey = getStorageKey(userAddress, 'role_selection_skipped');
    
    localStorage.removeItem(onboardingKey);
    localStorage.removeItem(skippedKey);
    
    setState(prev => ({
      ...prev,
      hasCompletedOnboarding: false,
      showRoleRegistration: false,
    }));
  }, []);

  // Force show role registration
  const showRoleRegistrationModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showRoleRegistration: true,
    }));
  }, []);

  // Hide role registration
  const hideRoleRegistration = useCallback(() => {
    setState(prev => ({
      ...prev,
      showRoleRegistration: false,
    }));
  }, []);

  // Main effect to determine when to show role registration
  useEffect(() => {
    if (!isConnected || !address || isLoadingRoles) {
      setState(prev => ({
        ...prev,
        showRoleRegistration: false,
        needsRoleSelection: false,
      }));
      return;
    }

    const { hasCompletedOnboarding, hasSkippedRoleSelection } = checkOnboardingStatus(address);
    const hasAnyRole = userRoles.isFarmer || userRoles.isTransporter || userRoles.isBuyer || userRoles.isAdmin;
    
    // Determine if user needs role selection
    const needsRoleSelection = !hasAnyRole && !hasSkippedRoleSelection;
    
    // Show role registration if:
    // 1. User doesn't have any roles AND
    // 2. User hasn't completed onboarding AND
    // 3. User hasn't explicitly skipped role selection
    const shouldShowRoleRegistration = needsRoleSelection && !hasCompletedOnboarding;

    setState(prev => ({
      ...prev,
      hasCompletedOnboarding,
      needsRoleSelection,
      showRoleRegistration: shouldShowRoleRegistration,
    }));
  }, [isConnected, address, isLoadingRoles, userRoles, checkOnboardingStatus]);

  // Handle successful role registration
  const handleRegistrationComplete = useCallback(() => {
    if (address) {
      completeOnboarding(address);
    }
  }, [address, completeOnboarding]);

  // Handle skipping role selection
  const handleSkipRoleSelection = useCallback(() => {
    if (address) {
      skipRoleSelection(address);
    }
  }, [address, skipRoleSelection]);

  // Get user's current roles summary
  const getRolesSummary = useCallback(() => {
    const roles = [];
    if (userRoles.isAdmin) roles.push('Admin');
    if (userRoles.isFarmer) roles.push('Farmer');
    if (userRoles.isTransporter) roles.push('Transporter');
    if (userRoles.isBuyer) roles.push('Buyer');
    
    return {
      roles,
      hasAnyRole: roles.length > 0,
      roleCount: roles.length,
      displayText: roles.length > 0 ? roles.join(', ') : 'No roles assigned',
    };
  }, [userRoles]);

  // Check if user can access specific features
  const canAccessFeature = useCallback((feature: 'mint' | 'transfer' | 'buy' | 'admin') => {
    switch (feature) {
      case 'mint':
        return userRoles.isFarmer || userRoles.isAdmin;
      case 'transfer':
        return userRoles.isTransporter || userRoles.isAdmin;
      case 'buy':
        return userRoles.isBuyer || userRoles.isAdmin;
      case 'admin':
        return userRoles.isAdmin;
      default:
        return false;
    }
  }, [userRoles]);

  // Get recommended next steps for user
  const getRecommendedActions = useCallback(() => {
    const actions = [];
    const rolesSummary = getRolesSummary();

    if (!rolesSummary.hasAnyRole) {
      actions.push({
        type: 'register_role',
        title: 'Register Your Role',
        description: 'Choose your role to access GreenLedger features',
        priority: 'high' as const,
        action: showRoleRegistrationModal,
      });
    }

    if (userRoles.isFarmer) {
      actions.push({
        type: 'mint_batch',
        title: 'Create Crop Batch',
        description: 'Mint your first crop batch NFT',
        priority: 'medium' as const,
        action: () => window.location.href = '/mint',
      });
    }

    if (userRoles.isBuyer) {
      actions.push({
        type: 'explore_marketplace',
        title: 'Explore Marketplace',
        description: 'Browse available crop batches',
        priority: 'medium' as const,
        action: () => window.location.href = '/marketplace',
      });
    }

    return actions;
  }, [getRolesSummary, userRoles, showRoleRegistrationModal]);

  return {
    // State
    showRoleRegistration: state.showRoleRegistration,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    needsRoleSelection: state.needsRoleSelection,
    isLoadingRoles,
    
    // User roles info
    userRoles,
    rolesSummary: getRolesSummary(),
    
    // Actions
    handleRegistrationComplete,
    handleSkipRoleSelection,
    showRoleRegistrationModal,
    hideRoleRegistration,
    resetOnboarding: () => address && resetOnboarding(address),
    
    // Utilities
    canAccessFeature,
    getRecommendedActions,
  };
};