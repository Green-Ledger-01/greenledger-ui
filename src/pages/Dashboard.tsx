import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Zap, TrendingUp, Users, Package, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
// import { useRealTimeMarketplace } from '../hooks/useRealTimeMarketplace';
// import { useCropBatchToken } from '../hooks/useCropBatchToken';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useWeb3Enhanced();

  // Helper function to check if user can perform action
  const canPerformAction = React.useCallback((role: string) => hasRole(role), [hasRole]);

  // Simplified mock data for SimpleAppRoutes
  const batches = React.useMemo(() => [], []);
  const totalBatches = 12; // Mock data
  const connectionStatus = 'connected' as const;
  const lastUpdateTime = React.useMemo(() => Date.now(), []);
  const refetchBatches = React.useCallback(() => Promise.resolve(), []);
  const isRefreshing = false;
  const nextTokenId = 13;
  
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

  // Update live stats when data changes
  useEffect(() => {
    const uniqueFarms = new Set(batches.map(batch => batch.originFarm)).size;
    const recentBatches = batches.filter(batch => 
      batch.lastUpdated && Date.now() - batch.lastUpdated < 86400000 // 24 hours
    ).length;
    
    setLiveStats({
      totalBatches: totalBatches,
      activeFarms: uniqueFarms,
      registeredUsers: Math.floor(totalBatches * 1.5) + 50, // Simulated
      recentTransactions: recentBatches + Math.floor(totalBatches * 0.3),
    });
  }, [batches, totalBatches]);

  const stats = React.useMemo(() => [
    {
      label: 'Total Batches',
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
      label: 'Registered Users',
      value: liveStats.registeredUsers.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
      isLive: false
    },
    {
      label: 'Recent Activity',
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4 animate-fade-in-down">
            Welcome to GreenLedger
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
            Your blockchain-powered agricultural supply chain management platform
          </p>

          {/* Connection Status */}
          <div className="mt-6 flex justify-center animate-fade-in-up">
            <div className="flex items-center gap-2 px-6 py-3 glass rounded-full shadow-lg border border-white/20">
              {getConnectionIcon()}
              <span className="text-sm font-medium text-gray-700">
                {connectionStatus === 'connected' ? 'Connected to blockchain' :
                 connectionStatus === 'disconnected' ? 'Disconnected from blockchain' :
                 'Syncing with blockchain'}
              </span>
              {connectionStatus === 'connected' && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    Updated {formatLastUpdate(lastUpdateTime)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="gradient-bg-primary text-white rounded-2xl shadow-2xl p-8 lg:p-12 text-center hover-lift animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-6">
            Transparent Agricultural Supply Chain
          </h2>
          <p className="text-lg lg:text-xl mb-8 max-w-4xl mx-auto opacity-90 leading-relaxed">
            Track your produce from farm to table with immutable blockchain records,
            ensuring trust and traceability at every step of the supply chain.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-white text-green-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-green-50 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              <Activity className="inline h-5 w-5 mr-2" />
              Explore Marketplace
            </button>
            <button
              onClick={() => navigate('/tokenize')}
              className="bg-green-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg border-2 border-green-500 hover:bg-green-500 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              <Package className="inline h-5 w-5 mr-2" />
              Create Batch
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative overflow-hidden hover-lift">
                {stat.isLive && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">LIVE</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    {stat.isLive && connectionStatus === 'connected' && (
                      <p className="text-xs text-green-600">Real-time data</p>
                    )}
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

      {/* Data Visualizations */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-6 w-6 text-green-600 mr-2" />
            Recent Token Mints
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">Chart Coming Soon</p>
              <p className="text-sm">Visualizing latest crop batch tokenizations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-6 w-6 text-blue-600 mr-2" />
            Supply Chain Map
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">Interactive Map Coming Soon</p>
              <p className="text-sm">Global movement and origin tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Zap className="h-6 w-6 text-yellow-600 mr-2" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  ${action.color} text-white p-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}
                `}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-bold">{action.title}</div>
                <div className="text-xs opacity-90 mt-1">{action.description}</div>
                {action.requiresRole && !canPerform && (
                  <div className="text-xs mt-1 opacity-75">
                    Requires {action.requiresRole} role
                  </div>
                )}
                {action.disabled && (
                  <div className="text-xs mt-1 opacity-75">
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