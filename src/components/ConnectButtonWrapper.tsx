import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { Zap } from 'lucide-react';
import { isMobile, getMobileConnectionStrategy } from '../utils/mobileDetection';

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
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const isOnMobile = isMobile();

  // Handle mobile-specific connection with proper error handling
  const handleMobileConnect = async () => {
    try {
      const strategy = getMobileConnectionStrategy();
      
      if (strategy === 'injected') {
        const injectedConnector = connectors.find(c => c.type === 'injected');
        if (injectedConnector) {
          await connect({ connector: injectedConnector });
          return true;
        }
      } else if (strategy === 'walletconnect') {
        const wcConnector = connectors.find(c => c.type === 'walletConnect');
        if (wcConnector) {
          await connect({ connector: wcConnector });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Mobile connection failed:', error);
      return false;
    }
  };

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

    // Use mobile-specific logic only on mobile devices
    if (isOnMobile) {
      return (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={async () => {
                const success = await handleMobileConnect();
                if (!success) {
                  openConnectModal();
                }
              }}
              className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Zap className="mr-2 h-5 w-5" />
              Connect Wallet
            </button>
          )}
        </ConnectButton.Custom>
      );
    }

    // Desktop: use standard RainbowKit button
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

    // Use mobile-specific logic only on mobile devices
    if (isOnMobile) {
      return (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={async () => {
                const success = await handleMobileConnect();
                if (!success) {
                  openConnectModal();
                }
              }}
              className="bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Zap className="mr-2 h-5 w-5" />
              Connect Wallet
            </button>
          )}
        </ConnectButton.Custom>
      );
    }

    // Desktop: use standard RainbowKit button
    return (
      <div className="space-y-3">
        <ConnectButton />
      </div>
    );
  }

  // All other variants (default, compact, minimal) - use mobile-optimized logic
  if (showBalance) {
    return <ConnectButton showBalance={showBalance} />;
  }

  // Use mobile-specific logic only on mobile devices
  if (isOnMobile) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            onClick={async () => {
              const success = await handleMobileConnect();
              if (!success) {
                openConnectModal();
              }
            }}
            className="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Connect Wallet
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  // Desktop: use standard RainbowKit button
  return <ConnectButton />;
};

export default ConnectButtonWrapper;
