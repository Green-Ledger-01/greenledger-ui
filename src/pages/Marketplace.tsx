import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Filter, Search, Info, RefreshCw, Wifi, WifiOff, Clock, AlertCircle, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { fetchMetadataFromIPFS, CropMetadata } from '../utils/ipfs';
import CropBatchCard from '../components/CropBatchCard';
import CropBatchCardSkeleton from '../components/CropBatchCardSkeleton';
import { secureLog, secureError, secureWarn } from '../utils/secureLogger';

const Marketplace: React.FC = () => {
  const { addToast } = useToast();
  const { isConnected } = useWeb3Enhanced();
  const { getAllBatches, isLoading, error, refreshTrigger } = useCropBatchToken();
  const { totalItems, toggleCart } = useCart();

  // Real blockchain data with IPFS metadata
  const [batches, setBatches] = useState<(CropMetadata & {
    tokenId: number;
    owner?: string;
    supplyChainStatus?: 'farmer' | 'transporter' | 'buyer';
    lastUpdated?: number;
  })[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdateTime = Date.now();
  const connectionStatus = isConnected ? 'connected' : 'disconnected';
  
  const [filterCropType, setFilterCropType] = useState('');
  const [filterFarmName, setFilterFarmName] = useState('');
  const [filterSupplyChainStatus, setFilterSupplyChainStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'quantity'>('newest');

  // Load batches from blockchain and fetch metadata from IPFS with rate limiting
  const refetchBatches = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const blockchainBatches = await getAllBatches();

      // Process batches in smaller chunks to avoid overwhelming IPFS gateways
      const chunkSize = 3; // Process 3 batches at a time
      const batchChunks = [];
      for (let i = 0; i < blockchainBatches.length; i += chunkSize) {
        batchChunks.push(blockchainBatches.slice(i, i + chunkSize));
      }

      const allBatchesWithMetadata = [];

      // Process each chunk with a delay between chunks
      for (let i = 0; i < batchChunks.length; i++) {
        const chunk = batchChunks[i];

        const chunkResults = await Promise.allSettled(
          chunk.map(async (batch) => {
            try {
              if (!batch.metadataUri) {
                // If no metadata URI, create a basic metadata object
                return {
                  tokenId: batch.tokenId,
                  name: `Batch #${batch.tokenId}`,
                  description: `${batch.cropType} from ${batch.originFarm}`,
                  image: '', // Will use placeholder
                  attributes: [],
                  cropType: batch.cropType,
                  quantity: batch.quantity,
                  originFarm: batch.originFarm,
                  harvestDate: batch.harvestDate,
                  notes: batch.notes,
                  owner: batch.owner,
                  lastUpdated: batch.timestamp,
                };
              }

              const metadata = await fetchMetadataFromIPFS(batch.metadataUri);
              return {
                ...metadata,
                tokenId: batch.tokenId,
                owner: batch.owner,
                lastUpdated: batch.timestamp,
              };
            } catch (error) {
              secureWarn('Failed to fetch metadata for batch:', batch.tokenId, error);
              // Return basic metadata if IPFS fetch fails
              return {
                tokenId: batch.tokenId,
                name: `Batch #${batch.tokenId}`,
                description: `${batch.cropType} from ${batch.originFarm}`,
                image: '', // Will use placeholder
                attributes: [],
                cropType: batch.cropType,
                quantity: batch.quantity,
                originFarm: batch.originFarm,
                harvestDate: batch.harvestDate,
                notes: batch.notes,
                owner: batch.owner,
                lastUpdated: batch.timestamp,
              };
            }
          })
        );

        // Extract successful results from this chunk
        const successfulChunkBatches = chunkResults
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map(result => result.value);

        allBatchesWithMetadata.push(...successfulChunkBatches);

        // Add delay between chunks to avoid rate limiting (except for the last chunk)
        if (i < batchChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      setBatches(allBatchesWithMetadata);
      addToast('Marketplace data refreshed', 'success');
    } catch (error) {
      secureError('Failed to fetch batches:', error);
      addToast('Failed to refresh marketplace data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [getAllBatches, addToast]);

  // Load batches on mount
  useEffect(() => {
    refetchBatches();
  }, [refetchBatches]);

  // Auto-refresh when transfer events are detected
  useEffect(() => {
    if (refreshTrigger > 0) {
      secureLog('Auto-refreshing marketplace due to transfer event');
      refetchBatches();
    }
  }, [refreshTrigger, refetchBatches]);

  // Format last update time
  const formatLastUpdate = useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    addToast('Refreshing marketplace data...', 'info');
    await refetchBatches();
  }, [refetchBatches, addToast]);

  // Filter and sort batches based on search criteria
  const filteredAndSortedBatches = useMemo(() => {
    // Filter batches
    const filtered = batches.filter(batch => {
      const matchesCropType = filterCropType ?
        (batch.cropType && batch.cropType.toLowerCase().includes(filterCropType.toLowerCase())) : true;
      const matchesFarmName = filterFarmName ?
        (batch.originFarm && batch.originFarm.toLowerCase().includes(filterFarmName.toLowerCase())) : true;
      const matchesSupplyChainStatus = filterSupplyChainStatus ?
        batch.supplyChainStatus === filterSupplyChainStatus : true;
      const matchesSearch = searchQuery ?
        JSON.stringify(batch).toLowerCase().includes(searchQuery.toLowerCase()) : true;

      return matchesCropType && matchesFarmName && matchesSupplyChainStatus && matchesSearch;
    });

    // Sort batches
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.lastUpdated || 0) - (a.lastUpdated || 0);
        case 'oldest':
          return (a.lastUpdated || 0) - (b.lastUpdated || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'quantity':
          return (b.quantity || 0) - (a.quantity || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [batches, filterCropType, filterFarmName, filterSupplyChainStatus, searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedBatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBatches = filteredAndSortedBatches.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCropType, filterFarmName, filterSupplyChainStatus, searchQuery, sortBy]);

  // Get unique values for filter options
  const uniqueCropTypes = [...new Set(batches.map(batch => batch.cropType).filter(Boolean))];
  const uniqueFarms = [...new Set(batches.map(batch => batch.originFarm).filter(Boolean))];
  const uniqueSupplyChainStatuses = [...new Set(batches.map(batch => batch.supplyChainStatus).filter(Boolean))];

  // Connection status indicator
  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to blockchain';
      case 'disconnected':
        return 'Disconnected from blockchain';
      case 'syncing':
        return 'Syncing with blockchain';
      default:
        return 'Unknown connection status';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Compact Header with Controls */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Title and Stats */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
                <div className="flex items-center gap-2">
                  {getConnectionStatusIcon()}
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold">{batches.length}</span> batches
                    {filteredAndSortedBatches.length !== batches.length && (
                      <span className="text-gray-500"> • {filteredAndSortedBatches.length} filtered</span>
                    )}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Discover crop batches from verified farms with blockchain tracking
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="quantity">Quantity High-Low</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>

              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className="relative bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-all"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Connection Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filterCropType}
            onChange={(e) => setFilterCropType(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Crop Types</option>
            {uniqueCropTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterFarmName}
            onChange={(e) => setFilterFarmName(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Farms</option>
            {uniqueFarms.map(farm => (
              <option key={farm} value={farm}>{farm}</option>
            ))}
          </select>

          <select
            value={filterSupplyChainStatus}
            onChange={(e) => setFilterSupplyChainStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Stages</option>
            {uniqueSupplyChainStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Active Filters */}
        {(filterCropType || filterFarmName || filterSupplyChainStatus || searchQuery) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filterCropType && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                {filterCropType}
                <button onClick={() => setFilterCropType('')} className="ml-1 text-green-600 hover:text-green-800">×</button>
              </span>
            )}
            {filterFarmName && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                {filterFarmName}
                <button onClick={() => setFilterFarmName('')} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
              </span>
            )}
            {filterSupplyChainStatus && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                {filterSupplyChainStatus.charAt(0).toUpperCase() + filterSupplyChainStatus.slice(1)}
                <button onClick={() => setFilterSupplyChainStatus('')} className="ml-1 text-purple-600 hover:text-purple-800">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1 text-yellow-600 hover:text-yellow-800">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setFilterCropType('');
                setFilterFarmName('');
                setFilterSupplyChainStatus('');
                setSearchQuery('');
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Summary & Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' :
              `Showing ${startIndex + 1}-${Math.min(endIndex, filteredAndSortedBatches.length)} of ${filteredAndSortedBatches.length} batch${filteredAndSortedBatches.length !== 1 ? 'es' : ''}`
            }
          </p>

          {/* Items per page selector */}
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={48}>48 per page</option>
            <option value={96}>96 per page</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          {connectionStatus === 'connected' && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live updates enabled
            </span>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm text-gray-600 px-3">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Batch Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(itemsPerPage)].map((_, i) => (
            <CropBatchCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {currentBatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentBatches.map((batch) => (
                <CropBatchCard key={batch.tokenId} batch={batch} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100">
                <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Info className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {batches.length === 0 ? 'No crop batches available' : 'No batches match your filters'}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {batches.length === 0
                    ? 'No crop batches have been minted yet. Be the first to create one!'
                    : 'Try adjusting your search criteria to find more results.'
                  }
                </p>
                {batches.length === 0 ? (
                  <button
                    onClick={handleRefresh}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Refresh Data
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setFilterCropType('');
                      setFilterFarmName('');
                      setFilterSupplyChainStatus('');
                      setSearchQuery('');
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>

          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Marketplace;