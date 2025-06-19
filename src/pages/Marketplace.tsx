import React, { useState, useCallback } from 'react';
import { Filter, Search, Info, RefreshCw, Wifi, WifiOff, Clock, AlertCircle } from 'lucide-react';
import { useRealTimeMarketplace } from '../hooks/useRealTimeMarketplace';
import { useToast } from '../contexts/ToastContext';
import CropBatchCard from '../components/CropBatchCard';
import CropBatchCardSkeleton from '../components/CropBatchCardSkeleton';

const Marketplace: React.FC = () => {
  const { addToast } = useToast();
  const {
    batches,
    isLoading,
    error,
    refetchBatches,
    totalBatches,
    isRefreshing,
    lastUpdateTime,
    connectionStatus,
  } = useRealTimeMarketplace();
  
  const [filterCropType, setFilterCropType] = useState('');
  const [filterFarmName, setFilterFarmName] = useState('');
  const [filterSupplyChainStatus, setFilterSupplyChainStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter batches based on search criteria
  const filteredBatches = batches.filter(batch => {
    const matchesCropType = filterCropType ? 
      batch.cropType.toLowerCase().includes(filterCropType.toLowerCase()) : true;
    const matchesFarmName = filterFarmName ? 
      batch.originFarm.toLowerCase().includes(filterFarmName.toLowerCase()) : true;
    const matchesSupplyChainStatus = filterSupplyChainStatus ? 
      batch.supplyChainStatus === filterSupplyChainStatus : true;
    const matchesSearch = searchQuery ? 
      JSON.stringify(batch).toLowerCase().includes(searchQuery.toLowerCase()) : true;
    
    return matchesCropType && matchesFarmName && matchesSupplyChainStatus && matchesSearch;
  });

  // Get unique values for filter options
  const uniqueCropTypes = [...new Set(batches.map(batch => batch.cropType))];
  const uniqueFarms = [...new Set(batches.map(batch => batch.originFarm))];
  const uniqueSupplyChainStatuses = [...new Set(batches.map(batch => batch.supplyChainStatus))];

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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          GreenLedger Marketplace
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover and explore crop batches from verified farms with real-time blockchain tracking
        </p>
      </div>

      {/* Connection Status & Stats Bar */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getConnectionStatusIcon()}
              <span className="text-sm font-medium text-gray-700">
                {getConnectionStatusText()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last update: {formatLastUpdate(lastUpdateTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{totalBatches}</span> total batches
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
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

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
            <select
              value={filterCropType}
              onChange={(e) => setFilterCropType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">All Crop Types</option>
              {uniqueCropTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
            <select
              value={filterFarmName}
              onChange={(e) => setFilterFarmName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">All Farms</option>
              {uniqueFarms.map(farm => (
                <option key={farm} value={farm}>{farm}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
            <select
              value={filterSupplyChainStatus}
              onChange={(e) => setFilterSupplyChainStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">All Supply Chain Stages</option>
              {uniqueSupplyChainStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
            <input
              type="text"
              placeholder="Search all batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Active Filters */}
        {(filterCropType || filterFarmName || filterSupplyChainStatus || searchQuery) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filterCropType && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Crop: {filterCropType}
                <button
                  onClick={() => setFilterCropType('')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterFarmName && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Farm: {filterFarmName}
                <button
                  onClick={() => setFilterFarmName('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterSupplyChainStatus && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Status: {filterSupplyChainStatus.charAt(0).toUpperCase() + filterSupplyChainStatus.slice(1)}
                <button
                  onClick={() => setFilterSupplyChainStatus('')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
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

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {isLoading ? 'Loading...' : `${filteredBatches.length} batch${filteredBatches.length !== 1 ? 'es' : ''} found`}
        </p>
        <div className="text-sm text-gray-500">
          {connectionStatus === 'connected' && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live updates enabled
            </span>
          )}
        </div>
      </div>

      {/* Batch Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <CropBatchCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {filteredBatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBatches.map((batch) => (
                <CropBatchCard key={batch.tokenId} batch={batch} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {batches.length === 0 ? 'No crop batches available' : 'No batches match your filters'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {batches.length === 0 
                    ? 'No crop batches have been minted yet. Be the first to create one!'
                    : 'Try adjusting your search criteria to find more results.'
                  }
                </p>
                {batches.length === 0 ? (
                  <button
                    onClick={handleRefresh}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Marketplace;