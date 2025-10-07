import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
import SelfServiceRoleRegistrationSimple from '../components/SelfServiceRoleRegistrationSimple';
import SidebarSimple from '../components/SidebarSimple';
import CartSidebar from '../components/CartSidebar';
import ConnectButtonWrapper from '../components/ConnectButtonWrapper';
import LoadingSpinner from '../components/LoadingSpinner';
import LandingPage from '../pages/LandingPage';

import Dashboard from '../pages/Dashboard';
import UserProfile from '../pages/UserProfile';
import TokenizationPage from '../pages/TokenizationPage';
import TransferOwnershipPage from '../pages/TransferOwnershipPage';
import SupplyChainExplorer from '../pages/SupplyChainExplorer';
import Marketplace from '../pages/Marketplace';
import CheckoutAndTrack from '../pages/CheckoutAndTrack';
import WaitlistPage from '../pages/WaitlistPage';
import QRVerificationPage from '../pages/QRVerificationPage';


// Simple Connect Button Component using ConnectButtonWrapper
const SimpleConnectButton: React.FC = () => {
  return <ConnectButtonWrapper variant="compact" />;
};

// Main App Content Component
const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { needsRoleRegistration } = useWeb3Enhanced();
  const { isConnected } = useAccount();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show landing page if not connected
  if (!isConnected) {
    return <LandingPage />;
  }

  // Show role registration overlay if needed (but allow bypass)
  if (needsRoleRegistration && window.location.pathname !== '/register') {
    // Only show modal if not on register page and user hasn't skipped
    const hasSkipped = localStorage.getItem('greenledger_role_registration_skipped');
    if (!hasSkipped) {
      return (
        <SelfServiceRoleRegistrationSimple
          onRegistrationComplete={() => {}}
          onSkip={() => {
            localStorage.setItem('greenledger_role_registration_skipped', 'true');
            window.location.reload();
          }}
          showSkipOption={true}
          isModal={true}
        />
      );
    }
  }

  return (
    <div className="min-h-screen-safe flex flex-col bg-gradient-to-br from-green-50 via-white to-green-100 safe-area-inset">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 xs:p-6 bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-40">
        <button
          onClick={toggleSidebar}
          className="text-green-800 focus:outline-none hover:text-green-600 transition-colors touch-target rounded-lg hover:bg-green-50 active:bg-green-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-3 xs:space-x-2">
          <div className="h-10 w-10 xs:h-8 xs:w-8 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-lg">
            <span className="text-white text-base xs:text-sm font-bold">G</span>
          </div>
          <h1 className="text-2xl xs:text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">GreenLedger</h1>
        </div>
        <div className="flex-shrink-0">
          <SimpleConnectButton />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-green-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 lg:h-10 lg:w-10 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg lg:text-base">G</span>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">GreenLedger</h1>
                  <span className="text-sm text-gray-500">Agricultural Supply Chain</span>
                </div>
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
        <main className="flex-1 overflow-y-auto bg-transparent mobile-scroll pb-16 md:pb-0">
          <div className="min-h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/mint" element={<TokenizationPage />} />
              <Route path="/tokenize" element={<TokenizationPage />} />
              <Route path="/transfer" element={<TransferOwnershipPage />} />
              <Route path="/explorer" element={<SupplyChainExplorer />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/track" element={<CheckoutAndTrack />} />
              <Route path="/track/:tokenId" element={<CheckoutAndTrack />} />
              <Route path="/qr" element={<QRVerificationPage />} />
              <Route path="/verify" element={<QRVerificationPage />} />
              <Route path="/register" element={
                <div className="p-6">
                  <SelfServiceRoleRegistrationSimple
                    onRegistrationComplete={() => window.location.href = '/dashboard'}
                    onSkip={() => window.location.href = '/dashboard'}
                    showSkipOption={true}
                    isModal={false}
                  />
                </div>
              } />

              <Route path="/waitlist" element={<WaitlistPage />} />

            </Routes>
          </div>
        </main>

        {/* Cart Sidebar */}
        <CartSidebar />
      </div>
    </div>
  );
};

/**
 *  App Routes Component
 *
 * Uses the hybrid Web3 setup with both WalletConnect (for Lisk blockchain)
 * and Particle Network (for account abstraction). The providers are configured
 * in App.tsx for proper layering.
 *
 * This provides:
 * - WalletConnect support for Lisk blockchain
 * - Particle Network account abstraction
 * - Enhanced role management
 * - All core app functionality
 * - Clean, maintainable architecture
 */
const AppRoutes = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;