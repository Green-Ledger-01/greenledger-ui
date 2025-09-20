/**
 * Secure Logger Utilities
 * Provides sanitized logging to prevent log injection attacks
 */

/**
 * Sanitize input for safe logging by removing/escaping dangerous characters
 * @param input The input to sanitize
 * @returns Sanitized string safe for logging
 */
const sanitizeLogInput = (input: unknown): string => {
  if (input === null || input === undefined) {
    return '[null]';
  }

  let str = String(input);
  
  // Remove or escape dangerous characters that could be used for log injection
  str = str
    .replace(/\r\n/g, ' ') // Remove CRLF
    .replace(/\r/g, ' ')   // Remove CR
    .replace(/\n/g, ' ')   // Remove LF
    .replace(/\t/g, ' ')   // Remove tabs
    .replace(/\x00/g, '')  // Remove null bytes
    .replace(/[\x01-\x1F\x7F]/g, ''); // Remove other control characters

  // Truncate very long strings to prevent log flooding
  if (str.length > 200) {
    str = str.substring(0, 200) + '...[truncated]';
  }

  return str;
};

/**
 * Secure console.log wrapper
 */
export const secureLog = (message: string, ...args: unknown[]): void => {
  const sanitizedMessage = sanitizeLogInput(message);
  const sanitizedArgs = args.map(sanitizeLogInput);
  console.log(sanitizedMessage, ...sanitizedArgs);
};

/**
 * Secure console.error wrapper
 */
export const secureError = (message: string, ...args: unknown[]): void => {
  const sanitizedMessage = sanitizeLogInput(message);
  const sanitizedArgs = args.map(sanitizeLogInput);
  console.error(sanitizedMessage, ...sanitizedArgs);
};

/**
 * Secure console.warn wrapper
 */
export const secureWarn = (message: string, ...args: unknown[]): void => {
  const sanitizedMessage = sanitizeLogInput(message);
  const sanitizedArgs = args.map(sanitizeLogInput);
  console.warn(sanitizedMessage, ...sanitizedArgs);
};