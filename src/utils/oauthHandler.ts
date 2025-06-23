/**
 * OAuth redirect handler utilities
 * Handles OAuth redirect messages from popup windows and iframes
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
 * Set up OAuth message listener
 */
export const setupOAuthListener = (): (() => void) => {
  const handleMessage = (event: MessageEvent) => {
    // Verify origin for security
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data?.type === 'PARTICLE_AUTH_RESULT') {
      const result: OAuthResult = event.data.result;
      
      console.log('Received OAuth result:', result);
      
      // Handle the OAuth result
      if (result.error) {
        console.error('OAuth error:', result.error, result.errorDescription);
        // You can dispatch a custom event or call a callback here
        window.dispatchEvent(new CustomEvent('particle-auth-error', {
          detail: { error: result.error, description: result.errorDescription }
        }));
      } else {
        console.log('OAuth success:', result);
        // You can dispatch a custom event or call a callback here
        window.dispatchEvent(new CustomEvent('particle-auth-success', {
          detail: result
        }));
      }
    }
  };

  // Add the event listener
  window.addEventListener('message', handleMessage);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};

/**
 * Initialize OAuth handling
 */
export const initializeOAuthHandling = (): void => {
  // Set up the message listener
  const cleanup = setupOAuthListener();

  // Store cleanup function for later use
  (window as any).__oauthCleanup = cleanup;

  // Add event listeners for OAuth events
  window.addEventListener('particle-auth-success', (event: any) => {
    console.log('OAuth authentication successful:', event.detail);
    // The Particle Network SDK should handle this automatically
  });

  window.addEventListener('particle-auth-error', (event: any) => {
    console.error('OAuth authentication failed:', event.detail);
    // You can show an error message to the user here
  });
};

/**
 * Cleanup OAuth handling
 */
export const cleanupOAuthHandling = (): void => {
  if ((window as any).__oauthCleanup) {
    (window as any).__oauthCleanup();
    delete (window as any).__oauthCleanup;
  }
};
