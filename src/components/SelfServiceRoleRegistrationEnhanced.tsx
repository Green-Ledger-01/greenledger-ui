import React, { useState, useCallback, useEffect } from 'react';
import { User, Truck, ShoppingCart, Shield, X, Check, AlertCircle, Loader2, Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
import { useToast } from '../contexts/ToastContext';

interface SelfServiceRoleRegistrationEnhancedProps {
  onRegistrationComplete: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
  isModal?: boolean;
}

type UserRole = 'farmer' | 'transporter' | 'buyer' | 'admin';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  benefits: string[];
  restrictions?: string[];
}

const roleOptions: RoleOption[] = [
  {
    id: 'farmer',
    title: 'Farmer',
    description: 'Produce and tokenize crop batches',
    icon: <User className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    benefits: [
      'Mint crop batch NFTs',
      'Track production data',
      'Verify crop authenticity',
      'Direct market access',
      'Transparent pricing',
      'Quality certification',
      'Supply chain visibility'
    ]
  },
  {
    id: 'transporter',
    title: 'Transporter',
    description: 'Handle logistics and supply chain',
    icon: <Truck className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    benefits: [
      'Update transport status',
      'Track shipment progress',
      'Verify delivery completion',
      'Earn transport fees',
      'Build reputation score',
      'Route optimization',
      'Performance analytics'
    ]
  },
  {
    id: 'buyer',
    title: 'Buyer',
    description: 'Purchase and verify crop batches',
    icon: <ShoppingCart className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    benefits: [
      'Browse marketplace',
      'Purchase crop batches',
      'Verify authenticity',
      'Track supply chain',
      'Access quality reports',
      'Price comparison',
      'Bulk ordering'
    ]
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Manage platform and oversee operations',
    icon: <Shield className="w-8 h-8" />,
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    benefits: [
      'Platform management',
      'User verification',
      'System oversight',
      'Advanced analytics',
      'Policy enforcement',
      'Dispute resolution',
      'System configuration'
    ],
    restrictions: [
      'Requires special approval',
      'Limited availability',
      'Additional verification needed'
    ]
  }
];

/**
 * Enhanced Self-Service Role Registration Component
 * 
 * This component provides a comprehensive role registration system that integrates
 * with wagmi for proper Web3 functionality. It solves the critical user lockout
 * problem by allowing users to register their own roles upon first login.
 * 
 * Key Features:
 * - Full wagmi integration for wallet connection
 * - Self-service role selection with multiple role support
 * - Local storage persistence with blockchain sync
 * - Comprehensive error handling and user feedback
 * - Responsive design with accessibility features
 * - Skip option for exploration mode
 * - Real-time transaction status updates
 * 
 * Architecture Benefits:
 * - Eliminates user lockout scenarios
 * - Reduces admin workload significantly
 * - Improves user onboarding experience
 * - Provides clear role descriptions and benefits
 * - Enables immediate platform access
 * - Maintains data consistency between local and blockchain storage
 */
