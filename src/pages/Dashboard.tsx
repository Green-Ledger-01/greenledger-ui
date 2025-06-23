import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Zap, TrendingUp, Users, Package, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { useUserTokenHistory, useTokensByState } from '../hooks/useSupplyChainManager';
import CartCheckoutSection from '../components/CartCheckoutSection';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole, isConnected, account } = useWeb3Enhanced();
  const { getAllBatches, isLoading, error } = useCropBatchToken();

  // Real-time blockchain data hooks
  const { data: userTokenHistory } = useUserTokenHistory(account);
  const { data: producedTokens } = useTokensByState(0); // Produced state
  const { data: inTransitTokens } = useTokensByState(1); // InTransit state
  const { data: deliveredTokens } = useTokensByState(2); // Delivered state

  // Helper function to check if user can perform action
  const canPerformAction = React.useCallback((role: string) => hasRole(role), [hasRole]);

  // Real blockchain data
  const [batches, setBatches] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const connectionStatus = isConnected ? 'connected' : 'disconnected';
  const lastUpdateTime = React.useMemo(() => Date.now(), []);
  
  const [liveStats, setLiveStats] = useState({
    totalBatches: 0,
    activeFarms: 0,
    registeredUsers: 0,
    recentTransactions: 0,
  });

  const quickActions = [
    {
      title: 'Register Role',
      description: 'Manage user roles and permissions',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      path: '/register',
      requiresRole: 'admin' as const,
    },
    {
      title: 'Tokenize Crop',
      description: 'Create new crop batch NFTs',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/tokenize',
      requiresRole: 'farmer' as const,
    },
    {
      title: 'Browse Marketplace',
      description: 'Explore available crop batches',
      icon: Activity,
      color: 'bg-purple-500 hover:bg-purple-600',
      path: '/marketplace',
    },
    {
      title: 'Track Supply Chain',
      description: 'Monitor batch movements',
      icon: MapPin,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      path: '/track',
    },
  ];

  // Load batches from blockchain
  const refetchBatches = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const allBatches = await getAllBatches();
      setBatches(allBatches);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [getAllBatches]);

  // Load batches on mount
  useEffect(() => {
    refetchBatches();
  }, [refetchBatches]);

  // Update live stats when data changes
  useEffect(() => {
    if (!account) {
      // Show platform-wide stats when not connected
      setLiveStats({
        totalBatches: 0,
        activeFarms: 0,
        registeredUsers: 0,
        recentTransactions: 0,
      });
      return;
    }

    // User-specific data calculations
    const userBatches = batches.filter(batch =>
      batch.owner?.toLowerCase() === account.toLowerCase() ||
      batch.minter?.toLowerCase() === account.toLowerCase()
    );

    const uniqueFarms = new Set(userBatches.map(batch => batch.originFarm)).size;
    const recentBatches = userBatches.filter(batch =>
      batch.timestamp && Date.now() - batch.timestamp < 86400000 // 24 hours
    ).length;

    // Calculate real-time stats from blockchain data per connected address
    const totalSupplyChainTokens = (producedTokens || 0) + (inTransitTokens || 0) + (deliveredTokens || 0);
    const userInteractionCount = userTokenHistory ? userTokenHistory.length : 0;

    setLiveStats({
      totalBatches: userBatches.length, // User's batches only
      activeFarms: uniqueFarms, // Farms user has interacted with
      registeredUsers: totalSupplyChainTokens, // Platform-wide token count
      recentTransactions: recentBatches + userInteractionCount, // User's activity
    });
  }, [batches, producedTokens, inTransitTokens, deliveredTokens, userTokenHistory, account]);

  const stats = React.useMemo(() => [
    {
      label: 'Your Batches',
      value: liveStats.totalBatches.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      isLive: true
    },
    {
      label: 'Active Farms',
      value: liveStats.activeFarms.toString(),
      icon: MapPin,
      color: 'text-green-600',
      isLive: true
    },
    {
      label: 'Platform Tokens',
      value: liveStats.registeredUsers.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
      isLive: true
    },
    {
      label: 'Your Activity',
      value: liveStats.recentTransactions.toLocaleString(),
      icon: TrendingUp,
      color: 'text-orange-600',
      isLive: true
    },
  ], [liveStats]);

  const formatLastUpdate = React.useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  }, []);

  const getConnectionIcon = React.useCallback(() => {
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
  }, [connectionStatus]);

  const handleQuickAction = React.useCallback((action: typeof quickActions[0]) => {
    if (action.disabled) return;
    if (action.requiresRole && !canPerformAction(action.requiresRole)) {
      return; // Button should be disabled, but just in case
    }
    navigate(action.path);
  }, [canPerformAction, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Compact Header */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex items-center gap-2">
                  {getConnectionIcon()}
                  <span className="text-sm text-gray-600">
                    {connectionStatus === 'connected' ? 'Connected' :
                     connectionStatus === 'disconnected' ? 'Disconnected' :
                     'Syncing'}
                  </span>
                  {connectionStatus === 'connected' && account && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Your blockchain-powered agricultural supply chain management platform
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/marketplace')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all text-sm"
              >
                <Activity className="h-4 w-4" />
                Marketplace
              </button>
              <button
                onClick={() => navigate('/tokenize')}
                className="flex items-center gap-2 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all border border-gray-200 text-sm"
              >
                <Package className="h-4 w-4" />
                Create Batch
              </button>
            </div>
          </div>
        </div>

        {/* Compact Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-100 relative">
                {stat.isLive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                <div className="text-center">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-700 font-medium">{stat.label}</div>
                  {stat.isLive && connectionStatus === 'connected' && account && (
                    <p className="text-xs text-green-600 mt-1">Live</p>
                  )}
                  {!account && (
                    <p className="text-xs text-gray-500 mt-1">Connect wallet</p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

      {/* Compact Data Visualizations */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium text-sm">Chart Coming Soon</p>
              <p className="text-xs text-gray-600">Latest crop batch tokenizations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Supply Chain Map</h3>
          </div>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium text-sm">Interactive Map Coming Soon</p>
              <p className="text-xs text-gray-600">Global movement tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Quick Actions */}
      <section className="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const canPerform = !action.requiresRole || canPerformAction(action.requiresRole);
            const isDisabled = action.disabled || !canPerform;

            return (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                disabled={isDisabled}
                className={`
                  bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg transition-all text-center
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:shadow-md'}
                `}
              >
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xs font-bold text-gray-900">{action.title}</div>
                <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                {action.requiresRole && !canPerform && (
                  <div className="text-xs mt-1 text-orange-600">
                    Requires {action.requiresRole}
                  </div>
                )}
                {action.disabled && (
                  <div className="text-xs mt-1 text-gray-500">
                    Coming Soon
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Cart Checkout Section */}
      <section>
        <CartCheckoutSection />
      </section>
      </div>
    </div>
  );
};

export default Dashboard;