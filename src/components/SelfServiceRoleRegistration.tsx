import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { User, Truck, ShoppingCart, CheckCircle, AlertCircle, Loader, Shield, Info } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useToast } from '../contexts/ToastContext';
import { CONTRACT_ADDRESSES, USER_ROLES } from '../config/constants';
import { getErrorMessage } from '../utils/errorHandling';
import UserManagementABI from '../contracts/UserManagement.json';

interface SelfServiceRoleRegistrationProps {
  onRegistrationComplete?: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
}

/**
 * Self-Service Role Registration Component
 * 
 * Architecture Decision:
 * - Allows users to register their own roles without admin intervention
 * - Prevents user lockout scenarios by providing immediate access
 * - Maintains security by using smart contract validation
 * - Provides clear role descriptions and permissions
 * 
 * Benefits:
 * - Eliminates admin bottleneck for user onboarding
 * - Improves user experience with immediate access
 * - Reduces support burden
 * - Maintains decentralized principles
 */
const SelfServiceRoleRegistration: React.FC<SelfServiceRoleRegistrationProps> = ({ 
  onRegistrationComplete, 
  onSkip,
  showSkipOption = false 
}) => {
  const { address, isConnected } = useAccount();
  const { userRoles, isLoadingRoles, refetchRoles } = useWeb3();
  const { addToast } = useToast();
  
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Contract interaction hooks
  const { 
    writeContract, 
    data: hash, 
    isPending: isRegistering,
    error: registrationError 
  } = useWriteContract();

  const { 
    isLoading: isConfirmingRegistration, 
    isSuccess: isRegistrationConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Role definitions with comprehensive information
  const roles = [
    {
      type: USER_ROLES.FARMER,
      name: 'Farmer',
      icon: User,
      color: 'bg-green-600',
      description: 'Agricultural producer and crop batch creator',
      permissions: [
        'Create and mint crop batch NFTs',
        'Upload crop metadata and certificates',
        'Transfer batches to transporters',
        'View production analytics',
        'Access farmer dashboard'
      ],
      benefits: [
        'Direct access to supply chain',
        'Transparent pricing',
        'Quality certification',
        'Traceability records'
      ]
    },
    {
      type: USER_ROLES.TRANSPORTER,
      name: 'Transporter/Distributor',
      icon: Truck,
      color: 'bg-blue-600',
      description: 'Logistics and distribution specialist',
      permissions: [
        'Receive batches from farmers',
        'Update transportation status',
        'Transfer batches to buyers',
        'Track shipment locations',
        'Manage delivery schedules'
      ],
      benefits: [
        'Optimized route planning',
        'Real-time tracking',
        'Automated payments',
        'Delivery verification'
      ]
    },
    {
      type: USER_ROLES.BUYER,
      name: 'Buyer/Retailer',
      icon: ShoppingCart,
      color: 'bg-purple-600',
      description: 'End consumer or retail distributor',
      permissions: [
        'Purchase crop batches',
        'View complete supply chain history',
        'Verify product authenticity',
        'Access quality certificates',
        'Rate and review products'
      ],
      benefits: [
        'Product authenticity guarantee',
        'Complete traceability',
        'Quality assurance',
        'Direct farmer connection'
      ]
    }
  ];

  // Handle successful registration
  useEffect(() => {
    if (isRegistrationConfirmed && hash) {
      setRegistrationSuccess(true);
      refetchRoles();
      addToast('Role registered successfully! Welcome to GreenLedger.', 'success');
      
      // Auto-complete after a short delay
      setTimeout(() => {
        onRegistrationComplete?.();
      }, 2000);
    }
  }, [isRegistrationConfirmed, hash, refetchRoles, addToast, onRegistrationComplete]);

  // Handle registration errors
  useEffect(() => {
    if (registrationError) {
      addToast(`Registration failed: ${getErrorMessage(registrationError)}`, 'error');
    }
  }, [registrationError, addToast]);

  const handleRoleSelection = (roleType: number) => {
    setSelectedRole(roleType);
    setRegistrationSuccess(false);
    setShowConfirmation(false);
  };

  const handleRegister = async () => {
    if (selectedRole === null || !address) return;

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.UserManagement as `0x${string}`,
        abi: UserManagementABI,
        functionName: 'registerUser',
        args: [address, selectedRole],
      });
    } catch (error) {
      console.error('Registration error:', error);
      addToast(`Registration failed: ${getErrorMessage(error)}`, 'error');
    }
  };

  const isRoleAlreadyRegistered = (roleType: number) => {
    switch (roleType) {
      case USER_ROLES.FARMER:
        return userRoles.isFarmer;
      case USER_ROLES.TRANSPORTER:
        return userRoles.isTransporter;
      case USER_ROLES.BUYER:
        return userRoles.isBuyer;
      default:
        return false;
    }
  };

  const hasAnyRole = userRoles.isFarmer || userRoles.isTransporter || userRoles.isBuyer || userRoles.isAdmin;
  const selectedRoleData = roles.find(r => r.type === selectedRole);

  // Loading state
  if (isLoadingRoles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Connected</h3>
            <p className="text-gray-600">Please connect your wallet to register for a role.</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (registrationSuccess && selectedRoleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Successful!</h3>
            <p className="text-gray-600 mb-4">
              You have successfully registered as a <strong>{selectedRoleData.name}</strong>.
            </p>
            <p className="text-sm text-gray-500">
              You can now access all {selectedRoleData.name.toLowerCase()} features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your role in the GreenLedger supply chain ecosystem to get started immediately
          </p>
          
          {/* Info banner */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-blue-800 font-medium">Self-Service Registration</p>
                <p className="text-sm text-blue-700 mt-1">
                  Register your role instantly without waiting for admin approval. You can add additional roles later if needed.
                </p>
              </div>
            </div>
          </div>

          {hasAnyRole && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-green-800 text-sm">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                You already have registered roles. You can register for additional roles if needed.
              </p>
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            const isRegistered = isRoleAlreadyRegistered(role.type);
            const isSelected = selectedRole === role.type;

            return (
              <div
                key={role.type}
                className={`
                  relative bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${isSelected ? 'ring-4 ring-green-500 shadow-2xl' : 'hover:shadow-xl'}
                  ${isRegistered ? 'opacity-75 cursor-not-allowed' : ''}
                `}
                onClick={() => !isRegistered && handleRoleSelection(role.type)}
              >
                {isRegistered && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${role.color} text-white mb-4`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{role.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">{role.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Permissions:</h4>
                    <ul className="space-y-1">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {permission}
                        </li>
                      ))}
                      {role.permissions.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{role.permissions.length - 3} more permissions
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                    <ul className="space-y-1">
                      {role.benefits.slice(0, 2).map((benefit, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <Shield className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {isRegistered && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Already Registered
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Registration Actions */}
        {selectedRole !== null && !isRoleAlreadyRegistered(selectedRole) && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Register as {selectedRoleData?.name}
              </h3>
              <p className="text-gray-600 mb-6">
                This will register your wallet address with the selected role on the blockchain.
                You'll gain immediate access to all {selectedRoleData?.name.toLowerCase()} features.
              </p>

              {/* Detailed permissions for selected role */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-3">You will gain access to:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Permissions:</h5>
                    <ul className="space-y-1">
                      {selectedRoleData?.permissions.map((permission, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Benefits:</h5>
                    <ul className="space-y-1">
                      {selectedRoleData?.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <Shield className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                {showSkipOption && (
                  <button
                    onClick={onSkip}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Skip for Now
                  </button>
                )}
                
                <button
                  onClick={handleRegister}
                  disabled={isRegistering || isConfirmingRegistration}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center"
                >
                  {isRegistering || isConfirmingRegistration ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      {isRegistering ? 'Registering...' : 'Confirming...'}
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Register Role
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Registration is free and takes effect immediately after blockchain confirmation.
              </p>
            </div>
          </div>
        )}

        {/* Skip option for users who already have roles */}
        {hasAnyRole && selectedRole === null && showSkipOption && (
          <div className="text-center">
            <button
              onClick={onSkip}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Continue with existing roles →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfServiceRoleRegistration;