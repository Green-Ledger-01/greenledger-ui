/**
 * Error Handling Utilities
 * Centralized error message processing for better UX
 */

export const getErrorMessage = (error: any): string => {
  if (error instanceof Error) {
    // Handle common Web3/Wagmi errors
    if (error.message.includes('User rejected the request')) {
      return 'Transaction rejected by user.';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction.';
    }
    if (error.message.includes('AccessControl')) {
      return 'You do not have the required role to perform this action.';
    }
    if (error.message.includes('Invalid role')) {
      return 'Invalid role specified.';
    }
    if (error.message.includes('execution reverted')) {
      return 'Transaction failed: Smart contract execution reverted.';
    }
    if (error.message.includes('network')) {
      return 'Network error: Please check your connection and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timeout: Please try again.';
    }
    
    // Return the short message if available, otherwise the full message
    return (error as any).shortMessage || error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
};

export const formatTxHash = (hash: string | undefined): string => {
  if (!hash) return '';
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

export const getBlockExplorerUrl = (
  hash: string, 
  type: 'tx' | 'address' = 'tx', 
  chainId?: number
): string => {
  // For Lisk Sepolia - you can extend this for other chains
  const explorer = 'https://sepolia-blockscout.lisk.com';
  return `${explorer}/${type}/${hash}`;
};

export const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};