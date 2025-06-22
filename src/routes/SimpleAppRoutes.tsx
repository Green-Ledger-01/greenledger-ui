import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { SimpleWeb3Provider, useSimpleWeb3 } from '../contexts/SimpleWeb3ContextClean';
import { ToastProvider } from '../contexts/ToastContext';
import SelfServiceRoleRegistrationSimple from '../components/SelfServiceRoleRegistrationSimple';
import SidebarSimple from '../components/SidebarSimple';
import Dashboard from '../pages/Dashboard';
import RegisterUserSimple from '../pages/RegisterUserSimple';
import MintCropBatchSimple from '../pages/MintCropBatchSimple';
import Marketplace from '../pages/Marketplace';
import SupplyChainTracker from '../pages/SupplyChainTracker';
import { useSimpleRoleManagement } from '../hooks/useSimpleRoleManagement';

// Simple Connect Button Component
const SimpleConnectButton: React.FC = () => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useSimpleWeb3();

  if (isConnecting) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
      >
        Connecting...
      </button>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          {`${account.slice(0, 6)}...${account.slice(-4)}`}
        </span>
        <button
          onClick={disconnectWallet}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
};

// Main App Content Component
const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    showRoleRegistration, 
    handleRegistrationComplete, 
    handleSkipRoleSelection 
  } = useSimpleRoleManagement();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show role registration overlay if needed
  if (showRoleRegistration) {
    return (
      <SelfServiceRoleRegistrationSimple
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
        <SimpleConnectButton />
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
              <SimpleConnectButton />
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
 * Simple App Routes Component
 * 
 * A simplified version of the app routes that doesn't depend on
 * complex Web3 libraries that are causing build issues.
 * 
 * This provides:
 * - Basic wallet connection functionality
 * - Self-service role registration
 * - All core app functionality
 * - Clean, maintainable architecture
 * 
 * Can be easily upgraded to use more advanced Web3 libraries
 * once the build issues are resolved.
 */
const SimpleAppRoutes = () => {
  return (
    <ToastProvider>
      <SimpleWeb3Provider>
        <Router>
          <AppContent />
        </Router>
      </SimpleWeb3Provider>
    </ToastProvider>
  );
};

export default SimpleAppRoutes;