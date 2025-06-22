import React from 'react';
import { Info, UserPlus, Users, Shield, CheckCircle } from 'lucide-react';
import { useSimpleWeb3 } from '../contexts/SimpleWeb3Context';

/**
 * Simple Register User Component
 * 
 * This component provides information about the self-service role registration
 * system and shows current user roles. Since users can now register their own
 * roles, this eliminates the need for complex admin-based user management.
 */
const RegisterUserSimple: React.FC = () => {
  const { account, isConnected } = useSimpleWeb3();

  // Get user roles from local storage
  const getUserRoles = () => {
    if (!account) return [];
    
    const stored = localStorage.getItem(`greenledger_user_roles_${account}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.roles || [];
      } catch (error) {
        console.error('Failed to parse stored roles:', error);
      }
    }
    return [];
  };

  const userRoles = getUserRoles();
  const hasRoles = userRoles.length > 0;

  const roleInfo = [
    {
      id: 'farmer',
      title: 'Farmer',
      description: 'Can mint new crop batch NFTs and track production',
      icon: '🌱',
      permissions: [
        'Mint crop batch NFTs',
        'Track production data',
        'Verify crop authenticity',
        'Access direct market'
      ]
    },
    {
      id: 'transporter',
      title: 'Transporter',
      description: 'Can handle logistics and update supply chain status',
      icon: '🚛',
      permissions: [
        'Update transport status',
        'Track shipment progress',
        'Verify delivery completion',
        'Earn transport fees'
      ]
    },
    {
      id: 'buyer',
      title: 'Buyer',
      description: 'Can purchase and verify crop batches',
      icon: '🛒',
      permissions: [
        'Browse marketplace',
        'Purchase crop batches',
        'Verify authenticity',
        'Track supply chain'
      ]
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Can manage platform and oversee operations',
      icon: '👑',
      permissions: [
        'Platform management',
        'User verification',
        'System oversight',
        'Advanced analytics'
      ]
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <UserPlus className="h-12 w-12 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">User Role Management</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          GreenLedger uses a self-service role registration system. Users can register their own roles without admin intervention.
        </p>
      </div>

      {/* Current User Status */}
      {isConnected && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Current Status</h2>
            <p className="text-gray-600">Connected wallet: {account}</p>
          </div>
          
          <div className="p-6">
            {hasRoles ? (
              <div>
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-green-800">Registered Roles</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userRoles.map((roleId: string) => {
                    const role = roleInfo.find(r => r.id === roleId);
                    if (!role) return null;
                    
                    return (
                      <div key={roleId} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-2">{role.icon}</span>
                          <h4 className="font-semibold text-green-800">{role.title}</h4>
                        </div>
                        <p className="text-sm text-green-700">{role.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Roles Registered</h3>
                <p className="text-gray-600 mb-4">
                  You haven't registered any roles yet. Roles will be automatically prompted when you connect your wallet.
                </p>
                <p className="text-sm text-gray-500">
                  Refresh the page or reconnect your wallet to see the role registration modal.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Self-Service Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start">
          <Info className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Self-Service Role Registration</h3>
            <p className="text-blue-800 mb-4">
              GreenLedger now features self-service role registration! This means:
            </p>
            <ul className="text-blue-800 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                No waiting for admin approval
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                Immediate platform access after wallet connection
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                Multiple role selection support
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                Local storage with future blockchain sync
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Role Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Roles</h2>
          <p className="text-gray-600">
            Learn about the different roles available in the GreenLedger platform.
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roleInfo.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{role.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                  <ul className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Role Registration Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">1️⃣</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Connect Wallet</h4>
            <p className="text-sm text-gray-600">
              Connect your wallet to the GreenLedger platform
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">2️⃣</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Select Roles</h4>
            <p className="text-sm text-gray-600">
              Choose one or more roles that match your needs
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">3️⃣</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Start Using</h4>
            <p className="text-sm text-gray-600">
              Immediately access platform features based on your roles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUserSimple;