/**
 * @deprecated OAuth redirect handler utilities
 * This file is no longer needed after migrating to RainbowKit-only authentication.
 * RainbowKit handles wallet connections without OAuth flows.
 * This file will be removed in the next cleanup phase.
 */

export interface OAuthResult {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
  accessToken?: string;
  idToken?: string;
  url?: string;
}

/**
 * @deprecated Set up OAuth message listener - no longer needed with RainbowKit
 */
export const setupOAuthListener = (): (() => void) => {
  console.warn('setupOAuthListener is deprecated - RainbowKit handles wallet connections directly');

  // Return no-op cleanup function
  return () => {
    // No-op
  };
};

/**
 * @deprecated Initialize OAuth handling - no longer needed with RainbowKit
 */
export const initializeOAuthHandling = (): void => {
  console.warn('initializeOAuthHandling is deprecated - RainbowKit handles wallet connections directly');
  // No-op
};

/**
 * @deprecated Cleanup OAuth handling - no longer needed with RainbowKit
 */
export const cleanupOAuthHandling = (): void => {
  console.warn('cleanupOAuthHandling is deprecated - RainbowKit handles wallet connections directly');
  // No-op
};
