import React, { useState } from 'react';
import { useContracts } from '../hooks/useContracts';
import { UserRole } from '../utils/contracts';
import { User, Truck, ShoppingCart, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface RoleRegistrationProps {
  onRegistrationComplete?: () => void;
}

const RoleRegistration: React.FC<RoleRegistrationProps> = ({ onRegistrationComplete }) => {
  const { registerUser, loading, error, userRoles, isConnected } = useContracts();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const roles = [
    {
      type: UserRole.FARMER,
      name: 'Farmer',
      description: 'Grow and harvest crops, mint crop batch tokens',
      icon: User,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      permissions: [
        'Mint new crop batch tokens',
        'Update crop metadata',
        'Transfer crops to distributors',
        'View crop history'
      ]
    },
    {
      type: UserRole.TRANSPORTER,
      name: 'Transporter/Distributor',
      description: 'Transport and distribute crops through the supply chain',
      icon: Truck,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      permissions: [
        'Receive crops from farmers',
        'Transfer crops to retailers',
        'Update transport status',
        'Track shipments'
      ]
    },
    {
      type: UserRole.BUYER,
      name: 'Buyer/Retailer',
      description: 'Purchase and sell crops to end consumers',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      permissions: [
        'Purchase crops from distributors',
        'View complete supply chain',
        'Verify crop authenticity',
        'Access quality certificates'
      ]
    }
  ];

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setRegistrationSuccess(false);
  };

  const handleRegister = async () => {
    if (selectedRole === null) return;

    try {
      await registerUser(selectedRole);
      setRegistrationSuccess(true);
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const isRoleAlreadyRegistered = (role: UserRole) => {
    switch (role) {
      case UserRole.FARMER:
        return userRoles.isFarmer;
      case UserRole.TRANSPORTER:
        return userRoles.isTransporter;
      case UserRole.BUYER:
        return userRoles.isBuyer;
      default:
        return false;
    }
  };

  const hasAnyRole = userRoles.isFarmer || userRoles.isTransporter || userRoles.isBuyer;

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Connected</h3>
        <p className="text-gray-600">Please connect your wallet to register for a role.</p>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="text-center p-8">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Successful!</h3>
        <p className="text-gray-600 mb-4">
          You have successfully registered as a {roles.find(r => r.type === selectedRole)?.name}.
        </p>
        <button
          onClick={() => setRegistrationSuccess(false)}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Role</h2>
        <p className="text-gray-600 text-lg">
          Select your role in the GreenLedger supply chain ecosystem
        </p>
        {hasAnyRole && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              You already have registered roles. You can register for additional roles if needed.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {roles.map((role) => {
          const Icon = role.icon;
          const isRegistered = isRoleAlreadyRegistered(role.type);
          const isSelected = selectedRole === role.type;

          return (
            <div
              key={role.type}
              className={`
                relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
                ${isRegistered ? 'opacity-75' : ''}
              `}
              onClick={() => !isRegistered && handleRoleSelection(role.type)}
            >
              {isRegistered && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              )}
              
              <div className="text-center mb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${role.color} text-white mb-3`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{role.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{role.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Permissions:</h4>
                <ul className="space-y-1">
                  {role.permissions.map((permission, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>

              {isRegistered && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Registered
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedRole !== null && !isRoleAlreadyRegistered(selectedRole) && (
        <div className="text-center">
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Register as {roles.find(r => r.type === selectedRole)?.name}
            </h3>
            <p className="text-gray-600 mb-4">
              This will register your wallet address with the selected role on the blockchain.
              You'll be able to access role-specific features after registration.
            </p>
            <button
              onClick={handleRegister}
              disabled={loading}
              className={`
                inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                } text-white
              `}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Registering...
                </>
              ) : (
                'Register Role'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleRegistration;
