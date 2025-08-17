import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Zap } from 'lucide-react';

interface ConnectButtonWrapperProps {
  variant?: 'default' | 'compact' | 'minimal' | 'primary' | 'secondary';
  showBalance?: boolean;
}

/**
 * ConnectButtonWrapper - A simplified wrapper around RainbowKit's ConnectButton
 * Replaces the previous HybridConnectButton that supported both Wagmi and Particle Network
 * Now only supports RainbowKit/Wagmi for cleaner, standardized wallet connections
 */
const ConnectButtonWrapper: React.FC<ConnectButtonWrapperProps> = ({
  variant = 'default',
  showBalance = false
}) => {
  const { address, isConnected } = useAccount();

  // Primary variant - for landing page CTAs
  if (variant === 'primary') {
    if (isConnected) {
      return (
        <button className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl animate-pulse-green flex items-center justify-center">
          <Zap className="mr-2 h-5 w-5" />
          Connected - Enter App
        </button>
      );
    }

    return (
      <div className="space-y-3">
        <ConnectButton />
      </div>
    );
  }

  // Secondary variant - for landing page secondary CTAs
  if (variant === 'secondary') {
    if (isConnected) {
      return (
        <button className="bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center">
          <Zap className="mr-2 h-5 w-5" />
          Connected - Enter App
        </button>
      );
    }

    return (
      <div className="space-y-3">
        <ConnectButton />
      </div>
    );
  }

  // All other variants (default, compact, minimal) - just return RainbowKit's ConnectButton
  return <ConnectButton showBalance={showBalance} />;
};

export default ConnectButtonWrapper;
