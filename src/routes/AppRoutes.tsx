import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { HybridWeb3Provider } from "../config/HybridWeb3Config";
import { Web3Provider } from '../contexts/Web3Context';
import { ToastProvider } from '../contexts/ToastContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SelfServiceRoleRegistration from '../components/SelfServiceRoleRegistration';
import Dashboard from '../pages/Dashboard';
import RegisterUser from '../pages/RegisterUser';
import MintCropBatch from '../pages/MintCropBatch';
import Marketplace from '../pages/Marketplace';
import SupplyChainTracker from '../pages/SupplyChainTracker';
import { useRoleManagement } from '../hooks/useRoleManagement';

// Main App Content Component
const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    showRoleRegistration, 
    handleRegistrationComplete, 
    handleSkipRoleSelection 
  } = useRoleManagement();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show role registration overlay if needed
  if (showRoleRegistration) {
    return (
      <SelfServiceRoleRegistration
        onRegistrationComplete={handleRegistrationComplete}
        onSkip={handleSkipRoleSelection}
        showSkipOption={true}
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
        <ConnectButton showBalance={false} />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 bg-opacity-80">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<RegisterUser />} />
            <Route path="/mint" element={<MintCropBatch />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/track" element={<SupplyChainTracker />} />
            <Route path="/track/:tokenId" element={<SupplyChainTracker />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <HybridWeb3Provider>
      <ToastProvider>
        <Web3Provider>
          <Router>
            <AppContent />
          </Router>
        </Web3Provider>
      </ToastProvider>
    </HybridWeb3Provider>
  );
};

export default AppRoutes;