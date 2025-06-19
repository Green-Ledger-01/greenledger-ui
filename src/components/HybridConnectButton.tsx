import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useHybridAuth } from '../hooks/useHybridAuth';
import { 
  User, 
  Wallet, 
  LogOut, 
  ChevronDown, 
  Mail, 
  Smartphone,
  Shield,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface HybridConnectButtonProps {
  showBalance?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * HybridConnectButton - Advanced Web3 authentication component
 * 
 * This component provides a sophisticated interface for both social login
 * and traditional wallet connections. It's designed to be the primary
 * authentication entry point for your application.
 * 
 * Features:
 * - Social login via Particle Network (email, Google, Twitter, etc.)
 * - Traditional wallet connections via RainbowKit
 * - Unified user experience regardless of auth method
 * - Comprehensive error handling and loading states
 * - Responsive design with mobile optimization
 * - Accessibility compliant
 * 
 * UX Philosophy:
 * - Social login is presented first to reduce friction for Web2 users
 * - Traditional wallet options are clearly available for crypto-native users
 * - Connected state shows relevant information based on auth method
 * - Consistent visual design across all states
 */
export const HybridConnectButton: React.FC<HybridConnectButtonProps> = ({
  showBalance = true,
  size = 'md',
  variant = 'primary'
}) => {
  const {
    isConnected,
    isConnecting,
    address,
    authMethod,
    userInfo,
    error,
    connectParticle,
    connectWallet,
    disconnect,
    clearError
  } = useHybridAuth();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Size configurations
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Variant configurations
  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600',
    outline: 'bg-transparent hover:bg-green-50 text-green-600 border-green-600'
  };
  
  // Copy address to clipboard
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  // Handle social login
  const handleSocialLogin = async () => {
    try {
      clearError();
      await connectParticle();
      setShowConnectionModal(false);
    } catch (err) {
      console.error('Social login failed:', err);
    }
  };
  
  // Handle wallet connection
  const handleWalletConnect = () => {
    try {
      clearError();
      connectWallet();
      setShowConnectionModal(false);
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };
  
  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDropdown(false);
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };
  
  // Connection Modal Component
  const ConnectionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect to GreenLedger</h2>
          <p className="text-gray-600">Choose your preferred connection method</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        )}
        
        {/* Social Login Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Easy Login
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Perfect for new users - no crypto wallet needed
          </p>
          
          <button
            onClick={handleSocialLogin}
            disabled={isConnecting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isConnecting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Continue with Email/Social
              </>
            )}
          </button>
        </div>
        
        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>
        
        {/* Wallet Connection Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Crypto Wallet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect your existing wallet (MetaMask, WalletConnect, etc.)
          </p>
          
          {/* Use RainbowKit's ConnectButton for wallet connections */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
        
        {/* Close button */}
        <button
          onClick={() => setShowConnectionModal(false)}
          className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
  
  // Connected State Dropdown
  const ConnectedDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`${sizeClasses[size]} ${variantClasses[variant]} border rounded-lg font-medium transition-colors flex items-center space-x-2`}
      >
        {authMethod === 'particle' && userInfo?.avatar ? (
          <img src={userInfo.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            {authMethod === 'particle' ? (
              <User className="w-4 h-4 text-green-600" />
            ) : (
              <Wallet className="w-4 h-4 text-green-600" />
            )}
          </div>
        )}
        
        <span className="hidden sm:block">
          {authMethod === 'particle' && userInfo?.email 
            ? userInfo.email.split('@')[0]
            : address ? formatAddress(address) : 'Connected'
          }
        </span>
        
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {authMethod === 'particle' && userInfo?.avatar ? (
                <img src={userInfo.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  {authMethod === 'particle' ? (
                    <User className="w-6 h-6 text-green-600" />
                  ) : (
                    <Wallet className="w-6 h-6 text-green-600" />
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                {authMethod === 'particle' && userInfo?.email && (
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userInfo.email}
                  </p>
                )}
                {address && (
                  <p className="text-xs text-gray-500 font-mono">
                    {formatAddress(address)}
                  </p>
                )}
                <p className="text-xs text-gray-400 capitalize">
                  {authMethod === 'particle' ? 'Social Login' : 'Wallet Connected'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="py-1">
            {address && (
              <button
                onClick={copyAddress}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy Address'}</span>
              </button>
            )}
            
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  // Loading State
  if (isConnecting) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} ${variantClasses[variant]} border rounded-lg font-medium transition-colors flex items-center space-x-2 opacity-75`}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        <span>Connecting...</span>
      </button>
    );
  }
  
  // Connected State
  if (isConnected) {
    return <ConnectedDropdown />;
  }
  
  // Disconnected State
  return (
    <>
      <button
        onClick={() => setShowConnectionModal(true)}
        className={`${sizeClasses[size]} ${variantClasses[variant]} border rounded-lg font-medium transition-colors flex items-center space-x-2`}
      >
        <Wallet className="w-4 h-4" />
        <span>Connect</span>
      </button>
      
      {showConnectionModal && <ConnectionModal />}
    </>
  );
};

export default HybridConnectButton;