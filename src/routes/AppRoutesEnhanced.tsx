import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, Wallet, ChevronDown } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Web3ContextEnhancedProvider } from '../contexts/Web3ContextEnhanced';
import { ToastProvider } from '../contexts/ToastContext';
import SelfServiceRoleRegistrationEnhanced from '../components/SelfServiceRoleRegistrationEnhanced';
import SidebarSimple from '../components/SidebarSimple';
import Dashboard from '../pages/Dashboard';
import RegisterUserSimple from '../pages/RegisterUserSimple';
import MintCropBatchSimple from '../pages/MintCropBatchSimple';
import Marketplace from '../pages/Marketplace';
import SupplyChainTracker from '../pages/SupplyChainTracker';
import { useRoleManagementEnhanced } from '../hooks/useRoleManagementEnhanced';

// Enhanced Connect Button Component with Wagmi
const EnhancedConnectButton: React.FC = () => {
  const { address: account, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  if (isConnecting) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed flex items-center space-x-2"
      >
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>Connecting...</span>
      </button>
    );
  }

  if (isConnected && account) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowConnectors(!showConnectors)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm">
            {`${account.slice(0, 6)}...${account.slice(-4)}`}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {showConnectors && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-200">
              <p className="text-xs text-gray-500">Connected Account</p>
              <p className="text-sm font-medium text-gray-900 break-all">{account}</p>
            </div>
            <button
              onClick={() => {
                disconnect();
                setShowConnectors(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConnectors(!showConnectors)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {showConnectors && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Choose Wallet</h3>
            <p className="text-xs text-gray-500 mt-1">Connect with one of our available wallet providers</p>
          </div>
          <div className="p-2 space-y-1">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setShowConnectors(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{connector.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Content Component
const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    showRoleRegistration, 
    handleRegistrationComplete, 
    handleSkipRoleSelection 
  } = useRoleManagementEnhanced();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show role registration overlay if needed
  if (showRoleRegistration) {
    return (
      <SelfServiceRoleRegistrationEnhanced
        onRegistrationComplete={handleRegistrationComplete}
        onSkip={handleSkipRoleSelection}
        showSkipOption={true}
        isModal={true}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-md border-b border-gray-200">
        <button 
          onClick={toggleSidebar} 
          className="text-green-800 focus:outline-none hover:text-green-600 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-green-800">GreenLedger</h1>
        <EnhancedConnectButton />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-green-800">GreenLedger</h1>
                <span className="ml-2 text-sm text-gray-500">Agricultural Supply Chain</span>
              </div>
              <EnhancedConnectButton />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidebarSimple isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 bg-opacity-80">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<RegisterUserSimple />} />
            <Route path="/mint" element={<MintCropBatchSimple />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/track" element={<SupplyChainTracker />} />
            <Route path="/track/:tokenId" element={<SupplyChainTracker />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

/**
 * Enhanced App Routes Component
 * 
 * This component provides a complete Web3-enabled application with:
 * - Full wagmi integration for wallet connection and contract interactions
 * - Self-service role registration system that eliminates user lockout
 * - Comprehensive error handling and user feedback
 * - Responsive design with mobile-first approach
 * - Clean separation of concerns and maintainable architecture
 * 
 * Key Features:
 * - Multiple wallet connector support (MetaMask, WalletConnect, Coinbase)
 * - Real-time blockchain state management
 * - Local storage persistence with blockchain sync
 * - Role-based access control
 * - Toast notifications for user feedback
 * - Responsive sidebar navigation
 * 
 * Architecture Benefits:
 * - Eliminates dependency on admin for user onboarding
 * - Provides immediate platform access for new users
 * - Maintains data consistency between local and blockchain storage
 * - Scales efficiently with user growth
 * - Reduces support overhead significantly
 */
const AppRoutesEnhanced = () => {
  return (
    <ToastProvider>
      <Web3ContextEnhancedProvider>
        <Router>
          <AppContent />
        </Router>
      </Web3ContextEnhancedProvider>
    </ToastProvider>
  );
};

export default AppRoutesEnhanced;