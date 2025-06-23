import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Package,
  Truck,
  ShoppingCart,
  MapPin,
  Calendar,
  User,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  LoadingOutlined
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
import { useProvenanceHistory, useTransferWithProvenance } from '../hooks/useSupplyChainManager';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { fetchMetadataFromIPFS, CropMetadata } from '../utils/ipfs';
import { CONTRACT_ADDRESSES } from '../config/constants';

interface SupplyChainTrackerProps {
  tokenId?: number;
}

const SupplyChainTracker: React.FC<SupplyChainTrackerProps> = ({ tokenId: propTokenId }) => {
  const { tokenId: paramTokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { hasRole } = useWeb3Enhanced();

  // Helper function to check if user can perform action
  const canPerformAction = (role: string) => hasRole(role);

  const tokenId = propTokenId || (paramTokenId ? parseInt(paramTokenId) : null);

  // Real blockchain data state
  const [selectedTokenId, setSelectedTokenId] = useState<number>(tokenId || 1);
  const [transferAddress, setTransferAddress] = useState('');
  const [transferType, setTransferType] = useState<'transporter' | 'buyer'>('transporter');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentHistory, setCurrentHistory] = useState<any>(null);
  const [batchMetadata, setBatchMetadata] = useState<CropMetadata | null>(null);

  // Real blockchain hooks
  const { getAllBatches } = useCropBatchToken();
  const { data: provenanceHistory, refetch: refetchProvenance } = useProvenanceHistory(BigInt(selectedTokenId));
  const { writeAsync: transferWithProvenance, isPending: isTransferring } = useTransferWithProvenance();

  // Real blockchain functions
  const getSupplyChainHistory = useCallback(async (tokenId: number) => {
    setIsLoadingHistory(true);
    try {
      // Fetch batch metadata from IPFS
      const allBatches = await getAllBatches();
      const batch = allBatches.find(b => b.tokenId === tokenId);

      if (batch && batch.metadataUri) {
        try {
          const metadata = await fetchMetadataFromIPFS(batch.metadataUri);
          setBatchMetadata(metadata);
        } catch (error) {
          console.warn('Failed to fetch metadata:', error);
          setBatchMetadata({
            name: `Batch #${tokenId}`,
            description: `${batch.cropType} from ${batch.originFarm}`,
            image: '',
            attributes: [],
            cropType: batch.cropType,
            quantity: batch.quantity,
            originFarm: batch.originFarm,
            harvestDate: batch.harvestDate,
            notes: batch.notes,
          });
        }
      }

      // Refetch provenance history
      await refetchProvenance();

      // Process provenance data into history format
      if (provenanceHistory && provenanceHistory.length > 0) {
        const processedHistory = {
          currentStep: provenanceHistory.length - 1,
          isComplete: provenanceHistory.length >= 3, // farmer -> transporter -> buyer
          steps: provenanceHistory.map((entry: any, index: number) => ({
            role: index === 0 ? 'farmer' : index === 1 ? 'transporter' : 'buyer',
            address: entry.from || entry.to,
            timestamp: Number(entry.timestamp),
            transactionHash: entry.transactionHash,
            location: entry.location || '',
            notes: entry.notes || '',
          }))
        };
        setCurrentHistory(processedHistory);
      } else {
        setCurrentHistory(null);
      }

      addToast('Supply chain history loaded', 'success');
    } catch (error) {
      console.error('Failed to fetch supply chain history:', error);
      addToast('Failed to load supply chain history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [getAllBatches, refetchProvenance, provenanceHistory, addToast]);

  const canTransferTo = useCallback((role: string) => {
    // Check if user has permission to transfer to this role
    return hasRole('farmer') || hasRole('transporter') || hasRole('buyer');
  }, [hasRole]);

  const validateTransferRecipient = useCallback(async (address: string, role: string) => {
    // Basic address validation
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return false;
    }
    // In a real implementation, you might check if the address has the required role
    return true;
  }, []);

  // Load supply chain history when token ID changes
  useEffect(() => {
    if (selectedTokenId) {
      getSupplyChainHistory(selectedTokenId);
    }
  }, [selectedTokenId, getSupplyChainHistory]);

  // Handle transfer submission
  const handleTransfer = async () => {
    if (!transferAddress || !selectedTokenId) {
      addToast('Please enter a valid address', 'error');
      return;
    }

    setIsValidatingAddress(true);
    const isValid = await validateTransferRecipient(transferAddress, transferType);
    setIsValidatingAddress(false);

    if (!isValid) {
      addToast(`Invalid ${transferType} address. Please check the address and role.`, 'error');
      return;
    }

    try {
      // Determine the new state based on transfer type
      const newState = transferType === 'transporter' ? 1 : 2; // 1 = IN_TRANSIT, 2 = DELIVERED

      // Use the real transfer function from the hook
      await transferWithProvenance({
        tokenId: BigInt(selectedTokenId),
        to: transferAddress,
        newState: newState,
        location: '', // location (could be added to form)
        notes: `Transfer to ${transferType}`
      });

      setShowTransferModal(false);
      setTransferAddress('');
      addToast('Transfer initiated successfully', 'success');

      // Refresh the supply chain history after transfer
      setTimeout(() => {
        getSupplyChainHistory(selectedTokenId);
      }, 2000);
    } catch (error) {
      console.error('Transfer failed:', error);
      addToast('Transfer failed', 'error');
    }
  };

  // Supply chain steps configuration
  const supplyChainSteps = [
    {
      id: 0,
      role: 'farmer' as const,
      title: 'Farm Production',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      description: 'Crop harvested and tokenized by farmer',
    },
    {
      id: 1,
      role: 'transporter' as const,
      title: 'Transportation',
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      description: 'Batch in transit to distribution center',
    },
    {
      id: 2,
      role: 'buyer' as const,
      title: 'Final Destination',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      description: 'Delivered to final buyer/retailer',
    },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStepStatus = (stepId: number) => {
    if (!currentHistory) return 'pending';
    if (stepId < currentHistory.currentStep) return 'completed';
    if (stepId === currentHistory.currentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (stepId: number, status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    } else if (status === 'active') {
      return <Circle className="h-6 w-6 text-blue-600 animate-pulse" />;
    } else {
      return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Supply Chain Tracker
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track your crop batches through the complete supply chain journey
        </p>
      </div>

      {/* Token ID Selector */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch Token ID
            </label>
            <input
              id="tokenId"
              type="number"
              min="1"
              value={selectedTokenId}
              onChange={(e) => setSelectedTokenId(parseInt(e.target.value) || 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter token ID"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => getSupplyChainHistory(selectedTokenId)}
              disabled={isLoadingHistory}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
              {isLoadingHistory ? 'Loading...' : 'Track Batch'}
            </button>
            
            {(hasRole('farmer') || hasRole('transporter') || hasRole('buyer')) && (
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                Transfer Ownership
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Batch Information */}
      {batchMetadata && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Batch Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {batchMetadata.name}</p>
              <p><strong>Crop Type:</strong> {batchMetadata.cropType}</p>
              <p><strong>Quantity:</strong> {batchMetadata.quantity} kg</p>
              <p><strong>Origin Farm:</strong> {batchMetadata.originFarm}</p>
            </div>
            <div>
              <p><strong>Description:</strong> {batchMetadata.description}</p>
              {batchMetadata.notes && <p><strong>Notes:</strong> {batchMetadata.notes}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Supply Chain Flow */}
      {currentHistory && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Batch #{selectedTokenId} Supply Chain Journey
          </h2>
          
          {/* Progress Steps */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${(currentHistory.currentStep / (supplyChainSteps.length - 1)) * 100}%` }}
              />
            </div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {supplyChainSteps.map((step, index) => {
                const status = getStepStatus(step.id);
                const StepIcon = step.icon;
                const historyStep = currentHistory.steps.find(s => s.role === step.role);
                
                return (
                  <div key={step.id} className="flex flex-col items-center max-w-xs">
                    {/* Step Circle */}
                    <div className={`
                      relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 
                      ${status === 'completed' ? 'bg-green-100 border-green-500' : 
                        status === 'active' ? 'bg-blue-100 border-blue-500' : 
                        'bg-gray-100 border-gray-300'}
                    `}>
                      {getStepIcon(step.id, status)}
                    </div>
                    
                    {/* Step Content */}
                    <div className="mt-4 text-center">
                      <h3 className={`font-semibold ${
                        status === 'completed' ? 'text-green-700' :
                        status === 'active' ? 'text-blue-700' :
                        'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.description}
                      </p>
                      
                      {/* Step Details */}
                      {historyStep && (
                        <div className={`mt-3 p-3 rounded-lg border ${step.borderColor} ${step.bgColor}`}>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-3 w-3" />
                            <span>{formatAddress(historyStep.address)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(historyStep.timestamp)}</span>
                          </div>
                          {historyStep.transactionHash && (
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <ExternalLink className="h-3 w-3" />
                              <a 
                                href={`${import.meta.env.VITE_APP_EXPLORER_URL}/tx/${historyStep.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                View Transaction
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Completion Status */}
          <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              {currentHistory.isComplete ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Supply Chain Complete</h3>
                    <p className="text-sm text-green-700">
                      This batch has successfully completed its journey through the supply chain.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">In Progress</h3>
                    <p className="text-sm text-blue-700">
                      This batch is currently at step {currentHistory.currentStep + 1} of {supplyChainSteps.length}.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transfer Batch #{selectedTokenId}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer To
                </label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as 'transporter' | 'buyer')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="transporter">Transporter</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={isTransferring || isValidatingAddress || !transferAddress}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isValidatingAddress ? 'Validating...' :
                 isTransferring ? 'Transferring...' :
                 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoadingHistory && !currentHistory && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading supply chain history...</p>
        </div>
      )}

      {/* No Data State */}
      {!isLoadingHistory && !currentHistory && selectedTokenId && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Supply Chain Data Found
          </h3>
          <p className="text-gray-600 mb-4">
            Unable to find supply chain history for batch #{selectedTokenId}.
          </p>
          <button
            onClick={() => getSupplyChainHistory(selectedTokenId)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SupplyChainTracker;