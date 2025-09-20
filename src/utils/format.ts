export const formatAddress = (address: string): string => {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return 'No address';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

export const formatTxHash = (hash: string): string => {
  return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
};