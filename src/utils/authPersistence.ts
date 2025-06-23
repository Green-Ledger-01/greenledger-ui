/**
 * Authentication persistence utilities
 * Helps maintain authentication state across page reloads and OAuth redirects
 */

const AUTH_STATE_KEY = 'particle_auth_state';
const AUTH_TIMESTAMP_KEY = 'particle_auth_timestamp';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export interface PersistedAuthState {
  isConnected: boolean;
  userInfo?: any;
  timestamp: number;
}

/**
 * Save authentication state to localStorage
 */
export const saveAuthState = (isConnected: boolean, userInfo?: any): void => {
  try {
    const authState: PersistedAuthState = {
      isConnected,
      userInfo,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authState));
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to save auth state:', error);
  }
};

/**
 * Load authentication state from localStorage
 */
export const loadAuthState = (): PersistedAuthState | null => {
  try {
    const authStateStr = localStorage.getItem(AUTH_STATE_KEY);
    const timestampStr = localStorage.getItem(AUTH_TIMESTAMP_KEY);
    
    if (!authStateStr || !timestampStr) {
      return null;
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    
    // Check if the session has expired
    if (now - timestamp > SESSION_TIMEOUT) {
      clearAuthState();
      return null;
    }
    
    const authState: PersistedAuthState = JSON.parse(authStateStr);
    return authState;
  } catch (error) {
    console.warn('Failed to load auth state:', error);
    return null;
  }
};

/**
 * Clear authentication state from localStorage
 */
export const clearAuthState = (): void => {
  try {
    localStorage.removeItem(AUTH_STATE_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear auth state:', error);
  }
};

/**
 * Check if we're in the middle of an OAuth flow
 */
export const isOAuthRedirect = (): boolean => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    
    // Check for common OAuth parameters
    return !!(
      urlParams.get('code') ||
      urlParams.get('state') ||
      urlParams.get('access_token') ||
      hash.includes('access_token') ||
      hash.includes('id_token')
    );
  } catch (error) {
    return false;
  }
};

/**
 * Mark that we're starting an OAuth flow
 */
export const markOAuthStart = (): void => {
  try {
    localStorage.setItem('oauth_flow_started', Date.now().toString());
  } catch (error) {
    console.warn('Failed to mark OAuth start:', error);
  }
};

/**
 * Check if we recently started an OAuth flow
 */
export const wasOAuthRecentlyStarted = (): boolean => {
  try {
    const startTime = localStorage.getItem('oauth_flow_started');
    if (!startTime) return false;
    
    const elapsed = Date.now() - parseInt(startTime, 10);
    const fiveMinutes = 5 * 60 * 1000;
    
    if (elapsed > fiveMinutes) {
      localStorage.removeItem('oauth_flow_started');
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Clear OAuth flow markers
 */
export const clearOAuthMarkers = (): void => {
  try {
    localStorage.removeItem('oauth_flow_started');
  } catch (error) {
    console.warn('Failed to clear OAuth markers:', error);
  }
};

/**
 * Clear all authentication-related data
 */
export const clearAllAuthData = (): void => {
  clearAuthState();
  clearOAuthMarkers();
  console.log('All authentication data cleared');
};
