import React, { useState, useEffect } from 'react';
import { RefreshCw, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { useToast } from '../contexts/ToastContext';

interface OwnershipTrackerProps {
  tokenId: number;
  className?: string;
}

const OwnershipTracker: React.FC<OwnershipTrackerProps> = ({ tokenId, className = '' }) => {
  const { getBatchDetails, refreshTrigger } = useCropBatchToken();
  const { addToast } = useToast();
  const [owner, setOwner] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [updateCount, setUpdateCount] = useState(0);

  const fetchOwnership = async () => {
    setIsLoading(true);
    try {
      const batch = await getBatchDetails(tokenId);
      if (batch) {
        const newOwner = batch.owner;
        if (newOwner !== owner && owner !== '') {
          // Ownership changed!
          addToast(`Token #${tokenId} ownership changed to ${newOwner.slice(0, 6)}...${newOwner.slice(-4)}`, 'success');
          setUpdateCount(prev => prev + 1);
        }
        setOwner(newOwner);
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('Failed to fetch ownership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOwnership();
  }, [tokenId]);

  // Auto-refresh when transfer events are detected
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log(`Auto-refreshing ownership for token ${tokenId} due to transfer event`);
      fetchOwnership();
    }
  }, [refreshTrigger]);

  const formatAddress = (address: string) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      return 'No owner';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatLastUpdate = () => {
    const now = Date.now();
    const diff = now - lastUpdated;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s ago`;
    }
    return `${seconds}s ago`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Token #{tokenId} Ownership
        </h3>
        <button
          onClick={fetchOwnership}
          disabled={isLoading}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-mono text-gray-900">
            {formatAddress(owner)}
          </span>
          {updateCount > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">
                Updated {updateCount} time{updateCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Last checked: {formatLastUpdate()}</span>
        </div>

        {refreshTrigger > 0 && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <AlertCircle className="h-3 w-3" />
            <span>Live updates enabled (trigger: {refreshTrigger})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnershipTracker;
