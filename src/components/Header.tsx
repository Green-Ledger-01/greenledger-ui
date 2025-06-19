import React from 'react';
import { useAccount, useDisconnect, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Copy } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useToast } from '../contexts/ToastContext';
import { truncateAddress } from '../utils/errorHandling';
import { APP_CONFIG } from '../config/constants';

const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { userRoles, isLoadingRoles } = useWeb3();
  const { addToast } = useToast();
  const chainId = useChainId();

  const getUserRoleDisplay = () => {
    if (isLoadingRoles) return 'Loading Role...';
    if (!isConnected) return 'Not Connected';

    const roles = [];
    if (userRoles.isAdmin) roles.push('Admin');
    if (userRoles.isFarmer) roles.push('Farmer');
    if (userRoles.isTransporter) roles.push('Transporter');
    if (userRoles.isBuyer) roles.push('Buyer');

    return roles.length > 0 ? roles.join(', ') : 'No Role';
  };

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        addToast('Address copied to clipboard!', 'success');
      } catch (err) {
        addToast('Failed to copy address', 'error');
      }
    }
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-40 border-b border-gray-200">
      {/* Logo and Brand */}
      <div className="flex items-center">
        <div className="h-10 w-10 mr-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">GL</span>
        </div>
        <h1 className="text-2xl font-bold text-green-800">{APP_CONFIG.NAME}</h1>
      </div>

      {/* User Info and Wallet Connection */}
      <div className="flex items-center space-x-4">
        {/* Desktop User Info */}
        <div className="hidden md:flex items-center space-x-4 text-sm text-gray-700">
          {isConnected && address && (
            <>
              <div className="flex flex-col items-end">
                <span className="font-medium">
                  Role: <span className="font-semibold text-green-700">{getUserRoleDisplay()}</span>
                </span>
                <span className="text-xs text-gray-500">
                  Chain ID: <span className="font-medium">{chainId}</span>
                </span>
              </div>
              
              <div className="flex items-center border border-green-300 rounded-full px-3 py-2 bg-green-50 text-green-800">
                <Wallet className="h-4 w-4 mr-2" />
                <span className="font-mono text-sm">{truncateAddress(address)}</span>
                <button 
                  onClick={handleCopyAddress}
                  className="ml-2 text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-100" 
                  title="Copy Address"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              
              <button
                onClick={() => disconnect()}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-full hover:bg-red-600 transition-colors font-medium"
              >
                Disconnect
              </button>
            </>
          )}
        </div>

        {/* Mobile Connect Button */}
        <div className="md:hidden">
          <ConnectButton showBalance={false} />
        </div>

        {/* Desktop Connect Button (when not connected) */}
        <div className="hidden md:block">
          {!isConnected && <ConnectButton />}
        </div>
      </div>
    </header>
  );
};

export default Header;