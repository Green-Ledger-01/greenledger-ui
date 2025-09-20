/**
 * Secure Comparison Utilities
 * Provides constant-time string comparison to prevent timing attacks
 */

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a First string to compare
 * @param b Second string to compare
 * @returns true if strings are equal, false otherwise
 */
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};

/**
 * Check if API credentials are configured (using secure comparison)
 * @param apiKey The API key to check
 * @param secretKey The secret key to check
 * @returns true if credentials are properly configured
 */
export const areCredentialsConfigured = (apiKey: string | undefined, secretKey: string | undefined): boolean => {
  if (!apiKey || !secretKey) {
    return false;
  }

  // Use secure comparison to check against placeholder values
  const isApiKeyPlaceholder = secureCompare(apiKey, 'YOUR_PINATA_API_KEY');
  const isSecretKeyPlaceholder = secureCompare(secretKey, 'YOUR_PINATA_SECRET_API_KEY');

  return !isApiKeyPlaceholder && !isSecretKeyPlaceholder;
};