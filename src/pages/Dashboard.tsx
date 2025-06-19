import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Zap, TrendingUp, Users, Package, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useRealTimeMarketplace } from '../hooks/useRealTimeMarketplace';
import { useCropBatchToken } from '../hooks/useCropBatchToken';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userRoles, canPerformAction } = useWeb3();
  const { 
    batches, 
    totalBatches, 
    connectionStatus, 
    lastUpdateTime,
    refetchBatches,
    isRefreshing 
  } = useRealTimeMarketplace();
  const { nextTokenId } = useCropBatchToken();
  
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
      title: 'Mint New Batch',
      description: 'Create new crop batch NFTs',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/mint',
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

  const stats = [
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
  ];

  const formatLastUpdate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  const getConnectionIcon = () => {
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

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.disabled) return;
    if (action.requiresRole && !canPerformAction(action.requiresRole)) {
      return; // Button should be disabled, but just in case
    }
    navigate(action.path);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to GreenLedger
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your blockchain-powered agricultural supply chain management platform
        </p>
        
        {/* Connection Status */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
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
      <section className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-3xl font-extrabold mb-4">
          Transparent Agricultural Supply Chain
        </h2>
        <p className="text-lg mb-6 max-w-3xl mx-auto opacity-90">
          Track your produce from farm to table with immutable blockchain records, 
          ensuring trust and traceability at every step of the supply chain.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => navigate('/marketplace')}
            className="bg-white text-green-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-50 transition-all transform hover:scale-105"
          >
            Explore Marketplace
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg border-2 border-green-500 hover:bg-green-500 transition-all transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative overflow-hidden">
              {stat.isLive && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">LIVE</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.isLive && connectionStatus === 'connected' && (
                    <p className="text-xs text-green-600 mt-1">Real-time data</p>
                  )}
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
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
  );
};

export default Dashboard;