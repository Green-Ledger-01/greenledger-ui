import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useAuthCore, useConnect } from '@particle-network/authkit';
import { Wallet, LogOut, User, Shield, ChevronDown } from 'lucide-react';
import { markOAuthStart } from '../utils/authPersistence';

interface HybridConnectButtonProps {
  variant?: 'default' | 'compact' | 'minimal' | 'primary' | 'secondary';
  showBalance?: boolean;
}

const HybridConnectButton: React.FC<HybridConnectButtonProps> = ({
  variant = 'default',
  showBalance = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Particle Network hooks
  const authCore = useAuthCore();
  const { userInfo } = authCore;
  const { connect, disconnect: particleDisconnect, connected: particleConnected } = useConnect();

  const isParticleConnected = particleConnected || !!userInfo;
  const isAnyConnected = wagmiConnected || isParticleConnected;

  const handleParticleConnect = async () => {
    try {
      console.log('Available authCore methods:', Object.keys(authCore));

      // Check if user is already connected
      if (particleConnected || userInfo) {
        console.log('User already connected to Particle Network:', userInfo);
        return;
      }

      // Mark that we're starting an OAuth flow
      markOAuthStart();

      // Use the correct authentication method from Particle Network
      console.log('Attempting to connect using Particle Network connect()');
      const connectedUserInfo = await connect({
        // You can specify socialType to skip the modal and go directly to a specific provider
        // socialType: 'google', // 'email' | 'google' | 'twitter' | 'facebook' | etc.
      });

      console.log('Particle Network connection successful:', connectedUserInfo);
    } catch (error) {
      console.error('Particle connection failed:', error);
      // Provide more helpful error message
      if (error instanceof Error) {
        if (error.message.includes('Please connect first')) {
          alert('Particle Network needs to be initialized. Please try refreshing the page and try again.');
        } else {
          alert(`Connection failed: ${error.message}`);
        }
      }
    }
  };

  const handleDisconnectAll = async () => {
    try {
      if (wagmiConnected) {
        wagmiDisconnect();
      }
      if (isParticleConnected) {
        await particleDisconnect();
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Compact variant for mobile/header
  if (variant === 'compact') {
    if (isAnyConnected) {
      const displayAddress = wagmiAddress || userInfo?.wallets?.[0]?.public_address;
      return (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
          >
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">
              {displayAddress ? formatAddress(displayAddress) : 'Connected'}
            </span>
            <ChevronDown className="h-3 w-3" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-100">
                <div className="text-xs text-gray-500">Connected via</div>
                <div className="text-sm font-medium">
                  {wagmiConnected ? 'Wallet' : 'Particle Network'}
                </div>
              </div>
              <button
                onClick={handleDisconnectAll}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
        Not Connected
      </div>
    );
  }

  // Primary variant - for landing page CTAs
  if (variant === 'primary') {
    if (isAnyConnected) {
      return (
        <button className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl animate-pulse-green flex items-center justify-center">
          Connected - Enter App
        </button>
      );
    }

    return (
      <div className="space-y-3">
        <ConnectButton />
        <button
          onClick={handleParticleConnect}
          className="w-full px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
        >
          <Shield className="mr-2 h-5 w-5" />
          Connect with Social Login
        </button>
      </div>
    );
  }

  // Secondary variant - for landing page secondary CTAs
  if (variant === 'secondary') {
    if (isAnyConnected) {
      return (
        <button className="bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center">
          Connected - Enter App
        </button>
      );
    }

    return (
      <div className="space-y-3">
        <ConnectButton />
        <button
          onClick={handleParticleConnect}
          className="w-full px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center border border-blue-200"
        >
          <Shield className="mr-2 h-5 w-5" />
          Connect with Social Login
        </button>
      </div>
    );
  }

  // Minimal variant - just connection status
  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isAnyConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="text-sm text-gray-600">
          {isAnyConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    );
  }

  // Default variant - full featured
  if (isAnyConnected) {
    const displayAddress = wagmiAddress || userInfo?.wallets?.[0]?.public_address;
    const connectionType = wagmiConnected ? 'Traditional Wallet' : 'Particle Network';
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              {wagmiConnected ? <Wallet className="h-5 w-5 text-green-600" /> : <Shield className="h-5 w-5 text-green-600" />}
            </div>
            <div>
              <div className="font-semibold text-gray-900">Connected</div>
              <div className="text-sm text-gray-500">{connectionType}</div>
            </div>
          </div>
          <button
            onClick={handleDisconnectAll}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Disconnect"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        
        {displayAddress && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="text-xs text-gray-500 mb-1">Address</div>
            <div className="font-mono text-sm text-gray-900">{formatAddress(displayAddress)}</div>
          </div>
        )}

        {userInfo && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 mb-1">Particle Account</div>
            <div className="text-sm text-blue-900">{userInfo.name || userInfo.email || 'Authenticated'}</div>
          </div>
        )}
      </div>
    );
  }

  // Not connected state - show connection options
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect to GreenLedger</h3>
        <p className="text-gray-600">Choose your preferred connection method</p>
      </div>

      <div className="space-y-4">
        {/* Traditional Wallet Connection */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Traditional Wallets</h4>
              <p className="text-sm text-gray-500">MetaMask, WalletConnect, Coinbase</p>
            </div>
            <Wallet className="h-5 w-5 text-gray-400" />
          </div>
          <ConnectButton />
        </div>

        {/* Particle Network Connection */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Social Login</h4>
              <p className="text-sm text-gray-500">Email, Google, Twitter</p>
            </div>
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleParticleConnect}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Connect with Social Login
          </button>
          <div className="mt-2 text-xs text-gray-500 text-center">
            {userInfo ? 'Already connected to Particle' : 'Email, Google, Twitter & more'}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Secure authentication powered by Web3 technology
        </p>
      </div>
    </div>
  );
};

export default HybridConnectButton;
