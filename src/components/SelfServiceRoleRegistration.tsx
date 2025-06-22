import React, { useState, useCallback } from 'react';
import { User, Truck, ShoppingCart, Shield, X, Check, AlertCircle } from 'lucide-react';
import { useSimpleWeb3 } from '../contexts/SimpleWeb3Context';
import { useToast } from '../contexts/ToastContext';

interface SelfServiceRoleRegistrationProps {
  onRegistrationComplete: () => void;
  onSkip: () => void;
  showSkipOption?: boolean;
}

type UserRole = 'farmer' | 'transporter' | 'buyer' | 'admin';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  benefits: string[];
}

const roleOptions: RoleOption[] = [
  {
    id: 'farmer',
    title: 'Farmer',
    description: 'Produce and mint crop batch NFTs',
    icon: <User className="w-8 h-8" />,
    color: 'bg-green-500',
    benefits: [
      'Mint crop batch NFTs',
      'Track production data',
      'Verify authenticity',
      'Direct market access'
    ]
  },
  {
    id: 'transporter',
    title: 'Transporter',
    description: 'Handle logistics and supply chain',
    icon: <Truck className="w-8 h-8" />,
    color: 'bg-blue-500',
    benefits: [
      'Update transport status',
      'Track shipments',
      'Verify deliveries',
      'Earn transport fees'
    ]
  },
  {
    id: 'buyer',
    title: 'Buyer',
    description: 'Purchase and verify crop batches',
    icon: <ShoppingCart className="w-8 h-8" />,
    color: 'bg-purple-500',
    benefits: [
      'Browse marketplace',
      'Purchase crop batches',
      'Verify authenticity',
      'Track supply chain'
    ]
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Manage platform and users',
    icon: <Shield className="w-8 h-8" />,
    color: 'bg-red-500',
    benefits: [
      'Platform management',
      'User verification',
      'System oversight',
      'Advanced analytics'
    ]
  }
];

/**
 * Self-Service Role Registration Component
 * 
 * Allows users to register their roles without admin intervention.
 * This eliminates the user lockout problem where users couldn't access
 * the platform without an admin manually assigning roles.
 * 
 * Architecture Decision:
 * - Self-service registration reduces support burden
 * - Users can select multiple roles if needed
 * - Provides clear role descriptions and benefits
 * - Includes skip option for exploration
 * - Stores preferences locally to avoid repeated prompts
 * 
 * Benefits:
 * - Eliminates user lockout scenarios
 * - Reduces admin workload
 * - Improves user onboarding experience
 * - Provides role clarity and education
 */
const SelfServiceRoleRegistration: React.FC<SelfServiceRoleRegistrationProps> = ({
  onRegistrationComplete,
  onSkip,
  showSkipOption = true
}) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { account, isConnected, connectWallet } = useSimpleWeb3();
  const { addToast } = useToast();

  // Toggle role selection
  const toggleRole = useCallback((roleId: UserRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  }, []);

  // Handle role registration
  const handleRegister = useCallback(async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (selectedRoles.length === 0) {
      addToast('Please select at least one role', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, this would call the smart contract
      // For now, we'll simulate the registration process
      
      // Simulate contract call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store roles locally (in real app, this would be on-chain)
      const roleData = {
        address: account,
        roles: selectedRoles,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(`greenledger_user_roles_${account}`, JSON.stringify(roleData));
      
      addToast(
        `Successfully registered as: ${selectedRoles.map(role => 
          roleOptions.find(r => r.id === role)?.title
        ).join(', ')}`,
        'success'
      );
      
      onRegistrationComplete();
      
    } catch (error: any) {
      console.error('Role registration failed:', error);
      addToast('Failed to register roles. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, connectWallet, selectedRoles, account, addToast, onRegistrationComplete]);

  // Handle skip
  const handleSkip = useCallback(() => {
    addToast('You can register your role later from the profile menu', 'info');
    onSkip();
  }, [onSkip, addToast]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome to GreenLedger
              </h2>
              <p className="text-gray-600 mt-1">
                Choose your role(s) to get started with the platform
              </p>
            </div>
            {showSkipOption && (
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Skip for now"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span>Please connect your wallet to register roles</span>
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleOptions.map((role) => (
              <div
                key={role.id}
                className={`
                  relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-200
                  ${selectedRoles.includes(role.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => toggleRole(role.id)}
              >
                {/* Selection Indicator */}
                {selectedRoles.includes(role.id) && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Role Icon */}
                <div className={`w-16 h-16 ${role.color} rounded-lg flex items-center justify-center text-white mb-4`}>
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
                    {role.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Roles Summary */}
          {selectedRoles.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Roles:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(roleId => {
                  const role = roleOptions.find(r => r.id === roleId);
                  return (
                    <span
                      key={roleId}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {role?.title}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              You can change your roles later in your profile settings
            </div>
            
            <div className="flex space-x-3">
              {showSkipOption && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Skip for now
                </button>
              )}
              
              <button
                onClick={isConnected ? handleRegister : connectWallet}
                disabled={isSubmitting || (!isConnected && selectedRoles.length === 0)}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-all duration-200
                  ${isConnected && selectedRoles.length > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : !isConnected
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registering...</span>
                  </div>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : selectedRoles.length === 0 ? (
                  'Select Role(s)'
                ) : (
                  `Register as ${selectedRoles.length > 1 ? 'Multiple Roles' : roleOptions.find(r => r.id === selectedRoles[0])?.title}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfServiceRoleRegistration;