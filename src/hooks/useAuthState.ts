import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAuthCore, useConnect } from '@particle-network/authkit';
import {
  saveAuthState,
  loadAuthState,
  clearAuthState,
  isOAuthRedirect,
  wasOAuthRecentlyStarted,
  clearOAuthMarkers
} from '../utils/authPersistence';

export interface AuthState {
  isWagmiConnected: boolean;
  isParticleConnected: boolean;
  isAnyConnected: boolean;
  isConnecting: boolean;
  isStable: boolean;
  userInfo: any;
  wagmiAddress: string | undefined;
}

/**
 * Custom hook to manage authentication state across both Wagmi and Particle Network
 * Handles the OAuth redirect flow and prevents premature redirects during authentication
 */
export const useAuthState = (): AuthState => {
  const { isConnected: wagmiConnected, address: wagmiAddress } = useAccount();
  const { userInfo } = useAuthCore();
  const { connected: particleConnected, connectionStatus } = useConnect();

  const [isStable, setIsStable] = useState(false);
  const [hasBeenConnected, setHasBeenConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isParticleConnected = particleConnected || !!userInfo;
  const isAnyConnected = wagmiConnected || isParticleConnected;
  const isConnecting = connectionStatus === 'connecting';

  // Initialize from persisted state on mount
  useEffect(() => {
    const persistedState = loadAuthState();
    const isOAuth = isOAuthRedirect();
    const wasRecentOAuth = wasOAuthRecentlyStarted();

    if (persistedState?.isConnected || isOAuth || wasRecentOAuth) {
      setHasBeenConnected(true);
    }

    setIsInitialized(true);
  }, []);

  // Track if we've ever been connected to handle OAuth redirects better
  useEffect(() => {
    if (isAnyConnected && isInitialized) {
      setHasBeenConnected(true);
      // Save the authentication state
      saveAuthState(true, userInfo);
      // Clear OAuth markers since we're now connected
      clearOAuthMarkers();
    }
  }, [isAnyConnected, isInitialized, userInfo]);

  // Enhanced stability check with better OAuth flow handling
  useEffect(() => {
    if (!isInitialized) return;

    // Clear any existing timer
    if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }

    if (isAnyConnected && !isConnecting) {
      // Check if we're in an OAuth redirect scenario
      const isOAuth = isOAuthRedirect();
      const wasRecentOAuth = wasOAuthRecentlyStarted();

      // For OAuth flows (like Gmail), we need a longer delay to ensure the session is fully established
      let delay = 500; // Default delay

      if (isOAuth || wasRecentOAuth || !hasBeenConnected) {
        delay = 3000; // Longer delay for OAuth flows and first-time connections
      }

      stabilityTimerRef.current = setTimeout(() => {
        // Double-check that we're still connected before marking as stable
        if (isAnyConnected && !isConnecting) {
          setIsStable(true);
        }
      }, delay);
    } else {
      setIsStable(false);
    }

    return () => {
      if (stabilityTimerRef.current) {
        clearTimeout(stabilityTimerRef.current);
        stabilityTimerRef.current = null;
      }
    };
  }, [isAnyConnected, isConnecting, hasBeenConnected, isInitialized]);

  // Reset stability and connection tracking when fully disconnecting
  useEffect(() => {
    if (!isAnyConnected && !isConnecting && isInitialized) {
      setIsStable(false);
      setHasBeenConnected(false);
      // Clear persisted auth state
      clearAuthState();
      clearOAuthMarkers();
    }
  }, [isAnyConnected, isConnecting, isInitialized]);

  return {
    isWagmiConnected: wagmiConnected,
    isParticleConnected,
    isAnyConnected,
    isConnecting,
    isStable,
    userInfo,
    wagmiAddress,
  };
};
