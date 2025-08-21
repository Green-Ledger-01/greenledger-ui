import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Zap, Mail, Wallet } from 'lucide-react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';

interface ConnectButtonWrapperProps {
  variant?: 'default' | 'compact' | 'minimal' | 'primary' | 'secondary';
  showBalance?: boolean;
}

/**
 * ConnectButtonWrapper - Hybrid wallet connection supporting both RainbowKit and Web3Auth
 * Provides users with choice: traditional wallet connection OR social login
 */
const ConnectButtonWrapper: React.FC<ConnectButtonWrapperProps> = ({
  variant = 'default',
  showBalance = false
}) => {
  const { address, isConnected } = useAccount();
  const { web3authProvider, web3authConnected, setWeb3authProvider, setWeb3authConnected } = useWeb3Enhanced();
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x106A", // Lisk Sepolia
          rpcTarget: "https://rpc.sepolia-api.lisk.com",
          displayName: "Lisk Sepolia",
          blockExplorer: "https://sepolia-blockscout.lisk.com",
          ticker: "ETH",
          tickerName: "Ethereum",
        };

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3auth = new Web3Auth({
          clientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider: privateKeyProvider as any,
          uiConfig: {
            appName: "GreenLedger",
            appUrl: window.location.origin,
            logoLight: "https://images.web3auth.io/web3auth-logo-w.svg", // Default Web3Auth logo
            logoDark: "https://images.web3auth.io/web3auth-logo-w.svg",
            mode: "light",
            theme: {
              primary: "#10b981"
            },
          },
        });

        setWeb3auth(web3auth);
        await web3auth.init();

        if (web3auth.connected) {
          setWeb3authProvider(web3auth.provider);
          setWeb3authConnected(true);
        }
      } catch (error) {
        console.error('Web3Auth init error:', error);
      }
    };

    init();
  }, []);

  const connectWeb3Auth = async () => {
    if (!web3auth) return;

    try {
      const provider = await web3auth.connect();
      setWeb3authProvider(provider);
      setWeb3authConnected(true);
    } catch (error) {
      console.error('Web3Auth connection error:', error);
    }
  };

  const disconnectWeb3Auth = async () => {
    if (!web3auth) return;

    try {
      await web3auth.logout();
      setWeb3authProvider(null);
      setWeb3authConnected(false);
    } catch (error) {
      console.error('Web3Auth disconnect error:', error);
    }
  };

  // Primary variant - for landing page CTAs
  if (variant === 'primary') {
    if (isConnected || web3authConnected) {
      return (
        <button className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl animate-pulse-green flex items-center justify-center">
          <Zap className="mr-2 h-5 w-5" />
          Connected - Enter App
        </button>
      );
    }

    if (!showOptions) {
      return (
        <div className="space-y-4">
          <button
            onClick={() => setShowOptions(true)}
            className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center w-full"
          >
            <Zap className="mr-2 h-5 w-5" />
            Get Started
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex flex-col space-y-3">
          <button
            onClick={connectWeb3Auth}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center font-medium"
          >
            <Mail className="mr-2 h-4 w-4" />
            Login with Google
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Wallet className="mr-2 h-4 w-4 text-gray-600" />
            <ConnectButton />
          </div>
        </div>
        <button
          onClick={() => setShowOptions(false)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
      </div>
    );
  }

  // Secondary variant - for landing page secondary CTAs
  if (variant === 'secondary') {
    if (isConnected || web3authConnected) {
      return (
        <button className="bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center">
          <Zap className="mr-2 h-5 w-5" />
          Connected - Enter App
        </button>
      );
    }

    return (
      <div className="flex space-x-3">
        <button
          onClick={connectWeb3Auth}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center font-medium"
        >
          <Mail className="mr-2 h-4 w-4" />
          Google
        </button>
        <ConnectButton />
      </div>
    );
  }

  // All other variants (default, compact, minimal) - just return RainbowKit's ConnectButton
  return <ConnectButton showBalance={showBalance} />;
};

export default ConnectButtonWrapper;
