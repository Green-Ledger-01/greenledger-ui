import React, { useState, useEffect } from 'react';
import { User, ArrowRight, Clock, MapPin, FileText, RefreshCw } from 'lucide-react';
import { VerificationResult } from '../types/verification';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { formatAddress, formatTimestamp } from '../utils/format';

interface OwnershipTransfer {
  from: string;
  to: string;
  timestamp: number;
  location?: string;
  notes?: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface QROwnershipManagerProps {
  verificationResult?: VerificationResult;
  tokenId?: number;
  className?: string;
}

export const QROwnershipManager: React.FC<QROwnershipManagerProps> = ({
  verificationResult,
  tokenId,
  className = ''
}) => {
  const [ownershipHistory, setOwnershipHistory] = useState<OwnershipTransfer[]>([]);
  const [currentOwner, setCurrentOwner] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { getBatchDetails } = useCropBatchToken();
  
  const actualTokenId = verificationResult?.tokenId || tokenId?.toString() || '';

  const fetchOwnership = async () => {
    if (!actualTokenId) return;
    
    setIsLoading(true);
    try {
      const batch = await getBatchDetails(parseInt(actualTokenId));
      if (batch) {
        setCurrentOwner(batch.owner);
      }
    } catch (error) {
      console.error('Failed to fetch ownership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnership();
    
    // Mock ownership history - replace with actual blockchain data
    const mockHistory: OwnershipTransfer[] = [
      {
        from: '0x1234...5678',
        to: '0x2345...6789',
        timestamp: Date.now() - 86400000 * 2,
        location: 'Green Valley Farm, CA',
        notes: 'Initial harvest and tokenization',
        txHash: '0xabc123...',
        status: 'confirmed'
      },
      {
        from: '0x2345...6789',
        to: '0x3456...7890',
        timestamp: Date.now() - 86400000,
        location: 'Distribution Center, CA',
        notes: 'Transfer to distributor',
        txHash: '0xdef456...',
        status: 'confirmed'
      },
      {
        from: '0x3456...7890',
        to: '0x4567...8901',
        timestamp: Date.now() - 3600000,
        location: 'Fresh Market, CA',
        notes: 'Final delivery to retailer',
        txHash: '0xghi789...',
        status: 'pending'
      }
    ];

    setOwnershipHistory(mockHistory);
    if (!currentOwner) {
      setCurrentOwner(mockHistory[mockHistory.length - 1]?.to || '');
    }
  }, [actualTokenId]);



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleFromAddress = (address: string) => {
    // Mock role detection - replace with actual role lookup
    const roles: Record<string, string> = {
      '0x1234...5678': 'Farmer',
      '0x2345...6789': 'Transporter',
      '0x3456...7890': 'Distributor',
      '0x4567...8901': 'Retailer'
    };
    return roles[address] || 'Unknown';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Ownership & Transfer History</h3>
        </div>
        <button
          onClick={fetchOwnership}
          disabled={isLoading}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Current Owner */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-blue-700 font-medium">Current Owner</div>
            <div className="font-mono text-sm">{formatAddress(currentOwner)}</div>
            <div className="text-xs text-blue-600">{getRoleFromAddress(currentOwner)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-600">Token ID</div>
            <div className="font-mono text-sm">{actualTokenId}</div>
          </div>
        </div>
      </div>

      {/* Transfer History */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Transfer History</h4>
        
        {ownershipHistory.map((transfer, index) => (
          <div key={index} className="relative">
            {/* Connection Line */}
            {index < ownershipHistory.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
            )}
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{getRoleFromAddress(transfer.from)}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-medium">{getRoleFromAddress(transfer.to)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                    {transfer.status}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(transfer.timestamp)}</span>
                  </div>
                  
                  {transfer.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{transfer.location}</span>
                    </div>
                  )}
                  
                  {transfer.notes && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <FileText className="w-3 h-3" />
                      <span>{transfer.notes}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 font-mono">
                    Tx: {transfer.txHash}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{ownershipHistory.length}</div>
            <div className="text-xs text-gray-600">Transfers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {new Set(ownershipHistory.map(t => getRoleFromAddress(t.from))).size}
            </div>
            <div className="text-xs text-gray-600">Parties</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {Math.round((Date.now() - ownershipHistory[0]?.timestamp) / 86400000)}
            </div>
            <div className="text-xs text-gray-600">Days</div>
          </div>
        </div>
      </div>
    </div>
  );
};