import React, { useState, useEffect } from 'react';
import { Info, UserPlus, Users, Shield, CheckCircle, Package, TrendingUp, MapPin, Calendar, Wallet, Activity, Clock, Hash } from 'lucide-react';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { useUserTokenHistory } from '../hooks/useSupplyChainManager';

/**
 * User Profile Component
 *
 * This component displays comprehensive profile information for the connected
 * address including blockchain activity, owned tokens, supply chain interactions,
 * roles, and platform statistics specific to the user.
 */
const UserProfile: React.FC = () => {
  const { address, isConnected, userRoles, hasRole } = useWeb3Enhanced();
  const { getAllBatches } = useCropBatchToken();
  const { data: userTokenHistory } = useUserTokenHistory(address);

  // State for user-specific data
  const [userBatches, setUserBatches] = useState<any[]>([]);
  const [profileStats, setProfileStats] = useState({
    totalBatches: 0,
    ownedBatches: 0,
    mintedBatches: 0,
    interactedTokens: 0,
    uniqueFarms: 0,
    joinDate: null as Date | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user-specific data
  useEffect(() => {
    if (!address || !isConnected) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const allBatches = await getAllBatches();

        // Filter batches for this user
        const ownedBatches = allBatches.filter(batch =>
          batch.owner?.toLowerCase() === address.toLowerCase()
        );
        const mintedBatches = allBatches.filter(batch =>
          batch.minter?.toLowerCase() === address.toLowerCase()
        );

        // Calculate unique farms user has interacted with
        const uniqueFarms = new Set([
          ...ownedBatches.map(batch => batch.originFarm),
          ...mintedBatches.map(batch => batch.originFarm)
        ]);

        // Find earliest interaction (join date)
        const allUserBatches = [...ownedBatches, ...mintedBatches];
        const earliestTimestamp = allUserBatches.reduce((earliest: number | null, batch) => {
          return batch.timestamp && (!earliest || batch.timestamp < earliest)
            ? batch.timestamp
            : earliest;
        }, null);

        setUserBatches(allUserBatches);
        setProfileStats({
          totalBatches: allUserBatches.length,
          ownedBatches: ownedBatches.length,
          mintedBatches: mintedBatches.length,
          interactedTokens: Array.isArray(userTokenHistory) ? userTokenHistory.length : 0,
          uniqueFarms: uniqueFarms.size,
          joinDate: earliestTimestamp ? new Date(earliestTimestamp * 1000) : null,
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [address, isConnected, getAllBatches, userTokenHistory]);

  // Format date helper
  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format address helper
  const formatAddress = (address: string | undefined) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get role display info
  const getRoleInfo = (roleId: string) => {
    const roleMap = {
      farmer: { title: 'Farmer', icon: '🌱', color: 'green' },
      transporter: { title: 'Transporter', icon: '🚛', color: 'blue' },
      buyer: { title: 'Buyer', icon: '🛒', color: 'purple' },
      admin: { title: 'Administrator', icon: '👑', color: 'yellow' },
    };
    return roleMap[roleId as keyof typeof roleMap] || { title: roleId, icon: '👤', color: 'gray' };
  };

  if (!isConnected) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
          <p className="text-gray-600">
            Please connect your wallet to view your GreenLedger profile and activity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <UserPlus className="h-12 w-12 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your complete GreenLedger profile showing blockchain activity, tokens, and platform interactions.
        </p>
      </div>

      {/* Account Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Overview</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span className="font-mono">{formatAddress(address)}</span>
            </div>
            {profileStats.joinDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(profileStats.joinDate)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{profileStats.totalBatches}</div>
              <div className="text-sm text-gray-600">Total Batches</div>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{profileStats.mintedBatches}</div>
              <div className="text-sm text-gray-600">Minted</div>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{profileStats.uniqueFarms}</div>
              <div className="text-sm text-gray-600">Farms</div>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{profileStats.interactedTokens}</div>
              <div className="text-sm text-gray-600">Interactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Platform Roles</h2>
          <p className="text-gray-600">Your assigned roles and permissions on GreenLedger</p>
        </div>

        <div className="p-6">
          {userRoles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRoles.map((role) => {
                const roleInfo = getRoleInfo(role.id);
                const bgClass = roleInfo.color === 'green' ? 'bg-green-50 border-green-200' :
                               roleInfo.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                               roleInfo.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                               roleInfo.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                               'bg-gray-50 border-gray-200';
                const textClass = roleInfo.color === 'green' ? 'text-green-800' :
                                 roleInfo.color === 'blue' ? 'text-blue-800' :
                                 roleInfo.color === 'purple' ? 'text-purple-800' :
                                 roleInfo.color === 'yellow' ? 'text-yellow-800' :
                                 'text-gray-800';
                const subtextClass = roleInfo.color === 'green' ? 'text-green-700' :
                                    roleInfo.color === 'blue' ? 'text-blue-700' :
                                    roleInfo.color === 'purple' ? 'text-purple-700' :
                                    roleInfo.color === 'yellow' ? 'text-yellow-700' :
                                    'text-gray-700';

                return (
                  <div key={role.id} className={`${bgClass} border rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{roleInfo.icon}</span>
                        <h4 className={`font-semibold ${textClass}`}>{roleInfo.title}</h4>
                      </div>
                      {role.onChain && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          On-Chain
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${subtextClass}`}>
                      Registered {new Date(role.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Roles Assigned</h3>
              <p className="text-gray-600">
                Connect your wallet and refresh to register for platform roles.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Recent Activity</h2>
          <p className="text-gray-600">Your latest crop batches and blockchain interactions</p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading your activity...</p>
            </div>
          ) : userBatches.length > 0 ? (
            <div className="space-y-4">
              {userBatches.slice(0, 5).map((batch) => (
                <div key={batch.tokenId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {batch.cropType} - Batch #{batch.tokenId}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {batch.originFarm} • {batch.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {batch.timestamp ? new Date(batch.timestamp * 1000).toLocaleDateString() : 'Unknown date'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {batch.owner?.toLowerCase() === address?.toLowerCase() ? 'Owned' : 'Minted'}
                    </div>
                  </div>
                </div>
              ))}
              {userBatches.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Showing 5 of {userBatches.length} total batches
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-600">
                Start by minting your first crop batch or interacting with the marketplace.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Blockchain Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Blockchain Details</h2>
          <p className="text-gray-600">Your account information on the Lisk blockchain</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                  <code className="text-sm font-mono text-gray-900">{address}</code>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Network</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Lisk Sepolia Testnet</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Platform Status</label>
                <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">Active Member</span>
                  </div>
                </div>
              </div>

              {profileStats.joinDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Member Since</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900">{formatDate(profileStats.joinDate)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;