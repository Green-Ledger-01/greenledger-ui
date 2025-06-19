import React, { useState } from 'react';
import { AlertTriangle, UserPlus, Users, Shield } from 'lucide-react';
import { useUserManagement } from '../hooks/useUserManagement';
import { useToast } from '../contexts/ToastContext';
import { useWeb3, useRequireRole } from '../contexts/Web3Context';
import { USER_ROLES } from '../config/constants';

const RegisterUser: React.FC = () => {
  const [addressToRegister, setAddressToRegister] = useState('');
  const [selectedRole, setSelectedRole] = useState<number | ''>('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  
  const { registerUser, isRegistering, isConfirmingRegistration } = useUserManagement();
  const { addToast } = useToast();
  const { refetchRoles } = useWeb3();
  const { canPerformAction, needsRole, isLoadingRoles } = useRequireRole('admin');

  const roleOptions = [
    { value: USER_ROLES.FARMER, label: 'Farmer', description: 'Can mint crop batch NFTs', icon: '🌱' },
    { value: USER_ROLES.TRANSPORTER, label: 'Transporter', description: 'Can transfer batches in supply chain', icon: '🚛' },
    { value: USER_ROLES.BUYER, label: 'Buyer', description: 'Can purchase and receive batches', icon: '🛒' },
    { value: USER_ROLES.ADMIN, label: 'Admin', description: 'Full system access and user management', icon: '👑' },
  ];

  const validateAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setAddressToRegister(address);
    
    if (address) {
      setIsValidAddress(validateAddress(address));
    } else {
      setIsValidAddress(true);
    }
  };

  const handleRegister = async () => {
    if (!addressToRegister || selectedRole === '') {
      addToast('Please enter an address and select a role.', 'warning');
      return;
    }

    if (!validateAddress(addressToRegister)) {
      addToast('Please enter a valid Ethereum address.', 'error');
      return;
    }

    try {
      await registerUser(addressToRegister as `0x${string}`, selectedRole as number);
      // Refetch user roles after registration attempt
      refetchRoles();
      
      // Clear form on successful submission
      setAddressToRegister('');
      setSelectedRole('');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  // Display role-based access control
  if (isLoadingRoles) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-blue-800 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-medium">Loading user permissions...</p>
        </div>
      </div>
    );
  }

  if (needsRole) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-yellow-800 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-600" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-lg mb-4">You need administrator privileges to register user roles.</p>
          <p className="text-sm">
            Please contact an existing administrator to register your role or request access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <UserPlus className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Register User Role</h1>
          </div>
          <p className="text-gray-600">
            Assign roles to users to grant them specific permissions within the GreenLedger system.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Address Input */}
          <div>
            <label htmlFor="addressToRegister" className="block text-sm font-medium text-gray-700 mb-2">
              User Wallet Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="addressToRegister"
              value={addressToRegister}
              onChange={handleAddressChange}
              placeholder="0x..."
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                !isValidAddress ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {!isValidAddress && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid Ethereum address (0x followed by 40 hexadecimal characters)
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The wallet address of the user you want to register
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="selectRole" className="block text-sm font-medium text-gray-700 mb-2">
              Select Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {roleOptions.map((role) => (
                <label
                  key={role.value}
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === role.value
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) => setSelectedRole(Number(e.target.value))}
                    className="sr-only"
                  />
                  <div className="flex items-center flex-1">
                    <span className="text-2xl mr-3">{role.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{role.label}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                    {selectedRole === role.value && (
                      <Shield className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleRegister}
            disabled={isRegistering || isConfirmingRegistration || !addressToRegister || selectedRole === '' || !isValidAddress}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            {isRegistering ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                Sending Transaction...
              </>
            ) : isConfirmingRegistration ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                Confirming...
              </>
            ) : (
              <>
                <Users className="h-5 w-5 mr-2" />
                Register User Role
              </>
            )}
          </button>

          {(isRegistering || isConfirmingRegistration) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 text-center">
                Please confirm the transaction in your wallet and wait for blockchain confirmation...
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <h3 className="font-medium text-gray-900 mb-2">Role Permissions:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Farmer:</strong> Can mint new crop batch NFTs</li>
            <li>• <strong>Transporter:</strong> Can transfer batches in the supply chain</li>
            <li>• <strong>Buyer:</strong> Can purchase and receive crop batches</li>
            <li>• <strong>Admin:</strong> Can register users and has full system access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;