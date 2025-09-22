import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Zap, TrendingUp, Users, Package, Wifi, WifiOff, RefreshCw, QrCode, Scan } from 'lucide-react';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { useUserTokenHistory, useTokensByState } from '../hooks/useSupplyChainManager';


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole, address } = useWeb3Enhanced();
  const isConnected = !!address;
  const account = address;
  const { getAllBatches, isLoading, error } = useCropBatchToken();
  
  // Handle errors properly
  React.useEffect(() => {
    if (error) {
      console.error('Dashboard error:', error);
      // Could add toast notification here if needed
    }
  }, [error]);

  // Real-time blockchain data hooks
  const { data: userTokenHistory } = useUserTokenHistory(account);
  const { data: producedTokens } = useTokensByState(0); // Produced state
  const { data: inTransitTokens } = useTokensByState(1); // InTransit state
  const { data: deliveredTokens } = useTokensByState(2); // Delivered state

  // Helper function to check if user can perform action
  const canPerformAction = React.useCallback((role: string) => hasRole(role), [hasRole]);

  // Real blockchain data
  const [batches, setBatches] = useState<any[]>([]);
  const connectionStatus = isConnected ? 'connected' : 'disconnected';
  
  const [liveStats, setLiveStats] = useState({
    totalBatches: 0,
    activeFarms: 0,
    platformTokens: 0,
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
      disabled: false,
    },
    {
      title: 'Tokenize Crop',
      description: 'Create new crop batch NFTs',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/tokenize',
      requiresRole: 'farmer' as const,
      disabled: false,
    },
    {
      title: 'Browse Marketplace',
      description: 'Explore available crop batches',
      icon: Activity,
      color: 'bg-purple-500 hover:bg-purple-600',
      path: '/marketplace',
      disabled: false,
    },
    {
      title: 'Checkout and Track',
      description: 'Complete purchases and track batches',
      icon: MapPin,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      path: '/track',
      disabled: false,
    },
  ];

  // Load batches from blockchain
  const refetchBatches = React.useCallback(async () => {
    try {
      const allBatches = await getAllBatches();
      setBatches(allBatches);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  }, [getAllBatches]);

  // Load batches on mount with error handling
  useEffect(() => {
    const loadBatches = async () => {
      try {
        await refetchBatches();
      } catch (error) {
        console.error('Failed to load batches on mount:', error);
      }
    };
    loadBatches();
  }, [refetchBatches]);

  // Update live stats when data changes
  useEffect(() => {
    if (!account) {
      // Show platform-wide stats when not connected
      setLiveStats({
        totalBatches: 0,
        activeFarms: 0,
        platformTokens: 0,
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
    const totalSupplyChainTokens = Number(producedTokens || 0) + Number(inTransitTokens || 0) + Number(deliveredTokens || 0);
    const userInteractionCount = Array.isArray(userTokenHistory) ? userTokenHistory.length : 0;

    setLiveStats({
      totalBatches: userBatches.length, // User's batches only
      activeFarms: uniqueFarms, // Farms user has interacted with
      platformTokens: totalSupplyChainTokens, // Platform-wide token count
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
      value: liveStats.platformTokens.toLocaleString(),
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



  const getConnectionIcon = React.useCallback(() => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-600" />;

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
      <div className="p-4 xs:p-6 space-y-4 xs:space-y-6">
        {/* Compact Header */}
        <div className="bg-white rounded-xl xs:rounded-lg p-6 xs:p-4 shadow-lg xs:shadow border border-gray-200">
          <div className="flex flex-col gap-4 xs:gap-6">
            <div className="flex-1">
              <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4 mb-3 xs:mb-2">
                <h1 className="text-3xl xs:text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex items-center gap-2 xs:gap-2">
                  {getConnectionIcon()}
                  <span className="text-base xs:text-sm text-gray-600 font-medium">
                    {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                  {connectionStatus === 'connected' && account && (
                    <>
                      <span className="text-gray-400 hidden xs:inline">•</span>
                      <span className="text-sm xs:text-xs text-gray-500 font-mono">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-base xs:text-sm text-gray-600 leading-relaxed">
                Your blockchain-powered agricultural supply chain management platform
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 xs:flex xs:flex-wrap gap-3 xs:gap-2">
              <button
                onClick={() => navigate('/qr')}
                className="flex items-center justify-center xs:justify-start gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 xs:px-3 py-3 xs:py-2 rounded-xl xs:rounded-lg hover:from-green-700 hover:to-blue-700 transition-all text-base xs:text-sm font-medium shadow-lg touch-target"
              >
                <QrCode className="h-5 w-5 xs:h-4 xs:w-4" />
                <span className="hidden xs:inline">QR Verify</span>
                <span className="xs:hidden">Verify</span>
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="flex items-center justify-center xs:justify-start gap-2 bg-green-600 text-white px-4 xs:px-3 py-3 xs:py-2 rounded-xl xs:rounded-lg hover:bg-green-700 transition-all text-base xs:text-sm font-medium touch-target"
              >
                <Activity className="h-5 w-5 xs:h-4 xs:w-4" />
                <span className="hidden xs:inline">Marketplace</span>
                <span className="xs:hidden">Market</span>
              </button>
              <button
                onClick={() => navigate('/track')}
                className="flex items-center justify-center xs:justify-start gap-2 bg-blue-600 text-white px-4 xs:px-3 py-3 xs:py-2 rounded-xl xs:rounded-lg hover:bg-blue-700 transition-all text-base xs:text-sm font-medium touch-target"
              >
                <MapPin className="h-5 w-5 xs:h-4 xs:w-4" />
                <span className="hidden xs:inline">Checkout & Track</span>
                <span className="xs:hidden">Track</span>
              </button>
              <button
                onClick={() => navigate('/tokenize')}
                className="flex items-center justify-center xs:justify-start gap-2 bg-gray-100 text-gray-900 px-4 xs:px-3 py-3 xs:py-2 rounded-xl xs:rounded-lg hover:bg-gray-200 transition-all border border-gray-200 text-base xs:text-sm font-medium touch-target"
              >
                <Package className="h-5 w-5 xs:h-4 xs:w-4" />
                <span className="hidden xs:inline">Create Batch</span>
                <span className="xs:hidden">Create</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl xs:rounded-lg shadow-lg xs:shadow p-6 xs:p-4 border border-gray-100 relative">
                {stat.isLive && (
                  <div className="absolute top-3 xs:top-2 right-3 xs:right-2">
                    <div className="w-3 h-3 xs:w-2 xs:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                <div className="text-center">
                  <div className="h-12 w-12 xs:h-10 xs:w-10 bg-green-100 rounded-xl xs:rounded-lg flex items-center justify-center mx-auto mb-4 xs:mb-3">
                    <Icon className="h-6 w-6 xs:h-5 xs:w-5 text-green-600" />
                  </div>
                  <div className="text-3xl xs:text-2xl font-bold text-green-600 mb-2 xs:mb-1">{stat.value}</div>
                  <div className="text-base xs:text-sm text-gray-700 font-medium">{stat.label}</div>
                  {stat.isLive && connectionStatus === 'connected' && account && (
                    <p className="text-sm xs:text-xs text-green-600 mt-2 xs:mt-1 font-medium">Live</p>
                  )}
                  {!account && (
                    <p className="text-sm xs:text-xs text-gray-500 mt-2 xs:mt-1">Connect wallet</p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* QR Verification Highlight */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl xs:rounded-lg shadow-lg p-6 xs:p-4 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-4">
            <div className="flex-1">
              <div className="flex flex-col xs:flex-row xs:items-center gap-4 xs:gap-3 mb-6 xs:mb-3">
                <div className="h-16 w-16 xs:h-12 xs:w-12 bg-white/20 rounded-xl xs:rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scan className="h-8 w-8 xs:h-6 xs:w-6 text-white" />
                </div>
                <div className="text-center xs:text-left">
                  <h3 className="text-2xl xs:text-xl font-bold mb-2 xs:mb-1">🚀 Revolutionary QR Verification</h3>
                  <p className="text-green-100 text-base xs:text-sm">Our key competitive advantage - instant blockchain verification</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 xs:gap-2 text-center">
                <div className="p-3 xs:p-2">
                  <div className="text-3xl xs:text-2xl font-bold mb-1">⚡ &lt;2s</div>
                  <div className="text-sm xs:text-xs text-green-100">Verification Time</div>
                </div>
                <div className="p-3 xs:p-2">
                  <div className="text-3xl xs:text-2xl font-bold mb-1">🔗 100%</div>
                  <div className="text-sm xs:text-xs text-green-100">Blockchain Proof</div>
                </div>
                <div className="p-3 xs:p-2">
                  <div className="text-3xl xs:text-2xl font-bold mb-1">📱 Mobile</div>
                  <div className="text-sm xs:text-xs text-green-100">Optimized</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <button
                onClick={() => navigate('/qr')}
                className="bg-white text-green-600 px-8 xs:px-6 py-4 xs:py-3 rounded-xl xs:rounded-lg hover:bg-gray-100 transition-all font-semibold flex items-center gap-3 xs:gap-2 shadow-lg touch-target text-lg xs:text-base"
              >
                <QrCode className="h-6 w-6 xs:h-5 xs:w-5" />
                Try QR Scanner
              </button>
            </div>
          </div>
        </section>

      {/* Compact Data Visualizations */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
        <div className="bg-white rounded-xl xs:rounded-lg shadow-lg xs:shadow p-6 xs:p-4 border border-gray-100">
          <div className="flex items-center gap-4 xs:gap-3 mb-6 xs:mb-4">
            <div className="h-10 w-10 xs:h-8 xs:w-8 bg-green-100 rounded-xl xs:rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 xs:h-4 xs:w-4 text-green-600" />
            </div>
            <h3 className="text-xl xs:text-lg font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="h-56 xs:h-48 bg-gray-50 rounded-xl xs:rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center p-4">
              <TrendingUp className="h-12 w-12 xs:h-8 xs:w-8 mx-auto mb-4 xs:mb-2 text-gray-400" />
              <p className="font-medium text-base xs:text-sm mb-2 xs:mb-1">Chart Coming Soon</p>
              <p className="text-sm xs:text-xs text-gray-600">Latest crop batch tokenizations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl xs:rounded-lg shadow-lg xs:shadow p-6 xs:p-4 border border-gray-100">
          <div className="flex items-center gap-4 xs:gap-3 mb-6 xs:mb-4">
            <div className="h-10 w-10 xs:h-8 xs:w-8 bg-green-100 rounded-xl xs:rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 xs:h-4 xs:w-4 text-green-600" />
            </div>
            <h3 className="text-xl xs:text-lg font-bold text-gray-900">Supply Chain Map</h3>
          </div>
          <div className="h-56 xs:h-48 bg-gray-50 rounded-xl xs:rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center p-4">
              <MapPin className="h-12 w-12 xs:h-8 xs:w-8 mx-auto mb-4 xs:mb-2 text-gray-400" />
              <p className="font-medium text-base xs:text-sm mb-2 xs:mb-1">Interactive Map Coming Soon</p>
              <p className="text-sm xs:text-xs text-gray-600">Global movement tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Quick Actions */}
      <section className="bg-white rounded-xl xs:rounded-lg shadow-lg xs:shadow p-6 xs:p-4 border border-gray-100">
        <div className="flex items-center gap-4 xs:gap-3 mb-6 xs:mb-4">
          <div className="h-10 w-10 xs:h-8 xs:w-8 bg-green-100 rounded-xl xs:rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 xs:h-4 xs:w-4 text-green-600" />
          </div>
          <h3 className="text-xl xs:text-lg font-bold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 xs:gap-3">
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
                  bg-gray-50 border border-gray-200 text-gray-900 p-4 xs:p-3 rounded-xl xs:rounded-lg transition-all text-center touch-target
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:shadow-md active:bg-gray-200'}
                `}
              >
                <div className="h-10 w-10 xs:h-8 xs:w-8 bg-green-100 rounded-xl xs:rounded-lg flex items-center justify-center mx-auto mb-3 xs:mb-2">
                  <Icon className="h-5 w-5 xs:h-4 xs:w-4 text-green-600" />
                </div>
                <div className="text-sm xs:text-xs font-bold text-gray-900 mb-1">{action.title}</div>
                <div className="text-sm xs:text-xs text-gray-600 leading-tight">{action.description}</div>
                {action.requiresRole && !canPerform && (
                  <div className="text-sm xs:text-xs mt-2 xs:mt-1 text-orange-600 font-medium">
                    Requires {action.requiresRole}
                  </div>
                )}
                {action.disabled && (
                  <div className="text-sm xs:text-xs mt-2 xs:mt-1 text-gray-500">
                    Coming Soon
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>


      </div>
    </div>
  );
};

export default Dashboard;