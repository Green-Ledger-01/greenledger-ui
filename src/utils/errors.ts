/**
 * Error handling utilities for Web3 interactions
 */

export interface ContractError {
  name: string;
  message: string;
  code?: string | number;
  reason?: string;
  data?: any;
}

/**
 * Parse contract error messages to user-friendly format
 */
export const parseContractError = (error: any): ContractError => {
  // Default error structure
  const defaultError: ContractError = {
    name: 'Unknown Error',
    message: 'An unexpected error occurred',
  };

  if (!error) return defaultError;

  // Handle different error types
  if (typeof error === 'string') {
    return {
      name: 'Contract Error',
      message: error,
    };
  }

  // Viem/Wagmi error handling
  if (error.name && error.message) {
    const parsedError: ContractError = {
      name: error.name,
      message: error.message,
      code: error.code,
      reason: error.reason,
      data: error.data,
    };

    // Handle specific contract errors
    if (error.message.includes('Must be farmer')) {
      parsedError.name = 'Access Denied';
      parsedError.message = 'Only farmers can perform this action. Please ensure you have the farmer role.';
    } else if (error.message.includes('Must be admin')) {
      parsedError.name = 'Admin Required';
      parsedError.message = 'Only administrators can perform this action.';
    } else if (error.message.includes('Token doesn\'t exist')) {
      parsedError.name = 'Token Not Found';
      parsedError.message = 'The requested token does not exist.';
    } else if (error.message.includes('Metadata is frozen')) {
      parsedError.name = 'Metadata Frozen';
      parsedError.message = 'This token\'s metadata has been permanently frozen and cannot be updated.';
    } else if (error.message.includes('Batch too large')) {
      parsedError.name = 'Batch Size Exceeded';
      parsedError.message = 'Batch size cannot exceed 100 kg.';
    } else if (error.message.includes('Must start with \'ipfs://\'')) {
      parsedError.name = 'Invalid IPFS URI';
      parsedError.message = 'Metadata URI must be a valid IPFS URI starting with "ipfs://".';
    } else if (error.message.includes('User rejected')) {
      parsedError.name = 'Transaction Rejected';
      parsedError.message = 'Transaction was rejected by the user.';
    } else if (error.message.includes('insufficient funds')) {
      parsedError.name = 'Insufficient Funds';
      parsedError.message = 'Insufficient funds to complete the transaction.';
    } else if (error.message.includes('network')) {
      parsedError.name = 'Network Error';
      parsedError.message = 'Network connection error. Please check your connection and try again.';
    }

    return parsedError;
  }

  // Handle wallet connection errors
  if (error.code === 4001) {
    return {
      name: 'Transaction Rejected',
      message: 'Transaction was rejected by the user.',
      code: error.code,
    };
  }

  if (error.code === -32603) {
    return {
      name: 'Internal Error',
      message: 'Internal JSON-RPC error. Please try again.',
      code: error.code,
    };
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR') {
    return {
      name: 'Network Error',
      message: 'Unable to connect to the network. Please check your connection.',
      code: error.code,
    };
  }

  // Handle timeout errors
  if (error.code === 'TIMEOUT') {
    return {
      name: 'Transaction Timeout',
      message: 'Transaction timed out. Please try again.',
      code: error.code,
    };
  }

  return defaultError;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  const parsedError = parseContractError(error);
  return parsedError.message;
};

/**
 * Check if error is a user rejection
 */
export const isUserRejection = (error: any): boolean => {
  if (!error) return false;
  
  return (
    error.code === 4001 ||
    error.message?.includes('User rejected') ||
    error.message?.includes('user rejected') ||
    error.name === 'UserRejectedRequestError'
  );
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  return (
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('network') ||
    error.message?.includes('Network') ||
    error.message?.includes('connection')
  );
};

/**
 * Check if error is insufficient funds
 */
export const isInsufficientFunds = (error: any): boolean => {
  if (!error) return false;
  
  return (
    error.message?.includes('insufficient funds') ||
    error.message?.includes('Insufficient funds') ||
    error.reason?.includes('insufficient funds')
  );
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error: any, context?: string): string => {
  const parsedError = parseContractError(error);
  const timestamp = new Date().toISOString();
  
  return `[${timestamp}] ${context ? `[${context}] ` : ''}${parsedError.name}: ${parsedError.message}${
    parsedError.code ? ` (Code: ${parsedError.code})` : ''
  }`;
};

/**
 * Error boundary for React components
 */
export class Web3ErrorBoundary extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'Web3ErrorBoundary';
  }
}

/**
 * Retry mechanism for failed transactions
 */
export const retryTransaction = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry user rejections
      if (isUserRejection(error)) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Validate transaction parameters
 */
export const validateTransactionParams = (params: {
  address?: string;
  amount?: number;
  tokenId?: number;
}): void => {
  if (params.address && !isValidAddress(params.address)) {
    throw new Error('Invalid address format');
  }
  
  if (params.amount !== undefined && (params.amount < 0 || !Number.isInteger(params.amount))) {
    throw new Error('Amount must be a positive integer');
  }
  
  if (params.tokenId !== undefined && (params.tokenId < 1 || !Number.isInteger(params.tokenId))) {
    throw new Error('Token ID must be a positive integer');
  }
};

/**
 * Simple address validation
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Format transaction hash for display
 */
export const formatTxHash = (hash: string, length: number = 10): string => {
  if (!hash || hash.length < length) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-6)}`;
};

/**
 * Get block explorer URL for transaction
 */
export const getBlockExplorerUrl = (hash: string, type: 'tx' | 'address' = 'tx'): string => {
  const baseUrl = 'https://sepolia-blockscout.lisk.com';
  return `${baseUrl}/${type}/${hash}`;
};