const SelfServiceRoleRegistrationEnhanced: React.FC<SelfServiceRoleRegistrationEnhancedProps> = ({
  onRegistrationComplete,
  onSkip,
  showSkipOption = true,
  isModal = true
}) => {
  const { address: account, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { registerRoles, isRegistering, userRoles } = useWeb3Enhanced();
  const { addToast } = useToast();

  // Local state
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);

  // Check if user already has roles
  useEffect(() => {
    if (userRoles.length > 0) {
      // User already has roles, complete registration
      onRegistrationComplete();
      return;
    }
  }, [userRoles, onRegistrationComplete]);

  // Toggle role selection
  const toggleRole = useCallback((roleId: UserRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        // Limit admin role selection
        if (roleId === 'admin') {
          addToast('Admin role requires special approval. Contact support for admin access.', 'warning');
          return prev;
        }
        return [...prev, roleId];
      }
    });
  }, [addToast]);

  // Handle wallet connection
  const handleConnect = useCallback((connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (connector) {
      connect({ connector });
      setShowConnectorModal(false);
    }
  }, [connect, connectors]);

  // Handle role registration
  const handleRegister = useCallback(async () => {
    if (!isConnected) {
      addToast('Please connect your wallet first', 'warning');
      setShowConnectorModal(true);
      return;
    }

    if (selectedRoles.length === 0) {
      addToast('Please select at least one role', 'warning');
      return;
    }

    try {
      await registerRoles(selectedRoles);
      setShowConfirmation(true);
      
      // Auto-close confirmation after 3 seconds
      setTimeout(() => {
        onRegistrationComplete();
      }, 3000);
      
    } catch (error: any) {
      console.error('Role registration failed:', error);
      addToast('Failed to register roles. Please try again.', 'error');
    }
  }, [isConnected, selectedRoles, registerRoles, addToast, onRegistrationComplete]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      onRegistrationComplete();
    }
    addToast('You can register your role later from the profile menu', 'info');
  }, [onSkip, onRegistrationComplete, addToast]);

  const containerClasses = isModal 
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    : "w-full max-w-4xl mx-auto";

  const contentClasses = isModal
    ? "bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
    : "bg-white rounded-xl shadow-lg border border-gray-200";

  return (
    <>
      <div className={containerClasses}>
        <div className={contentClasses}>
          {/* Success Confirmation */}
          {showConfirmation && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Complete!
              </h2>
              <p className="text-gray-600 mb-4">
                You've successfully registered as: {selectedRoles.map(role => 
                  roleOptions.find(r => r.id === role)?.title
                ).join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {/* Main Registration Form */}
          {!showConfirmation && (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Welcome to GreenLedger
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Choose your role(s) to get started with the agricultural supply chain platform
                    </p>
                  </div>
                  {showSkipOption && (
                    <button
                      onClick={handleSkip}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                      title="Skip for now"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>

              {/* Connection Status */}
              <div className="p-4 border-b border-gray-200">
                {isConnected && account ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Check className="w-5 h-5" />
                      <span>Wallet Connected: {`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                    </div>
                    <button
                      onClick={() => disconnect()}
                      className="text-sm text-green-600 hover:text-green-800 underline"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <AlertCircle className="w-5 h-5" />
                      <span>Please connect your wallet to register roles</span>
                    </div>
                    <button
                      onClick={() => setShowConnectorModal(true)}
                      disabled={isConnecting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />
                          <span>Connect Wallet</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select Your Role(s)
                  </h3>
                  <p className="text-gray-600 text-sm">
                    You can select multiple roles. Each role provides different capabilities within the platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleOptions.map((role) => {
                    const isSelected = selectedRoles.includes(role.id);
                    const isRestricted = role.id === 'admin';
                    
                    return (
                      <div
                        key={role.id}
                        className={`
                          relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-200
                          ${isSelected
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : isRestricted
                            ? 'border-gray-200 bg-gray-50 opacity-75'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                          }
                          ${isRestricted ? 'cursor-not-allowed' : ''}
                        `}
                        onClick={() => !isRestricted && toggleRole(role.id)}
                      >
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Restricted Indicator */}
                        {isRestricted && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Role Icon */}
                        <div className={`w-16 h-16 ${role.bgColor} rounded-lg flex items-center justify-center text-white mb-4`}>
                          {role.icon}
                        </div>

                        {/* Role Info */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {role.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {role.description}
                        </p>

                        {/* Benefits */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Benefits:</h4>
                          <ul className="space-y-1">
                            {role.benefits.slice(0, 3).map((benefit, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                                {benefit}
                              </li>
                            ))}
                            {role.benefits.length > 3 && (
                              <li className="text-xs text-gray-500 italic">
                                +{role.benefits.length - 3} more benefits
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Restrictions */}
                        {role.restrictions && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium text-red-700">Restrictions:</h4>
                            <ul className="space-y-1">
                              {role.restrictions.map((restriction, index) => (
                                <li key={index} className="text-sm text-red-600 flex items-center">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2" />
                                  {restriction}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected Roles Summary */}
                {selectedRoles.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Selected Roles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoles.map(roleId => {
                        const role = roleOptions.find(r => r.id === roleId);
                        return (
                          <span
                            key={roleId}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center"
                          >
                            {role?.title}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRole(roleId);
                              }}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>You can change your roles later in your profile settings</p>
                    <p className="text-xs mt-1">Roles are stored locally and synced to blockchain when available</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    {showSkipOption && (
                      <button
                        onClick={handleSkip}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-200"
                      >
                        Skip for now
                      </button>
                    )}
                    
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering || selectedRoles.length === 0}
                      className={`
                        px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
                        ${selectedRoles.length > 0
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                        ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : selectedRoles.length === 0 ? (
                        <span>Select Role(s)</span>
                      ) : (
                        <span>
                          Register {selectedRoles.length > 1 ? 'Roles' : 'Role'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Wallet Connector Modal */}
      {showConnectorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Connect Wallet</h3>
                <button
                  onClick={() => setShowConnectorModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector.id)}
                  disabled={isConnecting}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 disabled:opacity-50"
                >
                  <Wallet className="w-6 h-6 text-gray-600" />
                  <span className="font-medium text-gray-900">{connector.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelfServiceRoleRegistrationEnhanced;